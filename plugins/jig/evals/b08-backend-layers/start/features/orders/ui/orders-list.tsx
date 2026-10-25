"use client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTRPC } from "@/lib/trpc/react";
import type { OrderTab } from "../db/orders.repo";

/** One tab's orders, as a table. */
export function OrdersList({ tab }: { tab: OrderTab }) {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.orders.list.queryOptions({ tab }));
  if (data.length === 0) return <p>No orders</p>;
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((order) => (
          <TableRow key={order.id}>
            <TableCell>{order.number}</TableCell>
            <TableCell>{order.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
