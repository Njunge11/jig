/** Decides which products a store's list shows. */
import { trace } from "@/db/call-trace";
import type { ProductsRepo } from "../db/products.repo";

export function makeProductsService(deps: { repo: ProductsRepo }) {
  const list = (storeId: string) => trace("calling repo.list to read the store's products", () => deps.repo.list(storeId));

  return { list };
}
