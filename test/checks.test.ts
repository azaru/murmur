import assert from "node:assert/strict";
import { test } from "node:test";
import { checkMatcher } from "../src/swarm.ts";

test("a command runs the check when the check is a statement whose exit status nothing masks", () => {
  const runs = checkMatcher("python3 -m unittest -q test_trio");
  for (const command of ["python3 -m unittest -q test_trio", "cd src && python3 -m unittest -q test_trio", "time python3 -m unittest -q test_trio 2>&1",
    "PYTHONPATH=. python3 -m unittest -q test_trio && echo ok", "timeout 60 python3 -m unittest -q test_trio > out.txt"]) {
    assert.ok(runs(command), command);
  }
  for (const command of ["python3 -m unittest -q test_trio | tail -3", "python3 -m unittest -q test_trio; echo done", "python3 -m unittest -q test_trio_extra",
    "echo 'python3 -m unittest -q test_trio'", "python3 -m unittest -q test_trio\nls", "npm test"]) {
    assert.ok(!runs(command), command);
  }
});

test("a check that contains quotes falls back to plain containment", () => {
  const runs = checkMatcher(`node -e "require('./x').run()"`);
  assert.ok(runs(`node -e "require('./x').run()" && echo ok`));
  assert.ok(!runs("node -e x"));
});
