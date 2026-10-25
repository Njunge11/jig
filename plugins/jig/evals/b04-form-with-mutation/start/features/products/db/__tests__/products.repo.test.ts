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

test("findByTitle finds the store's product with that exact title", async () => {
  await inRollback(async (tx) => {
    await seedStores(tx);
    await seedProduct(tx, { id: "p1", title: "Mug" });

    expect(await makeProductsRepo(tx).findByTitle(STORE_ID, "Mug")).toEqual({ id: "p1" });
  });
});

test("findByTitle ignores another store's product with that title", async () => {
  await inRollback(async (tx) => {
    await seedStores(tx);
    await seedProduct(tx, { id: "p1", title: "Mug", storeId: OTHER_STORE_ID });

    expect(await makeProductsRepo(tx).findByTitle(STORE_ID, "Mug")).toBeNull();
  });
});

test("insert stores the product and returns it", async () => {
  await inRollback(async (tx) => {
    await seedStores(tx);
    const createdAt = new Date("2026-03-01T00:00:00Z");

    const product = await makeProductsRepo(tx).insert({ id: "p9", storeId: STORE_ID, title: "Jug", size: "large", createdAt });

    expect(product).toMatchObject({ id: "p9", title: "Jug", size: "large", status: "active", createdAt });
    expect((await makeProductsRepo(tx).list(STORE_ID)).map((r) => r.title)).toEqual(["Jug"]);
  });
});
