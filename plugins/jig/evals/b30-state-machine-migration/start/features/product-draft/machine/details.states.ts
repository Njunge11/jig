import { draftSetup } from "./product-draft/product-draft.setup";

export const detailsPending = draftSetup.createStateConfig({
  meta: { form: "details" },
  on: {
    DETAILS_SAVED: [
      {
        guard: { type: "detailsMissing", params: ({ event }) => ({ missing: event.missing }) },
        target: "details_pending",
        actions: { type: "recordMissing", params: ({ event }) => ({ missing: event.missing }) },
      },
      {
        target: "details_complete",
        actions: { type: "recordMissing", params: ({ event }) => ({ missing: event.missing }) },
      },
    ],
  },
});

export const detailsComplete = draftSetup.createStateConfig({
  tags: ["saved"],
  meta: { form: "details" },
});
