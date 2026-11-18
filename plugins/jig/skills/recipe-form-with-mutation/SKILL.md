---
name: recipe-form-with-mutation
description: The frontend recipe for a form that submits a mutation — validation, field errors. Gives the build order, the common failures, and the Verify list. Use when you build or review that surface. Invoke it before you write the code.
user-invocable: false
---

# Recipe: Form with a mutation

Use this recipe when the user enters data and submits it — a
create or edit form, from one field to a full page. The rules in
the `frontend-standards` skill apply throughout. Libraries: `react-hook-form`,
`@hookform/resolvers/zod`, and the kit's `Field` family
(`Field`, `FieldLabel`, `FieldDescription`, `FieldError`,
`FieldGroup`, `FieldSet`) — install any that are missing.

## Build order

1. **One schema, shared by both sides.** The procedure's zod
   input schema is THE schema: export it from one module and use
   it as the client resolver too. Client validation then mirrors
   the server for free; the server still re-validates — it is the
   authority. The schema lives in `api/<resource>.schema.ts`, which
   imports only zod (`structure`, rule 9). Moving the schema there
   is a change to the router too: write the router's new
   `.input(...)` import as code, never as a note to do it.

   ```ts
   // features/products/api/products.schema.ts
   export const createProductSchema = z.object({
     title: z.string().min(3).max(120),
     description: z.string().max(2000),
   });

   // features/products/api/products.router.ts
   create: protectedProcedure.input(createProductSchema).mutation(({ ctx, input }) => …),

   // features/products/ui/create-product-form.tsx
   const form = useForm({ resolver: zodResolver(createProductSchema), … });
   ```

   No procedure for the submit is a backend gap: apply
   the `implement-frontend` skill's "Backend gaps" section.

2. **Form state.** `useForm` with the shared schema and a
   `defaultValues` entry for every field. An edit form takes its
   `defaultValues` from the entity's prefetched query data:

   ```tsx
   const form = useForm<z.infer<typeof createProductSchema>>({
     resolver: zodResolver(createProductSchema),
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
   const mutation = useMutation(trpc.products.create.mutationOptions({
     meta: { failureTitle: "Couldn't create the product" },
     onSuccess: () => {
       queryClient.invalidateQueries(trpc.products.list.queryFilter());
       toast.success("Product created");
       router.push(`/products`); // or form.reset() for create-another
     },
   }));

   <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))}>
     …
     <Button type="submit" disabled={mutation.isPending}>
       {mutation.isPending ? <Spinner /> : null} Create product
     </Button>
   </form>
   ```

5. **A failure of a field lands on the field.** When the
   procedure can answer a failure with `field`, the form draws its
   failures itself, with `form.formState.errors.root` in a
   `FieldError` above the submit button.

   ```tsx
   meta: { showsOwnFailure: true }, // in place of failureTitle
   onError: (error) => {
     const { field, message } = describeFailure(error); // lib/trpc/failure.ts
     form.setError(field ? (field as Path<Values>) : "root", { message });
   },
   ```

6. **Reset semantics.** A create form resets on success (or
   navigates away). An edit form does not reset — the invalidated
   query re-syncs it.

## Don't — common failures

- Don't hand-roll label + error `<div>`s around inputs — the
  `Field` family carries the ids, `aria-invalid`, and error wiring.
- Don't write a second client-only schema — it drifts from the
  procedure input; share the one module.
- Don't clear or reset the form on a failed submit.
- Don't leave submit enabled while pending — double submits create duplicates.

## Verify

- [ ] The resolver schema and the procedure input schema are one
      exported module.
- [ ] Every field renders through `Controller` + `Field`, with
      `htmlFor`/`id` paired and `aria-invalid` on the control.
- [ ] Submit is disabled while pending; no double-submit.
- [ ] `meta` has `failureTitle`, or `showsOwnFailure` with each
      failure on its field or on `root`; input survives.
- [ ] Success invalidates the affected `queryFilter` and gives
      feedback (toast, navigation, or reset).
- [ ] Create resets on success; edit re-syncs from the
      invalidated query.
