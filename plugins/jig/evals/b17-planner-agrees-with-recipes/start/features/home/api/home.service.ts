/** Decides what the store's home page shows. */
import { trace } from "@/db/call-trace";
import type { HomeRepo } from "../db/home.repo";

const HOME_PRODUCTS = 5;
const HOME_ORDERS_PER_PRODUCT = 5;

export function makeHomeService(deps: { repo: HomeRepo }) {
  // The 5 newest active products, each with its 5 newest orders.
  async function overview(storeId: string) {
    const products = await trace("calling repo.newestActiveProducts to read the newest products", () =>
      deps.repo.newestActiveProducts(storeId, HOME_PRODUCTS),
    );
    const orders = await trace("calling repo.newestOrders to read each product's newest orders", () =>
      deps.repo.newestOrders(
        products.map((product) => product.id),
        HOME_ORDERS_PER_PRODUCT,
      ),
    );
    return {
      products: products.map((product) => ({
        ...product,
        orders: orders.filter((order) => order.productId === product.id),
      })),
    };
  }

  return { overview };
}
