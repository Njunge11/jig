/** The line that tells the shopper the order's payment was received. */
export function PaymentReceipt({ invoice }: { invoice: number }) {
  return <p className="text-sm text-muted-foreground">Payment received · invoice {invoice}</p>;
}
