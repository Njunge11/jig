import { Suspense } from "react";
import { screen } from "@testing-library/react";
import { server, trpcMsw } from "@/test/msw";
import { renderWithProviders } from "@/test/render";
import { ProductsCount } from "../products-count";

const makeProduct = (id: string, title: string) => ({
  id,
  storeId: "store-1",
  title,
  size: "medium" as const,
  status: "active" as const,
  priceCents: 900,
  createdAt: "2026-01-01T00:00:00.000Z",
});

test("shows how many active products the store has", async () => {
  server.use(trpcMsw.products.list.query(() => [makeProduct("p1", "Mug"), makeProduct("p2", "Teapot")]));

  renderWithProviders(
    <Suspense fallback={<p>Loading</p>}>
      <ProductsCount />
    </Suspense>,
  );

  expect(await screen.findByText("2 active products")).toBeVisible();
});
