# Agent-buildable showcase

A POC of the Arc UI (https://uiarc.dev) pitch: **"The React UI library your AI agents can build with."**

It shows, end to end, how an AI agent discovers Arc from its AI-facing surface (`llms.txt` →
per-component markdown docs → public shadcn registry) and assembles a working **"Create project"**
screen from real Arc components.

- **The narrative + evidence** (fetched AI-surface excerpts, the MCP probe, the step-by-step
  agent-build transcript, and an honest assessment of the claim): see **[`WRITEUP.md`](./WRITEUP.md)**.
- **The assembled screen:** [`src/App.tsx`](./src/App.tsx) — composes Arc **Input, Textarea, Select,
  Switch, Button**.
- **The Arc components:** [`src/components/arc/`](./src/components/arc) — **real Arc source**, pulled
  unmodified from `https://uiarc.dev/r/<name>.json` (the same files `npx shadcn@latest add @uiarc/<name>`
  installs). `App.tsx` and `index.css` are the only hand-written code; they use only documented props
  and Arc's semantic tokens.

## Run it

```bash
npm install
npm run dev     # start the dev server
npm run build   # tsc type-check + production build (passes)
```

## How Arc was consumed (read-only)

| Step | Arc surface used |
| --- | --- |
| Discover the catalog & agent rules | `GET https://uiarc.dev/llms.txt` |
| Learn each component's exact API | `GET https://uiarc.dev/components/<name>/markdown` |
| Install the genuine source | `GET https://uiarc.dev/r/<name>.json` |
| (MCP server) | `POST https://uiarc.dev/api/mcp` → **401, OAuth-gated** (see WRITEUP §4) |

All uiarc.dev access was read-only GET (plus one harmless MCP `initialize`/`tools-list` POST).
Arc is MIT for free items; this demo uses only free components.
