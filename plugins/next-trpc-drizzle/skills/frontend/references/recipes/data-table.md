# Recipe: Data table

Use this recipe for a table of rows with columns, sorting,
pagination, and row actions. A data table rides on
`page-with-data.md` and `search-and-filters.md` — the URL owns
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
     createColumnHelper, rowPaginationFeature, tableFeatures,
   } from "@tanstack/react-table";

   export const features = tableFeatures({ rowPaginationFeature });
   const helper = createColumnHelper<typeof features, Job>();

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
       cell: ({ row }) => <JobRowActions job={row.original} />,
     }),
   ]);
   ```

   `SortableHeader` is a `Button variant="ghost"` calling
   `setParams({ sort: field, page: 1 })`; its arrow reads the
   current `sort` from the same URL state. `JobRowActions` is a
   `DropdownMenu`; its items run mutations per
   `form-with-mutation.md` / the mutation-feedback recipe.

3. **Table instance in manual mode.** The data is already
   paginated, sorted, and filtered by the server — tell the table
   so, give it the total, and omit the client row models
   (`createPaginatedRowModel`, `createSortedRowModel`,
   `createFilteredRowModel` stay out of `features`):

   ```tsx
   const table = useTable({
     features,
     columns,
     data: rows,
     manualPagination: true,
     manualSorting: true,
     manualFiltering: true,
     rowCount: total,
   });
   ```

4. **Render** with the kit's `Table` parts and
   `<table.FlexRender />`, inside the table's own
   `overflow-x-auto` container:

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
             {row.getVisibleCells().map((cell) => (
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
   `search-and-filters.md` step 7, not a bare table.

5. **Pagination**: the kit's ONE `Pagination` component, bound to
   `setParams({ page })`, with the page count derived from
   `total` and the page size.

## Don't — failures this repo shipped

- Don't build another pagination component — this repo shipped
  five; the kit has one.
- Don't fetch all rows and let the table paginate, sort, or
  filter client-side — manual mode exists because SQL did it.
- Don't write v8 API (`useReactTable`, `ColumnDef[]`,
  `flexRender(...)`) — this stack is on v9: `useTable`,
  `tableFeatures`, the column helper, `<table.FlexRender />`.
- Don't make a header sortable when the procedure cannot sort
  that key.
- Don't hand-roll `<table>` markup — kit `Table` parts +
  `<table.FlexRender />`.
- Don't resurrect a dead table abstraction found in the repo;
  this recipe is the standard.

## Verify

- [ ] `@tanstack/react-table` is v9; no v8 API appears in the
      diff.
- [ ] `features` holds `rowPaginationFeature` only; no client
      row models; all three manual flags and `rowCount` set.
- [ ] Columns come from the column helper, typed from the
      procedure's output, in their own module.
- [ ] Sorting and page changes write the URL through the shared
      params module; sort changes reset `page` to 1.
- [ ] Only sortable-by-the-backend columns render a sort control.
- [ ] One kit pagination component; none hand-rolled.
- [ ] The table scrolls in its own `overflow-x-auto` container;
      the page never scrolls horizontally.
- [ ] Zero rows shows the filtered-empty or truly-empty state.
