import { defineTool } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import type { Log } from "./board.ts";

type Item = { id: number; title: string; details: string; author: string; state: "open" | "taken" | "done"; holder?: string; note?: string };

/** A shared list of work items, like an issue tracker: any agent adds items and takes them. murmur only keeps the list; nobody assigns. */
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

  finish(agent: string, id: number, note = "") {
    const item = this.item(id);
    if (item.holder !== agent || item.state !== "taken") throw new Error(`you have not taken #${id}; task_take it first`);
    Object.assign(item, { state: "done", note });
    this.log("task_done", { agent, id, note });
  }

  drop(agent: string, id: number, note = "") {
    const item = this.item(id);
    if (item.holder !== agent || item.state !== "taken") throw new Error(`you have not taken #${id}`);
    Object.assign(item, { state: "open", holder: undefined, note });
    this.log("task_drop", { agent, id, note });
  }

  /** An agent that finishes gives back what it had taken, as with claims. */
  release(agent: string) {
    for (const item of this.items) if (item.state === "taken" && item.holder === agent) this.drop(agent, item.id, `${agent} finished without completing it`);
  }

  list() {
    return this.items.map(({ id, title, details, author, state, holder, note }) => {
      const head = `#${id} [${state === "open" ? "open" : state === "taken" ? `taken by ${holder}` : `done by ${holder}`}] ${title} (added by ${author})`;
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

export const TASK_TOOLS = ["tasks", "task_add", "task_take", "task_done", "task_drop"];

const reply = (text: string) => ({ content: [{ type: "text" as const, text }], details: {} });

export function taskTools(list: TaskList, agent: string, toolDescriptions: Record<string, string>) {
  const tool = (name: string, text: string) => ({ name, label: name, description: toolDescriptions[name] ?? text });
  const id = Type.Integer({ minimum: 1, description: "Task number, as in #3" });
  return [
    defineTool({ ...tool("tasks", "Show the shared task list: every item with its state (open, taken by whom, done) and notes."),
      parameters: Type.Object({}), async execute() { return reply(list.list() || "The task list is empty."); } }),
    defineTool({ ...tool("task_add", "Add an item to the shared task list for anyone to take, yourself included."),
      parameters: Type.Object({ title: Type.String({ description: "Short description of the work" }), details: Type.Optional(Type.String()) }),
      async execute(_id, { title, details }) { return reply(`Added #${list.add(agent, title, details)}.`); } }),
    defineTool({ ...tool("task_take", "Take an open item from the task list: it shows as taken by you until you mark it done or drop it. Fails if someone else has taken it."),
      parameters: Type.Object({ id }), async execute(_id, { id }) { list.take(agent, id); return reply(`You have taken #${id}.`); } }),
    defineTool({ ...tool("task_done", "Mark an item you have taken as done, with a short note on what you did."),
      parameters: Type.Object({ id, note: Type.Optional(Type.String()) }), async execute(_id, { id, note }) { list.finish(agent, id, note); return reply(`#${id} is done.`); } }),
    defineTool({ ...tool("task_drop", "Give back an item you have taken, unfinished, so someone else can take it."),
      parameters: Type.Object({ id, note: Type.Optional(Type.String({ description: "Why, or what is left" })) }),
      async execute(_id, { id, note }) { list.drop(agent, id, note); return reply(`#${id} is open again.`); } }),
  ];
}
