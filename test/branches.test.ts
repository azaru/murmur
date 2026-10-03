import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { Branches } from "../src/branches.ts";

const setup = (mode: "required" | "optional") => {
  mkdirSync("tmp", { recursive: true });
  const dir = mkdtempSync(join("tmp", "test-branches-"));
  const workspace = join(dir, "ws"), runDir = join(dir, "run");
  mkdirSync(workspace);
  writeFileSync(join(workspace, "f.txt"), "one\n");
  const events: string[] = [];
  const branches = new Branches(workspace, runDir, mode, type => events.push(type));
  branches.init(["a", "b"]);
  const tool = (agent: string, name: string) => branches.tools(agent, {}).find(t => t.name === name)!;
  const call = async (agent: string, name: string, args = {}) =>
    ((await tool(agent, name).execute("id", args as never, undefined, undefined, undefined as never)).content[0] as { text: string }).text;
  return { dir, workspace, branches, call, events, cleanup: () => rmSync(dir, { recursive: true, force: true }) };
};

test("required: agents work in their own worktree; merge integrates, and a conflicting merge leaves the shared folder alone", async () => {
  const { workspace, branches, call, events, cleanup } = setup("required");
  try {
    assert.ok(!existsSync(join(workspace, ".git")));
    writeFileSync(join(branches.root("a"), "f.txt"), "from a\n");
    writeFileSync(join(branches.root("b"), "f.txt"), "from b\n");
    writeFileSync(join(branches.root("b"), "g.txt"), "only b\n");
    assert.match(await call("a", "merge", { message: "a's change" }), /Merged into the shared folder: f.txt/);
    assert.equal(readFileSync(join(workspace, "f.txt"), "utf8"), "from a\n");

    assert.match(await call("b", "merge", { message: "b's change" }), /Conflicts .* in: f.txt/);
    assert.equal(readFileSync(join(workspace, "f.txt"), "utf8"), "from a\n");
    assert.ok(!existsSync(join(workspace, "g.txt")));
    assert.match(await call("b", "merge", { message: "again" }), /still contain conflict markers/);
    spawnSync("git", ["add", "f.txt"], { cwd: branches.root("b") }); // staging the file by hand does not let the markers through
    assert.match(await call("b", "merge", { message: "staged" }), /f.txt still contain conflict markers/);

    writeFileSync(join(branches.root("b"), "f.txt"), "from a and b\n");
    assert.match(await call("b", "merge", { message: "resolved" }), /Merged into the shared folder: f.txt, g.txt/);
    assert.equal(readFileSync(join(workspace, "f.txt"), "utf8"), "from a and b\n");
    assert.match(await call("a", "update"), /files changed: f.txt, g.txt/);
    assert.deepEqual(events.filter(e => e.startsWith("merge")), ["merge", "merge_conflict", "merge"]);

    assert.equal(branches.doneWarning("a"), undefined);
    writeFileSync(join(branches.root("a"), "h.txt"), "unmerged\n");
    assert.match(branches.doneWarning("a")!, /Refused once/);
    assert.equal(branches.doneWarning("a"), undefined);
    assert.deepEqual(branches.finish(["a", "b"]), { a: ["h.txt"] });
    assert.ok(!existsSync(branches.root("a")));
  } finally { cleanup(); }
});

test("optional: agents start in the shared folder; branch opens a worktree whose merge keeps direct edits", async () => {
  const { workspace, branches, call, cleanup } = setup("optional");
  try {
    assert.equal(branches.root("a"), join(process.cwd(), workspace));
    assert.equal(branches.tools("a", {}).map(t => t.name).join(), "branch,merge,update");
    await assert.rejects(() => call("a", "merge", { message: "x" }), /no branch/);
    const created = await call("a", "branch");
    const path = /at (\S+)\./.exec(created)![1];
    writeFileSync(join(workspace, "direct.txt"), "b wrote here\n"); // b works in the shared folder
    writeFileSync(join(path, "f.txt"), "from a\n");
    assert.match(await call("a", "merge", { message: "a" }), /Merged into the shared folder: f.txt/);
    assert.equal(readFileSync(join(workspace, "direct.txt"), "utf8"), "b wrote here\n");
    assert.equal(readFileSync(join(workspace, "f.txt"), "utf8"), "from a\n");
    assert.equal(branches.doneWarning("b"), undefined); // no branch, nothing to warn about
  } finally { cleanup(); }
});
