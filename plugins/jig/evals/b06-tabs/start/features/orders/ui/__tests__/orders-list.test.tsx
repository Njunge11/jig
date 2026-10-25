import { Suspense } from "react";
import { screen } from "@testing-library/react";
import { server, trpcMsw } from "@/test/msw";
import { renderWithProviders } from "@/test/render";
import { OrdersList } from "../orders-list";

const order = { id: "o1", number: "#1001", status: "open", totalCents: 1200, createdAt: "2026-01-01T00:00:00.000Z" };

const renderList = () =>
  renderWithProviders(
    <Suspense fallback={<p>Loading</p>}>
      <OrdersList tab="active" />
    </Suspense>,
  );

test("shows each order's number and status", async () => {
  server.use(trpcMsw.orders.list.query(() => [order]));

  renderList();

  expect(await screen.findByText("#1001")).toBeVisible();
  expect(screen.getByText("open")).toBeVisible();
});

test("says so when the tab has no orders", async () => {
  server.use(trpcMsw.orders.list.query(() => []));

  renderList();

  expect(await screen.findByText("No orders")).toBeVisible();
});
