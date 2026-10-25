"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useTRPC } from "@/lib/trpc/react";
import { productEditSchema, type ProductEditValues } from "../api/product-edit.schema";

/** The product editor's form: title, price and the pasted description HTML. */
export function ProductEditForm({ productId }: { productId: string }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data } = useSuspenseQuery(trpc.products.byId.queryOptions({ productId }));
  const product = data.status === "found" ? data.product : null;
  const form = useForm<ProductEditValues>({
    resolver: zodResolver(productEditSchema),
    defaultValues: {
      title: product?.title ?? "",
      priceCents: product?.priceCents ?? 0,
      descriptionHtml: product?.descriptionHtml ?? "",
    },
  });
  const save = useMutation(
    trpc.products.update.mutationOptions({
      onSuccess: (result) => {
        if (result.status === "saved") toast.success("Product saved");
        else toast.error(result.message);
      },
      onError: () => toast.error("Couldn't save the product"),
      onSettled: () => queryClient.invalidateQueries(trpc.products.byId.queryFilter({ productId })),
    }),
  );

  if (data.status !== "found") return <p>{data.message}</p>;

  return (
    <form className="flex flex-col gap-4" onSubmit={form.handleSubmit((values) => save.mutate({ productId, ...values }))}>
      <Controller
        name="title"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Title</FieldLabel>
            <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
            {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
          </Field>
        )}
      />
      <Controller
        name="priceCents"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Price (cents)</FieldLabel>
            <Input
              id={field.name}
              type="number"
              value={field.value}
              onChange={(event) => field.onChange(event.target.valueAsNumber)}
              onBlur={field.onBlur}
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
          </Field>
        )}
      />
      <Controller
        name="descriptionHtml"
        control={form.control}
        render={({ field }) => (
          <Field>
            <FieldLabel htmlFor={field.name}>Description (paste HTML)</FieldLabel>
            <Textarea {...field} id={field.name} rows={12} className="font-mono text-xs" />
          </Field>
        )}
      />
      <Button type="submit" className="self-start" disabled={save.isPending}>
        {save.isPending ? <Spinner /> : null} Save product
      </Button>
    </form>
  );
}
