---
description: "a search task fires the search recipe or the frontend standards"
tags: [triggering, regression]
max_turns: 4
timeout_seconds: 420
allowed_tools: [Read, Glob, Grep, Skill]
---

The app is Next.js App Router + tRPC v11 + TanStack Query v5 + Drizzle + shadcn/ui. A store can hold thousands of products.

```ts
// features/products/api/products.router.ts
export const productsRouter = router({
  list: orgProcedure.input(z.object({})).query(({ ctx }) => products.list(ctx.storeId)),
});
// features/products/api/products.service.ts
export const makeProductsService = ({ repo }: { repo: ProductsRepo }) => ({
  list: (storeId: string) => repo.list(storeId),
});
// features/products/db/products.repo.ts
list: (storeId: string) =>
  db.select().from(productsTable).where(eq(productsTable.storeId, storeId)).orderBy(desc(productsTable.createdAt)),
// app/products/page.tsx
export default async function Page() {
  prefetch(trpc.products.list.queryOptions({}));
  return <HydrateClient><Suspense fallback={<ProductsSkeleton />}><ProductsList /></Suspense></HydrateClient>;
}
// features/products/ui/products-list.tsx  ("use client")
export function ProductsList() {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.products.list.queryOptions({}));
  return <ProductsTable rows={data} />;
}
```

Add a search box that finds products by title.

Do not write any file. Reply with the full code of every file you add or change.
