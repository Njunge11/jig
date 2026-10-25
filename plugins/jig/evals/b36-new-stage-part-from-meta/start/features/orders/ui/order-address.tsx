import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** The order's delivery address: a form while it is missing, a record once it is saved. */
export function OrderAddress({ draws, orderId }: { draws: "address-form" | "address-record"; orderId: string }) {
  if (draws === "address-record") return <p className="text-sm">Delivery address saved</p>;
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={`address-${orderId}`}>Delivery address</Label>
      <Input id={`address-${orderId}`} name="address" />
    </div>
  );
}
