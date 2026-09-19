---
name: recipe-search-and-filters
description: The frontend recipe for search, filters, sort or pagination over a list — the server narrows the rows, the URL owns the state, the search input debounces. Gives the build order, the common failures, and the Verify list. Use when you build or review that surface. The frontend builder and reviewer agents preload this recipe; in any other session, invoke it before you write the code.
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
   backend gap: apply the `frontend-standards` skill's "Backend gaps" section.
   The row count on screen never changes this: a dashboard's
   "newest 5" with a search box searches every row, so the
   procedure takes `q`.

2. **Define the URL state once, shared by both sides.** The URL
   owns every committed narrowing param. One parsers module:

   ```ts
   // search-params.ts — one definition; server and client import it
   import {
     createLoader, parseAsInteger, parseAsString, parseAsStringLiteral,
   } from "nuqs/server";

   export const jobsListParams = {
     q: parseAsString.withDefault(""),
     status: parseAsStringLiteral(["all", "open", "closed"]).withDefault("all"),
     sort: parseAsStringLiteral(["newest", "title"]).withDefault("newest"),
     page: parseAsInteger.withDefault(1),
   };
   export const loadJobsListParams = createLoader(jobsListParams);
   ```

   Invalid or missing params fall back to the parser defaults, so
   a mangled URL still renders.

3. **Server page: parse, then prefetch the same input.** A shared
   or reloaded link lands on a server-prefetched, already-narrowed
   list:

   ```tsx
   export default async function Page({ searchParams }: PageProps) {
     const filters = await loadJobsListParams(searchParams);
     prefetch(trpc.jobs.list.queryOptions(filters));
     return (
       <HydrateClient>
         <Suspense fallback={<JobsTableSkeleton />}><JobsList /></Suspense>
       </HydrateClient>
     );
   }
   ```

4. **Client list: URL state in, a deferred input to one suspense
   query.** `placeholderData` does not exist for suspense queries,
   and nuqs sets the new state at once, outside any transition —
   its `startTransition` option wraps only the URL write, for
   `shallow: false` server re-renders. So a query keyed on the
   fresh state suspends with nothing to hold the old list, and
   the route's `loading.tsx` replaces the page. Key the query on
   `useDeferredValue` of the state: React keeps the revealed list
   on screen until the narrowed one arrives. The busy cue is
   "the state and the deferred state differ":

   ```tsx
   const [filters, setFilters] = useQueryStates(jobsListParams);
   const shown = useDeferredValue(filters);
   const isStale = shown !== filters;
   const { data } = useSuspenseQuery(trpc.jobs.list.queryOptions(shown));
   // render the list; dim it while isStale
   ```

   `useDeferredValue` holds only content that is already revealed.
   Keep the list under the Suspense boundary that showed it first;
   a boundary that mounts with the new input shows its fallback.

5. **The search input holds a draft; the URL gets the commit,
   debounced.** nuqs state updates instantly, and the query fires
   on every state change — so a keystroke must not reach
   `setFilters` directly. Selects and sort commit immediately, no
   debounce:

   ```tsx
   const [draft, setDraft] = useState(filters.q);
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
- [ ] Every narrowing param lives in one shared parsers module;
      the server page parses with its loader and prefetches the
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
