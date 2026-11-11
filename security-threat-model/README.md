# Arc UI (uiarc.dev) — AI-Facing Attack Surface: Defensive Threat-Model POC

**Authorized, defensive, educational security-labs material.** This package
analyzes the *AI-facing* attack surface of Arc UI — a React component library
built to be consumed by autonomous AI coding agents — and demonstrates the core
threat classes with a **safe, fully local, benign** lab.

It is **not** an attack on the live service, **not** a weaponized exploit, and
**not** an allegation that Arc is malicious. In fact, recon found the live Arc
service to be well-run (auth-gated MCP, consistent responses, clean source). The
threats modeled here are *structural* to the "AI-agent-is-the-primary-consumer"
pattern and would apply to any such library.

---

## Safety scope (read first)

- **Live service:** interaction was **read-only and minimal** — a handful of GETs
  of public `llms.txt` / per-component markdown / `r/*.json` / skill files, plus
  **one** MCP `initialize` POST (returned `401`; we did not authenticate, retry,
  fuzz, or flood). No auth-bypass attempts, no exploitation.
- **Demonstration:** **100% local**, mock data only. The sole "payload" is a
  harmless marker file `PWNED_marker.txt` written inside `demo/sandbox-repo/`.
  **No** network callbacks, **no** real exfiltration, **no** credentials,
  **no** destructive actions, **no** reusable attack tool.
- The mock "malicious" component source is **inert text** — it is only ever
  *statically scanned*, never executed.

---

## Contents

```
security-threat-model/
├─ README.md                         <- this file (safety scope + how to run)
├─ THREAT-MODEL.md                   <- recon findings + STRIDE threat model + mitigations
├─ recon-evidence/                   <- small artifacts captured read-only from the live site
│  ├─ real_button_markdown.md        <- a real per-component doc (what an agent ingests)
│  ├─ real_arc_INSTRUCTIONS.md       <- Arc's real "paste into CLAUDE.md" skill rules
│  └─ real_mcp_initialize_401.json   <- real MCP auth-gate response
└─ demo/                             <- SAFE LOCAL LAB (mock only)
   ├─ naive_agent_sim.py             <- simulator: naive vs. defended agent
   ├─ mock-registry/
   │  ├─ docs/quick-note.md          <- mock component doc w/ benign injected instruction (T1)
   │  └─ r/
   │     ├─ quick-note.json          <- mock shadcn item w/ inert "malicious" source (T2)
   │     └─ mcp_toolpoison_response.json <- mock MCP tools/list w/ poisoned description (T3)
   └─ sandbox-repo/                  <- the "developer repo" the simulator writes into
```

## How to run the demo

```bash
cd demo
python -I naive_agent_sim.py      # -I = isolated: ignores cwd/env for safety
```

Expected: `DEMO SELF-CHECK: PASS`. The **naive** agent gets "compromised"
(writes the benign marker, commits red-flagged source); the **defended** agent,
given the *same* mock inputs, neutralizes all three threats by treating library
output as untrusted data and reviewing installed source.

---

## What the recon actually found (summary)

- `llms.txt`, per-component markdown, and `r/*.json` are public and **served
  byte-identically to browser and agent User-Agents** (no cloaking observed).
- `r/<name>.json` carries **real component source** in `files[].content` — this is
  the code the shadcn CLI writes straight into a developer's repo. The real
  `button` source is **clean** (no risky APIs). There is **no signing, no content
  hash, and no version pin** — the structural integrity gap.
- The **MCP server is OAuth-gated** (Clerk). An anonymous `initialize` returns
  `401` with an OAuth discovery pointer. We therefore could **not** enumerate live
  MCP tools — reported honestly, and also a genuine positive control.
- Arc's own `INSTRUCTIONS.md` asks to be pasted into `CLAUDE.md`/`AGENTS.md`,
  establishing persistent agent trust in Arc output — the precondition every
  injection threat needs.

## Top threats (detail in `THREAT-MODEL.md`)

1. **T2 — shadcn "copy source into my repo" supply chain (HIGH):** agent writes
   unpinned, unsigned, unhashed source into the repo and commits it unreviewed.
2. **T1 — prompt injection via docs / MCP output (HIGH):** imperatives embedded
   in markdown or tool output that a naive agent executes as setup steps.
3. **T4 — over-trust / confused deputy (HIGH, amplifier):** the agent lends its
   repo-write + shell + secret access to whatever the library "says."
   (T3 — MCP tool-poisoning / rug-pull / cloaking — MEDIUM.)

## Key mitigations

- **Agents/devs:** treat library docs, MCP outputs, and tool descriptions as
  **untrusted data, never instructions**; require **human review of installed
  source** before commit; **pin + hash** registry items; **sandbox** the agent
  (no ambient push/shell/`.env`); allowlist MCP servers.
- **Library authors:** keep **instructions out of docs**; **sign / provide
  provenance** for docs and `r/*.json`; **version + hash** items; serve identical
  content to agents and humans; keep MCP tool descriptions declarative and
  versioned.
