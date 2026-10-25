/** The fraud model: it scores an order from 0 (safe) to 100 (fraud) with an LLM call. */
export class RateLimitError extends Error {
  constructor(readonly retryAfterMs: number) {
    super(`fraud model rate limit, retry in ${retryAfterMs} ms`);
  }
}

// The order was deleted; a deleted order can never be scored.
export class OrderNotFoundError extends Error {
  constructor(readonly orderId: string) {
    super(`order ${orderId} not found`);
  }
}

export type FraudClient = { score(orderId: string): Promise<number> };

// The fixture has no model provider; a deployed app calls one here.
export const fraud: FraudClient = {
  async score(orderId) {
    if (!orderId) throw new OrderNotFoundError(orderId);
    return 0;
  },
};
