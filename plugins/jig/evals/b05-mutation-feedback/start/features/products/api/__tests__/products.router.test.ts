import { ctxFor, createCaller } from "@/test/caller";
import { inRollback } from "@/test/db";
import { seedProduct, seedStores, STORE_ID } from "@/test/seed";
import { statementCount } from "@/test/statement-counter";

const session = { userId: "u1", storeId: STORE_ID };

afterEach(() => vi.unstubAllEnvs());

test("list returns the active products of the session's store", async () => {
  await inRollback(async (tx) => {
    await seedStores(tx);
    await seedProduct(tx, { id: "p1", title: "Mug" });
    await seedProduct(tx, { id: "p2", title: "Teapot", status: "archived" });
    const caller = createCaller(ctxFor(session, tx));

    const rows = await caller.products.list({});

    expect(rows.map((r) => r.title)).toEqual(["Mug"]);
  });
});

test("list refuses a caller with no session", async () => {
  const caller = createCaller(ctxFor(null));

  await expect(caller.products.list({})).rejects.toThrow(/UNAUTHORIZED/);
});

test("list runs exactly 1 statement: the select of the store's active products", async () => {
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

    expect(blocks[0].split("\n")).toEqual([
      expect.stringMatching(/^calling products\.list to list the store's active products\. success\. took \d+\.\d{3} s$/),
      expect.stringMatching(/^  calling repo\.listActive to read the store's active products\. success\. took \d+\.\d{3} s$/),
      expect.stringMatching(/^    query select products\. took \d+\.\d{3} s$/),
    ]);
  });
});

test("archive takes the product off the list", async () => {
  await inRollback(async (tx) => {
    await seedStores(tx);
    await seedProduct(tx, { id: "p1", title: "Mug" });
    const caller = createCaller(ctxFor(session, tx));

    await caller.products.archive({ id: "p1" });

    expect(await caller.products.list({})).toEqual([]);
  });
});

test("archive throws NOT_FOUND for an id the store does not have", async () => {
  await inRollback(async (tx) => {
    await seedStores(tx);
    const caller = createCaller(ctxFor(session, tx));

    await expect(caller.products.archive({ id: "nope" })).rejects.toThrow("This product does not exist");
  });
});

test("archive runs exactly 1 statement: the update of the product's status", async () => {
  await inRollback(async (tx) => {
    await seedStores(tx);
    await seedProduct(tx, { id: "p1", title: "Mug" });
    const caller = createCaller(ctxFor(session, tx));
    statementCount.reset();

    await caller.products.archive({ id: "p1" });

    expect(statementCount()).toBe(1);
  });
});

test("archive prints its call trace: the root, the repo call, and its query", async () => {
  vi.stubEnv("TRACE_LOG", "1");
  await inRollback(async (tx) => {
    await seedStores(tx);
    await seedProduct(tx, { id: "p1", title: "Mug" });
    const blocks: string[] = [];
    const caller = createCaller(ctxFor(session, tx, (block) => blocks.push(block)));

    await caller.products.archive({ id: "p1" });

    expect(blocks[0].split("\n")).toEqual([
      expect.stringMatching(/^calling products\.archive to archive one of the store's products\. success\. took \d+\.\d{3} s$/),
      expect.stringMatching(/^  calling repo\.setStatus to archive the product\. success\. took \d+\.\d{3} s$/),
      expect.stringMatching(/^    query update products\. took \d+\.\d{3} s$/),
    ]);
  });
});

test("unarchive puts an archived product back on the list", async () => {
  await inRollback(async (tx) => {
    await seedStores(tx);
    await seedProduct(tx, { id: "p1", title: "Mug", status: "archived" });
    const caller = createCaller(ctxFor(session, tx));

    await caller.products.unarchive({ id: "p1" });

    expect((await caller.products.list({})).map((r) => r.title)).toEqual(["Mug"]);
  });
});

test("unarchive runs exactly 1 statement: the update of the product's status", async () => {
  await inRollback(async (tx) => {
    await seedStores(tx);
    await seedProduct(tx, { id: "p1", title: "Mug", status: "archived" });
    const caller = createCaller(ctxFor(session, tx));
    statementCount.reset();

    await caller.products.unarchive({ id: "p1" });

    expect(statementCount()).toBe(1);
  });
});

test("unarchive prints its call trace: the root, the repo call, and its query", async () => {
  vi.stubEnv("TRACE_LOG", "1");
  await inRollback(async (tx) => {
    await seedStores(tx);
    await seedProduct(tx, { id: "p1", title: "Mug", status: "archived" });
    const blocks: string[] = [];
    const caller = createCaller(ctxFor(session, tx, (block) => blocks.push(block)));

    await caller.products.unarchive({ id: "p1" });

    expect(blocks[0].split("\n")).toEqual([
      expect.stringMatching(/^calling products\.unarchive to restore one of the store's archived products\. success\. took \d+\.\d{3} s$/),
      expect.stringMatching(/^  calling repo\.setStatus to restore the product\. success\. took \d+\.\d{3} s$/),
      expect.stringMatching(/^    query update products\. took \d+\.\d{3} s$/),
    ]);
  });
});
