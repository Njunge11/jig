---
name: recipe-search-and-filters
description: The frontend recipe for search, filters, sort or pagination over a list — the server narrows the rows, the URL owns the state, the search input debounces. Gives the build order, the common failures, and the Verify list. Use when you build, review or fix that surface, including a list that falls back to its skeleton or spinner on each search, filter or page change. Invoke it before you write the code.
user-invocable: false
---

# Recipe: Search, filters, and sort over a list

Use this recipe when the user narrows a list: a search box, filter
selects, a sort control, pagination. The rules in the `frontend-standards` skill apply
throughout; this recipe gives the build order and the
list-narrowing mechanics. Libraries: `nuqs` for URL state and
`use-debounce` — install either if missing.

## Build order

1. **Find the backend contract.** The list procedure takes the
   narrowing in its input (`q`, filters, `sort`, `page`) and does
   the work server-side — `WHERE`, `ORDER BY`, `LIMIT` — and
   returns the rows plus the total count. A procedure that
   returns the full list for the client to `.filter()` is a
   backend gap: apply the `implement-frontend` skill's "Backend gaps" section.
   The row count on screen never changes this: a dashboard's
   "newest 5" with a search box searches every row, so the
   procedure takes `q`.

2. **Define the URL state once, shared by both sides.** The URL
   owns every committed narrowing param. One parsers module, in
   `features/<feature>/ui/search-params.ts`, where the `structure`
   tree puts it; the server page imports it from there:

   ```ts
   // features/products/ui/search-params.ts — one definition; server and client import it
   import {
     createLoader, parseAsInteger, parseAsString, parseAsStringLiteral,
   } from "nuqs/server";

   export const productsListParams = {
     q: parseAsString.withDefault(""),
     status: parseAsStringLiteral(["all", "open", "closed"]).withDefault("all"),
     sort: parseAsStringLiteral(["newest", "title"]).withDefault("newest"),
     page: parseAsInteger.withDefault(1),
   };
   export const loadProductsListParams = createLoader(productsListParams);
   ```

   Invalid or missing params fall back to the parser defaults, so
   a mangled URL still renders.

3. **Server page: parse, then prefetch the same input.** A shared
   or reloaded link lands on a server-prefetched, already-narrowed
   list:

   ```tsx
   export default async function Page({ searchParams }: PageProps<"/products">) {
     const filters = await loadProductsListParams(searchParams);
     prefetch(trpc.products.list.queryOptions(filters));
     return (
       <HydrateClient>
         <Suspense fallback={<ProductsTableSkeleton />}><ProductsList /></Suspense>
       </HydrateClient>
     );
   }
   ```

   `PageProps<"/products">` is the global route type that Next
   writes to `.next/types` on `next dev`, `next build` or
   `next typegen`. Without those files `tsc` fails with "Cannot
   find name 'PageProps'", so the app's `typecheck` script is
   `next typegen && tsc --noEmit`, as the Next CLI docs show.

4. **Client list: URL state in, a deferred input to one suspense
   query.** `placeholderData` does not exist for suspense queries,
   and nuqs sets its state synchronously inside the setter call —
   its `startTransition` option wraps only the URL write, for
   `shallow: false` server re-renders. So a query keyed on the
   fresh state suspends with nothing to hold the old list, and
   the route's `loading.tsx` replaces the page. Wrapping your own
   `setFilters` call in `startTransition` holds the list for that
   call only: the back button, or another component writing the
   same key, still updates the state outside it. Key the query on
   `useDeferredValue` of the state: React keeps the revealed list
   on screen until the narrowed one arrives, whatever changed the
   state. The busy cue is "the state and the deferred state
   differ" (`useQueryStates` returns the same object until a value
   changes):

   ```tsx
   const [filters, setFilters] = useQueryStates(productsListParams);
   const shown = useDeferredValue(filters);
   const isStale = shown !== filters;
   const { data } = useSuspenseQuery(trpc.products.list.queryOptions(shown));
   // render the list; dim it while isStale
   ```

   `useDeferredValue` holds only content that is already revealed.
   Keep the list under the Suspense boundary that showed it first;
   a boundary that mounts with the new input shows its fallback.

5. **The search input holds a draft; the URL gets the commit,
   debounced.** nuqs state updates instantly, and the query fires
   on every state change — so a keystroke must not reach
   `setFilters` directly. nuqs's own `limitUrlUpdates: debounce()`
   delays only the URL write; its state, and a query keyed on it,
   still change per keystroke. When the URL's `q` changes from
   outside the box, the draft follows it during render (React's
   "adjust state when a prop changes" pattern, no effect). Selects
   and sort commit immediately, no debounce:

   ```tsx
   const [draft, setDraft] = useState(filters.q);
   const [seenQ, setSeenQ] = useState(filters.q);
   if (filters.q !== seenQ) {
     // the URL changed outside the box (clear filters, back button)
     setSeenQ(filters.q);
     setDraft(filters.q);
   }
   const commit = useDebouncedCallback(
     (q: string) => setFilters({ q, page: 1 }), 400);

   <Input
     value={draft}
     onChange={(e) => { setDraft(e.target.value); commit(e.target.value); }}
   />
   ```

6. **Reset the page on every narrowing change.** Committing `q`,
   a filter, or the sort sets `page: 1` in the same `setFilters`
   call — page 7 of a new search is an empty screen.

7. **Two empty states, not one.** No rows because the filters
   matched nothing → say so and offer a clear-filters action
   (`setFilters(null)` restores every default). No rows because
   nothing exists yet → the feature's real empty state with its
   create action. Branch on whether any narrowing param differs
   from its default.

## Don't — common failures

- Don't keep filters in `useState` and leave the URL untouched —
  reload and share then lose the state. A dashboard card or a
  small widget is no exception.
- Don't search, filter or sort fetched rows on the client — a
  small list is no exception. A list that shows a cap (the newest
  5, one page) holds a part of the data: a browser filter searches
  the rows on screen and never finds a row outside the cap. The
  search covers every row the user can reach, and only the server
  has them.
- Don't pass `startTransition` to `useQueryStates` to hold the old
  list — nuqs changes the state outside that transition, so the
  query suspends to the fallback. Defer the query input.
- Don't key the query on the instant search state — that fetches
  per keystroke; the draft-plus-debounced-commit split exists for
  this.
- Don't forget `page: 1` when the search or a filter changes.
- Don't build another pagination component — the kit already has
  one.
- Don't show the filtered-empty message when the table is empty
  because nothing exists yet.

## Verify

- [ ] Narrowing happens in the list procedure; the client sends
      input, never post-filters.
- [ ] Every narrowing param lives in one shared parsers module,
      `features/<feature>/ui/search-params.ts`; the server page parses with its loader and prefetches the
      identical input.
- [ ] Typing in the search box fires no query per keystroke; the
      commit is debounced.
- [ ] Filter, sort, and search changes reset `page` to 1.
- [ ] Changing the search or a filter keeps the old list on screen,
      dimmed (`useDeferredValue` on the query input), not the
      skeleton fallback — proved by a test that holds the answer
      back.
- [ ] A pasted URL with params renders the narrowed list without
      a client refetch; a mangled URL falls back to defaults.
- [ ] Filtered-empty and truly-empty states are distinct.
