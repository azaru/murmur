import { randomBytes } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { NAMES, runSwarm, type Task } from "./swarm.ts";

function fail(message: string): never {
  console.error(`murmur: ${message}`);
  process.exit(1);
}

function validate(raw: any, base: string): Task {
  const errors: string[] = [];
  if (typeof raw !== "object" || raw === null) fail("task file must contain a JSON object");
  for (const key of ["goal", "done", "check", "provider", "model"]) {
    if (typeof raw[key] !== "string" || !raw[key].trim()) errors.push(`${key} must be a non-empty string`);
  }
  if (!Number.isInteger(raw.agents) || raw.agents < 1 || raw.agents > NAMES.length) errors.push(`agents must be an integer from 1 to ${NAMES.length}`);
  for (const key of ["budgetUsd", "budgetTokens"]) {
    if (raw[key] !== undefined && !(typeof raw[key] === "number" && raw[key] > 0)) errors.push(`${key} must be a positive number`);
  }
  if (raw.budgetUsd === undefined && raw.budgetTokens === undefined) errors.push("set budgetUsd and/or budgetTokens");
  if (!(typeof raw.timeoutMinutes === "number" && raw.timeoutMinutes > 0)) errors.push("timeoutMinutes must be a positive number");
  if (raw.thinking !== undefined && typeof raw.thinking !== "string") errors.push("thinking must be a string");
  if (raw.checks !== undefined && !(Array.isArray(raw.checks) && raw.checks.every((c: unknown) => typeof c === "string" && c.trim()))) errors.push("checks must be a list of commands");
  if (raw.messaging !== undefined) errors.push("messaging moved to the profile: set it in a profile file and point `profile` at it");
  const [project, profile] = ["project", "profile"].map(key => {
    const path = typeof raw[key] === "string" ? resolve(base, raw[key]) : undefined;
    if (raw[key] !== undefined && !(path && existsSync(path))) errors.push(`${key} must be an existing path`);
    return path;
  });
  if (errors.length) fail(`invalid task file:\n- ${errors.join("\n- ")}`);
  return { ...raw, project, profile };
}

const args = process.argv.slice(2);
const unsafe = args.includes("--unsafe");
const [command, file] = args.filter(arg => arg !== "--unsafe");
if (command !== "run" || !file) fail("usage: murmur run <task.json> [--unsafe]");
if (process.env.MURMUR_SANDBOX !== "1" && !unsafe) {
  fail("refusing to run outside a sandbox: set MURMUR_SANDBOX=1 (as the Docker image does) or pass --unsafe");
}
let raw: unknown;
try {
  raw = JSON.parse(readFileSync(file, "utf8"));
} catch (error) {
  fail(`cannot read ${file}: ${error}`);
}
const task = validate(raw, dirname(resolve(file)));
const stamp = new Date().toISOString().replace(/\D/g, "").slice(0, 14);
const runDir = join("runs", `${stamp.slice(0, 8)}-${stamp.slice(8)}-${randomBytes(2).toString("hex")}`);
try {
  const result = await runSwarm(task, { runDir });
  console.log(`murmur: ${runDir}: ${result.status} (${result.reason}), ${result.tokens} tokens, $${result.costUsd.toFixed(4)}`);
  process.exit(result.status === "passed" ? 0 : 1);
} catch (error) {
  fail(String(error instanceof Error ? error.message : error));
}
