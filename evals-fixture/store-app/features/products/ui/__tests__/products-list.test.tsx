import { Suspense } from "react";
import { screen } from "@testing-library/react";
import { server, trpcMsw } from "@/test/msw";
import { renderWithProviders } from "@/test/render";
import { ProductsList } from "../products-list";

const product = {
  id: "p1",
  storeId: "store-1",
  title: "Mug",
  size: "medium" as const,
  status: "active" as const,
  priceCents: 900,
  createdAt: "2026-01-01T00:00:00.000Z",
};

test("shows each product's title", async () => {
  server.use(trpcMsw.products.list.query(() => [product]));

  renderWithProviders(
    <Suspense fallback={<p>Loading</p>}>
      <ProductsList />
    </Suspense>,
  );

  expect(await screen.findByText("Mug")).toBeVisible();
});
