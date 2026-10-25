/** An order's fraud score and the owner of its store. */
import { trace } from "@/db/call-trace";
import type { OrdersRepo } from "../db/orders.repo";

export function makeOrdersService(deps: { repo: OrdersRepo }) {
  // The saved score, or null.
  const getScore = (orderId: string) => trace("calling repo.score to read the order's saved score", () => deps.repo.score(orderId));

  const saveScore = (orderId: string, score: number) =>
    trace("calling repo.saveScore to save the order's score", () => deps.repo.saveScore(orderId, score));

  // The email of the owner of the order's store, or null when the order is gone.
  const getOwnerEmail = (orderId: string) =>
    trace("calling repo.ownerEmail to read the store owner's email", () => deps.repo.ownerEmail(orderId));

  return { getScore, saveScore, getOwnerEmail };
}
