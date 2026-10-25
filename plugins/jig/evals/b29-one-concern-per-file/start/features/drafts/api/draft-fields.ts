/** Lists the fields of a draft's details form, in form order. */
export const draftFields = ["title", "size", "priceCents"] as const;

export type DraftField = (typeof draftFields)[number];

export type DraftDetails = {
  title: string | null;
  size: "small" | "medium" | "large" | null;
  priceCents: number | null;
};
