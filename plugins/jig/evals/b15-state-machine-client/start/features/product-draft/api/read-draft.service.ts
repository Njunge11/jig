/** Reads the stored stage of one draft. */
import { trace } from "@/db/call-trace";
import type { DraftsRepo } from "../db/drafts.repo";

export function makeReadDraftService(deps: { repo: DraftsRepo }) {
  async function readDraft(draftId: string, storeId: string) {
    const row = await trace("calling repo.byId to read the draft", () => deps.repo.byId(draftId, storeId));
    if (!row) return { status: "notFound" as const, message: "No such draft." };
    return { status: "found" as const, stage: row.stage };
  }

  return { readDraft };
}
