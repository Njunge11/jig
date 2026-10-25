import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RouterOutputs } from "@/lib/trpc/routers/_app";

type HomeProduct = RouterOutputs["home"]["overview"]["products"][number];

export function ProductsCard({ products }: { products: HomeProduct[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Products</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {products.length === 0 ? <p className="text-muted-foreground">No products yet</p> : null}
        {products.map((product) => (
          <section key={product.id} className="flex flex-col gap-1">
            <h3 className="font-medium">{product.title}</h3>
            <ul className="text-sm text-muted-foreground">
              {product.orders.map((order) => (
                <li key={order.id}>
                  {order.number} · {order.customerName}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </CardContent>
    </Card>
  );
}
