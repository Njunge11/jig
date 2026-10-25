/** Decides which product details a store reads and saves. */
import { trace } from "@/db/call-trace";
import type { ProductDetails, ProductsRepo } from "../db/products.repo";

export function makeProductsService(deps: { repo: ProductsRepo }) {
  const list = (storeId: string) => trace("calling repo.list to read the store's products", () => deps.repo.list(storeId));

  const byId = (storeId: string, id: string) =>
    trace("calling repo.byId to read the product's details", () => deps.repo.byId(storeId, id));

  const update = (storeId: string, id: string, details: ProductDetails) =>
    trace("calling repo.update to save the product's details", () => deps.repo.update(storeId, id, details));

  return { list, byId, update };
}
