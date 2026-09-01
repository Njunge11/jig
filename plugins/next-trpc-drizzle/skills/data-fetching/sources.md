# Sources — data-fetching rules

Loaded on demand; not part of the skill body. Each entry maps rules to
the doc that grounds them. Claims were verified against these pages on
2026-09-01.

- Rules 1–5, 8, 13 — [tRPC: Server Components setup](https://trpc.io/docs/client/tanstack-react-query/server-components).
  Awaited prefetch: "the server must complete the query before sending
  HTML." Server-rendered query data "is detached from your query
  client."
- Rules 3, 8, 14 — [TanStack Query: Advanced Server Rendering](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr)
- Rule 7 — [TanStack Query: Parallel Queries](https://tanstack.com/query/v5/docs/framework/react/guides/parallel-queries)
- Rules 27–29 — [TanStack Query: Optimistic Updates](https://tanstack.com/query/v5/docs/framework/react/guides/optimistic-updates)
  (v5 signatures: `context.client`, `onMutateResult`)
- Rules 20–23 — [Next.js: loading.js](https://nextjs.org/docs/app/api-reference/file-conventions/loading)
- Rules 24–25 — [Next.js: error.js](https://nextjs.org/docs/app/api-reference/file-conventions/error)
- Rules 9–10, 19, 30–31 — absorbed from Vercel's React best-practices
  rule set (`async-parallel`, `server-parallel-fetching`,
  `async-suspense-boundaries`, `bundle-preload`, `bundle-dynamic-imports`)
  so nothing depends on an external skill being installed.
