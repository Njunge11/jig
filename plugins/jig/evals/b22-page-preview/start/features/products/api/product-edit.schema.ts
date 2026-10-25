import { z } from "zod";

/** The product edit form's values: the procedure's input and the form's resolver. */
export const productEditSchema = z.object({
  title: z.string().min(1, "Enter a title"),
  priceCents: z.number().int().min(0),
  descriptionHtml: z.string(),
});

export type ProductEditValues = z.infer<typeof productEditSchema>;
