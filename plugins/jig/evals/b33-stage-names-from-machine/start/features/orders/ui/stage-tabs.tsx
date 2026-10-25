"use client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ORDER_STAGES, type OrderStageTab, STAGE_LABEL, STAGE_STATUS } from "./order-stages";

/** One tab per stage, with how many orders it holds. */
export function StageTabs({
  counts,
  active,
  onChange,
}: {
  counts: Record<string, number>;
  active: OrderStageTab;
  onChange: (tab: OrderStageTab) => void;
}) {
  return (
    <Tabs value={active} onValueChange={(value) => onChange(value as OrderStageTab)}>
      <TabsList>
        {ORDER_STAGES.map((tab) => (
          <TabsTrigger key={tab} value={tab}>
            {STAGE_LABEL[tab]} ({counts[STAGE_STATUS[tab]] ?? 0})
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
