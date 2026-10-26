---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: Does the archive mutation write the cache optimistically in this order: cancel, snapshot, set, roll back on error, invalidate on settle?

PASS if `onMutate` awaits `cancelQueries` for `products.list`, reads the previous data, sets the new data and returns the snapshot; `onError` restores the snapshot; `onSettled` invalidates `products.list`; it may skip the invalidation while another save of the same mutation key is still pending (`isMutating({ mutationKey }) === 1`), so the last save to settle refetches. The QueryClient may be `context.client` or `queryClient`. FAIL if a step is missing, or the invalidation runs only in `onSuccess`.
