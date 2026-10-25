// docs/lint-gates.md §6.1 backend-tests 10: a test file must be named after
// the source file it tests. Reports when neither `<name>.ts` nor
// `<name>.tsx` exists beside the `__tests__` folder.
import fs from "node:fs";
import path from "node:path";

/** @type {import("eslint").Rule.RuleModule} */
const testNamedAfterSourceRule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "backend-tests 10: wrong file; file not named after its source.",
    },
    messages: {
      noSource:
        "backend-tests 10: no {{name}}.ts or {{name}}.tsx beside __tests__.",
    },
    schema: [],
  },
  create(context) {
    return {
      Program(node) {
        const filename = context.filename;
        const match = path.basename(filename).match(/^(.+)\.test\.tsx?$/);
        if (!match) return;
        const name = match[1];
        const sourceDir = path.dirname(path.dirname(filename));
        const tsPath = path.join(sourceDir, `${name}.ts`);
        const tsxPath = path.join(sourceDir, `${name}.tsx`);
        if (!fs.existsSync(tsPath) && !fs.existsSync(tsxPath)) {
          context.report({ node, messageId: "noSource", data: { name } });
        }
      },
    };
  },
};

export default testNamedAfterSourceRule;
