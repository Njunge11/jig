"use client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { Field, FieldLabel } from "@/components/ui/field";
import { RichTextEditor, RichTextEditorContent } from "@/components/ui/rich-text-editor";
import { useTRPC } from "@/lib/trpc/react";

/** The product's description, edited in the app's rich text editor. */
export function ProductDescriptionForm({ productId }: { productId: string }) {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.products.byId.queryOptions({ productId }));
  const form = useForm<{ description: string }>({
    defaultValues: { description: data.status === "found" ? (data.product.description ?? "") : "" },
  });

  if (data.status !== "found") return <p>{data.message}</p>;

  return (
    <form className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold">{data.product.title}</h1>
      <Controller
        name="description"
        control={form.control}
        render={({ field }) => (
          <Field>
            <FieldLabel>Description</FieldLabel>
            <RichTextEditor defaultValue={field.value} onValueChange={field.onChange} className="h-80">
              <RichTextEditorContent label="Description" />
            </RichTextEditor>
          </Field>
        )}
      />
    </form>
  );
}
