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
  assert.ok(list.items.every(i => i.state === "open" && !i.holder));
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
