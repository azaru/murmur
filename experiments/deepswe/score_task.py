#!/usr/bin/env python3
"""Partial-credit scorer for a DeepSWE task, run against a live container whose /app holds the agent's work
(or the base commit, or base + reference solution).

It reuses the task's own tests/test.sh up to "Step 3" (model.patch capture, reset of the files test.patch touches,
apply test.patch), then runs `test.sh base` and `test.sh new` separately with per-test reporters and parses the
results (go test -json, pytest -rA, cargo test, jest --json, vitest verbose, mocha tap).

A reference file lists the tests that pass with the reference solution (see `reference()`):
  new_frac  = |new tests passing & ref new_f2p| / |ref new_f2p|   (f2p = fail at the untouched base, pass with the solution)
  base_frac = |base tests passing & ref base|   / |ref base|
  score     = new_frac * base_frac     (regressions in existing tests scale the credit down)
  binary    = 1 iff both test.sh modes exit 0 (what the official verifier gives)

Usage:  score_task.py TASK_DIR CONTAINER [--ref ref.json] [--out result.json] [--log-dir DIR]
As a module: score(task_dir, container) -> result dict; reference(solution_result, base_result) -> ref dict;
apply_ref(result, ref) adds the fractions.
"""
import argparse, json, os, re, subprocess, sys, tempfile, time

ENV = {"PYTEST_ADDOPTS": "-rA -p no:cacheprovider"}  # one line per test, whatever flags test.sh passes
# GOFLAGS=-json would also change `go env` (a task's own tests call it), so shim only `go test`.
GO_SHIM = """#!/bin/bash
REAL=$(PATH=${PATH#/opt/shim:} command -v go)
if [ "$1" = test ]; then shift; exec "$REAL" test -json "$@"; fi
exec "$REAL" "$@"
"""
# Appended to the prepared script: no fail-fast flags (the scorer must see every test) and per-test reporters for the
# JS runners, injected into the test.sh that test.patch added. Runners invoked some other way (a package script) are not
# covered and fall back to the exit codes only (`parsed` is 0 in the result).
PREP_TAIL = r"""
sed -i -E 's/ (-x|--exitfirst|-failfast|--bail( [0-9]+|=[0-9]+)?)( |$)/ /g' /app/test.sh
sed -i -E 's/(npx jest|node_modules\/\.bin\/jest|pnpm exec jest|bunx jest)( |$)/\1 --json \2/g' /app/test.sh
sed -i -E 's/ (--reporter|-R)[= ][^ ]+//g' /app/test.sh
sed -i -E 's/(npx vitest run|node_modules\/\.bin\/vitest run|pnpm exec vitest run|bunx vitest run)( |$)/\1 --reporter=verbose \2/g' /app/test.sh
sed -i -E 's/(npx mocha|node_modules\/\.bin\/mocha|pnpm exec mocha|pnpm mocha)( |$)/\1 --reporter=tap \2/g' /app/test.sh
"""


def sh(args, **kw):
    return subprocess.run(args, capture_output=True, text=True, **kw)


def parse(output):
    """Return {test_id: 'pass'|'fail'|'skip'} from the mixed runner output."""
    res = {}
    for line in output.splitlines():
        line = line.rstrip()
        if line.startswith('{"Time"') or line.startswith('{"Action"'):  # go test -json
            try:
                e = json.loads(line)
            except ValueError:
                continue
            if e.get("Test") and e.get("Action") in ("pass", "fail", "skip"):
                res[f'{e.get("Package","")}::{e["Test"]}'] = e["Action"]
            continue
        if line.startswith('{"numFailedTestSuites"'):  # jest --json
            try:
                e = json.loads(line)
            except ValueError:
                continue
            for suite in e.get("testResults", []):
                f = suite.get("name", "").replace("/app/", "", 1)
                for a in suite.get("assertionResults", []):
                    res[f'js::{f}::{a.get("fullName")}'] = {"passed": "pass", "failed": "fail"}.get(a.get("status"), "skip")
            continue
        m = re.match(r"^(PASSED|FAILED|ERROR|SKIPPED|XFAIL|XPASS) (\S+::\S+)", line)  # pytest -rA
        if m:
            res.setdefault("py::" + m.group(2), {"PASSED": "pass", "XPASS": "pass", "FAILED": "fail", "ERROR": "fail"}.get(m.group(1), "skip"))
            continue
        m = re.match(r"^test (\S+) \.\.\. (ok|FAILED|ignored)", line)  # cargo test
        if m:
            res["rs::" + m.group(1)] = {"ok": "pass", "FAILED": "fail", "ignored": "skip"}[m.group(2)]
            continue
        m = re.match(r"^\s*(✓|×|✗|✕|↓)\s+(\S.* > .*?)(?:\s+\d+(?:\.\d+)?m?s)?$", line)  # vitest --reporter=verbose
        if m:
            key = "vt::" + m.group(2)  # the typecheck pass reports the same test name: a failure in either counts
            if res.get(key) != "fail":
                res[key] = {"✓": "pass", "↓": "skip"}.get(m.group(1), "fail")
            continue
        m = re.match(r"^(ok|not ok) \d+ (.+?)(?: # (SKIP|skip).*)?$", line)  # mocha --reporter=tap
        if m:
            res["mocha::" + m.group(2)] = "skip" if m.group(3) else ("pass" if m.group(1) == "ok" else "fail")
    return res


def run_mode(container, mode):
    t = time.time()
    envs = [x for k, v in ENV.items() for x in ("-e", f"{k}={v}")]
    r = sh(["docker", "exec", *envs, "-w", "/app", container, "bash", "-c", f"PATH=/opt/shim:$PATH bash /app/test.sh {mode}"])
    out = r.stdout + "\n" + r.stderr
    tests = parse(out)
    return {"exit": r.returncode, "seconds": round(time.time() - t, 1),
            "passed": sorted(k for k, v in tests.items() if v == "pass"),
            "failed": sorted(k for k, v in tests.items() if v == "fail")}, out


def score(task_dir, container, log_dir=None):
    """Run the verifier steps in `container` and return {task, binary, base, new} (lists of test ids)."""
    tdir = os.path.abspath(task_dir)
    prep = open(f"{tdir}/tests/test.sh").read().split("# --- Step 3")[0] + PREP_TAIL
    sh(["docker", "exec", container, "mkdir", "-p", "/tests", "/logs/verifier", "/logs/artifacts"])
    sh(["docker", "cp", f"{tdir}/tests/test.patch", f"{container}:/tests/test.patch"])
    with tempfile.NamedTemporaryFile("w", suffix=".sh", dir=os.getcwd(), delete=False) as f:
        f.write(prep); pp = f.name
    sh(["docker", "cp", pp, f"{container}:/tmp/prep.sh"]); os.unlink(pp)
    r = sh(["docker", "exec", container, "bash", "/tmp/prep.sh"])
    if r.returncode != 0:
        raise RuntimeError(f"prep failed ({r.returncode}): {r.stdout[-500:]} {r.stderr[-500:]}")
    sh(["docker", "exec", "-i", container, "bash", "-c", "mkdir -p /opt/shim && cat > /opt/shim/go && chmod +x /opt/shim/go"], input=GO_SHIM)
    base, bout = run_mode(container, "base")
    new, nout = run_mode(container, "new")
    if log_dir:
        os.makedirs(log_dir, exist_ok=True)
        open(f"{log_dir}/base.log", "w").write(bout); open(f"{log_dir}/new.log", "w").write(nout)
    return {"task": os.path.basename(tdir), "binary": int(base["exit"] == 0 and new["exit"] == 0), "base": base, "new": new}


def reference(solution, base):
    """Reference from a scored solution run and a scored untouched-base run of the same task."""
    new_ref, at_base = set(solution["new"]["passed"]), set(base["new"]["passed"])
    return {"new": sorted(new_ref), "new_f2p": sorted(new_ref - at_base), "base": solution["base"]["passed"]}


def apply_ref(res, ref):
    rn, rb = set(ref["new_f2p"]), set(ref["base"])
    res["new_frac"] = len(rn & set(res["new"]["passed"])) / len(rn) if rn else None
    res["base_frac"] = len(rb & set(res["base"]["passed"])) / len(rb) if rb else 1.0
    res["score"] = None if res["new_frac"] is None else res["new_frac"] * res["base_frac"]
    res["ref_new_total"], res["ref_base_total"] = len(rn), len(rb)
    res["parsed"] = len(res["new"]["passed"]) + len(res["new"]["failed"]) + len(res["base"]["passed"]) + len(res["base"]["failed"])
    return res


def summary(res):
    s = {k: v for k, v in res.items() if k not in ("base", "new")}
    for mode in ("base", "new"):
        s[mode] = {k: (len(v) if isinstance(v, list) else v) for k, v in res[mode].items()}
    return s


def make_ref(argv):
    """score_task.py ref SOLUTION.json BASE.json [--write ref.json]: build the reference and print the scores of both runs."""
    sol, base = (json.load(open(f)) for f in argv[:2])
    ref = reference(sol, base)
    if "--write" in argv and ref["new_f2p"]:  # an empty reference means the parser saw nothing: never store it
        json.dump(ref, open(argv[argv.index("--write") + 1], "w"))
    print(json.dumps({"ref": {k: len(v) for k, v in ref.items()}, "sol": summary(apply_ref(sol, ref)), "base": summary(apply_ref(base, ref))}))


def main():
    if sys.argv[1:2] == ["ref"]:
        return make_ref(sys.argv[2:])
    ap = argparse.ArgumentParser()
    ap.add_argument("task_dir"); ap.add_argument("container")
    ap.add_argument("--ref"); ap.add_argument("--out"); ap.add_argument("--log-dir")
    a = ap.parse_args()
    res = score(a.task_dir, a.container, a.log_dir)
    if a.ref:
        apply_ref(res, json.load(open(a.ref)))
    print(json.dumps(summary(res)))
    if a.out:
        json.dump(res, open(a.out, "w"), indent=1)


if __name__ == "__main__":
    main()
