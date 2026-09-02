# Recipe: Form with a mutation

Use this recipe when the user enters data and submits it — a
create or edit form, from one field to a full page. The rules in
SKILL.md apply throughout. Libraries: `react-hook-form`,
`@hookform/resolvers/zod`, and the kit's `Field` family
(`Field`, `FieldLabel`, `FieldDescription`, `FieldError`,
`FieldGroup`, `FieldSet`) — install any that are missing.

## Build order

1. **One schema, shared by both sides.** The procedure's zod
   input schema is THE schema: export it from one module and use
   it as the client resolver too. Client validation then mirrors
   the server for free; the server still re-validates — it is the
   authority. No procedure for the submit is a backend gap: apply
   SKILL.md's "Backend gaps" section.

2. **Form state.** `useForm` with the shared schema and a
   `defaultValues` entry for every field. An edit form takes its
   `defaultValues` from the entity's prefetched query data:

   ```tsx
   const form = useForm<z.infer<typeof jobSchema>>({
     resolver: zodResolver(jobSchema),
     defaultValues: { title: "", description: "" },
   });
   ```

3. **Field anatomy** — RHF `Controller` + the kit's `Field`
   parts. The label points at the input; invalidity is carried on
   both the `Field` (`data-invalid`) and the control
   (`aria-invalid`):

   ```tsx
   <Controller
     name="title"
     control={form.control}
     render={({ field, fieldState }) => (
       <Field data-invalid={fieldState.invalid}>
         <FieldLabel htmlFor={field.name}>Title</FieldLabel>
         <Input {...field} id={field.name}
           aria-invalid={fieldState.invalid} />
         {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
       </Field>
     )}
   />
   ```

4. **The mutation.** Submit hands validated data to the mutation;
   the button is disabled while pending; success invalidates what
   the write changed and tells the user:

   ```tsx
   const mutation = useMutation(trpc.jobs.create.mutationOptions({
     onSuccess: () => {
       queryClient.invalidateQueries(trpc.jobs.list.queryFilter());
       toast.success("Job created");
       router.push(`/jobs`); // or form.reset() for create-another
     },
   }));

   <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))}>
     …
     <Button type="submit" disabled={mutation.isPending}>
       {mutation.isPending ? <Spinner /> : null} Create job
     </Button>
   </form>
   ```

5. **Server errors land in the right channel.** Write one
   error-mapping helper for the app's error contract and use it
   in `onError`: a failure tied to a field goes to that field via
   `form.setError(name, { message })`; everything else is a toast
   naming the action. The user's input stays intact either way —
   never reset on error.

6. **Reset semantics.** A create form resets on success (or
   navigates away). An edit form does not reset — the invalidated
   query re-syncs it.

## Don't — common failures

- Don't hand-roll label + error `<div>`s around inputs — the
  `Field` family carries the ids, `aria-invalid`, and error
  wiring.
- Don't write a second client-only schema — it drifts from the
  procedure input; share the one module.
- Don't trust client validation alone — the server re-validates
  before side effects; the client schema is UX, not enforcement.
- Don't clear or reset the form on a failed submit.
- Don't leave the submit button enabled while the mutation is
  pending — double submits create duplicates.
- Don't render a mutation failure in the route error boundary —
  boundaries are for read failures; mutations toast or set field
  errors.

## Verify

- [ ] The resolver schema and the procedure input schema are one
      exported module.
- [ ] Every field renders through `Controller` + `Field`, with
      `htmlFor`/`id` paired and `aria-invalid` on the control.
- [ ] Submit is disabled while pending; no double-submit.
- [ ] A server field error lands on its field; other failures
      toast with the action's name; input survives.
- [ ] Success invalidates the affected `queryFilter` and gives
      feedback (toast, navigation, or reset).
- [ ] Create resets on success; edit re-syncs from the
      invalidated query.
