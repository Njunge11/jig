"use client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTRPC } from "@/lib/trpc/react";
import { DescriptionEditor } from "./description-editor";
import { DescriptionPreview } from "./description-preview";

/** The product editor: the description editor panel beside its preview. */
export function ProductEditor({ id }: { id: string }) {
  const trpc = useTRPC();
  const { data: product } = useSuspenseQuery(trpc.products.byId.queryOptions({ id }));
  const [description, setDescription] = useState("");

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">{product.title}</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <DescriptionEditor value={description} onChange={setDescription} />
        <DescriptionPreview title={product.title} description={description} />
      </div>
    </div>
  );
}
