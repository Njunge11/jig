/** Moves a draft's stage by one seller event. */
import { transition } from "xstate";
import { trace } from "@/db/call-trace";
import type { DraftsRepo } from "../db/drafts.repo";
import type { DraftEvent } from "../machine/product-draft/product-draft.setup";
import { productDraftMachine } from "../machine/product-draft/product-draft.machine";

export function makeSendDraftEventService(deps: { repo: DraftsRepo }) {
  async function sendDraftEvent(draftId: string, storeId: string, event: DraftEvent) {
    const row = await trace("calling repo.byId to read the draft", () => deps.repo.byId(draftId, storeId));
    if (!row) return { status: "notFound" as const, message: "No such draft." };

    const before = productDraftMachine.resolveState(row.stage);
    const [after] = transition(productDraftMachine, before, event);
    const stage = { value: String(after.value) };
    const saved = await trace("calling repo.saveStage to store the draft's next stage", () =>
      deps.repo.saveStage(draftId, row.stage.value, stage),
    );
    if (!saved) return { status: "refused" as const, message: "The draft changed while you saved it. Try again." };
    return { status: "found" as const, stage };
  }

  return { sendDraftEvent };
}
