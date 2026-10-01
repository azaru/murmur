import { readFileSync } from "node:fs";
import { Type } from "typebox";
import { Errors } from "typebox/value";

export const BUILTIN_TOOLS = ["read", "bash", "edit", "write", "grep", "find", "ls"];
export const BOARD_TOOLS = ["post", "inbox", "team", "budget", "claim", "release", "role", "finding", "done"];

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
  /** Menu agents may pick from with role(name); empty means no role tool. Never assigned. */ roles: {} as Record<string, { summary: string; instructions: string }>,
  /** How many times a new post may wake an agent that already called done. */ revive: 0,
  /** done is refused while the agent has unread messages or the acceptance check fails. */ doneGate: false,
  /** How posts reach a busy agent: "steer" interrupts it; "attach" appends them to its next tool result; "pull" waits for inbox. */ delivery: "steer" as "steer" | "attach" | "pull",
  /** Share each agent's file writes and acceptance-check runs with teammates; needs delivery "attach". */ notices: false,
  /** Refuse a write that looks like only part of an existing file (starts indented, or is shorter and starts differently). */ writeGuard: false,
  /** Above 0, claims block other agents' write/edit and lapse after this many seconds without the holder writing. */ claimLease: 0,
  /** Refuse a write onto a file that changed since this agent last read or wrote it. */ staleGuard: false,
  /** Tool calls required after an agent's first passing check before done; its latest check must pass too. 0 is off. */ doneAfterGreen: 0,
  /** Append the minutes left before the timeout to every tool result. */ clock: false,
  /** How many fresh instances may take over each agent's seat after it calls done (a context reset, not a revival). */ relay: 0,
  /** Tokens per turn above which an agent with relays left is asked to write its handoff and call done. 0 is off. */ relayContext: 0,
  /** Offer finding(text, command): murmur runs the command and posts the claim with its real exit code and output. */ findings: false,
  /** Tool calls an agent makes while the acceptance check fails or has not run before the board hears it may need help; also posts when one finishes without a pass. 0 is off. */ helpAfter: 0,
  /** Board tools offered when messaging is on; done is always offered. */ boardTools: BOARD_TOOLS,
};
export type Profile = typeof DEFAULT_PROFILE;

const text = Type.Optional(Type.String()), flag = Type.Optional(Type.Boolean()), count = Type.Optional(Type.Integer({ minimum: 0 }));
const ProfileSchema = Type.Object({
  briefing: text, teamBriefing: text, steer: text, wake: text, systemPromptAppend: text,
  messaging: flag, doneGate: flag, notices: flag, writeGuard: flag, staleGuard: flag, clock: flag, findings: flag,
  revive: count, doneAfterGreen: count, relay: count, relayContext: count, helpAfter: count,
  spawnGapSeconds: Type.Optional(Type.Number({ minimum: 0 })), claimLease: Type.Optional(Type.Number({ minimum: 0 })),
  toolDescriptions: Type.Optional(Type.Record(Type.String(), Type.String())),
  tools: Type.Optional(Type.Array(Type.String())), boardTools: Type.Optional(Type.Array(Type.String())),
  roles: Type.Optional(Type.Record(Type.String(), Type.Object({ summary: Type.String(), instructions: Type.String() }, { additionalProperties: false }))),
  delivery: Type.Optional(Type.Union([Type.Literal("steer"), Type.Literal("attach"), Type.Literal("pull")])),
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
  const badBoardTool = raw.boardTools?.find((t: string) => !BOARD_TOOLS.includes(t));
  if (badBoardTool) throw new Error(`profile ${path}: unknown board tool ${badBoardTool} (allowed: ${BOARD_TOOLS.join(", ")})`);
  const badDescription = Object.keys(raw.toolDescriptions ?? {}).find(t => !BOARD_TOOLS.includes(t));
  if (badDescription) throw new Error(`profile ${path}: toolDescriptions.${badDescription} is not a board tool`);
  return { ...DEFAULT_PROFILE, ...raw };
}

/** Fills {key} placeholders in one pass, so substituted text is never re-expanded. */
export function render(template: string, values: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match);
}
