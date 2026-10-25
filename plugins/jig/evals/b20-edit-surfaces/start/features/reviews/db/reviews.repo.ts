/** Owns the review rows. */
import { eq } from "drizzle-orm";
import { reviewsTable } from "@/db/schema";
import type { Db } from "@/db/types";

export function makeReviewsRepo(db: Db) {
  function listForProduct(productId: string) {
    return db.select({ id: reviewsTable.id, body: reviewsTable.body }).from(reviewsTable).where(eq(reviewsTable.productId, productId));
  }

  function removeForProduct(productId: string) {
    return db.delete(reviewsTable).where(eq(reviewsTable.productId, productId));
  }

  return { listForProduct, removeForProduct };
}

export type ReviewsRepo = ReturnType<typeof makeReviewsRepo>;
