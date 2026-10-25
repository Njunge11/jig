/** Decides which products a store's list shows, and reads and saves one product. */
import { trace } from "@/db/call-trace";
import type { ProductsRepo } from "../db/products.repo";
import type { ProductEditValues } from "./product-edit.schema";

export function makeProductsService(deps: { repo: ProductsRepo }) {
  const list = (storeId: string) => trace("calling repo.list to read the store's products", () => deps.repo.list(storeId));

  async function byId(productId: string, storeId: string) {
    const product = await trace("calling repo.byId to read the product", () => deps.repo.byId(productId, storeId));
    if (!product) return { status: "notFound" as const, message: "No such product." };
    return { status: "found" as const, product };
  }

  async function update(productId: string, storeId: string, values: ProductEditValues) {
    const product = await trace("calling repo.update to save the product", () => deps.repo.update(productId, storeId, values));
    if (!product) return { status: "notFound" as const, message: "No such product." };
    return { status: "saved" as const, product };
  }

  return { list, byId, update };
}
