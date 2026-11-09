const CLAUDE_ATTRIBUTION =
  /co-authored-by:[^\n]*(claude|anthropic)|generated with \[?claude code/i;

module.exports = {
  extends: ["@commitlint/config-conventional"],
  plugins: [
    {
      rules: {
        "no-claude-attribution": ({ raw }) => [
          !CLAUDE_ATTRIBUTION.test(raw),
          "the commit message must not carry a Claude attribution line " +
            "(Co-Authored-By: Claude, or Generated with Claude Code)",
        ],
      },
    },
  ],
  rules: {
    "body-max-line-length": [0],
    "no-claude-attribution": [2, "always"],
  },
};
