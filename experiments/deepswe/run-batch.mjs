#!/usr/bin/env node
// DeepSWE batch driver: one murmur configuration over several DeepSWE tasks, scored with partial credit.
//   node experiments/deepswe/run-batch.mjs --tasks a,b,c --arm swarm --profile profiles/n12-stagger-tokens.json --agents 12 --tokens 24000000 --minutes 120
//   node experiments/deepswe/run-batch.mjs --tasks a,b,c --arm solo  --tokens 24000000 --minutes 120      (profile defaults to profiles/solo-clock-tokens.json)
//   node experiments/deepswe/run-batch.mjs --tasks a,b,c --arm isolated --tokens 24000000 --minutes 120   (M separate single-agent runs, tokens/M each)
//   node experiments/deepswe/run-batch.mjs --tasks a,b --dry     (no model: checks the plumbing, then builds refs/<task>.json if missing)
// Options: --id <batch id> --hub-image murmur:latest --sidecar-memory 3g --cmd-timeout 1200 (seconds per `run` command)
//          --grade-parallel 1 --rewrite-refs
// Layout: a hub container (murmur) mounts one volume per task at /work/<task>; each task's own image runs as a sidecar
// (--network none) on the same volume and executes `run <task> <cmd>` from the hub. See README.md.
import { spawn, spawnSync } from "node:child_process";
import { parseArgs } from "node:util";
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const here = dirname(fileURLToPath(import.meta.url));
const murmur = resolve(here, "..", "..");
const tasksRoot = resolve(murmur, "..", "deep-swe", "tasks");
const secretsRoot = join(murmur, "tmp", "claude-deepswe");

const { values: opt } = parseArgs({ options: {
  tasks: { type: "string" }, arm: { type: "string" }, profile: { type: "string" }, agents: { type: "string" },
  tokens: { type: "string" }, minutes: { type: "string" }, id: { type: "string" }, dry: { type: "boolean", default: false },
  "hub-image": { type: "string", default: "murmur:latest" }, "sidecar-memory": { type: "string", default: "3g" },
  "cmd-timeout": { type: "string" }, "grade-parallel": { type: "string", default: "1" }, "rewrite-refs": { type: "boolean", default: false },
} });
const taskIds = (opt.tasks ?? "").split(",").filter(Boolean);
if (!taskIds.length || (!opt.dry && !["swarm", "solo", "isolated"].includes(opt.arm))) {
  console.error("usage: see the top of run-batch.mjs"); process.exit(1);
}
const arm = opt.arm ?? "dry";
const profilePath = resolve(murmur, opt.profile ?? (arm === "swarm" ? "" : "profiles/solo-clock-tokens.json"));
const agents = arm === "swarm" ? Number(opt.agents) : 1;
const tokens = Number(opt.tokens), minutes = Number(opt.minutes);
if (!opt.dry && (!(agents >= 1) || !(tokens > 0) || !(minutes > 0) || !existsSync(profilePath) || profilePath === murmur + "/")) {
  console.error("need --tokens, --minutes, an existing --profile, and --agents for the swarm arm"); process.exit(1);
}
const cmdTimeout = Number(opt["cmd-timeout"] ?? (opt.dry ? 6 : 1200));
const batch = opt.id ?? `${opt.dry ? "dry" : arm}-${new Date().toISOString().replace(/\D/g, "").slice(0, 12)}`;
const out = join(here, "runs", batch);
const label = `dswe=${batch}`;

// ---- docker helpers -------------------------------------------------------------------------------------------
const docker = (args, o = {}) => spawnSync("docker", args, { encoding: "utf8", maxBuffer: 1 << 28, ...o });
function dockerOk(args, o) {
  const r = docker(args, o);
  if (r.status !== 0) throw new Error(`docker ${args.slice(0, 3).join(" ")} failed: ${(r.stderr || r.stdout).slice(-400)}`);
  return r.stdout;
}
const sidecarExec = (name, script) => docker(["exec", name, "bash", "-c", script]);

function cleanup() {
  const ids = docker(["ps", "-aq", "--filter", `label=${label}`]).stdout.split("\n").filter(Boolean);
  if (ids.length) docker(["rm", "-f", ...ids]);
  const vols = docker(["volume", "ls", "-q", "--filter", `label=${label}`]).stdout.split("\n").filter(Boolean);
  if (vols.length) docker(["volume", "rm", "-f", ...vols]);
}
for (const sig of ["SIGINT", "SIGTERM"]) process.on(sig, () => { console.error(`\n${sig}: cleaning up`); cleanup(); process.exit(130); });

// ---- tasks ---------------------------------------------------------------------------------------------------
function taskInfo(id) {
  const dir = join(tasksRoot, id);
  if (!existsSync(join(dir, "task.toml"))) throw new Error(`unknown task ${id} (no ${dir}/task.toml)`);
  const toml = readFileSync(join(dir, "task.toml"), "utf8");
  const get = key => toml.match(new RegExp(`^${key} = "([^"]*)"`, "m"))?.[1];
  return { id, dir, image: get("docker_image"), base: get("base_commit_hash"), language: get("language") };
}
const tasks = taskIds.map(taskInfo);
const refPath = id => join(here, "refs", `${id}.json`);

// ---- one unit: a hub plus one sidecar per task ------------------------------------------------------------------
// Anti-leak: the upstream history after the base commit is deleted inside the volume before any agent sees it.
const STRIP = base => `set -e; cd /app; git config --global --add safe.directory /app
[ "$(git rev-parse HEAD)" = ${base} ] || { echo "HEAD is not the base commit"; exit 3; }
git checkout -q --detach HEAD
git for-each-ref --format='%(refname)' | while read -r r; do git update-ref -d "$r"; done
for r in $(git remote); do git remote remove "$r"; done
rm -f .git/packed-refs .git/FETCH_HEAD .git/ORIG_HEAD
git reflog expire --expire=now --all; git gc -q --prune=now
echo all=$(git rev-list --all --count); echo head=$(git rev-list HEAD --count); echo unreachable=$(git fsck --unreachable --no-reflogs 2>/dev/null | wc -l); echo refs=$(git for-each-ref | wc -l); echo remotes=$(git remote | wc -l)
git rev-parse --verify -q ${base}^{commit} > /dev/null && echo base_present=1
ls -d /solution /tests /app/test.sh /app/solution 2> /dev/null | sed 's/^/stray=/' || true
GIT_INDEX_FILE=/tmp/dswe-base-index git add -A && echo basetree=$(GIT_INDEX_FILE=/tmp/dswe-base-index git write-tree)  # the starting state, for the final diff (the image's work tree may differ from HEAD)`;

async function startUnit(unit, unitTasks) {
  const hubMounts = [];
  const leaks = {};
  for (const t of unitTasks) {
    const app = `dswe-${batch}-${unit}-${t.id}-app`, q = `dswe-${batch}-${unit}-${t.id}-q`;
    for (const v of [app, q]) dockerOk(["volume", "create", "--label", label, v]);
    dockerOk(["run", "-d", "--init", "--name", `dswe-${batch}-${unit}-${t.id}`, "--label", label, "--platform", "linux/amd64", "--network", "none",
      "--cpus", "2", "--memory", opt["sidecar-memory"], "-e", `RUN_TIMEOUT=${cmdTimeout}`, "-v", `${app}:/app`, "-v", `${q}:/q`,
      "-v", `${join(here, "execd.sh")}:/opt/execd.sh:ro`, "--entrypoint", "bash", t.image, "/opt/execd.sh"]);
    hubMounts.push("-v", `${app}:/work/${t.id}`, "-v", `${q}:/q/${t.id}`);
    const s = sidecarExec(`dswe-${batch}-${unit}-${t.id}`, STRIP(t.base));
    const kv = Object.fromEntries(s.stdout.split("\n").filter(l => l.includes("=")).map(l => l.split(/=(.*)/s).slice(0, 2)));
    leaks[t.id] = { ok: s.status === 0 && kv.all === kv.head && kv.unreachable === "0" && kv.refs === "0" && kv.remotes === "0" && kv.base_present === "1" && !s.stdout.includes("stray="),
      all: Number(kv.all), head: Number(kv.head), unreachable: Number(kv.unreachable), refs: Number(kv.refs), remotes: Number(kv.remotes), baseTree: kv.basetree, log: s.stdout.trim().split("\n").slice(-7, -1).join(" | ") };
    if (!leaks[t.id].ok) throw new Error(`anti-leak strip failed for ${t.id}: ${s.stdout} ${s.stderr}`);
  }
  const taskText = join(out, unit, "tasks");  // instruction.md copies, shown to the agents at /work/_tasks/<id>.md
  mkdirSync(taskText, { recursive: true });
  for (const t of unitTasks) cpSync(join(t.dir, "instruction.md"), join(taskText, `${t.id}.md`));
  return { unit, tasks: unitTasks, leaks, hubMounts, taskText };
}

const hubName = u => `dswe-${batch}-${u.unit}-hub`;
function hubArgs(u, extra, cmd) {
  return ["run", ...extra, "--name", hubName(u), "--label", label, "--cpus", "2", "--memory", "2g", ...u.hubMounts,
    "-v", `${join(here, "run")}:/usr/local/bin/run:ro`, "-v", `${u.taskText}:/work/_tasks:ro`, ...cmd];
}

// The goal says only what the environment is: where the projects are and how to run commands in them.
function goalText(unitTasks) {
  const list = unitTasks.map(t => `- ${t.id}: description in /work/_tasks/${t.id}.md, repository in /work/${t.id}`).join("\n");
  return `Your working directory /work holds ${unitTasks.length} separate software project${unitTasks.length > 1 ? "s" : ""}, one repository per folder. For each, a description of a change to make is in a markdown file:
${list}
Implement the described change in each repository. Every project counts the same.

You can read and edit the repositories' files directly. Their toolchains are not installed in your own environment: to run any command (build, tests, git, scripts) in a project, use
  run <project> <command...>
It runs the command in that project's environment with the repository as working directory (for example: run ${unitTasks[0].id} "git status"). There is no network access there, and a command is stopped after ${Math.round(cmdTimeout / 60)} minutes. Several commands can run at once; the projects' environments have 2 CPUs each.`;
}

const ENTRY = `import { readFileSync } from "node:fs";
import { runSwarm } from "./src/swarm.ts";
const task = JSON.parse(readFileSync("/cfg/task.json", "utf8"));
const result = await runSwarm(task, { runDir: "/murmur-run/run", workspace: "/work", checkTimeoutMs: 60_000 });
console.log(\`murmur: \${result.status} (\${result.reason}), \${result.tokens} tokens\`);
process.exit(0);
`;

// Run murmur in the hub; resolves when the hub is gone. Credentials: a filtered copy of auth.json, deleted afterwards.
function runHub(u, cap) {
  const cfg = join(out, u.unit, "cfg");
  mkdirSync(cfg, { recursive: true });
  cpSync(profilePath, join(cfg, "profile.json"));
  writeFileSync(join(cfg, "entry.mjs"), ENTRY);
  writeFileSync(join(cfg, "task.json"), JSON.stringify({ goal: goalText(u.tasks), provider: "openai-codex", model: "gpt-6-luna", thinking: "medium",
    done: "The change described for each project is implemented in its repository.", check: "true", agents, budgetTokens: cap, timeoutMinutes: minutes,
    profile: "/cfg/profile.json" }, null, 2));
  const secrets = join(secretsRoot, `secrets-${batch}-${u.unit}`);
  mkdirSync(secrets, { recursive: true });
  const auth = JSON.parse(readFileSync(join(homedir(), ".pi", "agent", "auth.json"), "utf8"));
  writeFileSync(join(secrets, "auth.json"), JSON.stringify({ "openai-codex": auth["openai-codex"] }));
  // runs/ is copied back to the mounted folder at the end, also when `timeout` stops murmur (bind mounts are slow to write to).
  const script = `mkdir -p "$HOME/.pi" /murmur-run && cp -r /host-pi-agent "$HOME/.pi/agent" && chmod -R u+w "$HOME/.pi/agent" && cp /cfg/entry.mjs /murmur/entry.mjs`
    + ` && cd /murmur && timeout ${minutes + 8}m node_modules/.bin/tsx entry.mjs > /murmur-run/murmur.log 2>&1; s=$?; cp -r /murmur-run/. /out/; exit $s`;
  mkdirSync(join(out, u.unit, "murmur"), { recursive: true });
  const args = hubArgs(u, ["--rm"], ["-v", `${cfg}:/cfg:ro`, "-v", `${join(murmur, "src")}:/murmur/src:ro`, "-v", `${secrets}:/host-pi-agent:ro`,
    "-v", `${join(out, u.unit, "murmur")}:/out`, "--entrypoint", "sh", opt["hub-image"], "-c", script]);
  return new Promise(res => {
    const child = spawn("docker", args, { stdio: ["ignore", "pipe", "pipe"] });
    let log = "";
    child.stdout.on("data", d => { log += d; }); child.stderr.on("data", d => { log += d; });
    const timer = setTimeout(() => docker(["kill", hubName(u)]), (minutes + 12) * 60_000);
    child.on("close", code => {
      clearTimeout(timer); rmSync(secrets, { recursive: true, force: true });
      writeFileSync(join(out, u.unit, "hub.log"), log);
      const f = join(out, u.unit, "murmur", "run", "result.json");
      res({ code, result: existsSync(f) ? JSON.parse(readFileSync(f, "utf8")) : undefined });
    });
  });
}

// ---- scoring ---------------------------------------------------------------------------------------------------
const sidecarName = (u, t) => `dswe-${batch}-${u.unit}-${t.id}`;
const score = (u, t, ref) => {
  const args = [join(here, "score_task.py"), t.dir, sidecarName(u, t), "--out", join(out, u.unit, `${t.id}.score.json`), "--log-dir", join(out, u.unit, `${t.id}-logs`)];
  if (ref) args.push("--ref", refPath(t.id));
  const r = spawnSync("nice", ["-n", "15", "python3", ...args], { cwd: join(out, u.unit), encoding: "utf8", maxBuffer: 1 << 26 });
  if (r.status !== 0) return { error: (r.stderr || r.stdout).slice(-500), score: 0, binary: 0 };
  return JSON.parse(r.stdout.trim().split("\n").at(-1));
};
async function mapLimit(items, n, fn) {
  const results = new Array(items.length); let next = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => { while (next < items.length) { const i = next++; results[i] = await fn(items[i], i); } }));
  return results;
}

// After murmur: save each repo's final diff, stop stray processes (restart keeps /app), then score.
function finalize(u, t) {
  const c = sidecarName(u, t);
  const diff = docker(["exec", c, "bash", "-c", `cd /app && export GIT_INDEX_FILE=/tmp/dswe-index && git add -A && git diff --cached --binary ${u.leaks[t.id].baseTree} | head -c 30000000`]);
  writeFileSync(join(out, u.unit, `${t.id}.diff`), diff.stdout);
  docker(["restart", "-t", "1", c]);
  return { diffBytes: diff.stdout.length };
}

// ---- dry mode: plumbing and reference checks, no model ------------------------------------------------------------
function check(name, ok, detail = "") { console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? ` (${detail})` : ""}`); if (!ok) process.exitCode = 1; return ok; }
async function dry() {
  const u = await startUnit("d", tasks);
  dockerOk(hubArgs(u, ["-d"], ["--entrypoint", "sleep", opt["hub-image"], "infinity"]));
  const hub = (script, o) => docker(["exec", hubName(u), "bash", "-c", script], o);
  const t0 = tasks[0];
  for (const t of tasks) check(`anti-leak ${t.id}: rev-list --all (${u.leaks[t.id].all}) == HEAD (${u.leaks[t.id].head}), no unreachable objects/refs/remotes`, u.leaks[t.id].ok, u.leaks[t.id].log);
  check("hub sees no deep-swe files", hub("ls /work; find / -xdev \\( -name test.patch -o -name solution.patch -o -name instruction.md \\) -not -path '/work/_tasks/*' -not -path '/proc/*' 2>/dev/null | grep -v node_modules | head").stdout.split("\n").filter(x => x && !tasks.some(t => t.id === x) && x !== "_tasks").length === 0);
  for (const t of tasks) {
    let r = hub(`run ${t.id} 'pwd; echo out; echo err >&2; exit 3'`);
    check(`run ${t.id}: output and exit code`, r.status === 3 && r.stdout.includes("/app") && r.stdout.includes("out") && r.stdout.includes("err"), `rc=${r.status}`);
    hub(`echo probe > /work/${t.id}/_probe.txt`);
    r = hub(`run ${t.id} 'cat _probe.txt; rm _probe.txt'`);
    check(`run ${t.id}: hub write visible in the sidecar`, r.stdout.trim() === "probe");
    r = hub(`run ${t.id} 'curl -sS -m 3 https://example.com || ping -c1 -W1 8.8.8.8 || wget -T3 -qO- https://example.com'`);
    check(`sidecar ${t.id} has no network`, r.status !== 0);
  }
  const t = Date.now();
  const r = hub(`run ${t0.id} 'sleep 1001 & sleep 1002'`);
  const left = sidecarExec(sidecarName(u, t0), "pgrep -fc '[s]leep 100' || true").stdout.trim();
  check("timeout kills the command and its children", r.status === 124 && /timed out/.test(r.stdout) && left === "0", `rc=${r.status}, ${((Date.now() - t) / 1000).toFixed(1)}s, sleeps left=${left}`);
  hub(`(run ${t0.id} 'sleep 900' & p=$!; sleep 3; kill -9 $p)`);
  await new Promise(r => setTimeout(r, 30_000));
  check("caller killed with SIGKILL: remote command is killed", sidecarExec(sidecarName(u, t0), "pgrep -fc '[s]leep 900' || true").stdout.trim() === "0");
  const conc = hub(`for i in $(seq 12); do (run ${t0.id} "echo start $i; sleep 1; echo done $i" > /tmp/c$i.out; echo $? > /tmp/c$i.rc) & done; wait; for i in $(seq 12); do cat /tmp/c$i.out | tr '\\n' ' '; cat /tmp/c$i.rc; done`);
  const lines = conc.stdout.trim().split("\n");
  check("12 concurrent calls: each got its own output and rc 0", lines.length === 12 && lines.every((l, i) => l.trim() === `start ${i + 1} done ${i + 1} 0`));
  // Reference: untouched base first, then base + reference solution; the reference is built from both.
  const rows = [];
  await mapLimit(tasks, Number(opt["grade-parallel"]), async tk => {
    const c = sidecarName(u, tk), f = n => join(out, u.unit, `${tk.id}.${n}.json`);
    score(u, tk, false);
    cpSync(f("score"), f("base"));
    sidecarExec(c, `cd /app && git reset -q --hard ${tk.base} && git clean -qfd`);
    cpSync(join(tk.dir, "solution"), join(out, u.unit, `${tk.id}-solution`), { recursive: true });
    dockerOk(["cp", join(out, u.unit, `${tk.id}-solution`), `${c}:/solution`]);
    dockerOk(["exec", c, "bash", "/solution/solve.sh"]);
    score(u, tk, false);
    const write = existsSync(refPath(tk.id)) && !opt["rewrite-refs"] ? [] : ["--write", refPath(tk.id)];
    const r = spawnSync("python3", [join(here, "score_task.py"), "ref", f("score"), f("base"), ...write], { encoding: "utf8" });
    rows.push({ task: tk.id, language: tk.language, ...JSON.parse(r.stdout.trim().split("\n").at(-1)) });
  });
  console.log(JSON.stringify(rows, null, 1));
  for (const r of rows) check(`${r.task} (${r.language}): solution scores 1.0 with binary 1; untouched base scores ~0`,
    r.ref.new_f2p > 0 && r.sol.score === 1 && r.sol.binary === 1 && r.base.score < 0.1 && r.sol.parsed > 0, `base=${r.base.score}, solution=${r.sol.score}, parsed=${r.sol.parsed}`);
}

// ---- real batch --------------------------------------------------------------------------------------------------
async function real() {
  for (const t of tasks) if (!existsSync(refPath(t.id))) throw new Error(`no reference for ${t.id}: run --dry --tasks ${t.id} first`);
  const started = Date.now();
  const units = arm === "isolated" ? tasks.map(t => [t.id, [t], Math.floor(tokens / tasks.length)]) : [["b", tasks, tokens]];
  const prepared = await Promise.all(units.map(async ([name, ts, cap]) => ({ ...(await startUnit(name, ts)), cap })));
  const runs = await Promise.all(prepared.map(async u => ({ u, ...(await runHub(u, u.cap)) })));
  const minutesUsed = (Date.now() - started) / 60_000;
  const perTask = {};
  const jobs = runs.flatMap(r => r.u.tasks.map(t => ({ r, t })));
  for (const { r, t } of jobs) perTask[t.id] = { ...finalize(r.u, t), leakCheck: r.u.leaks[t.id] };
  await mapLimit(jobs, Number(opt["grade-parallel"]), async ({ r, t }) => {
    const s = score(r.u, t, true);
    Object.assign(perTask[t.id], { score: s.score, new_frac: s.new_frac, base_frac: s.base_frac, binary: s.binary, parsed: s.parsed, ...(s.error && { error: s.error }) });
  });
  const git = a => spawnSync("git", a, { cwd: murmur, encoding: "utf8" }).stdout.trim();
  const scores = tasks.map(t => perTask[t.id].score ?? 0);
  const summary = { batch, arm, profile: opt.profile ?? "profiles/solo-clock-tokens.json", profileSha256: createHash("sha256").update(readFileSync(profilePath)).digest("hex").slice(0, 16),
    agents, tasks: taskIds, tokenCap: tokens, timeoutMinutes: minutes, tokens: runs.reduce((a, r) => a + (r.result?.tokens ?? 0), 0), minutes: Math.round(minutesUsed * 10) / 10,
    endReason: runs.map(r => r.result?.reason ?? `no result (hub exit ${r.code})`).join(","), cmdTimeoutSeconds: cmdTimeout, hubImage: opt["hub-image"], perTask,
    meanScore: scores.reduce((a, b) => a + b, 0) / scores.length, code: { commit: git(["rev-parse", "HEAD"]), srcDirty: git(["status", "--porcelain", "src"]) !== "" }, date: new Date().toISOString() };
  mkdirSync(join(here, "results"), { recursive: true });
  writeFileSync(join(here, "results", `${batch}.json`), JSON.stringify(summary, null, 2) + "\n");
  console.log(JSON.stringify(summary, null, 2));
  for (const r of runs) { // traces must be there
    const files = existsSync(join(out, r.u.unit, "murmur", "run")) ? readdirSync(join(out, r.u.unit, "murmur", "run")) : [];
    console.log(`traces ${r.u.unit}: ${files.join(" ") || "MISSING"}`);
  }
}

mkdirSync(out, { recursive: true });
try {
  await (opt.dry ? dry() : real());
} catch (e) {
  console.error(e); process.exitCode = 1;
} finally {
  cleanup();
  rmSync(join(secretsRoot, `secrets-${batch}-b`), { recursive: true, force: true });
}
