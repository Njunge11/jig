import { ctxFor, createCaller } from "@/test/caller";
import { inRollback } from "@/test/db";
import { seedOrder, seedStores, STORE_ID } from "@/test/seed";
import { statementCount } from "@/test/statement-counter";

const session = { userId: "u1", storeId: STORE_ID };

afterEach(() => vi.unstubAllEnvs());

test("list returns the session store's orders in the tab", async () => {
  await inRollback(async (tx) => {
    await seedStores(tx);
    await seedOrder(tx, { id: "o1", number: "#1001", status: "open" });
    await seedOrder(tx, { id: "o3", number: "#1003", status: "archived" });
    const caller = createCaller(ctxFor(session, tx));

    const rows = await caller.orders.list({ tab: "archived" });

    expect(rows.map((r) => r.number)).toEqual(["#1003"]);
  });
});

test("list refuses a caller with no session", async () => {
  const caller = createCaller(ctxFor(null));

  await expect(caller.orders.list({ tab: "active" })).rejects.toThrow(/UNAUTHORIZED/);
});

test("list runs exactly 1 statement: the select of the tab's orders", async () => {
  await inRollback(async (tx) => {
    await seedStores(tx);
    const caller = createCaller(ctxFor(session, tx));
    statementCount.reset();

    await caller.orders.list({ tab: "active" });

    expect(statementCount()).toBe(1);
  });
});

test("list prints its call trace: the root, the repo call, and its query", async () => {
  vi.stubEnv("TRACE_LOG", "1");
  await inRollback(async (tx) => {
    await seedStores(tx);
    const blocks: string[] = [];
    const caller = createCaller(ctxFor(session, tx, (block) => blocks.push(block)));

    await caller.orders.list({ tab: "active" });

    expect(blocks[0].split("\n")).toEqual([
      expect.stringMatching(/^calling orders\.list to list the store's orders in one tab\. success\. took \d+\.\d{3} s$/),
      expect.stringMatching(/^  calling repo\.list to read the store's active orders\. success\. took \d+\.\d{3} s$/),
      expect.stringMatching(/^    query select orders\. took \d+\.\d{3} s$/),
    ]);
  });
});

test("counts returns the session store's order count per tab", async () => {
  await inRollback(async (tx) => {
    await seedStores(tx);
    await seedOrder(tx, { id: "o1", number: "#1001", status: "open" });
    await seedOrder(tx, { id: "o3", number: "#1003", status: "archived" });
    const caller = createCaller(ctxFor(session, tx));

    expect(await caller.orders.counts()).toEqual({ active: 1, archived: 1 });
  });
});

test("counts runs exactly 1 statement: one select that counts both tabs", async () => {
  await inRollback(async (tx) => {
    await seedStores(tx);
    const caller = createCaller(ctxFor(session, tx));
    statementCount.reset();

    await caller.orders.counts();

    expect(statementCount()).toBe(1);
  });
});

test("counts prints its call trace: the root, the repo call, and its query", async () => {
  vi.stubEnv("TRACE_LOG", "1");
  await inRollback(async (tx) => {
    await seedStores(tx);
    const blocks: string[] = [];
    const caller = createCaller(ctxFor(session, tx, (block) => blocks.push(block)));

    await caller.orders.counts();

    expect(blocks[0].split("\n")).toEqual([
      expect.stringMatching(/^calling orders\.counts to count the store's orders per tab\. success\. took \d+\.\d{3} s$/),
      expect.stringMatching(/^  calling repo\.counts to count the store's orders per tab\. success\. took \d+\.\d{3} s$/),
      expect.stringMatching(/^    query select orders\. took \d+\.\d{3} s$/),
    ]);
  });
});
