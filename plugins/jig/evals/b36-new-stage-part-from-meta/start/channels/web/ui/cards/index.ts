import { detailsCard } from "@/features/orders/ui/cards/details-card/details-card";
import { overviewCard } from "@/features/orders/ui/cards/overview-card/overview-card";
import type { AppMessagePart, CardType, PartOf } from "../app-message";
import type { Card } from "./card";
import { textCard } from "./text-card";

// The part-type → card map: the only file that names every card.
export const CARDS = {
  text: textCard,
  "data-order-details": detailsCard,
  "data-order-overview": overviewCard,
} satisfies { [T in CardType]: Card<PartOf<T>> };

const cards: Partial<Record<string, Card<AppMessagePart>>> = CARDS as Partial<Record<string, Card<AppMessagePart>>>;

/** The card of a part; a part type with no card has none and renders nothing. */
export function cardFor(part: AppMessagePart) {
  return cards[part.type];
}
