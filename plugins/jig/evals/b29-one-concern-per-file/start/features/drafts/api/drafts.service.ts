/** Decides what a seller's unpublished draft holds. */
import { trace } from "@/db/call-trace";
import type { DraftsRepo } from "../db/drafts.repo";
import type { DraftDetails } from "./draft-fields";

const notFound = { status: "notFound" as const, message: "No such draft." };

export function makeDraftsService(deps: { repo: DraftsRepo; now: () => Date; uuid: () => string }) {
  const createDraft = (storeId: string) =>
    trace("calling repo.insert to start an empty draft", () =>
      deps.repo.insert({ id: deps.uuid(), storeId, now: deps.now() }),
    );

  async function readDraft(draftId: string, storeId: string) {
    const draft = await trace("calling repo.byId to read the draft", () => deps.repo.byId(draftId, storeId));
    return draft ?? notFound;
  }

  async function updateDraft(draftId: string, storeId: string, details: Partial<DraftDetails>) {
    const draft = await trace("calling repo.updateDetails to save the seller's edit", () =>
      deps.repo.updateDetails(draftId, storeId, details, deps.now()),
    );
    return draft ?? notFound;
  }

  return { createDraft, readDraft, updateDraft };
}
