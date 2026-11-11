# Arc UI — agent-build demo

**Claim under test (from https://uiarc.dev/):** *"The React UI library your AI agents can build with."*

This POC walks the pipeline an AI coding agent actually follows to build a UI from Arc:

```
read llms.txt  →  pick components for the job  →  read each component's markdown doc
   →  pull real source from the public registry  →  emit assembled code  →  it builds
```

All fetches against uiarc.dev were **read-only** (GET, plus a harmless MCP `initialize` / `tools/list` POST). Fetched on **2026-11-09/10**.

---

## 1. What Arc's AI surface actually exposes

Arc publishes several machine-readable surfaces, all advertised from `llms.txt`:

| Surface | URL | Status in this test |
| --- | --- | --- |
| Index | `https://uiarc.dev/llms.txt` | **200** — 90 KB, full component/block index |
| Full context | `https://uiarc.dev/llms-full.txt` | advertised (every component's markdown inlined) |
| Small context | `https://uiarc.dev/llms-small.txt` | advertised (one line per item) |
| Per-component markdown | `https://uiarc.dev/components/<name>/markdown` | **200** — rich structured docs |
| Per-block markdown | `https://uiarc.dev/components/blocks/<name>/markdown` | **200** |
| shadcn registry item | `https://uiarc.dev/r/<name>.json` | **200** — real source, public, MIT |
| Registry index | `https://uiarc.dev/r/registry.json` | advertised |
| Catalog metadata | `https://uiarc.dev/r/catalog.json` | advertised |
| Agent skills | `https://uiarc.dev/r/skills/arc/*.md` | advertised |
| **MCP server** | `https://uiarc.dev/api/mcp` | **401 — OAuth-gated** (see §4) |

### 1a. `llms.txt` — the index (verbatim excerpt)

```
# Arc

> Arc is a React component and block library designed for AI-assisted frontend
> development. It provides copy-paste components, complete interface blocks,
> machine-readable registry metadata, AI skills, and MCP compatibility.
> Components and blocks share design tokens, CSS modules, and Motion. Free items
> install with the shadcn CLI from a public registry; Pro items are licensed and
> install from the token-gated @uiarc-pro registry.

Arc has 243 components and 141 blocks. 121 components and 22 blocks are free and
open source (MIT); 122 components and 119 blocks are Arc Pro.
```

The index is organized into sections an agent can scan: **Install**, **Rules for agents**, **Skills**, **Guides**, **Comparisons**, **Templates**, **Docs**, then **Components** (grouped: Actions, Inputs, Disclosure, Feedback, Data, Text, Special) and **Blocks**. Every component is a markdown link with a one-line "job" description, e.g.:

```
### Inputs
- [Input](https://uiarc.dev/components/input/markdown): A single line field with clear labels and useful states.
- [Textarea](https://uiarc.dev/components/textarea/markdown): A multiline field for notes, descriptions, and longer text.
- [Select](https://uiarc.dev/components/select/markdown): A compact choice field with a keyboard friendly menu.
- [Switch](https://uiarc.dev/components/switch/markdown): A tactile toggle for settings that take effect immediately.
```

Notably there is an explicit **"Rules for agents"** section — instructions written *to the agent*, not the human:

```
## Rules for agents
- Prefer an existing Arc component or block over writing a new one; compose blocks from Arc components.
- Read the component's markdown before using it; use only documented props.
- Keep semantic HTML, keyboard behavior, and a reduced-motion branch for every animation.
- Use the semantic tokens (--background, --surface, --foreground, --text-secondary,
  --border, --accent, --success, --warning, --danger) instead of raw colors...
- Sentence case copy ... no em dashes, no focus rings on pointer focus ...
```

### 1b. Per-component markdown (verbatim excerpt — Input)

Every component page follows the same template: `When to use` / `When not to use` / `Installation` (CLI + manual) / `Usage` (runnable snippet) / **`API reference` (typed prop table)** / `Keyboard` / `Accessibility` / `Motion` / `Responsive` / `Performance` / **`Notes for AI`** / `Guidance for AI tools`. The prop table is the key artifact an agent composes against:

```
## API reference
### Input
| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| label (required) | string | – | Visible label, tied to the input with htmlFor. |
| description      | string | – | Helper copy under the field, linked through aria-describedby. |
| error            | string | – | Error copy. Sets aria-invalid and renders in a role="alert" row. |
| ...props | InputHTMLAttributes<HTMLInputElement> | – | Forwarded to the native input... |

## Notes for AI
- Default single-line text field. Use password-field, search-field, or number-field
  when the value has that shape.
- Works controlled or uncontrolled like a native input; pass name for plain form submission.
- Changing the error string rewords it in place, so derive it from state...
```

Each page also carries a stable **`Usage`** snippet that is effectively copy-ready, e.g. the Select doc ships:

```tsx
<Select
  label="Region"
  value={region}
  onValueChange={setRegion}
  options={[
    { value: "us", label: "United States" },
    { value: "eu", label: "Europe" },
    { value: "ap", label: "Asia Pacific", disabled: true },
  ]}
/>
```

### 1c. The registry — real source, public, MIT

`https://uiarc.dev/r/<name>.json` is a standard shadcn registry item. For free components it returns the **actual source code** (no auth), with install metadata:

```jsonc
// GET https://uiarc.dev/r/input.json  (keys)
{
  "name": "input",
  "type": "registry:ui",
  "dependencies": ["motion"],
  "registryDependencies": ["https://uiarc.dev/r/arc-motion-tokens.json"],
  "files": [
    { "path": "registry/components/input/input.tsx",        "target": "@components/arc/input/input.tsx" },
    { "path": "registry/components/input/input.module.css", "target": "@components/arc/input/input.module.css" }
  ]
}
```

This is what makes the loop end-to-end real: the agent doesn't just *read about* the component, it can **install the genuine implementation** the docs describe.

---

## 2. The agent-build transcript

Acting *as the agent*, with only Arc's AI surface as input:

**Step 1 — Read the index.** `GET /llms.txt`. Learn Arc exists, that components are grouped by job, and that `components.json` can register the `@uiarc` namespace. Read "Rules for agents": prefer Arc components, read markdown before use, use only documented props, use semantic tokens, support dark via `data-theme="dark"`, keep reduced-motion branches.

**Step 2 — Decide the screen & select components.** Goal: a **"Create project"** settings screen. Mapping the need to the index's one-line descriptions:

| Need on the screen | Arc component chosen | Why (from its index line) |
| --- | --- | --- |
| Project name, slug | **Input** | "A single line field with clear labels and useful states." |
| Description | **Textarea** | "A multiline field for notes, descriptions, and longer text." |
| Visibility, Region | **Select** | "A compact choice field with a keyboard friendly menu." |
| Analytics / preview toggles, dark mode | **Switch** | "A tactile toggle for settings that take effect immediately." |
| Create / Cancel | **Button** | "A clear, responsive action with quiet secondary states." |

All five are **free / MIT** — no gated item is needed for this screen.

**Step 3 — Read each component's markdown.** `GET /components/{input,textarea,select,switch}/markdown` (and `button`). Extract the typed prop tables. This is where the agent learns the *exact* API — e.g. that Select takes `options: {value,label,disabled?}[]` and `onValueChange`, that Switch uses `checked` + `onCheckedChange`, that Input/Textarea take `label` + `description` + `error`.

**Step 4 — Install the real source.** For each item, `GET /r/<name>.json` and write `files[].content` to `files[].target` (`@components` → `src/components`). This is exactly what `npx shadcn@latest add @uiarc/<name>` does. Result: real Arc `.tsx` + `.module.css` land in `src/components/arc/<name>/`, plus the shared `arc-foundation` (tokens) and `arc-motion-tokens` dependencies that each item declares.

**Step 5 — Emit assembled code.** Compose the five components into `src/App.tsx`, using **only props from the doc tables**, and follow the agent rules: tokens from `foundation.css` for app chrome, `data-theme="dark"` for the dark toggle, native-label accessibility inherited from the components.

**Step 6 — Verify.** `tsc -b && vite build` → **green.** The documented APIs matched the real source; no prop was invented.

---

## 3. The assembled result

`src/App.tsx` is a working **Create project** screen:

- **Input** ×2 — project name (with live `error` validation that rewords in place, and `autoFocus`) and an auto-suggested URL slug.
- **Textarea** — description with a live "N characters left" counter in `description` (the doc notes counts get a rolling-digit animation for free).
- **Select** ×2 — visibility and hosting region, driven by `options[]` + `onValueChange`.
- **Switch** ×3 — usage analytics, preview environments, and a dark-mode toggle that sets `data-theme` on `<html>`.
- **Button** ×2 — primary "Create project" (uses the documented `loading` prop for the saving state) and a ghost "Cancel".

On submit it renders the resulting project payload as JSON. Light/dark both work via Arc's token sets.

**Provenance — what came from where (honest accounting):**

| Artifact | Source |
| --- | --- |
| `src/components/arc/**` (button, input, textarea, select, switch, foundation.css, motion-tokens) | **Real Arc source**, fetched from the public registry `https://uiarc.dev/r/*.json`. Unmodified. |
| `src/App.tsx`, `src/index.css` | Written by me (the "agent"), composing the above using only documented props + semantic tokens. |
| `components.json` | Mirrors Arc's documented `@uiarc` registry setup. |
| Vite/TS scaffold | Standard Vite + TypeScript conventions. |

Nothing here is recreated or guessed, unlike a hand-rewritten recreation of a component library. Every Arc component in this demo is the genuine upstream file.

---

## 4. The MCP server — gated

The one surface that did **not** open read-only is the MCP server. A standard JSON-RPC probe:

```bash
curl -sS https://uiarc.dev/api/mcp -X POST \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  --data '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{...}}'
```

returns **HTTP 401** with an OAuth challenge:

```
WWW-Authenticate: Bearer resource_metadata="https://uiarc.dev/.well-known/oauth-protected-resource/api/mcp", scope="openid profile email"

{"jsonrpc":"2.0","id":null,"error":{"code":-32001,
 "message":"Sign in to use the Arc MCP server. Your MCP client opens the sign-in page;
            a free account is enough. Setup: https://uiarc.dev/docs/ai#mcp"}}
```

`tools/list` returns the same 401. The protected-resource metadata (read-only GET) confirms the auth server:

```json
{ "resource":"https://uiarc.dev/api/mcp",
  "authorization_servers":["https://clerk.uiarc.dev"],
  "scopes_supported":["openid","profile","email"],
  "resource_name":"Arc UI" }
```

So the MCP tool list could **not** be enumerated anonymously. Per `llms.txt`, the MCP server exposes **list, search, get, install, and skill** tools, and requires an Arc account over OAuth (free account suffices; Pro source unlocks for Pro accounts). In a real client (`claude mcp add --transport http arc https://uiarc.dev/api/mcp`) the client would run the OAuth flow and open these tools. For an unattended/headless agent, MCP is a sign-in wall.

**This does not block the build**, because the same information (what exists, each API, the real source) is reachable without auth via `llms.txt` + per-component markdown + the public registry. MCP is a convenience/structured layer over the same content, plus the gate for Pro source.

---

## 5. Does the pitch hold up?

**Verdict: largely yes, and more concretely than most "AI-friendly" claims — but with one honest asterisk on MCP.**

**What worked (the claim delivering):**
- **Discoverability is real.** `llms.txt` gives an agent the full catalog with job-oriented one-liners *and* an explicit "Rules for agents" contract. The agent never has to guess what exists.
- **The docs are built for composition, not humans.** Typed prop tables + `Notes for AI` + copy-ready `Usage` snippets mean the agent composes against a contract. In this build, **every documented prop matched the real source** — the type-check passed with zero invented props.
- **The loop closes.** Because the registry serves the *actual* MIT source publicly, "read about it" and "install it" are the same pipeline. The result compiles and runs. This is the difference between a library an agent can *describe* and one it can *build with*.
- **The guardrails are machine-usable.** Semantic tokens, `data-theme` dark mode, reduced-motion branches, and accessibility are all stated as rules *and* embodied in the shipped source, so following the rules is the path of least resistance.

**What was gated / missing / rough:**
- **MCP is OAuth-only** — not usable by an anonymous or headless agent without a sign-in step. The pitch leans on MCP, but the genuinely frictionless surface for an autonomous agent is `llms.txt` + markdown + registry, not MCP.
- **Pro is the majority of the library.** 122/243 components and 119/141 blocks are Pro and token-gated; `get_component` only returns Pro source with a Pro token. The *free* tier is more than enough to build real screens (as here), but "build anything from the catalog" has a paywall behind it.
- **Non-trivial dependency weight.** Even simple components pull in `motion` (and Radix for Select/Switch), so the bundle is heavier than hand-rolled inputs — a reasonable trade for the motion/a11y quality, worth noting.

**Bottom line:** For an agent with web access, Arc is genuinely "buildable" end-to-end from its free, unauthenticated AI surface — discovery through compiling code — which is a materially stronger position than a normal component library whose agent story is "here are some React docs, good luck." The MCP server is a nice-to-have on top, not the thing that makes it work, and it's the one piece an unattended agent can't reach without credentials.
