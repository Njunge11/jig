/** Decides which products a store's list shows, and which of them are featured. */
import { trace } from "@/db/call-trace";
import type { ProductsRepo } from "../db/products.repo";

export function makeProductsService(deps: { repo: ProductsRepo }) {
  const list = (storeId: string) => trace("calling repo.list to read the store's products", () => deps.repo.list(storeId));

  const setFeatured = (storeId: string, id: string, featured: boolean) =>
    trace("calling repo.setFeatured to mark the product featured or not", () => deps.repo.setFeatured(storeId, id, featured));

  return { list, setFeatured };
}
