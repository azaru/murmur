import { readFileSync } from "node:fs";
import { Type } from "typebox";
import { Errors } from "typebox/value";

export const BUILTIN_TOOLS = ["read", "bash", "edit", "write", "grep", "find", "ls"];
export const BOARD_TOOLS = ["post", "inbox", "team", "budget", "claim", "release", "done"];

/** Everything about how murmur behaves that an experiment may change. */
export const DEFAULT_PROFILE = {
  messaging: true,
  briefing: `You are {name}, an agent in a swarm. You work in the current directory; stay inside it.
{team}
Goal:
{goal}

Definition of done:
{done}

Acceptance check (run from the current directory, must exit 0):
{check}

When the definition of done is met and the check passes, call done(reason). If you conclude the goal cannot be reached, call done(reason) with the reason instead of pushing on.`,
  teamBriefing: `
Teammates: {teammates}. You all share this folder and this goal; nobody is in charge.
Coordinate on the shared board:
- post(text, thread?) sends a message to every teammate; inbox() returns the messages you have not read.
- team() shows who is working, idle or done and which files they claim; budget() shows the shared spend.
- claim(path) / release(path) announce which file you are editing (advisory; claim fails if someone else holds it).
Start by reading your inbox and posting what you will work on. When told you have new messages, call inbox.
`,
  steer: "You have new messages on the board; call inbox.",
  wake: "You have new messages on the board. Call inbox, then continue toward the goal.",
  systemPromptAppend: "",
  toolDescriptions: {} as Record<string, string>,
  tools: ["read", "bash", "edit", "write"],
  spawnGapSeconds: 0,
};
export type Profile = typeof DEFAULT_PROFILE;

const text = Type.Optional(Type.String());
const ProfileSchema = Type.Object({
  messaging: Type.Optional(Type.Boolean()),
  briefing: text, teamBriefing: text, steer: text, wake: text, systemPromptAppend: text,
  toolDescriptions: Type.Optional(Type.Record(Type.String(), Type.String())),
  tools: Type.Optional(Type.Array(Type.String())),
  spawnGapSeconds: Type.Optional(Type.Number({ minimum: 0 })),
}, { additionalProperties: false });

export function loadProfile(path?: string): Profile {
  if (!path) return DEFAULT_PROFILE;
  const raw = JSON.parse(readFileSync(path, "utf8"));
  const error = [...Errors(ProfileSchema, raw)][0];
  if (error) {
    const what = error.schemaPath.endsWith("additionalProperties") ? "is not a profile key" : error.message;
    throw new Error(`profile ${path}: ${error.instancePath || "/"} ${what}`);
  }
  const badTool = raw.tools?.find((t: string) => !BUILTIN_TOOLS.includes(t));
  if (badTool) throw new Error(`profile ${path}: unknown tool ${badTool} (allowed: ${BUILTIN_TOOLS.join(", ")})`);
  const badDescription = Object.keys(raw.toolDescriptions ?? {}).find(t => !BOARD_TOOLS.includes(t));
  if (badDescription) throw new Error(`profile ${path}: toolDescriptions.${badDescription} is not a board tool`);
  return { ...DEFAULT_PROFILE, ...raw };
}

/** Fills {key} placeholders in one pass, so substituted text is never re-expanded. */
export function render(template: string, values: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match);
}
