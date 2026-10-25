import type { AppMessage, AppMessagePart } from "./app-message";
import { cardFor } from "./cards";

/** The last part of each order whose card is `staged`. */
export function lastCardOfEachOrder(messages: AppMessage[]) {
  const last = new Map<string, AppMessagePart>();
  for (const part of messages.flatMap((message) => message.parts)) {
    const card = cardFor(part);
    if (card?.staged) last.set(card.staged(part), part);
  }
  return new Set(last.values());
}
