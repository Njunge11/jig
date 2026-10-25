/** Streams an improved product description, as markdown, from the text model. */
import type { TextModel } from "@/lib/ai/model";

export function makeImproveDescriptionService(deps: { model: TextModel }) {
  function improveDescription(markdown: string) {
    return deps.model.stream(`Improve this product description. Reply in markdown only.\n\n${markdown}`);
  }

  return { improveDescription };
}
