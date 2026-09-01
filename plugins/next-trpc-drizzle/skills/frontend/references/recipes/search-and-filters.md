# Recipe: Search, filters, and sort over a list

Use this recipe when the user narrows a list: a search box, filter
selects, a sort control, pagination. The rules in SKILL.md apply
throughout; this recipe gives the build order and the
list-narrowing mechanics. Libraries: `nuqs` for URL state and
`use-debounce` — both already installed.

## Build order

1. **Find the backend contract.** The list procedure takes the
   narrowing in its input (`q`, filters, `sort`, `page`) and does
   the work server-side — `WHERE`, `ORDER BY`, `LIMIT` — and
   returns the rows plus the total count. A procedure that
   returns the full list for the client to `.filter()` is a
   backend gap: apply SKILL.md's "Backend gaps" section.

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

4. **Client list: URL state in, one suspense query out.**
   `placeholderData` does not exist for suspense queries — wrap
   the updates that change the query input in a transition, so
   the old list stays on screen instead of the fallback, and use
   `isPending` as the busy cue:

   ```tsx
   const [isPending, startTransition] = useTransition();
   const [filters, setFilters] = useQueryStates(jobsListParams, {
     startTransition,
   });
   const { data } = useSuspenseQuery(trpc.jobs.list.queryOptions(filters));
   // render the list; dim it with isPending while the next page loads
   ```

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

## Don't — failures this repo shipped

- Don't keep filters in `useState` and leave the URL untouched —
  reload and share then lose the state.
- Don't filter or sort a fully-fetched list on the client.
- Don't key the query on the instant search state — that fetches
  per keystroke; the draft-plus-debounced-commit split exists for
  this.
- Don't forget `page: 1` when the search or a filter changes.
- Don't build another pagination component — the kit already has
  one; this repo shipped five.
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
- [ ] Changing filters keeps the old list on screen (transition +
      `isPending` cue), not the skeleton fallback.
- [ ] A pasted URL with params renders the narrowed list without
      a client refetch; a mangled URL falls back to defaults.
- [ ] Filtered-empty and truly-empty states are distinct.
