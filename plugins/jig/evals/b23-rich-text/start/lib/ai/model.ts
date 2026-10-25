/** The app's text model. The fixture streams a fixed reply in chunks; a deployed app streams the model's reply here. */
const REPLY = [
  "## A linen shirt for every day\n\n",
  "Cut from **washed linen**, this shirt is soft from the first wear ",
  "and gets softer with each wash.\n\n",
  "- Relaxed fit\n",
  "- Mother-of-pearl buttons\n",
  "- Machine washable\n",
];

export const textModel = {
  async *stream(prompt: string): AsyncGenerator<string> {
    if (!prompt) return;
    for (const chunk of REPLY) yield chunk;
  },
};

export type TextModel = typeof textModel;
