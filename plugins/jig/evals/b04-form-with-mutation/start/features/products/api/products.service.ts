/** Decides which products a store lists, and whether a new one can be added. */
import { trace } from "@/db/call-trace";
import type { ProductsRepo } from "../db/products.repo";

export type ProductsServiceDeps = { repo: ProductsRepo; now: () => Date; uuid: () => string };

export type CreateProduct = { title: string; size: "small" | "medium" | "large" };

export function makeProductsService(deps: ProductsServiceDeps) {
  const list = (storeId: string) => trace("calling repo.list to read the store's products", () => deps.repo.list(storeId));

  async function create(storeId: string, input: CreateProduct) {
    const taken = await trace("calling repo.findByTitle to check the title is free", () =>
      deps.repo.findByTitle(storeId, input.title),
    );
    if (taken) return { status: "titleTaken" as const };
    const product = await trace("calling repo.insert to add the product", () =>
      deps.repo.insert({ id: deps.uuid(), storeId, createdAt: deps.now(), ...input }),
    );
    return { status: "created" as const, product };
  }

  return { list, create };
}
