/** Removes a product with its reviews, in one transaction. */
import { trace } from "@/db/call-trace";
import type { ReviewsRepo } from "@/features/reviews/db/reviews.repo";
import type { ProductsRepo } from "../db/products.repo";

export type RemoveProductRepos = { products: ProductsRepo; reviews: ReviewsRepo };

export function makeRemoveProductService(deps: { write: <T>(run: (repos: RemoveProductRepos) => Promise<T>) => Promise<T> }) {
  async function removeWithReviews(repos: RemoveProductRepos, storeId: string, id: string) {
    const product = await trace("calling repo.byId to check the product is the store's", () => repos.products.byId(storeId, id));
    if (!product) return null;
    await trace("calling reviews.removeForProduct to delete the product's reviews", () => repos.reviews.removeForProduct(id));
    return trace("calling repo.remove to delete the product", () => repos.products.remove(storeId, id));
  }

  const removeProduct = (storeId: string, id: string) => deps.write((repos) => removeWithReviews(repos, storeId, id));

  return { removeProduct };
}
