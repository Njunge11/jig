---
name: frontend
description: The one skill for frontend work in Next.js + tRPC + TanStack Query v5 + shadcn/Tailwind apps. Use when building or changing any page, component, form, table, dialog, or chat surface; any query, mutation, loading/error UI, or styling; or when diagnosing slow pages, waterfalls, duplicate fetches, spinner problems, or layout breakage. Identify what you are building, load the matching recipe, and build to the rules.
---

# Frontend

Stack: **Next.js App Router + tRPC + TanStack Query v5 + shadcn/ui
(+ Radix) + Tailwind CSS**. When code in the repo disagrees with a
rule here, the rule wins. Assume existing repo patterns are wrong
until they match this skill.

## The loop

0. **Restate the UI.** You usually get it as prose. Write the
   page's anatomy — a named tree of parts, one responsibility per
   part, one owner per piece of shared state — before any code.
1. **Pick the recipe(s).** Match what you are building against the
   catalog below. Load every matching recipe file and follow it —
   the recipe orders the construction.
2. **Author the checklist** — the `## Frontend + Integration`
   section of `features/<name>/checklist.md`, split into
   **Behavior (test-backed)** `F<n>` items and **Visual &
   responsive (browser-checked, never jsdom tests)** `V<n>` items.
   Cover error and empty states, not just the happy path. Preserve
   described copy verbatim; ask when a screen or state is
   undecided.
3. **TDD the behavior.** One case → one failing test (MSW at the
   network edge, or seed the cache) → build to pass → tick `[x]`
   → refactor.
4. **Integrate.** Wire the real tRPC path against the feature's
   actual router under `features/<name>/api` — never an invented
   shape. Behavior tests must pass against the real router.
5. **Visual & responsive.** Verify in the browser at 375, 768,
   1024, and 1440.
6. **Done** when every behavior item is checked and `vitest` is
   green — then surface the proof in the transcript: the ticked
   checklist and the green test run. A transcript watcher cannot
   open files; it sees only what you surface.

## Backend gaps

A backend gap is a value the UI needs that no procedure returns,
or a real backend/contract bug found while integrating. Never
patch around one in the client, and never write backend code in
this loop. Do this instead:

1. Stop the frontend work.
2. Write the missing behavior as new items in the `## Backend`
   section of `features/<name>/checklist.md` — one observable
   behavior per line.
3. Spawn the `backend-feature-builder` agent:
   "Implement the unchecked items in
   `features/<name>/checklist.md` `## Backend`."
4. Continue the frontend build when its tests are green.

If you are running as a subagent, you cannot spawn another agent:
report the gap and the checklist items you wrote, then stop — the
main session dispatches the backend builder.

## The catalog — building X → recipe

Load every row that matches. A row marked *planned* has no file
yet: build from the rules below and tell the developer which
recipe is missing.

| Building | Recipe |
|---|---|
| A page that reads and renders queries — dashboard, details, list | [`references/recipes/page-with-data.md`](references/recipes/page-with-data.md) |
| Search, filters, or sort over a list (debounce, URL state) | [`references/recipes/search-and-filters.md`](references/recipes/search-and-filters.md) |
| A data table — columns, sorting, pagination, row actions | *planned* |
| Tabs or segmented views (URL-backed, prefetched) | [`references/recipes/tabs.md`](references/recipes/tabs.md) |
| A form that submits a mutation (validation, field errors) | [`references/recipes/form-with-mutation.md`](references/recipes/form-with-mutation.md) |
| A multi-step flow / wizard | *planned* |
| Mutation feedback — toasts, optimistic updates, undo | *planned* |
| An edit surface — dialog, drawer, inline edit | *planned* |
| A fullscreen / expanded mode for a panel | *planned* |
| A live preview of rendered output (no iframes) | *planned* |
| Rich text editing (Lexical) | *planned* |
| A chat surface (AI SDK + AI Elements) | *planned* |

Authoring a genuinely new compound component (own state, keyboard
map, `asChild`)? Load
[`references/authoring-custom.md`](references/authoring-custom.md).
The one-time tRPC + TanStack wiring lives in
[`references/wiring.md`](references/wiring.md).
[`references/sources.md`](references/sources.md) maps each rule
to the doc that grounds it — load it only when a rule's ground is
questioned.

## Rules

Each rule lives here once — recipes give the build order and do
not restate them. This list is also the review checklist.

### Compose shadcn — never hand-roll

1. Use the installed shadcn primitives (`Button`, `Card`,
   `Dialog`, `Table`, `Tabs`, `Form`, `Input`, `Select`, `Badge`,
   …). Need one that is not installed?
   `npx shadcn@latest add <component>`. Build custom only when
   explicitly instructed — then follow
   `references/authoring-custom.md`.
2. Never hand-edit a primitive's source. Regenerate with
   `npx shadcn@latest add --overwrite`.
3. One primitive library: Radix. Do not introduce a second (Base
   UI, Headless UI, React Aria). A registry component that ships
   on another library gets rebuilt on the kit's own primitives —
   a combobox is `Popover` + `Command`.
4. Decompose the UI into a tree of shadcn parts by responsibility
   and repetition — not one monolith. A "card list" is `Card` +
   `CardHeader`/`CardTitle`/`CardContent` plus a row component.
5. Use the component's own API: `variant`/`size` for
   permutations, compound parts as intended. Do not recreate what
   a prop already does.
6. Feature components follow the kit's anatomy. When one grows
   sections, name its parts with the standard vocabulary —
   `Trigger` (initiates), `Content` (the shown/hidden body),
   `Header`/`Body`/`Footer` (structure), `Title`/`Description`
   (text).
7. Composition over configuration. Compose with `children`/slots;
   a component collecting boolean/config props is a monolith
   forming — give the call site parts instead:

```tsx
// Wrong: config props multiply forever
<CandidateCard compact hideActions withBadge badgeTone="warn" />

// Right: the call site composes what it needs
<CandidateCard>
  <CandidateCardHeader>
    <Badge variant="outline">Interview</Badge>
  </CandidateCardHeader>
  <CandidateCardBody />
</CandidateCard>
```

8. Expose component state for styling through data attributes,
   never through per-state className props. `data-state="open"`
   styled with `data-[state=open]:…`; `data-slot="card-header"`
   for parent targeting. Props carry variants, sizes, and
   behavior — not styling hooks for each internal state.
9. Integrate with `asChild` — a `Button` that is really a Next
   `<Link>` is `<Button asChild><Link href>…</Link></Button>`.
   The child is a single, non-Fragment element that spreads
   props. Mind HTML nesting validity: a button cannot contain a
   button — put interactive controls beside a trigger, not inside
   it.
10. Preserve copy verbatim. Do not invent labels, headings, or
    placeholder text that were not described; ask only when
    genuinely ambiguous.

### Tokens, scale, and class construction

11. Colors are semantic tokens only: `bg-background`,
    `text-foreground`, `bg-card`, `bg-primary`,
    `bg-muted`/`text-muted-foreground`, `bg-accent`,
    `bg-destructive`, `border-border`, `ring-ring`, `chart-1…5`.
    Never hex, inline color, or raw palette (`bg-stone-500`)
    unless instructed. Base token = surface; `-foreground` =
    text/icon on it.
12. Spacing, sizing, and typography use the Tailwind scale
    (`p-4`, `gap-2`, `h-10`, `text-sm`). No arbitrary values
    (`w-[327px]`) and no inline `style={{}}` unless instructed.
13. Build class lists with `cn(...)` in this order: base styles,
    then variant styles, then conditional (state) styles, then
    the caller's `className` last so it can override.
14. Never build class names from template literals
    (`` `bg-[${color}]` `` breaks Tailwind's scanner). A dynamic
    value goes through a CSS variable:
    `className="bg-[var(--tone)]"`. A feature component with
    several visual permutations defines them with CVA, outside
    the component body.

### Responsive — every form factor, breakpoint utilities only

Breakpoints apply at that width **and up**: `sm` 640 · `md` 768 ·
`lg` 1024 · `xl` 1280. Unprefixed = all sizes; `sm:` means "at
the small breakpoint and up," never "on mobile."

15. Design each form factor, do not scale one into another.
    Author mobile first, then layer `sm:`/`md:`/`lg:`
    deliberately. Verify at **375, 768, 1024, and 1440** — 1024
    (`lg`) is where scaled-desktop layouts break.
16. Never jump base → `lg:` and leave 768–1023 unstyled. Every
    responsive layout states its `md:` step.
17. Use breakpoint variants only — no container queries. To style
    one range, stack with `max-*`: `md:max-lg:flex`.
18. Fluid, not fixed: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`,
    `flex-col md:flex-row`. No fixed widths that overflow a
    narrower form factor.
19. Wide content (tables, code, diagrams) scrolls inside its own
    `overflow-x-auto` container. The page never scrolls
    horizontally.

### Hooks discipline — the default is none

20. `useEffect` synchronizes with an external system
    (subscription, DOM API, analytics) — nothing else. Every
    effect must be able to name its external system, or it gets
    rewritten.
21. Derive values during render. Never store what props/state can
    compute, and never sync state in an effect:

```tsx
// Wrong: redundant state + effect
const [fullName, setFullName] = useState("");
useEffect(() => { setFullName(first + " " + last); }, [first, last]);

// Right: derive during render
const fullName = first + " " + last;
```

22. A side effect triggered by a user action runs in that event
    handler — never modeled as state plus an effect that watches
    it.
23. Effect dependencies are primitives (`[user.id]`), not objects
    (`[user]`) — objects re-run the effect on every unrelated
    change.
24. `useMemo`/`useCallback` are performance tools for measured,
    expensive work or referential stability a consumer requires.
    Wrapping a small object literal or a trivial computation is
    noise — the default is no memoization.
25. No derived state in `useState`. State holds what the user
    did, not what can be computed from it.

### Accessibility — do not undo what Radix gives

26. Use the right primitive (a `Dialog`, not a styled `div`);
    keep semantic elements; never strip `aria-*` or roles from
    shadcn parts.
27. Icon-only buttons carry an accessible name (`aria-label`,
    icon `aria-hidden`).
28. Inputs get `<label>`s, not placeholders-as-labels.
29. Do not convey meaning by color alone; keep the
    `:focus-visible` ring.
30. Touch targets are at least 44×44px — pad small icon buttons
    rather than shrinking the hit area. Never disable zoom
    (`maximum-scale=1`, `user-scalable=no` are forbidden in the
    viewport meta).

### Data — the golden path

Kick off the query on the **server** (no `await`), stream it, and
read it in the client with `useSuspenseQuery`. The Suspense
fallback shows meanwhile. The client never re-fetches what the
server started.

```tsx
export default async function Page() {
  prefetch(trpc.users.funnel.queryOptions({ period: "30d" })); // fire, don't await
  prefetch(trpc.users.table.queryOptions({ page: 1 }));        // fires in parallel
  return (
    <HydrateClient>
      <Suspense fallback={<FunnelCardsSkeleton />}><FunnelCards /></Suspense>
      <Suspense fallback={<UsersTableSkeleton />}><UsersTable /></Suspense>
    </HydrateClient>
  );
}
```

31. The page `prefetch`es every query its tree renders, wrapped
    in `HydrateClient`.
32. Do not `await` a prefetch by default — it blocks the HTML on
    that query. Rule 49 names the only cases that earn an awaited
    prefetch, and then it is `await Promise.all([...])` over the
    prefetches, never one await after another.
33. Server `prefetch` and client `useSuspenseQuery` call the
    **identical** `trpc.x.queryOptions(input)`. A mismatched
    input is a cache miss and a refetch.
34. The wiring (`@trpc/tanstack-react-query`, not the legacy
    `createHydrationHelpers`) is a one-time install — see
    `references/wiring.md`. Everything here assumes it.

### Choosing the read primitive

35. `useSuspenseQuery` for prefetched data. `useQuery` only for
    data fetched **after** mount (user-triggered, dependent on
    client state), with its own loading state — Next.js does not
    suspend for `useQuery`, so it renders `pending` and opts out
    of server-rendering.
36. Several values that belong to one screen section (metrics,
    counts): one aggregating procedure, one `useSuspenseQuery`,
    one cache entry. Inside the procedure, prefer one SQL
    statement (`COUNT(*) FILTER (WHERE …)`); when one statement
    cannot produce them, run the queries in parallel server-side
    (`Promise.all` on the repo calls) and return one object. The
    fan-out lives next to the database, never across the network.
37. Several genuinely independent sources in one component: one
    `useSuspenseQueries` (or `useQueries` for a variable count).
    Never stack `useSuspenseQuery` calls — the first suspends
    before the second starts.
38. Server Components are for prefetch only. Do not render query
    data in a Server Component — that copy is detached from the
    query client and desyncs after the client revalidates. Never
    use a Server Action as a `queryFn` — Server Actions run
    serially.

### Parallelism and duplicate fetches

39. Independent fetches start together. Fire all
    prefetches/promises first; if you must await, `Promise.all` —
    never sequential awaits for independent data.
40. Awaits that are not queries — `auth()`, `cookies()`, feature
    flags — get their parallelism from composition: sibling async
    components await their own data. A layout that awaits
    `auth()` and then renders a page awaiting a flag check has
    serialized the two; give each its own component, or start
    both promises before awaiting. tRPC queries are not this
    rule's business — rules 31–32 and 39 already run them in
    parallel.
41. No per-row queries. A list that runs one query per row is an
    N+1; return the rows with their joined data from one list
    procedure.
42. Two components reading the same `queryOptions` is not a
    duplicate fetch — the cache deduplicates by key. Do not lift
    query results into props or context to "save" a fetch.
43. On the server, `getQueryClient` is wrapped in React
    `cache()`, so all prefetches in one request share one client.
    Never construct a second QueryClient per request.

### Caching

44. Set a non-zero `staleTime` (30–60s; higher for reference
    data). The default `0` refetches immediately after hydration,
    wasting the prefetch.
45. Leave `gcTime` at its default (5m) unless a screen provably
    needs longer retention.
46. Query keys are derived from `queryOptions` — never hand-write
    a key. Invalidate through the derived filter:
    `queryClient.invalidateQueries(trpc.users.table.queryFilter())`.
47. One freshness layer. TanStack owns freshness for these
    queries; do not also configure Next route/`fetch` caching for
    them.

### Streaming — and when not to

48. Wrap independent sections in their own `<Suspense>` so fast
    sections paint while slow ones stream.
49. Streaming is the default, not a law. Two cases earn
    `await prefetch(...)` instead (same wiring, same
    `useSuspenseQuery` — the only change is when the HTML ships):
    the content must be in the initial HTML (a public posting
    page that crawlers and link unfurls read), or the query is so
    small and fast that its skeleton is just flicker (the company
    name in the shell). A dashboard of sections streams; a public
    document page awaits. Choose per section, and say why in the
    code.

### Loading UI

50. Every fetching route segment has a `loading.tsx`. It
    auto-wraps the page in a Suspense boundary and shows
    instantly on navigation.
51. Derive the skeleton from the real component: copy its
    container, grid, and sizing classes; replace content with the
    `Skeleton` primitive. Same column count, same card sizes —
    zero layout shift on swap. A mismatched skeleton is worse
    than a spinner.
52. One skeleton per boundary. A component using
    `useSuspenseQuery` suspends — it must not also branch on
    `isLoading` or render its own spinner inside the
    already-suspended boundary.
53. Keep runtime data out of `layout.tsx` (`cookies()`,
    `headers()`, uncached fetches) — a layout that blocks defeats
    `loading.tsx`. Fetch in the page, or give the layout's
    dynamic part its own boundary.

### Error UI

54. Every fetching route segment has an `error.tsx`: a Client
    Component receiving `{ error, reset }`, with `reset()` wired
    to a "Try again" action.
55. Isolate a failing section with an inner
    `react-error-boundary` around its `<Suspense>`, so one broken
    card does not take the page.
56. Route errors by channel: read failures render in the
    boundary; mutation failures surface as a toast naming the
    action; form-field validation renders inline at the field. Do
    not mix the channels.

### Optimistic updates

57. Use optimism for instant-feel mutations the user expects to
    succeed (toggle, rename, reorder). Do not use it for
    destructive or irreversible actions — those wait for the
    server.
58. Default: variables-only. Render the pending row from the
    mutation's `variables` + `isPending`; no cache writes; it
    reconciles itself on settle.
59. Cache-write optimism only when other components must reflect
    the change immediately. Callbacks receive `context` with
    `context.client`; `onMutate`'s return arrives as the
    `onMutateResult` parameter:

```ts
const filter = trpc.promo.list.queryFilter();
useMutation(trpc.promo.markPaid.mutationOptions({
  onMutate: async (vars, context) => {
    await context.client.cancelQueries(filter);                // 1 cancel
    const prev = context.client.getQueryData(filter.queryKey); // 2 snapshot
    context.client.setQueryData(filter.queryKey, apply(prev, vars)); // 3 set
    return { prev };
  },
  onError: (_e, _v, onMutateResult, context) =>
    context.client.setQueryData(filter.queryKey, onMutateResult.prev), // rollback
  onSettled: (_d, _e, _v, _r, context) =>
    context.client.invalidateQueries(filter),                  // reconcile
}));
```

    The order matters: `cancelQueries` first (a slow refetch
    would clobber the optimistic value); invalidate in
    `onSettled` (it runs even after a rollback).

### Secondary surfaces

60. Modals, drawers, tabs, and detail panels get page treatment:
    prefetch their data on the trigger's hover/focus
    (`queryClient.prefetchQuery(trpc.x.queryOptions(input))`) and
    open them against the same cache — never an ad-hoc fetch with
    a fresh spinner.
61. Load heavy panel components with `next/dynamic` and prefetch
    their data on hover, so opening is instant despite the lazy
    code.

## Review

Rules 1–61, plus the Verify list of every recipe the build
declared, are this skill's review checklist — run by the
`review-frontend-feature` skill.
