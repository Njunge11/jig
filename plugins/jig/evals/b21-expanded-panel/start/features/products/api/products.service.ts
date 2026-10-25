/** Decides which products a store's pages show. */
import { trace } from "@/db/call-trace";
import type { ProductsRepo } from "../db/products.repo";

export function makeProductsService(deps: { repo: ProductsRepo }) {
  const list = (storeId: string) => trace("calling repo.list to read the store's products", () => deps.repo.list(storeId));

  const byId = (storeId: string, id: string) =>
    trace("calling repo.byId to read one of the store's products", () => deps.repo.byId(storeId, id));

  return { list, byId };
}
