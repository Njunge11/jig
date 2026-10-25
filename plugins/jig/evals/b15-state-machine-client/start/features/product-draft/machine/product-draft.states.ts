import { draftSetup } from "./product-draft/product-draft.setup";

export const collecting = draftSetup.createStateConfig({
  tags: ["editable"],
  meta: { form: "details" },
  on: { SUBMIT: { target: "reviewing" } },
});

export const reviewing = draftSetup.createStateConfig({
  tags: ["editable"],
  meta: { form: "review" },
  on: { APPROVE: { target: "published" }, BACK: { target: "collecting" } },
});

export const published = draftSetup.createStateConfig({
  meta: { form: "summary" },
});
