import { ctxFor, createCaller } from "@/test/caller";
import { inRollback } from "@/test/db";
import { seedProduct, seedStores, STORE_ID } from "@/test/seed";
import { statementCount } from "@/test/statement-counter";

const session = { userId: "u1", storeId: STORE_ID };

afterEach(() => vi.unstubAllEnvs());

test("list returns the products of the session's store", async () => {
  await inRollback(async (tx) => {
    await seedStores(tx);
    await seedProduct(tx, { id: "p1", title: "Mug" });
    const caller = createCaller(ctxFor(session, tx));

    const rows = await caller.products.list({});

    expect(rows.map((r) => r.title)).toEqual(["Mug"]);
  });
});

test("list refuses a caller with no session", async () => {
  const caller = createCaller(ctxFor(null));

  await expect(caller.products.list({})).rejects.toThrow(/UNAUTHORIZED/);
});

test("list runs exactly 1 statement: the select of the store's products", async () => {
  await inRollback(async (tx) => {
    await seedStores(tx);
    const caller = createCaller(ctxFor(session, tx));
    statementCount.reset();

    await caller.products.list({});

    expect(statementCount()).toBe(1);
  });
});

test("list prints its call trace: the root, the repo call, and its query", async () => {
  vi.stubEnv("TRACE_LOG", "1");
  await inRollback(async (tx) => {
    await seedStores(tx);
    const blocks: string[] = [];
    const caller = createCaller(ctxFor(session, tx, (block) => blocks.push(block)));

    await caller.products.list({});

    expect(blocks).toHaveLength(1);
    expect(blocks[0].split("\n")).toEqual([
      expect.stringMatching(/^calling products\.list to list the store's products\. success\. took \d+\.\d{3} s$/),
      expect.stringMatching(/^  calling repo\.list to read the store's products\. success\. took \d+\.\d{3} s$/),
      expect.stringMatching(/^    query select products\. took \d+\.\d{3} s$/),
    ]);
  });
});

test("byId returns the session store's product", async () => {
  await inRollback(async (tx) => {
    await seedStores(tx);
    await seedProduct(tx, { id: "p1", title: "Mug", priceCents: 900 });
    const caller = createCaller(ctxFor(session, tx));

    const product = await caller.products.byId({ id: "p1" });

    expect(product).toMatchObject({ id: "p1", title: "Mug", priceCents: 900 });
  });
});

test("byId throws NOT_FOUND for an id the store does not have", async () => {
  await inRollback(async (tx) => {
    await seedStores(tx);
    const caller = createCaller(ctxFor(session, tx));

    await expect(caller.products.byId({ id: "nope" })).rejects.toThrow("This product does not exist");
  });
});

test("byId runs exactly 1 statement: the select of the one product", async () => {
  await inRollback(async (tx) => {
    await seedStores(tx);
    await seedProduct(tx, { id: "p1", title: "Mug" });
    const caller = createCaller(ctxFor(session, tx));
    statementCount.reset();

    await caller.products.byId({ id: "p1" });

    expect(statementCount()).toBe(1);
  });
});

test("byId prints its call trace: the root, the repo call, and its query", async () => {
  vi.stubEnv("TRACE_LOG", "1");
  await inRollback(async (tx) => {
    await seedStores(tx);
    await seedProduct(tx, { id: "p1", title: "Mug" });
    const blocks: string[] = [];
    const caller = createCaller(ctxFor(session, tx, (block) => blocks.push(block)));

    await caller.products.byId({ id: "p1" });

    expect(blocks[0].split("\n")).toEqual([
      expect.stringMatching(/^calling products\.byId to read one of the store's products\. success\. took \d+\.\d{3} s$/),
      expect.stringMatching(/^  calling repo\.byId to read one of the store's products\. success\. took \d+\.\d{3} s$/),
      expect.stringMatching(/^    query select products\. took \d+\.\d{3} s$/),
    ]);
  });
});
