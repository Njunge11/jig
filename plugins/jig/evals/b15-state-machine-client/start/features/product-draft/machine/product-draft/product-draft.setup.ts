import { setup } from "xstate";

export type DraftEvent = { type: "SUBMIT" } | { type: "APPROVE" } | { type: "BACK" };

export const draftSetup = setup({
  types: {
    events: {} as DraftEvent,
    tags: {} as "editable",
    meta: {} as { form: "details" | "review" | "summary" },
  },
});
