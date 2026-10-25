/** Decides which products a store's list shows. */
import { trace } from "@/db/call-trace";
import type { ProductsListFilters, ProductsRepo } from "../db/products.repo";

export function makeProductsService(deps: { repo: ProductsRepo }) {
  const list = (storeId: string, filters: ProductsListFilters) =>
    trace("calling repo.list to read one page of the store's products", () => deps.repo.list(storeId, filters));

  return { list };
}
