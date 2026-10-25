/** The AI writing helpers' procedures. */
import { z } from "zod";
import { textModel } from "@/lib/ai/model";
import { createTRPCRouter, orgProcedure } from "@/lib/trpc/init";
import { makeImproveDescriptionService } from "./improve-description.service";

export const aiRouter = createTRPCRouter({
  // Streams markdown chunks: the client reads them as they arrive (`for await`).
  improveDescription: orgProcedure
    .meta({ purpose: "stream an improved product description" })
    .input(z.object({ markdown: z.string() }))
    .mutation(({ input }) => makeImproveDescriptionService({ model: textModel }).improveDescription(input.markdown)),
});
