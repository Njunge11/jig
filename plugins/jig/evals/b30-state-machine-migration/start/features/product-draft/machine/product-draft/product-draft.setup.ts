import { assign, setup } from "xstate";

export type DraftContext = { missing: string[] };

export const draftSetup = setup({
  types: {
    context: {} as DraftContext,
    events: {} as { type: "DETAILS_SAVED"; missing: string[] },
    tags: {} as "saved",
    meta: {} as { form: "details" },
  },
  guards: { detailsMissing: (_, params: { missing: string[] }) => params.missing.length > 0 },
  actions: { recordMissing: assign({ missing: (_, params: { missing: string[] }) => params.missing }) },
});
