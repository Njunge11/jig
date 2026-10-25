import { collecting, published, reviewing } from "../product-draft.states";
import { draftSetup } from "./product-draft.setup";

export const productDraftMachine = draftSetup.createMachine({
  id: "productDraft",
  initial: "collecting",
  states: { collecting, reviewing, published },
});
