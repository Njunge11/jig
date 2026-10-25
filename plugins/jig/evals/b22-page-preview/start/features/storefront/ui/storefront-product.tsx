"use client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/lib/trpc/react";

const price = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

/** The public product page: title, price, the seller's description and the buy button. */
export function StorefrontProduct({ productId }: { productId: string }) {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.storefront.product.queryOptions({ productId }));
  if (data.status !== "found") return <p className="p-8">{data.message}</p>;
  const { product } = data;
  return (
    <article className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-8 md:px-8">
      <h1 className="text-3xl">{product.title}</h1>
      <p className="text-xl text-primary">{price.format(product.priceCents / 100)}</p>
      <div className="text-base leading-relaxed" dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
      <Button className="self-start">Add to cart</Button>
    </article>
  );
}
