import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { defineTool } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import type { Log } from "./board.ts";

export const BRANCH_TOOLS = ["branch", "merge", "update"];
const IDENTITY = ["-c", "user.name=murmur", "-c", "user.email=murmur@localhost"];
const EXCLUDE = ["node_modules/", "__pycache__/", "*.pyc", ".pytest_cache/", ".venv/"];

/**
 * A branch per agent, like pull requests. The repository lives in the run directory, so the shared folder gets no .git:
 * the shared folder is the working tree of branch main, and each agent's branch has its own worktree outside it.
 * Git runs synchronously, so merges from different agents never interleave.
 */
export class Branches {
  private workspace: string;
  private runDir: string;
  private gitDir: string;
  private warned = new Set<string>();

  constructor(workspace: string, runDir: string, readonly mode: "required" | "optional", private log: Log) {
    this.workspace = resolve(workspace), this.runDir = resolve(runDir), this.gitDir = join(this.runDir, "git");
  }

  init(names: string[]) {
    mkdirSync(this.runDir, { recursive: true });
    this.must(this.runDir, ["init", "-q", "-b", "main", "--bare", this.gitDir]);
    this.must(this.runDir, ["--git-dir", this.gitDir, "config", "core.bare", "false"]);
    writeFileSync(join(this.gitDir, "info", "exclude"), EXCLUDE.join("\n") + "\n");
    this.snapshot("murmur: initial shared folder", true);
    if (this.mode === "required") for (const name of names) this.create(name);
  }

  /** The folder an agent works in. */
  root(name: string) {
    return this.mode === "required" ? this.path(name) : this.workspace;
  }

  /** done is refused once while the agent's branch holds work the shared folder lacks, as git status would show it. */
  doneWarning(name: string) {
    if (this.warned.has(name) || !this.unmerged(name)) return undefined;
    this.warned.add(name);
    return `Refused once: your branch has changes that are not merged into the shared folder, and they will not be part of the result. Call merge to integrate them, or call done again to leave them out.`;
  }

  /** Commits what each worktree holds, removes the worktrees and returns what was left unmerged; the repository stays as a record. */
  finish(names: string[]) {
    this.snapshot("murmur: final shared folder");
    const left: Record<string, string[]> = {};
    for (const name of names.filter(n => existsSync(this.path(n)))) {
      this.git(this.path(name), ["add", "-A"]);
      this.git(this.path(name), ["commit", "-q", "--no-verify", "-m", "murmur: left in the branch at the end"]);
      const files = this.repo(["diff", "--name-only", `main...${name}`]).out.split("\n").filter(Boolean);
      if (files.length) left[name] = files;
      this.repo(["worktree", "remove", "--force", this.path(name)]);
    }
    return left;
  }

  tools(name: string, toolDescriptions: Record<string, string>) {
    const tool = (tool: string, text: string, promptSnippet: string) => ({ name: tool, label: tool, description: toolDescriptions[tool] ?? text, promptSnippet });
    const branch = defineTool({ ...tool("branch", "Create your own branch: a private copy of the shared folder, at an absolute path, where you can work without affecting teammates. merge integrates it into the shared folder. Optional: you may also work in the shared folder directly.", "Create your own branch of the shared folder"),
      parameters: Type.Object({}),
      execute: async () => {
        const fresh = !existsSync(this.path(name));
        if (fresh) this.create(name);
        return reply(`${fresh ? "Created your branch" : "You already have a branch"} at ${this.path(name)}. Work there with absolute paths (and cd into it in bash); the shared folder does not see those changes until you call merge.`);
      } });
    const merge = defineTool({ ...tool("merge", "Integrate your branch into the shared folder: commits your changes, brings in what teammates merged since, and if that has no conflicts makes the shared folder match your branch. On conflicts nothing reaches the shared folder: fix the conflict markers in your copy and call merge again.", "Integrate your branch into the shared folder"),
      parameters: Type.Object({ message: Type.String({ description: "What your changes do" }) }),
      execute: async (_id, { message }) => reply(this.merge(name, message)) });
    const update = defineTool({ ...tool("update", "Bring what teammates merged into the shared folder into your branch, keeping your own changes. Reports conflicts, which you fix in your copy.", "Bring teammates' merged work into your branch"),
      parameters: Type.Object({}),
      execute: async () => reply(this.update(name)) });
    return [...(this.mode === "optional" ? [branch] : []), merge, update];
  }

  private merge(name: string, message: string) {
    if (!existsSync(this.path(name))) throw new Error("you have no branch; call branch first");
    this.snapshot(`murmur: shared folder before ${name}'s merge`);
    const before = this.head("main");
    const stopped = this.commit(name, message) ?? this.pull(name);
    if (stopped) return stopped;
    if (this.head("main") === this.head(name)) return "Nothing to merge: the shared folder already has everything in your branch.";
    const ff = this.main(["merge", "-q", "--ff-only", name]);
    if (!ff.ok) return `The shared folder changed while merging, so nothing was merged; call merge again.\n${ff.out.slice(-800)}`;
    const files = this.repo(["diff", "--name-only", before, "main"]).out.split("\n").filter(Boolean);
    this.log("merge", { agent: name, files });
    return `Merged into the shared folder: ${files.join(", ") || "no file changes"}.`;
  }

  private update(name: string) {
    if (!existsSync(this.path(name))) throw new Error("you have no branch; call branch first");
    this.snapshot(`murmur: shared folder before ${name}'s update`);
    const unfinished = this.commit(name, `${name}: work in progress`);
    if (unfinished) return unfinished;
    const before = this.head(name);
    const stopped = this.pull(name);
    if (stopped) return stopped;
    const files = this.repo(["diff", "--name-only", before, name]).out.split("\n").filter(Boolean);
    this.log("update", { agent: name, files });
    return files.length ? `Your branch now has the shared folder's latest work; files changed: ${files.join(", ")}.` : "Your branch was already up to date.";
  }

  /** Commits the agent's work, which also concludes a merge whose conflicts it resolved; returns a message if markers remain. */
  private commit(name: string, message: string) {
    const wt = this.path(name);
    // Every changed or new file is scanned, because an agent may have staged a file with markers itself (git add).
    const changed = [...this.git(wt, ["diff", "--name-only", "HEAD"]).out.split("\n"), ...this.git(wt, ["ls-files", "-o", "--exclude-standard"]).out.split("\n")];
    const marked = [...new Set(changed.filter(Boolean))].filter(file => existsSync(join(wt, file)) && /^(<{7}|>{7})( |$)/m.test(readFileSync(join(wt, file), "utf8")));
    if (marked.length) return `Not merged: ${marked.join(", ")} still contain conflict markers (<<<<<<< ... >>>>>>>). Fix them, then call again.`;
    this.git(wt, ["add", "-A"]);
    this.git(wt, ["commit", "-q", "--no-verify", "-m", message]);
    return undefined;
  }

  /** Merges main into the agent's branch; returns a message when it stops on conflicts. */
  private pull(name: string) {
    const wt = this.path(name);
    const merged = this.git(wt, ["merge", "-q", "--no-edit", "main"]);
    if (merged.ok) return undefined;
    const conflicts = this.git(wt, ["diff", "--name-only", "--diff-filter=U"]).out.split("\n").filter(Boolean);
    this.log("merge_conflict", { agent: name, files: conflicts });
    return conflicts.length
      ? `Conflicts with what teammates merged, in: ${conflicts.join(", ")}. Nothing reached the shared folder. Those files in your copy now contain conflict markers; resolve them, then call merge again.`
      : `Could not bring in the shared folder's work:\n${merged.out.slice(-800)}`;
  }

  private create(name: string) {
    this.snapshot(`murmur: shared folder when ${name} branched`);
    this.must(this.runDir, ["--git-dir", this.gitDir, "worktree", "add", "-q", "-b", name, this.path(name), "main"]);
    this.log("branch", { agent: name, path: this.path(name) });
  }

  private unmerged(name: string) {
    if (!existsSync(this.path(name))) return false;
    return !!this.git(this.path(name), ["status", "--porcelain"]).out || this.repo(["rev-list", "--count", `main..${name}`]).out !== "0";
  }

  /** Commits the shared folder as it is, so work written there directly is part of main before any merge. */
  private snapshot(message: string, allowEmpty = false) {
    this.main(["add", "-A"]);
    this.main(["commit", "-q", "--no-verify", ...(allowEmpty ? ["--allow-empty"] : []), "-m", message]);
  }

  private path = (name: string) => join(this.runDir, "worktrees", name);
  private head = (ref: string) => this.repo(["rev-parse", ref]).out;
  private repo = (args: string[]) => this.git(this.runDir, ["--git-dir", this.gitDir, ...args]);
  private main = (args: string[]) => this.git(this.workspace, ["--git-dir", this.gitDir, "--work-tree", this.workspace, ...args]);

  private git(cwd: string, args: string[]) {
    const out = spawnSync("git", [...IDENTITY, ...args], { cwd, encoding: "utf8" });
    return { ok: out.status === 0, out: `${out.stdout}${out.stderr}`.trim() };
  }

  private must(cwd: string, args: string[]) {
    const result = this.git(cwd, args);
    if (!result.ok) throw new Error(`git ${args.join(" ")}: ${result.out}`);
  }
}

const reply = (text: string) => ({ content: [{ type: "text" as const, text }], details: {} });
