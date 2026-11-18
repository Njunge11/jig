import defaultToolsDisabled from "./default-tools-disabled.mjs";
import errorFileIsSharedPage from "./error-file-is-shared-page.mjs";
import failureChannel from "./failure-channel.mjs";
import responsiveMdStep from "./responsive-md-step.mjs";
import restrictedSyntax from "./restricted-syntax.mjs";
import segmentHasLoadingAndError from "./segment-has-loading-and-error.mjs";
import testNamedAfterSource from "./test-named-after-source.mjs";
import workflowDeterministic from "./workflow-deterministic.mjs";

/**
 * The jig rules as an oxlint JS plugin (oxlint docs, "JS Plugins"): each rule
 * file exports `{ meta, create(context) }`.
 */
const jigPlugin = {
  meta: { name: "jig" },
  rules: {
    "default-tools-disabled": defaultToolsDisabled,
    "error-file-is-shared-page": errorFileIsSharedPage,
    "failure-channel": failureChannel,
    "responsive-md-step": responsiveMdStep,
    "restricted-syntax": restrictedSyntax,
    "segment-has-loading-and-error": segmentHasLoadingAndError,
    "test-named-after-source": testNamedAfterSource,
    "workflow-deterministic": workflowDeterministic,
  },
};

export default jigPlugin;
