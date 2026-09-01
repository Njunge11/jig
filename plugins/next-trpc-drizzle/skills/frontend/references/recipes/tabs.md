# Recipe: Tabs and segmented views

Use this recipe when one route shows alternate views the user
switches between — tabs over a list, segmented detail sections.
Tabs live inside a page, so load `page-with-data.md` too — this
recipe only changes what tabs change. Libraries: shadcn `Tabs`
(Radix) and `nuqs` — both already installed.

## Build order

1. **Contract delta: the counts.** Tab badge counts come from ONE
   aggregating counts procedure, and its definitions must be the
   same predicates the tab contents query — a count computed one
   way and a list filtered another way drift apart. A mismatch is
   a backend gap: apply SKILL.md's "Backend gaps" section.

2. **The URL owns the active tab.** Add `tab` to the route's
   shared parsers module, next to its search/filter params:

   ```ts
   export const candidatesParams = {
     tab: parseAsStringLiteral(["active", "interview", "rejected"])
       .withDefault("active"),
   };
   export const loadCandidatesParams = createLoader(candidatesParams);
   ```

3. **Prefetch delta: counts + the active tab only.** In the
   server page from `page-with-data`, do not prefetch every
   tab's data — parse the `tab` param and prefetch its list plus
   the counts:

   ```tsx
   export default async function Page({ searchParams }: PageProps) {
     const { tab } = await loadCandidatesParams(searchParams);
     prefetch(trpc.candidates.counts.queryOptions());
     prefetch(trpc.candidates.list.queryOptions({ tab }));
     return (
       <HydrateClient>
         <Suspense fallback={<CandidatesTabsSkeleton />}>
           <CandidatesTabs />
         </Suspense>
       </HydrateClient>
     );
   }
   ```

4. **Client: controlled Tabs bound to the URL state**, switches
   wrapped in a transition so the current tab stays on screen
   while the next one loads; each content panel owns its Suspense
   boundary:

   ```tsx
   const [isPending, startTransition] = useTransition();
   const [{ tab }, setParams] = useQueryStates(candidatesParams, {
     startTransition,
   });

   <Tabs value={tab} onValueChange={(v) => setParams({ tab: v })}>
     <TabsList>
       <TabsTrigger value="active" onMouseEnter={prefetchActive}
         onFocus={prefetchActive}>
         Active <Badge>{counts.active}</Badge>
       </TabsTrigger>
       …
     </TabsList>
     <TabsContent value="active">
       <Suspense fallback={<ListSkeleton />}><ActiveList /></Suspense>
     </TabsContent>
     …
   </Tabs>
   ```

5. **Prefetch a tab on its trigger's hover and focus**, so the
   first switch is instant:

   ```tsx
   const queryClient = useQueryClient();
   const trpc = useTRPC();
   const prefetchActive = () =>
     queryClient.prefetchQuery(trpc.candidates.list.queryOptions({ tab: "active" }));
   ```

   The cache deduplicates: hovering twice, or returning to a
   visited tab, fetches nothing.

6. **Tabs that carry their own filters:** a tab switch resets
   tab-scoped params (page, tab-local filters) in the same
   `setParams` call, the way a search commit resets `page`.

## Don't — failures this repo shipped

- Don't keep the active tab in `useState` and leave the URL
  untouched — reload, share, and back-button then lose the tab.
  This repo's tabs never wrote the URL back.
- Don't prefetch or await every tab's data up front — the active
  tab's data plus hover prefetch covers it.
- Don't compute badge counts with separate logic from the tab
  contents — one counts procedure, same predicates.
- Don't put a spinner inside a tab panel that suspends — the
  panel's Suspense boundary owns loading.
- Don't rebuild tab navigation from `Button`s — `Tabs` carries
  the keyboard map (arrows, Home/End) and ARIA for free.

## Verify

- [ ] The active tab is in the URL; a pasted URL opens the right
      tab server-prefetched; back-button walks tab history
      sanely.
- [ ] Only the active tab's data is fetched up front; other tabs
      prefetch on trigger hover/focus.
- [ ] Badge counts and tab contents share one procedure's
      definitions.
- [ ] Switching tabs keeps the current view during load
      (transition + `isPending`), and a first visit shows the
      panel's skeleton, not a global one.
- [ ] A tab switch resets tab-scoped params in the same update.
- [ ] Arrow keys move between triggers (the primitive is intact).
