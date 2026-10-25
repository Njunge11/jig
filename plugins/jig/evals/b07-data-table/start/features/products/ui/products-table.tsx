import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { RouterOutputs } from "@/lib/trpc/routers/_app";

type Product = RouterOutputs["products"]["list"]["rows"][number];

export function ProductsTable({ rows, total }: { rows: Product[]; total: number }) {
  if (rows.length === 0) return <p>No products found</p>;
  return (
    <div className="flex flex-col gap-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.title}</TableCell>
              <TableCell>{row.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <p className="text-sm text-muted-foreground">{total} products</p>
    </div>
  );
}
