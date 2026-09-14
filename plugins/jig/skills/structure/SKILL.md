---
name: structure
description: Owns the feature folder tree and every file-placement rule for the Next.js + tRPC + Drizzle stack. Use when creating a file, starting a feature, deciding where a component, service, module, or test lives, or restructuring existing code into shape.
---

# Structure

One tree, one authority. Every file the stack produces has a
place defined here.

**Structure never comes from existing code.** Do not scan the
codebase for "how things are organized here" and imitate it.
Code that predates this skill is often organized wrong, and
imitation compounds it. When an existing file disagrees with this
tree, the file is wrong. Place new work correctly, and raise the
mismatch as restructuring work (a step checklist), never as a
precedent.

## The feature tree

A feature is a folder. The schema is central.

```
features/<feature>/
  checklist.md               ← the feature's build checklist
  api/
    <feature>.router.ts      ← entry: tRPC. The resource → router map; the only file that names every resource router
    <name>.tool.ts           ← the body of one eve tool (only if an agent runs this feature)
    <resource>.router.ts     ← one resource's procedures, with their input schemas and their composition (deps)
    <feature>.service.ts
    __fixtures__/            ← shared test setup and scripted fakes (only if two test files share them)
    __tests__/
      <resource>.router.test.ts
      <feature>.service.test.ts
  db/
    <feature>.repo.ts
    __tests__/
      <feature>.repo.test.ts
  mcp/
    <feature>.tool.ts        ← entry: MCP tool (only if the feature has one)
  workflows/                 ← entry: durable workflow (only if the feature has one)
    <name>/
      index.ts               ← workflow function
      steps.ts               ← step functions
  machine/<name>.states.ts   ← the feature's workflow states (only if an agent runs this feature)
  ui/
    <feature>-page.tsx       ← the composed page tree
    <part>.tsx               ← one file per anatomy part
    columns.tsx              ← data-table columns (if the feature has a table)
    search-params.ts         ← the route's shared nuqs parsers module
    cards/<card>/            ← chat surfaces only: one card per streamed part or per form a state's meta names; props in, never the snapshot
    use-<action>.ts          ← a card's mutation hook; calls this feature's router, which moves the stage through the service
    __tests__/
      <part>.test.tsx        ← behavior tests
db/schema/
  <domain>.ts                ← one file per domain (users.ts, jobs.ts, billing.ts)
app/<route>/
  page.tsx                   ← thin: parse params, prefetch, compose from features/<feature>/ui
  layout.tsx
  loading.tsx
  error.tsx
components/ui/               ← the kit, plus app-wide compound components
                               (Panel, RichTextEditor)
agent/                       ← only if the app has an eve agent: the agent's own code, shared by every channel
  agent.ts                   ← the agent definition (wired once)
  instructions.md            ← system instructions; instructions/<name>.ts for a dynamic one
  channels/<name>.ts         ← one eve channel with its auth walk (wired once); eve names the file (eve, slack, twilio, …)
  hooks/<name>.ts            ← one observer per event
  tools/<tool_name>.ts       ← entry: eve agent tool; composes a feature's api/<name>.tool.ts
  machine/<name>/            ← the conversation's machine: setup and root
  lib/
    thread/                  ← the conversation: advance, restore, the reader, the stage's tools, its repos
    <concern>/               ← the parts every tool shares, one folder per concern (model, caller, transcript, auth)
channels/<name>/             ← one channel's surface (web, whatsapp, …)
  api/<resource>.router.ts   ← the channel's entry points; each calls agent/lib/thread/ or a feature's service
  ui/                        ← the shell, the composer, the transcript and the channel-only cards (text, file, error)
    cards/index.ts           ← the part-type → card map; the only file that names every card, its own and every feature's
    <part>.tsx               ← reads the stored snapshot through agent/lib/thread's reader and draws the feature card the state's meta names
evals/
  evals.config.ts
  tools/<tool_name>.eval.ts  ← one eval per eve tool, on the compiled build
```

## Placement rules

1. **Route files are thin.** `app/` holds `page.tsx` (parse
   params → prefetch → compose), `loading.tsx`, `error.tsx`, and
   layouts — nothing else. Feature logic never lives under
   `app/`.
2. **Feature UI lives in the feature.** One file per anatomy
   part, named for the part. The page tree composes them.
3. **Two features need it → it graduates to the kit level**
   (`components/ui/`). A feature never imports another feature's
   `ui/`.
4. **Tests live in `__tests__/`** beside the code they test, on
   every branch of the tree.
5. **The backend branches** (`api/`, `db/`, schema placement)
   follow `backend-standards`; the `ui/` branch
   follows the `frontend-standards` skill. This skill owns only where
   things live.
6. **The agent owns the conversation; a feature owns its workflow.**
   One conversation runs every feature's workflow in turn. So the
   machine's setup and root live in `agent/machine/<name>/`, and
   the code that stores and moves a conversation lives in
   `agent/lib/thread/`. A feature's own states file lives in
   `features/<feature>/machine/<name>.states.ts` and plugs into
   the root. The `state-machines` skill owns the files' contents.
7. **eve fixes the tool path.** An eve tool lives at
   `agent/tools/<tool_name>.ts`, never in the feature folder,
   because eve registers that directory and names the tool after
   the file. The body it runs lives in its feature's
   `api/<name>.tool.ts`, beside the services it calls; the entry
   file only composes it. Eve reads only the named folders under
   `agent/`; everything else there is plain code under `lib/`.
8. **A channel receives and draws.** `channels/<name>/` holds one
   channel's routers and screens and nothing that decides a
   stage; every channel calls the same `agent/` code. Its card
   map imports each feature's `ui/cards/`. A feature never
   imports a channel. A feature's card never reads the stage:
   the channel screen reads the snapshot and picks the card.
9. **A router is a map of resource routers.** `<feature>.router.ts`
   merges one `<resource>.router.ts` per resource the feature
   serves (draft, questions, settings, …) and names nothing else,
   the same way `ui/cards/index.ts` maps part types to cards. A
   procedure, its input schema and its composition live in the
   resource's file. Merge with `t.mergeRouters` so the client's
   procedure paths do not change. A feature with one resource has
   one resource router; the map file still exists.
10. **Check before you finish.** Walk every file you created or
   moved against the tree. Fix a misplaced file now — do not
   record it for later.
