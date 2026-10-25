---
name: recipe-data-table
description: The frontend recipe for a data table — columns, sorting, pagination, row actions. Gives the build order, the common failures, and the Verify list. Use when you build or review that surface. Invoke it before you write the code.
user-invocable: false
---

# Recipe: Data table

Use this recipe for a table of rows with columns, sorting,
pagination, and row actions. A data table rides on
the `recipe-page-with-data` skill and the `recipe-search-and-filters` skill — the URL owns
`page`/`sort`/filters and the server narrows the rows; this
recipe adds only the table layer.

Library: `@tanstack/react-table` **v9** (the current `latest`) +
the kit's `Table` parts. A repo still holding an unused v8
install upgrades first: `pnpm add @tanstack/react-table@^9` —
with no v8 call sites there is nothing to migrate.

## Build order

1. **Contract delta.** The list procedure returns
   `{ rows, total }`, already narrowed (search recipe, step 1). A
   column is sortable only if its key is in the procedure's
   `sort` literal — the backend sorts, or the column is not
   sortable.

2. **Features + columns module**, in its own file. Declare the
   table features once; define columns with the column helper,
   typed from the procedure's output type. Sortable headers write
   the URL (and reset the page); actions are a display column:

   ```tsx
   import {
     createColumnHelper, tableFeatures,
   } from "@tanstack/react-table";

   // the URL owns sort and page, so the table registers no sorting
   // or pagination feature
   export const features = tableFeatures({});
   const helper = createColumnHelper<typeof features, Product>();

   export const columns = helper.columns([
     helper.accessor("title", {
       header: () => <SortableHeader field="title">Title</SortableHeader>,
     }),
     helper.accessor("status", {
       header: "Status",
       cell: ({ row }) => <Badge variant="outline">{row.original.status}</Badge>,
     }),
     helper.display({
       id: "actions",
       cell: ({ row }) => <ProductRowActions product={row.original} />,
     }),
   ]);
   ```

   `SortableHeader` is a `Button variant="ghost"` calling
   `setParams({ sort: field, page: 1 })`; its arrow reads the
   current `sort` from the same URL state. `ProductRowActions` is a
   `DropdownMenu`; its items run mutations per
   the `recipe-form-with-mutation` skill / the mutation-feedback recipe.

3. **Table instance over the server's rows.** The data is
   already paginated, sorted, and filtered by the server. In v9 a
   table sorts, filters or pages only through a feature plus its
   row-model factory registered in `features`
   (`rowSortingFeature` + `sortedRowModel: createSortedRowModel()`,
   and the same for filtering and pagination). Register none, and
   the table renders `rows` in the server's order:

   ```tsx
   const table = useTable({ features, columns, data: rows });
   ```

   The manual flags are typed per feature: `manualSorting` exists
   only with `rowSortingFeature`, `manualPagination` and
   `rowCount` only with `rowPaginationFeature`. A table that
   drives its headers through `rowSortingFeature` (its
   `getToggleSortingHandler`) sets `manualSorting: true`, passes
   the URL's sort as `state.sorting`, and writes it back in
   `onSortingChange`; it never registers `sortedRowModel`.

4. **Render** with the kit's `Table` parts and
   `<table.FlexRender />`, inside the table's own
   `overflow-x-auto` container. `row.getAllCells()` is core;
   `row.getVisibleCells()` exists only with
   `columnVisibilityFeature`:

   ```tsx
   <div className="overflow-x-auto">
     <Table>
       <TableHeader>
         {table.getHeaderGroups().map((hg) => (
           <TableRow key={hg.id}>
             {hg.headers.map((header) => (
               <TableHead key={header.id}>
                 <table.FlexRender header={header} />
               </TableHead>
             ))}
           </TableRow>
         ))}
       </TableHeader>
       <TableBody>
         {table.getRowModel().rows.map((row) => (
           <TableRow key={row.id}>
             {row.getAllCells().map((cell) => (
               <TableCell key={cell.id}>
                 <table.FlexRender cell={cell} />
               </TableCell>
             ))}
           </TableRow>
         ))}
       </TableBody>
     </Table>
   </div>
   ```

   Zero rows renders the two empty states from
   the `recipe-search-and-filters` skill step 7, not a bare table.

5. **Pagination**: the kit's ONE `Pagination` family, bound to
   `setParams({ page })`, with the page count
   `Math.ceil(total / pageSize)` from the server's `total`. The
   shadcn `Pagination` is a set of parts, not a component that
   takes `page` or `onPageChange`: compose `Pagination` >
   `PaginationContent` > `PaginationItem` > `PaginationPrevious` /
   `PaginationLink` / `PaginationNext`. Each link is an `<a>`: give
   it the real `href` from the params module's `createSerializer`,
   and an `onClick` that calls `preventDefault()` and `setParams`,
   so a click stays a client update:

   ```tsx
   // search-params.ts: export const serializeProductsListParams = createSerializer(productsListParams);
   const link = (page: number) => ({
     href: serializeProductsListParams({ ...params, page }),
     onClick: (e: React.MouseEvent) => { e.preventDefault(); setParams({ page }); },
   });

   <Pagination>
     <PaginationContent>
       <PaginationItem>
         <PaginationPrevious {...link(Math.max(1, params.page - 1))} aria-disabled={params.page <= 1} />
       </PaginationItem>
       {pages.map((p) => (
         <PaginationItem key={p}>
           <PaginationLink {...link(p)} isActive={p === params.page}>{p}</PaginationLink>
         </PaginationItem>
       ))}
       …
     </PaginationContent>
   </Pagination>
   ```

## Don't — common failures

- Don't build another pagination component — the kit has one;
  duplicates multiply fast.
- Don't fetch all rows and let the table paginate, sort, or
  filter client-side — manual mode exists because SQL did it.
- Don't write v8 API (`useReactTable`, `getCoreRowModel()`,
  `getSortedRowModel()`, `getPaginationRowModel()`) — this stack
  is on v9: `useTable`, `tableFeatures`, the column helper,
  `<table.FlexRender />`.
- Don't make a header sortable when the procedure cannot sort
  that key.
- Don't hand-roll `<table>` markup — kit `Table` parts +
  `<table.FlexRender />`.
- Don't adopt or resurrect a table abstraction found in the
  codebase; this recipe is the standard.

## Verify

- [ ] `@tanstack/react-table` is v9; no v8 API appears in the
      diff.
- [ ] No client row models: no `sortedRowModel`,
      `filteredRowModel` or `paginatedRowModel` in `features`; a
      registered sorting or pagination feature sets its manual
      flag (`manualSorting`, `manualPagination` + `rowCount`).
- [ ] Columns come from the column helper, typed from the
      procedure's output, in their own module.
- [ ] Sorting and page changes write the URL through the shared
      params module; sort changes reset `page` to 1.
- [ ] Only sortable-by-the-backend columns render a sort control.
- [ ] One kit pagination component; none hand-rolled.
- [ ] The table scrolls in its own `overflow-x-auto` container;
      the page never scrolls horizontally.
- [ ] Zero rows shows the filtered-empty or truly-empty state.
