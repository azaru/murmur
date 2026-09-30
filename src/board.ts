import { defineTool } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";

export type Log = (type: string, data?: Record<string, unknown>) => void;
export type Member = { name: string; working: boolean; doneReason?: string };

/** Shared in-memory state of one swarm. */
export class Board {
  members = new Map<string, Member>();

  constructor(names: string[], private log: Log) {
    for (const name of names) this.members.set(name, { name, working: false });
  }

  done(agent: string, reason: string) {
    this.members.get(agent)!.doneReason = reason;
    this.log("done", { agent, reason });
  }
}

const reply = (text: string) => ({ content: [{ type: "text" as const, text }], details: {} });

/** Coordination tools for one agent. */
export function boardTools(board: Board, agent: string) {
  return [
    defineTool({
      name: "done",
      label: "done",
      description: "Finish your work in the swarm. Call it when the definition of done is met, or to give up with the reason why the goal cannot be reached.",
      parameters: Type.Object({ reason: Type.String({ description: "Why you are finishing" }) }),
      async execute(_id, { reason }) {
        board.done(agent, reason);
        return reply("You are done. End your turn now.");
      },
    }),
  ];
}
