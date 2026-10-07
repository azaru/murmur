import { defineTool } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import type { Log } from "./board.ts";

type Item = { id: number; title: string; details: string; author: string; state: "open" | "taken" | "done"; holder?: string; assignedBy?: string; note?: string };

/** A shared list of work items, like an issue tracker: any agent adds items and takes them, and with taskAssign any agent may
 * hand an item to a teammate, who can give it back. murmur only keeps the list. */
export class TaskList {
  items: Item[] = [];
  private shown = new Map<string, string>(); // agent -> progress line it last saw

  constructor(private log: Log) {}

  add(agent: string, title: string, details = "") {
    const item: Item = { id: this.items.length + 1, title, details, author: agent, state: "open" };
    this.items.push(item);
    this.log("task_add", { agent, id: item.id, title });
    return item.id;
  }

  take(agent: string, id: number) {
    const item = this.item(id);
    if (item.state === "done") throw new Error(`#${id} is already done`);
    if (item.holder && item.holder !== agent) throw new Error(`#${id} is taken by ${item.holder}`);
    Object.assign(item, { state: "taken", holder: agent });
    this.log("task_take", { agent, id });
  }

  /** A request between equals: the item becomes the teammate's, who can drop it. Only open items or the assigner's own. */
  assign(agent: string, id: number, to: string) {
    const item = this.item(id);
    if (item.state === "done") throw new Error(`#${id} is already done`);
    if (item.holder && item.holder !== agent) throw new Error(`#${id} is taken by ${item.holder}`);
    Object.assign(item, { state: "taken", holder: to, assignedBy: to === agent ? undefined : agent });
    this.log("task_assign", { agent, id, to });
    return item;
  }

  finish(agent: string, id: number, note = "") {
    const item = this.item(id);
    if (item.holder !== agent || item.state !== "taken") throw new Error(`you have not taken #${id}; task_take it first`);
    Object.assign(item, { state: "done", note });
    this.log("task_done", { agent, id, note });
  }

  drop(agent: string, id: number, note = "") {
    const item = this.item(id);
    if (item.holder !== agent || item.state !== "taken") throw new Error(`you have not taken #${id}`);
    Object.assign(item, { state: "open", holder: undefined, assignedBy: undefined, note });
    this.log("task_drop", { agent, id, note });
  }

  /** An agent that finishes gives back what it had taken, as with claims. */
  release(agent: string) {
    for (const item of this.items) if (item.state === "taken" && item.holder === agent) this.drop(agent, item.id, `${agent} finished without completing it`);
  }

  list() {
    return this.items.map(({ id, title, details, author, state, holder, assignedBy, note }) => {
      const by = assignedBy ? `, assigned by ${assignedBy}` : "";
      const head = `#${id} [${state === "open" ? "open" : state === "taken" ? `taken by ${holder}${by}` : `done by ${holder}`}] ${title} (added by ${author})`;
      const body = state === "done" ? note : [details, note && `last note: ${note}`].filter(Boolean).join("\n");
      return body ? `${head}\n  ${body.replace(/\n/g, "\n  ")}` : head;
    }).join("\n");
  }

  /** The progress line for an agent's next tool result, only when it changed since the agent last saw it. */
  news(agent: string) {
    const count = (state: Item["state"]) => this.items.filter(i => i.state === state).length;
    const mine = this.items.filter(i => i.state === "taken" && i.holder === agent).map(i => `#${i.id}`);
    const line = this.items.length
      ? `[task list: ${count("open")} open, ${count("taken")} taken${mine.length ? ` (by you: ${mine.join(", ")})` : ""}, ${count("done")} done]`
      : "[task list: empty]";
    if (this.shown.get(agent) === line) return "";
    this.shown.set(agent, line);
    return line;
  }

  private item(id: number) {
    const item = this.items[id - 1];
    if (!item) throw new Error(`no task #${id}; tasks lists them`);
    return item;
  }
}

export const TASK_TOOLS = ["tasks", "task_add", "task_take", "task_done", "task_drop", "task_assign"];

const reply = (text: string) => ({ content: [{ type: "text" as const, text }], details: {} });

/** With `assign`, task_add takes an optional teammate and task_assign hands an item over; `assigned` tells the team. */
export function taskTools(list: TaskList, agent: string, toolDescriptions: Record<string, string>,
  assign?: { names: string[]; assigned: (to: string, id: number, title: string) => void }) {
  const tool = (name: string, text: string, promptSnippet: string) => ({ name, label: name, description: toolDescriptions[name] ?? text, promptSnippet });
  const id = Type.Integer({ minimum: 1, description: "Task number, as in #3" });
  const handOver = (taskId: number, to: string) => {
    if (!assign!.names.includes(to)) throw new Error(`unknown agent ${to} (agents: ${assign!.names.join(", ")})`);
    const item = list.assign(agent, taskId, to);
    if (to !== agent) assign!.assigned(to, taskId, item.title);
    return to === agent ? `You have taken #${taskId}.` : `#${taskId} is now ${to}'s; ${to} is told and can give it back.`;
  };
  const forWhom = Type.String({ description: "A teammate's name" });
  const add = assign
    ? defineTool({ ...tool("task_add", "Add an item to the shared task list for anyone to take, yourself included, or hand it straight to a teammate with `for`: they are told, called back if they had left, and can give it back.", "Add an item to the shared task list, optionally for a teammate"),
      parameters: Type.Object({ title: Type.String({ description: "Short description of the work" }), details: Type.Optional(Type.String({ description: "Anything a taker needs to know" })),
        for: Type.Optional(forWhom) }),
      async execute(_id, { title, details, for: to }) { const n = list.add(agent, title, details); return reply(`Added #${n}.${to ? ` ${handOver(n, to)}` : ""}`); } })
    : defineTool({ ...tool("task_add", "Add an item to the shared task list for anyone to take, yourself included.", "Add an item to the shared task list"),
      parameters: Type.Object({ title: Type.String({ description: "Short description of the work" }), details: Type.Optional(Type.String({ description: "Anything a taker needs to know" })) }),
      async execute(_id, { title, details }) { return reply(`Added #${list.add(agent, title, details)}.`); } });
  return [
    defineTool({ ...tool("tasks", "Show the shared task list: every item with its state (open, taken by whom, done) and notes.", "Show the shared task list"),
      parameters: Type.Object({}), async execute() { return reply(list.list() || "The task list is empty."); } }),
    add,
    defineTool({ ...tool("task_take", "Take an open item from the task list: it shows as taken by you until you mark it done or drop it. Fails if someone else has taken it.", "Take an open item from the task list"),
      parameters: Type.Object({ id }), async execute(_id, { id }) { list.take(agent, id); return reply(`You have taken #${id}.`); } }),
    defineTool({ ...tool("task_done", "Mark an item you have taken as done, optionally with a short note on what you did.", "Mark an item you took as done"),
      parameters: Type.Object({ id, note: Type.Optional(Type.String()) }), async execute(_id, { id, note }) { list.finish(agent, id, note); return reply(`#${id} is done.`); } }),
    defineTool({ ...tool("task_drop", "Give back an item you have taken, unfinished, so someone else can take it.", "Give back an item you took, unfinished"),
      parameters: Type.Object({ id, note: Type.Optional(Type.String({ description: "Why, or what is left" })) }),
      async execute(_id, { id, note }) { list.drop(agent, id, note); return reply(`#${id} is open again.`); } }),
    ...(assign ? [defineTool({ ...tool("task_assign", "Hand an open item, or one you hold, to a teammate: it shows as theirs, they are told, called back if they had left, and can give it back with task_drop.", "Hand a task-list item to a teammate"),
      parameters: Type.Object({ id, to: forWhom }), async execute(_id, { id, to }) { return reply(handOver(id, to)); } })] : []),
  ];
}
