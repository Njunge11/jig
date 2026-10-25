/** Decides which products a store's list shows, and which products a store may delete. */
import { trace } from "@/db/call-trace";
import type { ProductsRepo } from "../db/products.repo";

export type DeleteProductResult = { ok: true } | { ok: false; reason: "notFound" | "hasOrders" };

export function makeProductsService(deps: { repo: ProductsRepo }) {
  const list = (storeId: string) => trace("calling repo.list to read the store's products", () => deps.repo.list(storeId));

  // A product that any order names stays, so the order keeps its line.
  async function deleteProduct(id: string, storeId: string): Promise<DeleteProductResult> {
    const exists = await trace("calling repo.exists to find the product", () => deps.repo.exists(id, storeId));
    if (!exists) return { ok: false, reason: "notFound" };
    const hasOrders = await trace("calling repo.hasOrders to check that no order names the product", () => deps.repo.hasOrders(id));
    if (hasOrders) return { ok: false, reason: "hasOrders" };
    await trace("calling repo.remove to delete the product", () => deps.repo.remove(id, storeId));
    return { ok: true };
  }

  return { list, deleteProduct };
}
