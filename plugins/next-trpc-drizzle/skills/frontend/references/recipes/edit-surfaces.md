# Recipe: Edit surfaces — inline, dialog, sheet, page

Use this recipe when the user changes data outside a dedicated
form page, and to pick which surface an edit lives in. The form
inside comes from `form-with-mutation.md`; the write's feedback
from `mutation-feedback.md`. This recipe owns the surface choice
and the surface mechanics.

## Pick the surface

- **One field, instant feedback expected** (a status, a title, a
  toggle) → **inline edit**, auto-saving on commit.
- **Short, focused, infrequent task in a single context**, nothing
  outside it to consult → **Dialog**. If the content needs more
  space than a large dialog, it is a page, not a bigger dialog.
- **A task the user repeats often**, or one needing information or
  navigation outside the surface → **its own page**.
- **Quick preview or reference beside the page** (peek at a
  candidate from a list) → **Sheet**. Small direct actions in it
  are fine; a create/edit form in a sheet is not — that edit is a
  dialog or a page.

## Build order — dialog edit

1. **Prefetch on the trigger.** The edit's entity query prefetches
   on the trigger's hover/focus; heavy dialog content loads with
   `next/dynamic`.

2. **Controlled dialog, form inside** per `form-with-mutation.md`.
   Success closes the dialog after the mutation settles — never
   before:

   ```tsx
   const [open, setOpen] = useState(false);
   const mutation = useMutation(trpc.jobs.update.mutationOptions({
     onSuccess: () => {
       queryClient.invalidateQueries(trpc.jobs.list.queryFilter());
       toast.success("Job updated");
       setOpen(false);
     },
   }));
   ```

3. **The dismissal contract.** `Esc` and the Cancel button close
   and discard. A backdrop click must NOT discard unsaved input —
   block it while the form is dirty:

   ```tsx
   <DialogContent
     onInteractOutside={(e) => {
       if (form.formState.isDirty) e.preventDefault();
     }}
   >
   ```

4. **A dialog opened from a dropdown menu is controlled.** The
   row owns the `open` state, the menu item opens it with
   `onSelect={() => setOpen(true)}`, and the dialog renders
   OUTSIDE the menu. A `DialogTrigger` inside
   `DropdownMenuContent` dies when the menu unmounts on select.

5. **Destructive confirms** are an `AlertDialog`: the body states
   the consequence; the confirm button is the specific verb
   (`Delete job`), destructive variant — never "OK", "Yes", or
   "Done". The title and button name the same action.

## Build order — inline edit

1. The display value swaps to an input on click (or `Enter` when
   focused). `Esc` reverts; blur or `Enter` commits.
2. The commit is a mutation on the variables-only optimistic tier:
   the new value renders immediately from `variables`, a subtle
   spinner marks pending, and a failure reverts the value with a
   toast naming the action.
3. The swap is one component owning one piece of state
   (`editing`), not a page-level mode.

## Build order — sheet preview

1. A `Sheet` shows a read view of a row beside its list; its data
   prefetches on the row's hover/focus and reads through the same
   `queryOptions` as everything else.
2. Direct actions inside it (change status, assign) follow
   `mutation-feedback.md`.
3. The moment a form grows inside a sheet, move it — dialog for
   short, page for long.

## Don't — failures this repo shipped

- Don't put a create/edit form in a `Sheet` — quick previews and
  direct actions only.
- Don't grow a dialog into a page — more content than a large
  dialog fits means it IS a page.
- Don't let a backdrop click discard a dirty form.
- Don't label a confirm button "OK", "Yes", or "Done" — the
  specific verb.
- Don't open an edit surface into a fresh spinner — the entity
  was prefetchable on the trigger.
- Don't hand-roll a fullscreen takeover for an edit — this repo
  shipped four ad-hoc fullscreen implementations; the surfaces
  above cover edits.
- Don't let closing an overlay disturb the page beneath it. This
  repo shipped the same bug three times: closing a dialog (by
  button OR backdrop) collapsed collapsibles under it, because a
  page-level outside-click handler misread the overlay's events —
  rules 62–63 are the fix.
- Don't put a `DialogTrigger` inside `DropdownMenuContent`.

## Verify

- [ ] The chosen surface matches the pick rules (field → inline;
      short focused → dialog; repeated or context-needing → page;
      preview → sheet).
- [ ] No create/edit form lives in a sheet.
- [ ] Dialog closes on success only after the mutation settles;
      Esc/Cancel discard; backdrop is blocked while dirty.
- [ ] Destructive confirms state the consequence and use the
      action verb on the button.
- [ ] Inline edits commit on blur/Enter, revert on Esc, and fail
      loudly (revert + named toast).
- [ ] Surface data prefetches on the trigger; no fresh spinner on
      open.
- [ ] Closing the surface — button, Esc, or backdrop — leaves the
      page beneath exactly as it was: no collapsed sections, no
      state changes.
- [ ] Dialogs opened from menus are controlled and rendered
      outside the menu.
