import assert from "node:assert/strict";
import { test } from "node:test";
import { TaskList } from "../src/tasklist.ts";

test("items are added, taken by one agent at a time, finished only by their holder", () => {
  const list = new TaskList(() => {});
  assert.equal(list.add("a", "parser", "handle quotes"), 1);
  assert.equal(list.add("b", "cli"), 2);
  list.take("a", 1);
  assert.throws(() => list.take("b", 1), /taken by a/);
  assert.throws(() => list.finish("b", 1), /not taken #1/);
  list.finish("a", 1, "quotes and escapes");
  assert.throws(() => list.take("b", 1), /already done/);
  assert.match(list.list(), /#1 \[done by a\] parser \(added by a\)\n {2}quotes and escapes\n#2 \[open\] cli \(added by b\)/);
});

test("dropping or finishing the run gives items back", () => {
  const list = new TaskList(() => {});
  list.add("a", "x"), list.add("a", "y");
  list.take("b", 1), list.take("b", 2);
  list.drop("b", 1, "needs the parser first");
  assert.match(list.list(), /#1 \[open\] x \(added by a\)\n {2}last note: needs the parser first/);
  list.release("b");
  assert.ok(list.items.every(i => i.state === "open" && !i.holders.length));
});

test("the progress line is shown only when it changed for that agent", () => {
  const list = new TaskList(() => {});
  assert.equal(list.news("a"), "[task list: empty]");
  assert.equal(list.news("a"), "");
  list.add("b", "x");
  list.take("a", 1);
  assert.equal(list.news("a"), "[task list: 0 open, 1 taken (by you: #1), 0 done]");
  assert.equal(list.news("b"), "[task list: 0 open, 1 taken, 0 done]");
  assert.equal(list.news("b"), "");
});

test("an item can be handed to a teammate, who can give it back", () => {
  const list = new TaskList(() => {});
  list.add("a", "x"), list.add("a", "y");
  list.assign("a", 1, "b");
  assert.match(list.list(), /#1 \[taken by b, assigned by a\] x/);
  list.take("c", 2);
  assert.throws(() => list.assign("a", 2, "b"), /taken by c/);
  list.drop("b", 1, "busy");
  assert.match(list.list(), /#1 \[open\] x \(added by a\)/);
});

test("with shared, a second agent joins the holders; the item reopens when every holder dropped it", () => {
  const list = new TaskList(() => {}, { shared: true });
  list.add("a", "core");
  list.take("a", 1), list.take("b", 1);
  assert.match(list.list(), /#1 \[taken by a, b\] core/);
  assert.equal(list.news("b"), "[task list: 0 open, 1 taken (by you: #1), 0 done]");
  list.drop("a", 1);
  assert.match(list.list(), /#1 \[taken by b\] core/);
  list.release("b");
  assert.match(list.list(), /#1 \[open\] core/);
  list.take("c", 1), list.take("d", 1);
  list.finish("d", 1, "both halves");
  assert.match(list.list(), /#1 \[done by c, d\] core/);
});

test("with weights, unfinished items are listed heaviest first and done items last", () => {
  const list = new TaskList(() => {}, { weights: true });
  list.add("a", "detail", "", 2), list.add("a", "core", "", 9), list.add("a", "middle", "", 5);
  list.take("b", 2), list.finish("b", 2);
  assert.deepEqual(list.list().split("\n").map(l => l.match(/^#\d+/)?.[0]), ["#3", "#1", "#2"]);
  assert.match(list.list(), /^#3 \(weight 5\) \[open\] middle/);
});

test("with idle, a holder without a write/edit since taking the item is marked once it held it long enough", () => {
  let now = 0;
  const edits = new Map<string, number>();
  const list = new TaskList(() => {}, { shared: true, idle: { minutes: 3, lastEdit: a => edits.get(a) }, now: () => now });
  list.add("a", "core");
  list.take("a", 1), list.take("b", 1);
  now = 2 * 60_000;
  assert.match(list.list(), /#1 \[taken by a, b\] core/);
  edits.set("b", now);
  now = 5 * 60_000;
  assert.match(list.list(), /#1 \[taken by a \(no write\/edit since taking it 5 min ago\), b\] core/);
  list.drop("a", 1), list.take("a", 1);
  assert.match(list.list(), /#1 \[taken by b, a\] core/);
});
