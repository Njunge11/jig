---
type: llm
weight: 2
---

PASS only if: one exported Zod schema module is used by both the form resolver and the procedure input; each field renders through react-hook-form `Controller` with the kit's `Field` parts, a paired `htmlFor`/`id`, and `aria-invalid`; submit is disabled while the mutation is pending; the server's field error is set on the `title` field with `setError`, and other failures show a toast that names the action; success invalidates the affected query and resets the form.

FAIL if the form declares its own second schema, if server errors only toast, if submit can fire twice, or if the form uses uncontrolled ad-hoc state in place of react-hook-form.
