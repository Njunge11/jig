---
type: llm
weight: 2
---

PASS only if the answer: (1) opens the docs that ship with the installed package under `node_modules/eve/docs/` for the slot it changes, and does not rely on memory of eve; (2) runs `pnpm exec eve info` from the app root that installs eve; (3) finds the project's eval script in `package.json`. The answer must not use `npx eve`.

FAIL if it uses `npx eve`, or starts to write the tool with none of these steps.
