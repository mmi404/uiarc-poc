# Arc UI POC Program

A proof-of-concept program evaluating [Arc UI](https://uiarc.dev/) ("The React UI
library your AI agents can build with") across three angles:

1. **Flagship dashboard** (`flagship-dashboard/`) — a real, motion-heavy SaaS
   analytics product built with Arc's components, to see how far an AI agent
   can get building a polished application surface with it.
2. **Agent-buildable showcase** — assembling a screen from Arc's genuine
   upstream source via its public component registry, to test the frictionless
   agent-facing install path.
3. **Security threat model** — a defensive look at the risks of an AI agent
   pulling UI code from a library's docs/registry/MCP server.

This repo is built step by step, track by track. Each track gets its own
project folder plus a doc under `docs/`.

## Status

| Track | Code | Doc |
|---|---|---|
| 1. Flagship dashboard | [`flagship-dashboard/`](flagship-dashboard/) | [`docs/01-flagship-dashboard.md`](docs/01-flagship-dashboard.md) |
| 2. Agent-buildable showcase | [`agent-buildable/`](agent-buildable/) | [`docs/02-agent-buildable.md`](docs/02-agent-buildable.md) |
| 3. Security threat model | not started | not started |

## Docs

Each track's writeup lives in `docs/` as both Markdown and a generated PDF.
PDFs are built from the Markdown with `docs/tools/md2pdf.py` (Python
`markdown` + headless Chrome print-to-pdf — see that file for requirements).
