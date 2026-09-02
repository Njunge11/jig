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

## Data (31–61) and portals (62–63)

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

- Rules 62–63 — project incidents recorded in
  apps/dashboard/docs/frontend-do-dont.md §1–2 (the dialog-close
  collapse shipped three times against an enumerated-surface
  outside-click handler; the dismissal race yielded only to the
  `!target.isConnected` guard).

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
- recipes/page-preview.md — grounded in project evidence and CSS
  fundamentals: the slow-preview incident (the origin dashboard's
  job-board preview boots the whole public app in an iframe and
  syncs via postMessage — preview-panel.tsx audited 2026-09-02);
  the working precedent (marketing hero renders real dashboard
  pages in-document under a `data-theme` scope; packages/ui
  components take data as props); and the viewport fact that
  media queries evaluate against the viewport, not a container
  (Tailwind responsive docs, cited at rules 15–18). Device-toggle
  mechanism verified against
  [Storybook: Viewport](https://storybook.js.org/docs/essentials/viewport)
  ("adjust the dimensions of the iframe your story is rendered
  in") on 2026-09-02. Iframe load timing verified against
  [MDN: iframe](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe)
  (`loading="eager"` default: "Load the iframe immediately on
  page load") and
  [MDN: Speculation Rules API](https://developer.mozilla.org/en-US/docs/Web/API/Speculation_Rules_API)
  (prefetch/prerender "targets document URLs", top-level
  navigations — no iframe prefetch exists, hence mount-early).
  Sandboxed `srcDoc` for untrusted HTML is standard platform
  guidance (iframe `sandbox` attribute).
- recipes/expanded-panel.md — grounded in project evidence, not
  external docs (none authoritative exists for in-app panel
  expansion): the four divergent dashboard implementations
  (email-body-editor `fullscreen` prop; jobs/new wizard reducer +
  overlay with `previewOpen && isFullscreen && isVisible` and a
  separately-forked editor fullscreen; job-board context
  `toggleFullscreen`) audited 2026-09-02, and the jobs-v2 locked
  design decision (docked panel expands via flex reallocation, no
  overlays or portals — apps/dashboard/docs/jobs-v2/
  jobs-v2-chat-design.md §8). Rules 62–63 supply the
  overlay-event rationale.
- recipes/edit-surfaces.md — verified 2026-09-02 against four
  design-system pages:
  [Primer: Dialog guidelines](https://primer.style/product/components/dialog/guidelines/)
  ("Avoid creating a whole page inside a Dialog"; backdrop
  "won't dismiss the Dialog" when a form has unsaved changes;
  right side sheets "for quick previews", "Don't use side sheets
  to present create/edit forms … use a page instead"),
  [Carbon: Modal usage](https://carbondesignsystem.com/components/modal/usage/)
  ("Modals interrupt a user's workflow for short and non-frequent
  tasks"; repeated tasks belong on the main page; destructive →
  "transactional danger modal"; button labels are active verbs,
  "Avoid vague or passive words, such as Done or OK"),
  [Carbon: Dialog pattern](https://carbondesignsystem.com/patterns/dialog-pattern/)
  ("A modal is not an alternative to page"; needing outside
  information → full page), and
  [Polaris: Modal](https://shopify.dev/docs/api/app-home/polaris-web-components/overlays/modal)
  ("Use as a last resort for important decisions"; "For
  destructive actions, explain the consequences in the modal
  body"). Inline auto-save ground:
  [Primer: Saving patterns](https://primer.style/product/ui-patterns/saving/)
  ("Automatic saving should be used when the user expects instant
  feedback").
- recipes/mutation-feedback.md —
  [TanStack Query: Optimistic Updates](https://tanstack.com/query/v5/docs/framework/react/guides/optimistic-updates)
  (the v5 signatures: `context.client`, `onMutateResult`; the
  variables-only pattern; the cancel → snapshot → set → rollback
  order) and [Sonner: toast](https://sonner.emilkowal.ski/toast)
  (`toast.success`/`toast.error`; the `action` option "renders a
  primary button, clicking it will close the toast and run the
  callback passed via `onClick`"). Verified 2026-09-02. Kit ships
  the sonner toaster (`_ui/sonner.tsx`).
- recipes/data-table.md — committed to TanStack Table **v9**:
  npm `latest` is 9.2.4 (checked 2026-09-02), and the repo's
  `@tanstack/react-table@^8.21.3` has zero call sites, so the
  upgrade migrates nothing.
  [TanStack Table v9: React pagination guide](https://tanstack.com/table/v9/docs/framework/react/guide/pagination)
  (server-side: include `rowPaginationFeature`, omit the
  paginated row model; `manualPagination: true`; provide
  `rowCount` or `pageCount`; set `manualSorting`/`manualFiltering`
  for full server control) and
  [shadcn/ui: Data Table](https://ui.shadcn.com/docs/components/data-table)
  (v9 surface: `tableFeatures`, `createColumnHelper`, `useTable`,
  `<table.FlexRender />`; structure: columns module, row-actions
  display column, one extracted pagination component). Verified
  2026-09-02.
- recipes/form-with-mutation.md —
  [shadcn/ui: React Hook Form](https://ui.shadcn.com/docs/forms/react-hook-form)
  (the CURRENT pattern: RHF `Controller` + the `Field` family —
  the old `Form`/`FormField` wrapper anatomy is superseded;
  `data-invalid` on `Field`, `aria-invalid` on the control,
  `FieldError` for messages; zod schema + `zodResolver` +
  `defaultValues`). Verified 2026-09-02. Kit `field.tsx` exports
  the same family; `react-hook-form` and `@hookform/resolvers`
  confirmed in apps/dashboard/package.json. Server re-validation
  before side effects is a project lesson (the job publish
  VALIDATION contract).
- recipes/tabs.md —
  [Radix Primitives: Tabs](https://www.radix-ui.com/primitives/docs/components/tabs)
  (controlled `value`/`onValueChange`, `forceMount` on Content,
  arrow-key/Home/End keyboard map), the nuqs and TanStack
  suspense sources above, and a project lesson: dashboard tab
  badge counts drifted from tab contents until both read one
  procedure's definitions. Verified 2026-09-01.
