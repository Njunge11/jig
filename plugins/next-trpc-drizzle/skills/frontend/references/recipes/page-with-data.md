# Recipe: Page with data

Use this recipe for a route that reads queries and renders them —
a dashboard, a details page, a list page. The rules in SKILL.md
apply throughout; this recipe gives the build order and this page
type's specifics.

## Build order

1. **Find the backend contract.** Read the feature's router under
   `features/<name>/api`: its procedures and their input/output
   types. Wire against that actual shape — never invent it. A
   value the UI needs that no procedure returns is a backend gap:
   apply SKILL.md's "Backend gaps" section.

2. **Write the anatomy** — the named part tree, before any code:

   ```
   JobsPage
   ├── JobsStats            — the period's aggregate numbers
   │   └── StatCard (×4)
   ├── JobsTable            — the paginated job rows
   │   ├── JobsTableToolbar — search + filters
   │   └── JobRow
   └── (shared state: period filter — owner: the URL)
   ```

   Page-specific choice: shared state that should survive a
   reload and be shareable (a period filter, a selected tab) is
   owned by the URL; other cross-section state is owned by the
   page component. Each section is its own component so each can
   suspend and stream on its own.

3. **Shape the queries.** One query per section, not per value —
   a stats block gets one aggregating procedure.

4. **Build the server page** on the golden path: `prefetch` every
   query, no `await`, `HydrateClient`, one `Suspense` + skeleton
   per section. A public page that crawlers read is the awaited
   exception — say why in a comment.

5. **Build each section**: `useSuspenseQuery` with the identical
   `queryOptions`; compound parts; semantic tokens; no loading
   branch inside a suspending component.

6. **Add the route states**: `loading.tsx` + `error.tsx`; derive
   the skeleton from the real component's containers.

7. **Responsive pass**: mobile first, a deliberate `md:` step,
   verify at 375 / 768 / 1024 / 1440.

## Don't — failures this repo shipped

- Don't build one monolith component with config props that
  reshape it.
- Don't give two sections their own copies of shared state and
  sync them with effects.
- Don't fetch with a `useEffect` + `useState` pair.
- Don't render query data in the Server Component.
- Don't run one query per row of a list (N+1).
- Don't lift query results into props or context to "save" a
  fetch.
- Don't branch on `isLoading` inside a component that uses
  `useSuspenseQuery`.

## Verify

- [ ] Every value on screen maps to a real procedure output; no
      client-side patch around a backend gap.
- [ ] The anatomy was written first; each part has one
      responsibility; each piece of shared state has one named
      owner.
- [ ] Every rendered query has a matching server `prefetch`;
      inputs identical on both sides.
- [ ] No awaited prefetch without a stated initial-HTML reason.
- [ ] `loading.tsx` + `error.tsx` exist; the skeleton matches the
      real layout's containers and sizes.
- [ ] A deliberate `md:` step exists; checked at
      375, 768, 1024, and 1440.
