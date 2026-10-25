import { detailsComplete, detailsPending } from "../details.states";
import { draftSetup } from "./product-draft.setup";

export const draftMachine = draftSetup.createMachine({
  id: "draft",
  initial: "details_pending",
  context: { missing: [] },
  states: { details_pending: detailsPending, details_complete: detailsComplete },
});
