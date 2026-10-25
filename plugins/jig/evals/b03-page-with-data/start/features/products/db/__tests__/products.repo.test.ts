import { inRollback } from "@/test/db";
import { OTHER_STORE_ID, seedProduct, seedStores, STORE_ID } from "@/test/seed";
import { makeProductsRepo } from "../products.repo";

test("list returns the store's products, newest first, and no other store's", async () => {
  await inRollback(async (tx) => {
    await seedStores(tx);
    await seedProduct(tx, { id: "p1", title: "Mug", createdAt: new Date("2026-01-01T00:00:00Z") });
    await seedProduct(tx, { id: "p2", title: "Teapot", createdAt: new Date("2026-02-01T00:00:00Z") });
    await seedProduct(tx, { id: "p3", title: "Kettle", storeId: OTHER_STORE_ID });

    const rows = await makeProductsRepo(tx).list(STORE_ID);

    expect(rows.map((r) => r.title)).toEqual(["Teapot", "Mug"]);
  });
});

test("byId returns the store's product with that id", async () => {
  await inRollback(async (tx) => {
    await seedStores(tx);
    await seedProduct(tx, { id: "p1", title: "Mug", priceCents: 900 });

    const product = await makeProductsRepo(tx).byId(STORE_ID, "p1");

    expect(product).toMatchObject({ id: "p1", title: "Mug", priceCents: 900, status: "active" });
  });
});

test("byId returns null for another store's product", async () => {
  await inRollback(async (tx) => {
    await seedStores(tx);
    await seedProduct(tx, { id: "p1", title: "Mug", storeId: OTHER_STORE_ID });

    expect(await makeProductsRepo(tx).byId(STORE_ID, "p1")).toBeNull();
  });
});
