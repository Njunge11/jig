// docs/lint-gates.md §6.1 frontend-standards 16: a responsive class list must
// not jump from a base class straight to `lg:`. Reports a string literal or
// template quasi whose whitespace-split classes hold one that starts with
// `lg:` and none that starts with `sm:` or `md:`. An object key such as `lg:`
// in a `cva` size map is an identifier, not a literal, and is not read.

function classesSkipStep(text) {
  if (typeof text !== "string") return false;
  const classes = text.split(/\s+/).filter(Boolean);
  const hasLg = classes.some((cls) => cls.startsWith("lg:"));
  const hasStep = classes.some(
    (cls) => cls.startsWith("sm:") || cls.startsWith("md:"),
  );
  return hasLg && !hasStep;
}

/** @type {import("eslint").Rule.RuleModule} */
const responsiveMdStepRule = {
  meta: {
    type: "problem",
    docs: {
      description: "frontend-standards 16: no base to lg: jump.",
    },
    messages: {
      skipsStep:
        "frontend-standards 16: no base → lg: jump; step through sm: or md: first.",
    },
    schema: [],
  },
  create(context) {
    return {
      Literal(node) {
        if (typeof node.value !== "string") return;
        if (classesSkipStep(node.value)) {
          context.report({ node, messageId: "skipsStep" });
        }
      },
      TemplateElement(node) {
        const text = node.value.cooked ?? node.value.raw;
        if (classesSkipStep(text)) {
          context.report({ node, messageId: "skipsStep" });
        }
      },
    };
  },
};

export default responsiveMdStepRule;
