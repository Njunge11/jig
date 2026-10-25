/** Moves a draft's stage when the seller saves its details. */
import { transition } from "xstate";
import { trace } from "@/db/call-trace";
import type { DraftsRepo } from "../db/drafts.repo";
import { draftMachine } from "../machine/product-draft/product-draft.machine";

export function makeSaveDetailsService(deps: { repo: DraftsRepo }) {
  async function saveDetails(draftId: string, storeId: string, missing: string[]) {
    const row = await trace("calling repo.byId to read the draft", () => deps.repo.byId(draftId, storeId));
    if (!row) return { status: "notFound" as const, message: "No such draft." };

    const before = draftMachine.resolveState(row.stage);
    const [after] = transition(draftMachine, before, { type: "DETAILS_SAVED", missing });
    const stage = { value: String(after.value), context: after.context };
    const saved = await trace("calling repo.saveStage to store the draft's next stage", () =>
      deps.repo.saveStage(draftId, row.stage.value, stage),
    );
    if (!saved) return { status: "refused" as const, message: "The draft changed while you saved it. Try again." };
    return { status: "saved" as const, stage: stage.value };
  }

  return { saveDetails };
}
