# Recipe: Mutation feedback

Use this recipe for what the user sees when a write runs —
pending, success, failure, optimistic UI, undo. Form submits get
their wiring from `form-with-mutation.md`; this recipe covers the
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

3. **The toast contract.** Success names the action and the
   object, past tense: `toast.success("Job archived")`. Failure
   names what failed: `toast.error("Couldn't archive the job")`.
   Toasts are for mutations only — read failures belong to the
   error boundary.

4. **Settle: invalidate what the write changed**, in `onSettled`
   (not `onSuccess` — it must also run after an error rollback):

   ```tsx
   onSettled: (_d, _e, _v, _r, context) =>
     context.client.invalidateQueries(trpc.jobs.list.queryFilter()),
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
     onError: (_e, _v, onMutateResult, context) => {
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
   toast.success("Candidate archived", {
     action: { label: "Undo", onClick: () => unarchive.mutate({ id }) },
   });
   ```

   Undo is an inverse mutation, never a delayed commit. An
   irreversible write gets a confirm dialog up front, not an undo
   that cannot work.

## Don't — failures this repo shipped

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
- [ ] The firing control is disabled with a spinner while
      pending; no double-submit; no global overlay.
- [ ] Success and failure toasts name the action; no boundary
      shows a mutation failure.
- [ ] Invalidation runs in `onSettled` through the derived
      `queryFilter`.
- [ ] Cache-write optimism follows cancel → snapshot → set →
      rollback → invalidate, with `context.client` and
      `onMutateResult`.
- [ ] Undo appears only where an inverse mutation exists.
