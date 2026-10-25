import { inRollback } from "@/test/db";
import { OTHER_STORE_ID, seedProduct, seedStores, STORE_ID } from "@/test/seed";
import { makeProductsRepo } from "../products.repo";

test("listActive returns the store's active products, newest first, and no other store's", async () => {
  await inRollback(async (tx) => {
    await seedStores(tx);
    await seedProduct(tx, { id: "p1", title: "Mug", createdAt: new Date("2026-01-01T00:00:00Z") });
    await seedProduct(tx, { id: "p2", title: "Teapot", createdAt: new Date("2026-02-01T00:00:00Z") });
    await seedProduct(tx, { id: "p3", title: "Kettle", storeId: OTHER_STORE_ID });

    const rows = await makeProductsRepo(tx).listActive(STORE_ID);

    expect(rows.map((r) => r.title)).toEqual(["Teapot", "Mug"]);
  });
});

test("listActive leaves out archived products", async () => {
  await inRollback(async (tx) => {
    await seedStores(tx);
    await seedProduct(tx, { id: "p1", title: "Mug" });
    await seedProduct(tx, { id: "p2", title: "Teapot", status: "archived" });

    const rows = await makeProductsRepo(tx).listActive(STORE_ID);

    expect(rows.map((r) => r.title)).toEqual(["Mug"]);
  });
});

test("setStatus changes the status of the store's product and returns its id", async () => {
  await inRollback(async (tx) => {
    await seedStores(tx);
    await seedProduct(tx, { id: "p1", title: "Mug" });

    expect(await makeProductsRepo(tx).setStatus(STORE_ID, "p1", "archived")).toEqual({ id: "p1" });
    expect(await makeProductsRepo(tx).listActive(STORE_ID)).toEqual([]);
  });
});

test("setStatus returns null for another store's product and leaves it as it was", async () => {
  await inRollback(async (tx) => {
    await seedStores(tx);
    await seedProduct(tx, { id: "p1", title: "Mug", storeId: OTHER_STORE_ID });

    expect(await makeProductsRepo(tx).setStatus(STORE_ID, "p1", "archived")).toBeNull();
    expect((await makeProductsRepo(tx).listActive(OTHER_STORE_ID)).map((r) => r.id)).toEqual(["p1"]);
  });
});
