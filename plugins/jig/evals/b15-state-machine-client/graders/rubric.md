---
type: llm
weight: 2
---

PASS only if: the client never creates or drives its own copy of the workflow (the server moves the machine; a user action is a request to the server); it resolves the stored snapshot with the machine (`resolveState` / a restored snapshot) and reads it through `hasTag("editable")` for the button and `getMeta()` (or `matches`) for the form; if it uses `@xstate/react`, it reads through `useSelector`.

FAIL if the component keeps a hand-written table or `switch` that maps state names to "editable" beside the machine, compares `snapshot.value === "collecting" || ...` for the button, or sends events to a browser-side actor to move the draft.
