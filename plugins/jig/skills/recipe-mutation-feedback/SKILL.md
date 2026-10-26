---
name: recipe-mutation-feedback
description: The frontend recipe for mutation feedback — toasts, optimistic updates, undo. Gives the build order, the common failures, and the Verify list. Use when you build or review that surface. Invoke it before you write the code.
user-invocable: false
---

# Recipe: Mutation feedback

Use this recipe for what the user sees when a write runs —
pending, success, failure, optimistic UI, undo. Form submits get
their wiring from the `recipe-form-with-mutation` skill; this recipe covers the
feedback contract for every mutation, form or not (row actions,
toggles, inline buttons). Library: `sonner` via the kit's toaster.

## Build order

1. **Pick the feedback tier, per mutation.** Say which tier in
   the code, by shape:

   - **Default — pending + settle feedback.** The trigger shows
     the pending state; a toast reports the outcome. Right for
     most writes.
   - **Optimistic, variables-only.** Instant-feel actions the
     user expects to succeed (toggle, rename, reorder).
   - **Optimistic, cache-write.** Only when other components must
     reflect the change immediately.
   - **Destructive or irreversible.** Never optimistic. Confirm
     first (`AlertDialog`), then default tier.

2. **Pending on the trigger.** The control that fired the write
   is disabled and shows the spinner while `isPending`. A second
   click is an accidental repeat: on a non-idempotent write (add
   a comment, send an invite) the backend runs it again
   legitimately — only the UI knows it was one intent. Never a
   global overlay.

   ```tsx
   <Button onClick={() => archive.mutate({ id })} disabled={archive.isPending}>
     {archive.isPending ? <Spinner /> : null} Archive
   </Button>
   ```

   A switch or checkbox that saves on click is the one exception:
   step 8.

3. **The toast contract.** Success names the action and the
   object, past tense: `toast.success("Product archived")`. Failure
   names what failed: `toast.error("Couldn't archive the product")`.
   Toasts are for mutations only — read failures belong to the
   error boundary.

4. **Settle: invalidate what the write changed**, in `onSettled`
   (not `onSuccess` — it must also run after an error rollback):

   ```tsx
   onSettled: (_d, _e, _v, _r, context) =>
     context.client.invalidateQueries(trpc.products.list.queryFilter()),
   ```

5. **Variables-only optimism** — render the pending item from the
   mutation's own state; no cache writes; it reconciles on
   settle:

   ```tsx
   const addTag = useMutation(trpc.tags.add.mutationOptions({ … }));
   const tags = [
     ...data.tags,
     ...(addTag.isPending ? [{ ...addTag.variables, pending: true }] : []),
   ];
   ```

6. **Cache-write optimism** — the full shape, in this order:
   cancel, snapshot, set, rollback on error, invalidate on
   settle. `cancelQueries` comes first (a slow refetch would
   clobber the optimistic value); callbacks receive `context`
   with `context.client`, and `onMutate`'s return arrives as the
   `onMutateResult` parameter (typed `| undefined` in `onError`
   and `onSettled`). `queryFilter()` with no input matches every
   cached input of the procedure, so it suits `cancelQueries` and
   `invalidateQueries`; `getQueryData`/`setQueryData` need the
   exact key, which `queryFilter().queryKey` is only for a
   procedure without input. A list cached under inputs uses
   `trpc.x.list.queryKey(input)`, or `getQueriesData(filter)` and
   `setQueriesData(filter, updater)` for every cached input:

   ```ts
   const filter = trpc.promo.list.queryFilter();
   useMutation(trpc.promo.markPaid.mutationOptions({
     onMutate: async (vars, context) => {
       await context.client.cancelQueries(filter);                // 1 cancel
       const prev = context.client.getQueryData(filter.queryKey); // 2 snapshot
       context.client.setQueryData(filter.queryKey, apply(prev, vars)); // 3 set
       return { prev };
     },
     onError: (_e, _v, onMutateResult, context) => {
       if (onMutateResult) // undefined when onMutate threw
         context.client.setQueryData(filter.queryKey, onMutateResult.prev); // rollback
       toast.error("Couldn't mark the promo paid");
     },
     onSettled: (_d, _e, _v, _r, context) =>
       context.client.invalidateQueries(filter),                  // reconcile
   }));
   ```

7. **Undo, for reversible writes only.** The write commits
   immediately; the toast's action runs the inverse mutation:

   ```tsx
   toast.success("Product archived", {
     action: { label: "Undo", onClick: () => unarchive.mutate({ id }) },
   });
   ```

   Undo is an inverse mutation, never a delayed commit. An
   irreversible write gets a confirm dialog up front, not an undo
   that cannot work.

8. **A switch or checkbox that saves on click.** This step is
   only for a control that holds a value the user flips. Every
   other write (a button, a row action, an archive) keeps steps
   2–7 as written: its button disables while pending, and its
   cache write restores its snapshot on error.

   The control follows every click at once. It is never
   `disabled={isPending}`, because the kit dims a disabled
   control for the whole save and refetch. Its handler never
   drops a click either: under fast clicks a dropped click leaves
   the control stuck on a value the user did not pick.
   Setting a value is idempotent, so every click sends its save,
   and four parts keep the last click the one that stays:

   - `scope: { id }` per control: TanStack runs the saves of one
     scope one after another, in click order, so the last click's
     value is the last one written. `onMutate` still runs at once
     for every click.
   - The cache-write tier (step 6): `onMutate` cancels the read
     and writes the new value into the cache, so the control
     reads the cache and moves at once.
   - `onSettled` refetches only after the last save of the
     procedure: `isMutating({ mutationKey }) === 1` (the settling
     save still counts as pending). A refetch between two saves
     flips the control back for a moment.
   - One toast per control, by `id`, so ten clicks show one toast.

   This control alone skips step 6's rollback: a failed save
   toasts, and the last `onSettled` refetches what the server
   holds, because restoring the snapshot would also undo the
   clicks after it.

   ```tsx
   const filter = trpc.products.list.queryFilter();
   const toastId = `featured-${id}`;
   const setFeatured = useMutation(trpc.products.setFeatured.mutationOptions({
     scope: { id: toastId },
     onMutate: async ({ featured }, context) => {
       await context.client.cancelQueries(filter);
       context.client.setQueryData(filter.queryKey, (rows) =>
         rows?.map((row) => (row.id === id ? { ...row, featured } : row)));
     },
     onSuccess: (_d, { featured }) =>
       toast.success(featured ? "Product featured" : "Product unfeatured", { id: toastId }),
     onError: () => toast.error("Couldn't change the product", { id: toastId }),
     onSettled: (_d, _e, _v, _r, context) => {
       const key = trpc.products.setFeatured.mutationKey();
       if (context.client.isMutating({ mutationKey: key }) === 1) {
         return context.client.invalidateQueries(filter);
       }
     },
   }));

   <Checkbox
     checked={row.featured} // read from the cache
     onCheckedChange={(featured) => setFeatured.mutate({ id, featured: featured === true })}
   />
   ```

## Don't — common failures

- Don't ship a silent mutation — every write shows pending and
  reports its outcome.
- Don't toast "Something went wrong" — name the action that
  failed.
- Don't route a mutation failure to the error boundary, or a read
  failure to a toast.
- Don't invalidate in `onSuccess` — `onSettled`, so
  reconciliation also runs after a rollback.
- Don't cache-write when variables-only covers it; don't
  optimistic a destructive action at all.
- Don't fake undo by delaying the write — commit, then offer the
  inverse.

## Verify

- [ ] Each mutation states its tier; destructive writes confirm
      first and are never optimistic.
- [ ] A button that fires a write is disabled with a spinner
      while pending; no double-submit; no global overlay.
- [ ] A switch or checkbox on an optimistic tier follows every
      click at once: never disabled or dimmed while pending, and
      no click is dropped. Its saves share one `scope.id`, the
      cache holds the new value, `onSettled` refetches only when
      `isMutating({ mutationKey }) === 1`, and its toasts share
      one `id`.
- [ ] Success and failure toasts name the action; no boundary
      shows a mutation failure.
- [ ] Invalidation runs in `onSettled` through the derived
      `queryFilter`.
- [ ] Cache-write optimism follows cancel → snapshot → set →
      rollback → invalidate, with `context.client` and
      `onMutateResult`.
- [ ] Undo appears only where an inverse mutation exists.
