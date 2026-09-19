---
type: llm
weight: 2
---

PASS only if: the table uses TanStack Table v9 (the `useTable` / `tableFeatures` API with `rowPaginationFeature`), not the v8 `useReactTable` + `getCoreRowModel` API; sorting and pagination are manual/server-side with `rowCount` set; sort and page changes write the URL through the shared params module and a sort change resets `page` to 1; only `title` and `createdAt` render a sort control; pagination uses the kit's pagination component; the table sits in its own `overflow-x-auto` container.

FAIL if rows are sorted or paged in the client, or if a v8 API appears.
