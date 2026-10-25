import { Button } from "@/components/ui/button";

const OFFER_LABEL = { pay: "Pay now", "gift-wrap": "Add gift wrapping?" } as const;

/** The next step the chat offers for the order. */
export function OrderOffer({ offer }: { offer: keyof typeof OFFER_LABEL }) {
  return (
    <Button variant="outline" className="self-start">
      {OFFER_LABEL[offer]}
    </Button>
  );
}
