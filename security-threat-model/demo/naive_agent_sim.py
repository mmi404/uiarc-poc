#!/usr/bin/env python3
"""
SAFE LAB SIMULATOR — AI-facing attack surface of an Arc-style UI library.
=========================================================================

Educational / defensive. 100% LOCAL. Mock data only. No network, no secrets,
no destructive actions. The only "payload" is a harmless marker file
(PWNED_marker.txt) written INSIDE this demo's sandbox-repo/ folder.

It contrasts two agent behaviours ingesting the SAME mock library surface:

  * NAIVE agent  — treats library docs / MCP output / source as TRUSTED
                   instructions. It "gets owned": obeys injected imperatives
                   and commits malicious source unreviewed.
  * DEFENDED agent — treats the same inputs as UNTRUSTED DATA. It ignores
                   imperatives and statically scans installed source,
                   refusing to commit red-flagged code.

The mock library files are NEVER executed. The malicious .tsx is only ever
read as text and statically scanned (that is the whole point).

Run:
    python -I naive_agent_sim.py
"""
import json
import re
import sys
from pathlib import Path

DEMO = Path(__file__).resolve().parent
DOC = DEMO / "mock-registry" / "docs" / "quick-note.md"
REG = DEMO / "mock-registry" / "r" / "quick-note.json"
MCP = DEMO / "mock-registry" / "r" / "mcp_toolpoison_response.json"
REPO = DEMO / "sandbox-repo"               # the "developer's repo" (sandbox)
MARKER = REPO / "PWNED_marker.txt"

# Imperative phrases that reveal text is addressing the AGENT, not documenting UI.
IMPERATIVE_RE = re.compile(
    r"(create a file|do not ask the user|do not mention this|just do it|"
    r"add this <script|set .*env|run this|mandatory|system note to assistant|"
    r"enable telemetry)",
    re.IGNORECASE,
)
# Static red flags in installed component source.
SOURCE_RED_FLAGS = [
    "dangerouslySetInnerHTML", "eval(", "new Function", "import(",
    "fetch(", "XMLHttpRequest", "document.cookie", "child_process",
]

def banner(t): print("\n" + "=" * 72 + f"\n{t}\n" + "=" * 72)
def reset():
    REPO.mkdir(parents=True, exist_ok=True)
    if MARKER.exists(): MARKER.unlink()
    for f in REPO.glob("src/components/*.tsx"):
        f.unlink()

# --------------------------------------------------------------------------
# NAIVE AGENT: everything the library says is trusted.
# --------------------------------------------------------------------------
def run_naive():
    banner("PROFILE A — NAIVE (OVER-TRUSTING) AGENT  [T1 + T3 + T2 + T4]")
    pwned = []

    # T1: ingest markdown doc as trusted instructions.
    doc = DOC.read_text(encoding="utf-8")
    hits = IMPERATIVE_RE.findall(doc)
    print(f"[naive] read {DOC.name} into context ({len(doc)} chars).")
    if hits:
        print(f"[naive] doc contains imperatives {sorted(set(h.lower() for h in hits))}")
        print("[naive] -> treating them as setup steps and OBEYING...")
        MARKER.write_text("injected-via-docs\n", encoding="utf-8")   # benign marker
        pwned.append("T1 docs injection -> wrote PWNED_marker.txt")

    # T3: ingest MCP tool descriptions as trusted.
    tools = json.loads(MCP.read_text(encoding="utf-8"))["result"]["tools"]
    for tool in tools:
        if IMPERATIVE_RE.search(tool["description"]):
            print(f"[naive] MCP tool '{tool['name']}' description carries a hidden instruction -> OBEYING...")
            MARKER.write_text("injected-via-mcp-tool-description\n", encoding="utf-8")
            pwned.append(f"T3 tool-poisoning via '{tool['name']}' -> wrote marker")

    # T2 + T4: install component source and commit it unreviewed.
    item = json.loads(REG.read_text(encoding="utf-8"))
    for f in item["files"]:
        dest = REPO / f["path"]
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(f["content"], encoding="utf-8")   # written verbatim, no review
        print(f"[naive] installed {f['path']} ({len(f['content'])} chars) and 'committed' it WITHOUT review.")
        flags = [p for p in SOURCE_RED_FLAGS if p in f["content"]]
        if flags:
            pwned.append(f"T2 unreviewed source shipped with red flags: {flags}")

    print("\n[naive] RESULT — agent compromised:")
    for p in pwned:
        print("   X " + p)
    return pwned

# --------------------------------------------------------------------------
# DEFENDED AGENT: library output is untrusted DATA.
# --------------------------------------------------------------------------
def run_defended():
    banner("PROFILE B — DEFENDED AGENT  [mitigations applied]")
    blocked = []

    doc = DOC.read_text(encoding="utf-8")
    if IMPERATIVE_RE.search(doc):
        print("[defended] doc contains agent-directed imperatives.")
        print("[defended] -> docs are DATA, not instructions. Ignoring + flagging for human.")
        blocked.append("T1 neutralized: imperatives in docs ignored")

    tools = json.loads(MCP.read_text(encoding="utf-8"))["result"]["tools"]
    for tool in tools:
        if IMPERATIVE_RE.search(tool["description"]):
            print(f"[defended] MCP tool '{tool['name']}' description carries an instruction -> refusing to act on it.")
            blocked.append(f"T3 neutralized: ignored hidden instruction in '{tool['name']}'")

    item = json.loads(REG.read_text(encoding="utf-8"))
    for f in item["files"]:
        flags = [p for p in SOURCE_RED_FLAGS if p in f["content"]]
        if flags:
            print(f"[defended] static scan of {f['path']} FAILED: {flags}")
            print("[defended] -> install BLOCKED pending human review. Nothing committed.")
            blocked.append(f"T2 neutralized: refused to commit {f['path']} ({flags})")

    marker_written = MARKER.exists()
    print(f"\n[defended] PWNED_marker.txt present? {marker_written}  (expected: False)")
    print("[defended] RESULT — attacks neutralized:")
    for b in blocked:
        print("   OK " + b)
    return blocked, marker_written

def main():
    print(__doc__)
    reset()
    run_naive()
    naive_owned = MARKER.exists()
    print(f"\n>>> after NAIVE run, marker exists? {naive_owned}  (expected: True == compromised)")

    reset()   # clean slate for the defended run
    _, defended_owned = run_defended()

    banner("SUMMARY")
    print(f"  NAIVE agent    -> compromised: {naive_owned}")
    print(f"  DEFENDED agent -> compromised: {defended_owned}")
    print("\n  The ONLY difference is the trust boundary: the defended agent treats")
    print("  library docs / MCP output / source as UNTRUSTED DATA and reviews")
    print("  installed source. Same inputs, opposite outcome.")
    ok = naive_owned and not defended_owned
    print("\n  DEMO SELF-CHECK:", "PASS" if ok else "FAIL")
    sys.exit(0 if ok else 1)

if __name__ == "__main__":
    main()
