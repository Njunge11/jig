import { inRollback } from "@/test/db";
import { OTHER_STORE_ID, seedOrder, seedStores, STORE_ID } from "@/test/seed";
import { makeOrdersRepo } from "../orders.repo";

test("list active returns the store's orders that are not archived, newest first", async () => {
  await inRollback(async (tx) => {
    await seedStores(tx);
    await seedOrder(tx, { id: "o1", number: "#1001", status: "open", createdAt: new Date("2026-01-01T00:00:00Z") });
    await seedOrder(tx, { id: "o2", number: "#1002", status: "shipped", createdAt: new Date("2026-02-01T00:00:00Z") });
    await seedOrder(tx, { id: "o3", number: "#1003", status: "archived" });
    await seedOrder(tx, { id: "o4", number: "#2001", status: "open", storeId: OTHER_STORE_ID });

    const rows = await makeOrdersRepo(tx).list(STORE_ID, "active");

    expect(rows.map((r) => r.number)).toEqual(["#1002", "#1001"]);
  });
});

test("list archived returns only the store's archived orders", async () => {
  await inRollback(async (tx) => {
    await seedStores(tx);
    await seedOrder(tx, { id: "o1", number: "#1001", status: "open" });
    await seedOrder(tx, { id: "o3", number: "#1003", status: "archived" });

    const rows = await makeOrdersRepo(tx).list(STORE_ID, "archived");

    expect(rows.map((r) => r.number)).toEqual(["#1003"]);
  });
});

test("counts returns how many of the store's orders each tab holds", async () => {
  await inRollback(async (tx) => {
    await seedStores(tx);
    await seedOrder(tx, { id: "o1", number: "#1001", status: "open" });
    await seedOrder(tx, { id: "o2", number: "#1002", status: "shipped" });
    await seedOrder(tx, { id: "o3", number: "#1003", status: "archived" });
    await seedOrder(tx, { id: "o4", number: "#2001", status: "open", storeId: OTHER_STORE_ID });

    expect(await makeOrdersRepo(tx).counts(STORE_ID)).toEqual({ active: 2, archived: 1 });
  });
});
