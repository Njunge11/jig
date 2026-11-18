---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: does every `Link` that `AppSidebar` renders for its items prefetch the full route from the moment the person points at it or moves the focus to it, and keep the default prefetch before that?

PASS if the `prefetch` prop of the sidebar's `Link` is `true` after a hover or a focus handler set a state, and `null`, `"auto"` or absent before it (such as `prefetch={intent ? true : null}` with `onPointerEnter` or `onMouseEnter`, and `onFocus`). The state and the handlers may live in a hook or in a wrapper component that the diff shows. FAIL if the prop is `true` from the start, if it never becomes `true`, if it is `false` at any time, or if no handler of the diff sets the state.
