import assert from "node:assert/strict";
import { test } from "node:test";
import { Board } from "../src/board.ts";

const setup = (threaded: boolean) => {
  const notified: string[] = [];
  const board = new Board(["a", "b", "c"], () => {}, member => notified.push(member.name), () => "");
  board.threaded = threaded;
  return { board, notified };
};
const texts = (board: Board, agent: string) => board.unread(agent).map(m => m.text);

test("a new thread is announced once, and only followers receive its posts", () => {
  const { board, notified } = setup(true);
  const id = board.open("a", "parser api", "who owns parse()?");
  assert.deepEqual(notified, ["b", "c"]);
  assert.match(texts(board, "b")[0], /opened "parser api" \(1 post\(s\)\); thread_read t1/);
  assert.deepEqual(texts(board, "a"), []);

  board.inbox("c"); // c was told and does not follow
  board.read("b", id);
  notified.length = 0;
  board.reply("a", id, "I do");
  assert.deepEqual(notified, ["b"]);
  assert.deepEqual(texts(board, "b"), ["I do"]);
  assert.deepEqual(texts(board, "c"), []);
});

test("reading follows the thread, and reply returns what the agent had missed", () => {
  const { board } = setup(true);
  const id = board.open("a", "t", "one");
  board.reply("b", id, "two"); // b replies without having read: it gets a's post back
  assert.deepEqual(board.reply("c", id, "three").map(m => m.text), ["one", "two"]);
  assert.deepEqual(texts(board, "a"), ["two", "three"]);
  board.inbox("a");
  assert.deepEqual(texts(board, "a"), []);
  assert.deepEqual(board.reply("a", id, "four").map(m => m.text), []);
});

test("a labelled post by someone who is behind does not skip what they missed", () => {
  const { board } = setup(true);
  const id = board.open("a", "t", "one");
  board.reply("b", id, "two");
  board.post("a", "three", id);
  assert.deepEqual(texts(board, "a"), ["two"]);
});

test("labelled posts open or extend a thread named by the label", () => {
  const { board } = setup(true);
  board.post("a", "stuck", "help");
  board.post("b", "me too", "help");
  assert.equal(board.threads.get("help")!.posts.length, 2);
  assert.equal(board.listThreads("c"), '' + 'help "help" by a, 2 post(s); not following');
  assert.throws(() => board.read("c", "nope"), /no thread nope/);
});

test("the flat board still notifies everyone and delivers every post", () => {
  const { board, notified } = setup(false);
  board.post("a", "hello");
  assert.deepEqual(notified, ["b", "c"]);
  assert.deepEqual(texts(board, "b"), ["hello"]);
  assert.equal(board.inbox("b").length, 1);
  assert.deepEqual(texts(board, "b"), []);
});
