/** Decides which products a store lists, and moves a product in and out of the archive. */
import { trace } from "@/db/call-trace";
import type { ProductsRepo } from "../db/products.repo";

export function makeProductsService(deps: { repo: ProductsRepo }) {
  const list = (storeId: string) =>
    trace("calling repo.listActive to read the store's active products", () => deps.repo.listActive(storeId));

  const archive = (storeId: string, id: string) =>
    trace("calling repo.setStatus to archive the product", () => deps.repo.setStatus(storeId, id, "archived"));

  const unarchive = (storeId: string, id: string) =>
    trace("calling repo.setStatus to restore the product", () => deps.repo.setStatus(storeId, id, "active"));

  return { list, archive, unarchive };
}
