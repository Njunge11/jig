import errorFileIsSharedPage from "./rules/error-file-is-shared-page.mjs";
import failureChannel from "./rules/failure-channel.mjs";
import responsiveMdStep from "./rules/responsive-md-step.mjs";
import restrictedSyntax from "./rules/restricted-syntax.mjs";
import segmentHasLoadingAndError from "./rules/segment-has-loading-and-error.mjs";
import testNamedAfterSource from "./rules/test-named-after-source.mjs";

/**
 * The jig rules as an oxlint JS plugin (oxlint docs, "JS Plugins"): each
 * rule file exports `{ meta, create(context) }`.
 */
export default {
  meta: { name: "jig" },
  rules: {
    "error-file-is-shared-page": errorFileIsSharedPage,
    "failure-channel": failureChannel,
    "responsive-md-step": responsiveMdStep,
    "restricted-syntax": restrictedSyntax,
    "segment-has-loading-and-error": segmentHasLoadingAndError,
    "test-named-after-source": testNamedAfterSource,
  },
};
