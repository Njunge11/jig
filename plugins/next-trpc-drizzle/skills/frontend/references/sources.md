# Sources — frontend rules

Loaded on demand; not part of the skill body. Each entry maps
rules to the doc that grounds them. Claims were verified against
these pages on 2026-09-01.

## Compose, tokens, responsive, hooks, accessibility (1–30)

- Rules 1–2, 4–5, 9–10, and references/authoring-custom.md —
  [components.build](https://components.build): /composition,
  /types, /as-child, /polymorphism, /state, /definitions,
  /principles.
- Rules 6–7 —
  [components.build/composition](https://www.components.build/composition):
  the part-naming vocabulary (Trigger/Content/Header/Body/Footer/
  Title/Description) and "instead of cramming all functionality
  into a single component with dozens of props, composition
  distributes responsibility across multiple cooperating
  components."
- Rule 8 —
  [components.build/data-attributes](https://www.components.build/data-attributes):
  per-state className props "couple the component's internal
  state to its styling API"; `data-state` for state, `data-slot`
  for identity, props for variants/sizes/behavior.
- Rule 3 — project policy (2026-09-01 audit: one stray
  `@base-ui/react` import rode in via a registry combobox; the
  kits are Radix throughout).
- Rule 9 (nesting validity) —
  [components.build/polymorphism](https://www.components.build/polymorphism)
  ("Be careful about HTML nesting rules") and the chat-prototype
  incident (controls inside AccordionTrigger).
- Rule 11 — [shadcn/ui: Theming](https://ui.shadcn.com/docs/theming)
  and [components.build/design-tokens](https://www.components.build/design-tokens).
- Rules 13–14 —
  [components.build/styling](https://www.components.build/styling):
  class order "base styles first, conditionals second, user
  overrides last"; no template-literal class generation, CSS
  variables instead; CVA variants defined outside the component.
- Rules 15–18 —
  [Tailwind: Responsive design](https://tailwindcss.com/docs/responsive-design).
  Verified: `sm` 640 / `md` 768 / `lg` 1024 / `xl` 1280 / `2xl`
  1536; "prefixed utilities only take effect at the specified
  breakpoint and above"; single-range targeting via `md:max-lg:`.
- Rule 19 — project incident (chat prototype
  horizontal-overflow bug, 2026-08-31).
- Rules 20–22, 25 —
  [React: You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
  and [Removing Effect Dependencies](https://react.dev/learn/removing-effect-dependencies)
  (via the absorbed Vercel rules `rerender-derived-state-no-effect`,
  `rerender-move-effect-to-event`).
- Rule 23 — absorbed Vercel rule `rerender-dependencies`.
- Rule 24 — [React: useMemo](https://react.dev/reference/react/useMemo)
  (memoization is a performance optimization, not a semantic
  guarantee).
- Rules 26–29 —
  [components.build/accessibility](https://www.components.build/accessibility)
  (five ARIA rules; "never convey information through color
  alone").
- Rule 30 —
  [components.build/accessibility](https://www.components.build/accessibility):
  44×44px (iOS) / 48dp (Android) touch targets; "never
  `maximum-scale=1` or `user-scalable=no`."

## Data (31–61)

- Rules 31–35, 38, 43 — [tRPC: Server Components setup](https://trpc.io/docs/client/tanstack-react-query/server-components).
  Awaited prefetch: "the server must complete the query before
  sending HTML." Server-rendered query data "is detached from
  your query client."
- Rules 33, 38, 44 — [TanStack Query: Advanced Server Rendering](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr)
- Rule 37 — [TanStack Query: Parallel Queries](https://tanstack.com/query/v5/docs/framework/react/guides/parallel-queries)
- Rules 57–59 — [TanStack Query: Optimistic Updates](https://tanstack.com/query/v5/docs/framework/react/guides/optimistic-updates)
  (v5 signatures: `context.client`, `onMutateResult`)
- Rules 50–53 — [Next.js: loading.js](https://nextjs.org/docs/app/api-reference/file-conventions/loading)
- Rules 54–55 — [Next.js: error.js](https://nextjs.org/docs/app/api-reference/file-conventions/error)
- Rules 39–40, 49, 60–61 — absorbed from Vercel's React
  best-practices rule set (`async-parallel`,
  `server-parallel-fetching`, `async-suspense-boundaries`,
  `bundle-preload`, `bundle-dynamic-imports`) so nothing depends
  on an external skill being installed.

## Recipes

- recipes/search-and-filters.md —
  [nuqs: Basic usage](https://nuqs.dev/docs/basic-usage) (parsers,
  `.withDefault()`, "the default value is also returned if the
  value is invalid"; `setValue(null)` clears),
  [nuqs: Server-side](https://nuqs.dev/docs/server-side)
  (`createLoader` / `createSearchParamsCache`, one parser
  definition shared by both sides),
  [nuqs: Options](https://nuqs.dev/docs/options) (state updates
  instantly; URL writes are rate-limited; `startTransition`
  integration), and
  [TanStack Query: Suspense](https://tanstack.com/query/v5/docs/framework/react/guides/suspense)
  ("`placeholderData` also doesn't exist for this Query"; "wrap
  your updates that change the QueryKey into startTransition").
  Verified 2026-09-01. `nuqs` and `use-debounce` confirmed in
  apps/dashboard/package.json.
