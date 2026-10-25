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

test("create adds the product to the session's store", async () => {
  await inRollback(async (tx) => {
    await seedStores(tx);
    const caller = createCaller(ctxFor(session, tx));

    const product = await caller.products.create({ title: "Jug", size: "large" });

    expect(product).toMatchObject({ title: "Jug", size: "large", storeId: STORE_ID });
    expect((await caller.products.list({})).map((r) => r.title)).toEqual(["Jug"]);
  });
});

test("create refuses a title the store already has, with the title field in the cause", async () => {
  await inRollback(async (tx) => {
    await seedStores(tx);
    await seedProduct(tx, { id: "p1", title: "Mug" });
    const caller = createCaller(ctxFor(session, tx));

    const error = await caller.products.create({ title: "Mug", size: "small" }).catch((e: unknown) => e);

    expect(error).toMatchObject({ code: "CONFLICT", cause: { field: "title", message: "A product with this title exists" } });
  });
});

test("create refuses a title shorter than 3 characters", async () => {
  const caller = createCaller(ctxFor(session));

  await expect(caller.products.create({ title: "ab", size: "small" })).rejects.toThrow(/too_small|at least 3/i);
});

test("create runs exactly 2 statements: the title check, and the insert", async () => {
  await inRollback(async (tx) => {
    await seedStores(tx);
    const caller = createCaller(ctxFor(session, tx));
    statementCount.reset();

    await caller.products.create({ title: "Jug", size: "large" });

    expect(statementCount()).toBe(2);
  });
});

test("create prints its call trace: the root, the title check, the insert, and their queries", async () => {
  vi.stubEnv("TRACE_LOG", "1");
  await inRollback(async (tx) => {
    await seedStores(tx);
    const blocks: string[] = [];
    const caller = createCaller(ctxFor(session, tx, (block) => blocks.push(block)));

    await caller.products.create({ title: "Jug", size: "large" });

    expect(blocks[0].split("\n")).toEqual([
      expect.stringMatching(/^calling products\.create to add a product to the store\. success\. took \d+\.\d{3} s$/),
      expect.stringMatching(/^  calling repo\.findByTitle to check the title is free\. success\. took \d+\.\d{3} s$/),
      expect.stringMatching(/^    query select products\. took \d+\.\d{3} s$/),
      expect.stringMatching(/^  calling repo\.insert to add the product\. success\. took \d+\.\d{3} s$/),
      expect.stringMatching(/^    query insert products\. took \d+\.\d{3} s$/),
    ]);
  });
});
