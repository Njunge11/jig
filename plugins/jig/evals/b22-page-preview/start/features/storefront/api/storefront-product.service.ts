/** Reads the product the public product page shows. */
import { trace } from "@/db/call-trace";
import type { StorefrontProductsRepo } from "../db/storefront-products.repo";

export function makeStorefrontProductService(deps: { repo: StorefrontProductsRepo }) {
  async function product(productId: string) {
    const row = await trace("calling repo.activeById to read the product", () => deps.repo.activeById(productId));
    if (!row) return { status: "notFound" as const, message: "This product is not for sale." };
    return { status: "found" as const, product: row };
  }

  return { product };
}
