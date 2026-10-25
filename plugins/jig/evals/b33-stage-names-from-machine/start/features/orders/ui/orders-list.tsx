"use client";
import { useSuspenseQueries } from "@tanstack/react-query";
import { useQueryStates } from "nuqs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTRPC } from "@/lib/trpc/react";
import { STAGE_STATUS } from "./order-stages";
import { ordersListParams } from "./search-params";
import { StageTabs } from "./stage-tabs";

/** The orders page: the stage tabs, and the active stage's orders as a table. */
export function OrdersList() {
  const trpc = useTRPC();
  const [{ stage }, setParams] = useQueryStates(ordersListParams);
  const [{ data: counts }, { data: rows }] = useSuspenseQueries({
    queries: [trpc.orders.counts.queryOptions(), trpc.orders.list.queryOptions({ status: STAGE_STATUS[stage] })],
  });
  return (
    <div className="flex flex-col gap-4">
      <StageTabs counts={counts} active={stage} onChange={(next) => setParams({ stage: next })} />
      {rows.length === 0 ? (
        <p>No orders</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.number}</TableCell>
                  <TableCell>{order.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
