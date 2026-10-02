#!/usr/bin/env node
// Rounds 5B and 6B: one batch of tasks for one arm. Agents and tokens scale with the batch: isolated arms (I, IC) run one
// single agent per task with B tokens each; shared arms (R, E, EC) run M agents over all M tasks with M x B tokens
// shared. Each murmur run happens in Docker with only its own folder mounted (graders and other runs stay out of reach);
// grading happens afterwards on the host with swarmtest's own grader.
//   node run-batch.mjs <lot> <arm> <rep> <image>      e.g. node run-batch.mjs L2 E 0 murmur-batch:a5a95a58e2
import { spawn, spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const [lot, arm, rep, image] = process.argv.slice(2);
const murmur = "/Users/azaru/Documents/projects/murmur";
const swarmtest = "/Users/azaru/Documents/projects/swarmtest";
const LOTS = {
  L1: ["information_extraction_hard", "durable_workflow_engine", "ledger_reconciliation_hard", "information_extraction_hard2"].map(id => [id, join(swarmtest, "tasks", id)]),
  S: ["bug_fixing", "data_analysis"].map(id => [id, join(swarmtest, "tasks", id)]), // smoke lot: cheap, saturated tasks
  L3: ["opt_routing", "opt_shop", "opt_packing", "opt_roster"].map(id => [id, join(swarmtest, "staging", id)]),
  L2: ["fam_billing", "fam_shipments", "fam_clinic", "fam_payouts"].map(id => [id, join(swarmtest, "staging", id)]),
};
const PROFILES = { I: "c4g-guard", R: "b-realloc", E: "b-swarm", IC: "c4g-clock", EC: "b-swarm-clock" };
const ISOLATED = ["I", "IC"];
const B = 1_500_000, MINUTES = 20;
const DONE = "Everything the goal asks for is implemented in the working directory and the acceptance check exits 0.";
if (!LOTS[lot] || !PROFILES[arm] || !/^\d+$/.test(rep ?? "") || !image) {
  console.error("usage: node run-batch.mjs <S|L1|L2|L3> <I|R|E|IC|EC> <rep> <image>");
  process.exit(1);
}
const tasks = LOTS[lot].map(([id, dir]) => ({ id, dir, ...JSON.parse(readFileSync(join(dir, "task.json"), "utf8")) }));
const out = join(murmur, "experiments", "batch", `${lot}-${arm}-r${rep}`);
if (existsSync(join(out, "batch-result.json"))) { console.log(`${out} is done`); process.exit(0); }
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
const base = { provider: "openai-codex", model: "gpt-6-luna", thinking: "medium", timeoutMinutes: MINUTES, profile: "profile.json" };

// One murmur run in a container that sees only `unit`; credentials are a filtered copy that lives outside it.
function container(unit, name) {
  const secrets = `${unit}.pi`;
  mkdirSync(secrets, { recursive: true });
  const auth = JSON.parse(readFileSync(join(homedir(), ".pi", "agent", "auth.json"), "utf8"));
  writeFileSync(join(secrets, "auth.json"), JSON.stringify({ "openai-codex": auth["openai-codex"] }));
  // Node's cpSync fails on macOS bind mounts, so the run happens on the container's own disk and runs/ is copied back,
  // also when `timeout` stops it. runSwarm is called directly so murmur's own final check (redundant here: the host
  // grades) gets 2 minutes instead of the CLI's 10, which pushed loaded runs past the container limit.
  writeFileSync(join(unit, "run.mjs"), `import { readFileSync } from "node:fs";
import { runSwarm } from "/murmur/src/swarm.ts";
const task = JSON.parse(readFileSync("task.json", "utf8"));
const result = await runSwarm({ ...task, project: "ws", profile: "profile.json" }, { runDir: "runs/run", checkTimeoutMs: 120_000 });
console.log(\`murmur: \${result.status} (\${result.reason}), \${result.tokens} tokens\`);
process.exit(0);
`);
  const script = 'mkdir -p "$HOME/.pi" /work && cp -r /host-pi-agent "$HOME/.pi/agent" && chmod -R u+w "$HOME/.pi/agent" && cp -r /lot/ws /lot/task.json /lot/profile.json /lot/run.mjs /work/'
    + ` && cd /work && timeout ${MINUTES + 6}m /murmur/node_modules/.bin/tsx run.mjs; s=$?; cp -r /work/runs /lot/; exit $s`;
  return new Promise(resolve => {
    const child = spawn("docker", ["run", "--rm", "--name", name, "-v", `${unit}:/lot`, "-v", `${secrets}:/host-pi-agent:ro`,
      "--entrypoint", "sh", image, "-c", script], { stdio: ["ignore", "pipe", "pipe"] });
    let log = "";
    child.stdout.on("data", d => { log += d; });
    child.stderr.on("data", d => { log += d; });
    const timer = setTimeout(() => spawnSync("docker", ["kill", name]), (MINUTES + 10) * 60_000);
    child.on("close", code => {
      clearTimeout(timer);
      rmSync(secrets, { recursive: true, force: true });
      writeFileSync(join(unit, "container.log"), log);
      const runs = existsSync(join(unit, "runs")) ? readdirSync(join(unit, "runs")) : [];
      const runDir = runs.length ? join(unit, "runs", runs[0]) : undefined;
      const result = runDir && existsSync(join(runDir, "result.json")) ? JSON.parse(readFileSync(join(runDir, "result.json"), "utf8")) : undefined;
      resolve({ code, runDir, result });
    });
  });
}

function grade(task, workspace) {
  const py = "import json,sys; from pathlib import Path; from swarmtest.grading import grade; print(json.dumps(grade(Path(sys.argv[1]), Path(sys.argv[2]))))";
  const run = spawnSync("python3", ["-c", py, task.dir, workspace], { cwd: swarmtest, encoding: "utf8" });
  try { return JSON.parse(run.stdout.trim().split("\n").at(-1)); } catch { return { score: 0, passed: false, error: run.stderr.slice(-500) }; }
}

const started = Date.now();
const scores = {};
let tokens = 0, reasons = [];
const profile = join(murmur, "profiles", `${PROFILES[arm]}.json`);
if (ISOLATED.includes(arm)) {
  // One single agent per task, all at once, each with its own budget.
  const results = await Promise.all(tasks.map(async (task, i) => {
    const unit = join(out, task.id);
    mkdirSync(unit);
    cpSync(join(task.dir, "workspace"), join(unit, "ws"), { recursive: true });
    cpSync(profile, join(unit, "profile.json"));
    writeFileSync(join(unit, "task.json"), JSON.stringify({ ...base, goal: task.prompt, done: DONE, check: task.acceptance_command,
      project: "ws", agents: 1, budgetTokens: B }, null, 2));
    return [task, await container(unit, `mb-${lot}-${arm}-r${rep}-${i}`)];
  }));
  for (const [task, { runDir, result }] of results) {
    scores[task.id] = runDir ? grade(task, join(runDir, "workspace")).score : 0;
    tokens += result?.tokens ?? 0;
    reasons.push(`${task.id}:${result?.reason ?? "no result"}`);
  }
} else {
  // M agents over all M tasks, one subfolder per task, each with its own check; M x B tokens shared.
  const unit = join(out, "batch"), ws = join(unit, "ws");
  mkdirSync(ws, { recursive: true });
  for (const task of tasks) {
    cpSync(join(task.dir, "workspace"), join(ws, task.id), { recursive: true });
    writeFileSync(join(ws, task.id, "TASK.md"), `# ${task.id}\n\n${task.prompt}\n\nAcceptance check (run from the top folder): npm run test:${task.id}\n`);
  }
  writeFileSync(join(ws, "check-all.sh"), `s=0\n${tasks.map(t => `(cd ${t.id} && ${t.acceptance_command}) || s=1`).join("\n")}\nexit $s\n`);
  writeFileSync(join(ws, "package.json"), JSON.stringify({ private: true, scripts: {
    test: "sh check-all.sh", ...Object.fromEntries(tasks.map(t => [`test:${t.id}`, `cd ${t.id} && ${t.acceptance_command}`])) } }, null, 2));
  const goal = `This folder holds ${tasks.length} independent tasks, one per subfolder. Each subfolder's TASK.md states its task, and each task has its own acceptance check, run from this folder:\n${
    tasks.map(t => `- ${t.id}: npm run test:${t.id}`).join("\n")}\nWork inside the task subfolders and leave check-all.sh and the top package.json as they are. Every task counts the same.`;
  cpSync(profile, join(unit, "profile.json"));
  writeFileSync(join(unit, "task.json"), JSON.stringify({ ...base, goal, done: "Every task is implemented in its subfolder and its acceptance check exits 0.",
    check: "npm run test", checks: tasks.map(t => `npm run test:${t.id}`), project: "ws", agents: tasks.length, budgetTokens: B * tasks.length }, null, 2));
  const { runDir, result } = await container(unit, `mb-${lot}-${arm}-r${rep}`);
  for (const task of tasks) scores[task.id] = runDir ? grade(task, join(runDir, "workspace", task.id)).score : 0;
  tokens = result?.tokens ?? 0;
  reasons.push(result?.reason ?? "no result");
}
const values = Object.values(scores);
const summary = { lot, arm, rep: Number(rep), image, profile: PROFILES[arm], scores, mean: values.reduce((a, b) => a + b, 0) / values.length,
  tokens, reasons, minutes: (Date.now() - started) / 60_000 };
writeFileSync(join(out, "batch-result.json"), JSON.stringify(summary, null, 2) + "\n");
console.log(JSON.stringify(summary));
