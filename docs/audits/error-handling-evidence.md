# Error handling: evidence for one pattern

Date: 2026-11-19. Stack and versions (the pins of `evals-fixture/store-app`, which are the pins of the `scaffold-repo` skill): Next.js 16.4.3, React 19.3.1, `@tanstack/react-query` 5.104.5, tRPC 11.19.0, sonner 2.0.8, react-hook-form 7.91.0, zod 4.6.7, oxlint 1.93.0.

This file holds the why of the error handling rules in jig 1.4.0. The rules live in the skills: `backend-standards` ("Error handling"), `frontend-standards` 54 and 56, `frontend-wiring`, `recipe-mutation-feedback`, `recipe-form-with-mutation`.

## 1. Verdict of each part

Each quote was read on its page and checked again by a script against the saved text of the page (69 quotes, 0 missing). The Next.js quotes come from the documents that the installed package ships (`node_modules/next/dist/docs`, version 16.4.3). The TanStack source quotes come from `@tanstack/query-core` 5.104.5 in `node_modules`. The tRPC documents are those of tag `v11.19.0`.

| # | Part of the hypothesis | Verdict | What changed |
| --- | --- | --- | --- |
| 1 | Two kinds of failure: an expected one is a returned value, an unexpected one is thrown; the `errorFormatter` gives one fixed sentence | Backed with a change | A service returns the expected failure. At the tRPC entry of a mutation, `orThrow` turns it into a `TRPCError` with its message. The client never reads a failure status from the data of a mutation. |
| 2 | One handler: one `MutationCache`, a failure title in a typed `meta`, an opt-out in `meta` | Backed | No change. Counter-evidence is in section 2. |
| 3 | One shared error page; `app/global-error.tsx`, `app/error.tsx`, `app/not-found.tsx` | Backed with a change | "Try again" must reset the failed queries (`useQueryErrorResetBoundary`) and then call `retry()`, not `reset()`. With `reset()` or `retry()` alone the page does not load again. |
| 4 | The server makes one identifier for each request, writes it in each log line and returns it; a screen never makes one | Backed with a change | Two references, each made by the server: `requestId` for a tRPC failure, and the `digest` of Next.js for a render failure. The reference shows only for a failure that nobody expected. |
| 5 | A message says what happened and what to do next, and states only what the app knows | Backed | No change. |
| 6 | One offline banner from the online manager | Backed | No change. Two limits are in section 9. |
| 7 | Lint rules refuse code that leaves the pattern | Backed | Two lint rules, and one type in place of a third rule: a mutation procedure that hands a returned failure to the client is a type error. |

### Part 1: two kinds of failure

| Source | Exact words |
| --- | --- |
| Next.js 16.4.3, `01-app/01-getting-started/10-error-handling.md` | "Errors can be divided into two categories: [expected errors](#handling-expected-errors) and [uncaught exceptions](#handling-uncaught-exceptions)." |
| Same page | "For these errors, avoid using `try`/`catch` blocks and throw errors. Instead, model expected errors as return values." |
| Same page | "Uncaught exceptions are unexpected errors that indicate bugs or issues that should not occur during the normal flow of your application. These should be handled by throwing errors, which will then be caught by error boundaries." |
| TkDodo, "React Query Error Handling", tkdodo.eu/blog/react-query-error-handling | "React Query needs a rejected Promise in order to handle errors correctly." |
| Google AIP-193, google.aip.dev/193 | "APIs **should not** support partial errors. Partial errors add significant complexity for users, because they usually sidestep the use of error codes, or move those error codes into the response message, where the user **must** write specialized error handling logic to address the problem." |
| RFC 9457, the `status` member | "Generators MUST use the same status code in the actual HTTP response," |
| RFC 9457, "Defining New Problem Types" | "Problem details are intended to avoid the necessity of establishing new "fault" or "error" document formats, not to replace existing domain-specific formats." |
| tRPC 11.19.0, `server/error-handling.md` | "Whenever an error occurs in a procedure, tRPC responds to the client with an object that includes an "error" property. This property contains all the information that you need to handle the error in the client." |
| Same page | "tRPC provides an error subclass, `TRPCError`, which you can use to represent an error that occurred inside a procedure." |
| tRPC 11.19.0, `server/error-formatting.md` | "The error formatting in your router will be inferred all the way to your client." |

Why "with a change": Next.js writes the return-value rule for Server Functions, whose caller reads the value. A tRPC mutation that returns `{ status: "notFound" }` answers HTTP 200, so TanStack Query calls `onSuccess` and no error handler sees it. That is the "partial error" that AIP-193 refuses, and it is the cause of the hand-written `toast.error(result.message)` in each `onSuccess`. The service keeps the return value (tests and other entry points read it). The mutation procedure turns it into the error of the protocol. tRPC already has the error format, so RFC 9457 is not added on top: the RFC says it does not replace a format that exists.

A query can keep a returned failure and draw it in place. A query that wraps its service call in `orThrow` reaches the shared error page with the message (proved, test 7).

### Part 2: one handler

| Source | Exact words |
| --- | --- |
| `@tanstack/query-core` 5.104.5, `src/mutationCache.ts` | "Global callbacks that fire for every mutation handled by a `MutationCache`, regardless of which" |
| Same file | "callbacks are always called, and `onMutate` here does not allow returning a result." |
| TanStack Query, `docs/framework/react/typescript.md` | "Similarly to registering a [global error type](#registering-a-global-error) you can also register a global `Meta` type. This ensures the optional `meta` field on [queries](./reference/functions/useQuery.md) and [mutations](./reference/functions/useMutation.md) stays consistent and is type-safe." |
| TkDodo, "Automatic Query Invalidation after Mutations", tkdodo.eu/blog/automatic-query-invalidation-after-mutations | "Since there is only one MutationCache for our application, those callbacks are “global” - they are invoked for every Mutation." |
| Same article | "Generally, meta is typed as Record<string, unknown>, but we can tweak this with module augmentation:" |
| TkDodo, "Breaking React Query's API on purpose", tkdodo.eu/blog/breaking-react-querys-api-on-purpose | "The best way to address this problem is to use the global cache-level callbacks when setting up your QueryClient:" |
| Same article | "a simple solution would be to use the meta field on your Query." |
| TkDodo, "React Query Error Handling" | "It is also likely the best place to put any sort of error tracking or monitoring that you want to perform, because it’s guaranteed to run only once per request and cannot be overwritten like e.g. the defaultOptions." |
| Google AIP-193 | "Services returning standardized error responses enable API clients to construct centralized common error handling logic. This common logic simplifies API client applications and eliminates the need for cumbersome custom error handling code." |

### Part 3: one shared error page

| Source | Exact words |
| --- | --- |
| Next.js 16.4.3, `03-file-conventions/error.md` | "In most cases, you should use [`retry()`](#retry) instead." (about `reset()`), and in the version table for `v16.3.0`: "`retry` prop became stable." |
| Same page | "To handle errors in the root layout, use [`global-error.js`](/docs/app/api-reference/file-conventions/error#global-error)." |
| Same page | "Global error UI must define its own `<html>` and `<body>` tags, global styles, fonts, or other dependencies that your error page requires." |
| Next.js 16.4.3, `03-file-conventions/not-found.md` | "the root `app/not-found.js` and `app/global-not-found.js` files handle any unmatched URLs for your whole application." |
| Next.js 16.4.3, `04-functions/catchError.md` | "In most cases, use `retry()` instead of `reset()`. The `reset()` function only clears the error state and re-renders without re-fetching, which means it won't recover from Server Component errors." |
| TanStack Query, `docs/framework/react/guides/suspense.md` | "Whether you are using **suspense** or **throwOnError** in your queries, you will need a way to let queries know that you want to try again when re-rendering after some error occurred." |
| Same page | "Query errors can be reset with the `QueryErrorResetBoundary` component or with the `useQueryErrorResetBoundary` hook." |
| GOV.UK Design System, "There is a problem with the service pages" | "Use this page when there is an unexpected problem with the service. Use the same page for all unexpected problems." |

Why "with a change": the old rule 54 said `{ error, reset }` with `reset()`. Next.js 16.3 and later say `retry()`. The proof found one more fault: a `useSuspenseQuery` that failed does not fetch again after `retry()` alone. The shared page calls `reset()` of `useQueryErrorResetBoundary`, then `retry()`.

### Part 4: a reference for a failure that nobody expects

| Source | Exact words |
| --- | --- |
| OWASP Logging Cheat Sheet, note A of "Event attributes" | "The "Interaction identifier" is a method of linking all (relevant) events for a single user interaction (e.g. desktop application form submission, web page request, mobile app button click, web service call)." |
| Stripe API reference, "Request IDs", docs.stripe.com/api/request_ids | "Each API request has an associated request identifier. You can find this value in the response headers, under `Request-Id`." |
| Same page | "To expedite the resolution process, provide the request identifier when you contact us about a specific request." |
| RFC 9457, the `instance` member | "it serves as a unique identifier for the problem occurrence that may be of significance to the server but is opaque to the client." |
| RFC 9457, "Security Considerations" | "Generators providing links to occurrence information are encouraged to avoid making implementation details such as a stack dump available through the HTTP interface" |
| Next.js 16.4.3, `03-file-conventions/error.md` (`error.digest`) | "An automatically generated hash of the error thrown. It can be used to match the corresponding error in server-side logs." |
| Same page | "Errors forwarded from Server Components show a generic message with an identifier. This is to prevent leaking sensitive details." |
| Next.js 16.4.3, `03-file-conventions/instrumentation.md` | "You can optionally export an `onRequestError` function to track **server** errors to any custom observability provider." |
| NN/g, "Error-Message Guidelines", nngroup.com/articles/error-message-guidelines | "Hide or minimize the use of obscure error codes or abbreviations; show them for technical diagnostic purposes only." |

Why "with a change": a failure of a Server Component render does not pass through tRPC, so it has no `requestId`. Next.js already makes a `digest` on the server and writes it in the server log. The shared page shows that one. A reference that the browser makes is in no log, so it finds nothing. NN/g limits a code to diagnostics, so the reference shows only for the fixed sentence, never for a failure that the server sent on purpose.

### Part 5: the words of a message

| Source | Exact words |
| --- | --- |
| NN/g, "Error-Message Guidelines" | "Concisely and precisely describe the issue. Generic messages such as An error occurred lack context." |
| Same article | "Offer constructive advice. Merely stating the problem is also not enough; offer some potential remedies." |
| Same article | "Display the error message close to the error's source." and "Preserve the user's input." |
| Microsoft, "Error Messages" (Windows UX guide), learn.microsoft.com/windows/win32/uxguide/mess-error | "Effective error messages inform users that a problem occurred, explain why it happened, and provide a solution so users can fix the problem." |
| Same page | "Don't provide a problem, cause, or solution unless it is likely to be right. For example, it is better to say An unknown error occurred than something that is likely to be inaccurate." |
| Same page | "it is better to be up front about the lack of information than to present problems, causes, or solutions that might not be right." |
| GOV.UK Design System, "Error message" | "In the error message explain what went wrong and how to fix it." |
| GOV.UK Design System, "There is a problem with the service pages" | the page must give "information about what has happened to their answers if they are in the middle of a transaction" |
| Google AIP-193 | "Messages **should** use simple descriptive language that is easy to understand (without technical jargon) to clearly state the problem that results in an error, and offer an actionable resolution to it." |
| RFC 9457, the `detail` member | "The "detail" string, if present, ought to focus on helping the client correct the problem, rather than giving debugging information." |

The Microsoft lines back "no comfort that the app cannot prove": a message such as "your data is safe" is a statement that the code did not check.

### Part 6: one offline banner

| Source | Exact words |
| --- | --- |
| `@tanstack/query-core` 5.104.5, `src/onlineManager.ts` | "By default, the `onlineManager` assumes an active network connection, and" "listens to the `online` and `offline` events on the `window` object to" detect changes. |
| TanStack Query, `docs/framework/react/guides/network-mode.md` | "In this mode, Queries and Mutations will not fire unless you have network connection. This is the default mode." |

The proof shows the result of the default mode: a mutation that starts offline shows no failure toast. It waits and runs when the connection returns. So the banner is the only message that the user gets, and its text says what the app does with a change.

### Part 7: lint rules

| Source | Exact words |
| --- | --- |
| `@tanstack/query-core` 5.104.5, `src/types.ts` (`MutationOptions`) | `meta?: MutationMeta` |
| Same file | "cache-level handlers. Defaults to `Record<string, unknown>`; declare `mutationMeta` on {@link Register} to narrow it." |
| TkDodo, "Breaking React Query's API on purpose" | "except that it’s a fail-safe way to handle this situation." |

The type probe (section 5.2) shows the gap: a `meta` with a wrong key is a type error, but a mutation with no `meta` passes the type check. So one lint rule reads each mutation.

## 2. Evidence against the hypothesis

These are the strongest lines against a global handler. The pattern keeps each one in view.

| Source | Exact words | What the pattern does with it |
| --- | --- | --- |
| TkDodo, "Mastering Mutations in React Query" | "Do UI related things like redirects or showing toast notifications in mutate callbacks. If the user navigated away from the current screen before the mutation finished, those will purposefully not fire." | The maintainer puts a toast in the callback of the screen. A global handler also shows the toast after the user left the screen. For a failure this is the wanted result: the write did not happen, and the user must know. A success toast stays in the callback of the mutation. |
| TkDodo, "Breaking React Query's API on purpose" | "please note that we’re talking only about the callbacks of useQuery, NOT about the useMutation callbacks." | The removal of `onError` in v5 was for queries. Nothing forbids `onError` on a mutation. The pattern does not say that it is forbidden: it says that a failure toast has one home. `onError` stays for a rollback and for `setError`. |
| TkDodo, "React Query Error Handling" | "the onError callback on useQuery is called for every Observer, which means if you call useTodos twice in your application, you will get two error toasts, even though only one network request fails." | This duplicate is a fault of query observers. For mutations, a hand-written `onError` in the options also gives one toast for one `mutate()` call. The proof test "two components that use one mutation show one toast" passes, but it is not a gain over the old way. The gain is one place for the words, not fewer toasts. |
| TkDodo, "Automatic Query Invalidation after Mutations" | "Just keep in mind that every abstraction has a cost: It’s a new API that needs to be learned, understood and applied properly." and "This pattern is probably only slightly better than just having onSuccess callbacks on useMutation itself" | The cost is real: `meta`, two functions and two lint rules. The measured gain is in section 6. |
| cal.com, commit `ae027bb` | 118 `useMutation(` calls; 124 `showToast(..., "error")` calls; 75 `onError` handlers with a `showToast` in the next 3 lines; no `MutationCache` | A large app of this stack writes the failure toast by hand at each mutation. It works. It is also the state that this change removes: the same code in more than 100 places. |

## 3. The alternatives

| Alternative | Evidence | Verdict |
| --- | --- | --- |
| A wrapper hook around `useMutation` | TkDodo, "Creating Query Abstractions": "I’ve come to the conclusion that custom hooks are just not the right abstraction here" and "as soon as you try to create low-level, generic abstractions over them, it becomes difficult to get right." The wrapper must copy the generics of `mutationOptions`, and an agent can still call `useMutation`. | Not backed |
| An error boundary with `throwOnError` for mutations | It exists: "If you want mutations to propagate errors to the nearest error boundary (similar to queries), you can set the `throwOnError` option to `true` as well." (suspense guide). But a boundary replaces the screen, so the form and its input go: NN/g "Preserve the user's input." Next.js: "Error boundaries don't catch errors inside event handlers." | Not backed for a mutation |
| A result type library | Next.js models an expected error as a plain return value. With `orThrow` at the entry, the client reads no result type. No source of this stack asks for a library. Not tested. | Not backed |
| The hand-written `onError` + toast at each mutation (the old jig rule) | cal.com does this. It needs about 5 lines for each mutation and has no gate. | Works, not chosen |

Open source apps of this stack, real code:

| App | File | What it does |
| --- | --- | --- |
| create-t3-app | `src/trpc/query-client.ts`, `src/server/api/trpc.ts` | No `MutationCache`. The `errorFormatter` adds `zodError` to `data`. Expected failures are thrown as `TRPCError`. |
| create-t3-turbo | `packages/api/src/trpc.ts`, `query-client.ts` | The same. A comment in the query client: "// Next.js also automatically redacts errors for us" |
| cal.com `ae027bb` | `apps/web/app/_trpc/query-client.ts` | No global handler. The query `retry` skips expected codes: "// if input data is wrong or you're not authorized there's no point retrying a query". The pattern takes this. |
| cal.com `ae027bb` | `apps/web/app/error.tsx`, `apps/web/app/global-error.tsx`, `apps/web/instrumentation.ts` | One shared `ErrorPage` for both app-wide files (`<CustomError {...props} />`), and `onRequestError` in the instrumentation. Some route `error.tsx` files draw their own `Alert`. |
| vercel/commerce `f7521d5` | `app/error.tsx` | One app-wide `error.tsx` with `reset()` and a fixed text. No tRPC. |
| vercel/next-learn `bb25584` | `dashboard/final-example/app/dashboard/invoices/error.tsx` | A route `error.tsx` with its own page and `reset()`. |

No open source app in this list has the full pattern. Parts 2 and 7 rest on the documents and the articles of the TanStack Query maintainer and on the proof below, not on a known app.

## 4. The pattern, as proved

| Place | What it holds |
| --- | --- |
| Service | An expected failure is the value `{ status: "notFound" \| "forbidden" \| "refused" \| "invalid", message, field? }`. |
| Mutation procedure | `orThrow(<the service call>)`. The failure leaves as a `TRPCError` (`NOT_FOUND`, `FORBIDDEN`, `CONFLICT`, `BAD_REQUEST`) with its message. `Exclude<T, Failure>` removes the failure from the type of the client. |
| `createTRPCRouter` | Its argument has the type `NoReturnedFailure<T>`: a mutation with no `orThrow` is a type error. |
| `createTRPCContext` | `requestId = crypto.randomUUID()`. `ctx.log` starts each line with it. The first middleware of the base procedure logs each failure: `[<requestId>] <path> <code>: <message>`. |
| `errorFormatter: formatFailure` | One fixed sentence for `INTERNAL_SERVER_ERROR`; no stack; `data.requestId`; `data.field`. |
| `lib/trpc/failure.ts` | The type of `meta` (`Register.mutationMeta`), `showMutationFailure`, `describeFailure`, `isExpectedFailure`. |
| `lib/trpc/query-client.ts` | `mutationCache: new MutationCache({ onError: ... showMutationFailure(error, mutation) })`; the query `retry` skips an expected failure. |
| Each mutation | `meta: { failureTitle: "Couldn't archive the product" }`, or `meta: { showsOwnFailure: true }`. |
| `components/ui/route-error.tsx` | `RouteError`: the message, the reference, "Try again". Each `error.tsx` is `export { RouteError as default } from "@/components/ui/route-error";`. |
| `app/` | `error.tsx`, `global-error.tsx`, `not-found.tsx`. |
| `components/ui/offline-banner.tsx` | `OfflineBanner`, drawn one time in the root layout. |
| Lint | `jig/failure-channel`, `jig/error-file-is-shared-page`. |

How the handler knows a failure from a returned answer: it does not need to. Three ways were on the table.

| Way | Code for each mutation | Checked by a type |
| --- | --- | --- |
| The handler reads `data.status` in the `onSuccess` of the `MutationCache` | none in the screen, but each screen still gets a union and must narrow `data` before it reads it | No: a success value with a `status` and a `message` looks the same as a failure |
| Each mutation gives a function in `meta` that says if the data is a failure | 1 line or more | Partly |
| The procedure wraps the service call in `orThrow`, so a failure is always an error (chosen) | 9 characters in the procedure, none in the screen | Yes: `NoReturnedFailure` refuses a mutation that returns a failure, and the client type holds no failure |

## 5. Proof

The proof app is a copy of `evals-fixture/store-app` in a folder from `mktemp -d`, outside the plugin, with the pattern files of this commit, proof screens, proof procedures and `@playwright/test` 1.65.0. The tests run on the production build (`next build`, then `next start`) and on a real PGlite database.

### 5.1 Lint rules (oxlint with the JS plugin of the `lint-config` assets)

```
$ oxlint -c oxlint.assets.config.ts features/bad app/bad app/global-error.tsx app/layout.tsx   # violation files, and app/not-found.tsx removed
app/global-error.tsx:9:9: frontend-standards 54: global-error.tsx draws only <html>, <body> and <RouteError>. [Error/jig(error-file-is-shared-page)]
app/global-error.tsx:10:11: frontend-standards 54: global-error.tsx draws only <html>, <body> and <RouteError>. [Error/jig(error-file-is-shared-page)]
features/bad/ui/no-meta.tsx:8:29: frontend-standards 56: this mutation has no `meta`. Write `meta: { failureTitle: "Couldn't <do the action>" }`, or `meta: { showsOwnFailure: true }` when it draws its failure itself. [Error/jig(failure-channel)]
features/bad/ui/no-meta.tsx:9:30: frontend-standards 56: this mutation has no `meta`. Write `meta: { failureTitle: "Couldn't <do the action>" }`, or `meta: { showsOwnFailure: true }` when it draws its failure itself. [Error/jig(failure-channel)]
features/bad/ui/no-meta.tsx:10:17: frontend-standards 56: this mutation has no `meta`. Write `meta: { failureTitle: "Couldn't <do the action>" }`, or `meta: { showsOwnFailure: true }` when it draws its failure itself. [Error/jig(failure-channel)]
app/layout.tsx:1:1: frontend-standards 54: the app has no app/not-found.tsx. [Error/jig(error-file-is-shared-page)]
app/bad/error.tsx:1:1: frontend-standards 54: an error file has no page of its own. Its one statement is `export { RouteError as default } from "@/components/ui/route-error";`. [Error/jig(error-file-is-shared-page)]
features/bad/ui/hand-toast.tsx:12:22: frontend-standards 56: no `toast.error` by hand. The handler of the query client shows a failed mutation: give the mutation `meta: { failureTitle }`. [Error/jig(failure-channel)]
8 problems
exit 1

$ oxlint -c oxlint.assets.config.ts features app components/ui/route-error.tsx components/ui/offline-banner.tsx lib/trpc/failure.ts lib/trpc/query-client.ts lib/trpc/returned-failure.ts   # correct files
exit 0
```

### 5.2 Types

The probe files hold `@ts-expect-error` lines. The type check fails when one of the expected errors is not there. The build output is here because the browser tests run on it; its last line is a failure (section 9, item 1).

```
$ pnpm typecheck
$ next typegen && bun check --no-script
Generating route types...
✓ Types generated successfully
✓ No type errors in 81 files [253.83ms]
exit 0

$ pnpm build   # 4 lines of the output
✓ Compiled successfully in 920ms
✓ Generating static pages using 6 workers (4/4) in 823ms
Error [SecurityFatalError]: Your version of Next.js is affected by a known security vulnerability.
build exit 1
```

What the probes prove:

- `meta: { failureTitel: "..." }`, `meta: {}` and `meta: { showsOwnFailure: false }` are type errors.
- A mutation with no `meta` is NOT a type error. The lint rule `jig/failure-channel` reports it.
- A mutation procedure that returns the service call with no `orThrow` is a type error. A query that returns a failure value is not.
- A returned failure is not in the output type of the client. `error.data.field` and `error.data.requestId` are typed from the `errorFormatter`.

### 5.3 The browser tests

```
$ pnpm exec playwright test   # production build: next build, then next start
Running 11 tests using 1 worker
  ✓   1 proof/error-pattern.spec.ts:13:1 › a returned failure shows one toast with the title of the mutation and the returned message (410ms)
  ✓   2 proof/error-pattern.spec.ts:23:1 › a thrown failure shows one toast with the title, the fixed sentence and the reference of the server log (227ms)
  ✓   3 proof/error-pattern.spec.ts:37:1 › a mutation with the opt-out shows its message at the field and no toast (226ms)
  ✓   4 proof/error-pattern.spec.ts:44:1 › two components that use one mutation show one toast (726ms)
  ✓   5 proof/error-pattern.spec.ts:53:1 › three failed saves of one control show one toast (1.2s)
  ✓   6 proof/error-pattern.spec.ts:65:1 › a request with no answer shows one toast that says so (223ms)
error page shown after 7410 ms
error page text: "This page did not load\n\nThe server had an error. Try again.\n\nReference: 08e265b9-d457-4c67-a092-3f5fd8e08723\n\nTry again"
  ✓   7 proof/error-pattern.spec.ts:74:1 › a query that fails in a route shows the shared error page, and Try again loads the page (8.3s)
error page of a returned failure shown after 1354 ms
error page text: "This page did not load\n\nThis product is not in the store. Go back to the list.\n\nTry again"
  ✓   8 proof/error-pattern.spec.ts:91:1 › a query with a returned failure shows the shared error page with the returned message and no reference (1.4s)
global-error text: "This page did not load\n\nThe page had an error. Try again.\n\nReference: 2013969599\n\nTry again"
  ✓   9 proof/error-pattern.spec.ts:103:1 › a root layout that throws shows global-error with the shared page, and Try again loads the page (242ms)
  ✓  10 proof/error-pattern.spec.ts:119:1 › an address with no page shows not-found (112ms)
  ✓  11 proof/error-pattern.spec.ts:125:1 › the banner shows when the browser goes offline and goes when it comes back (1.2s)
  11 passed (16.1s)
exit 0
```

The server log of the same run (`proof/server.log`):

```
6:[e131607c-e45d-43ca-8535-a7cd9f7bd497] products.list UNAUTHORIZED: Your session ended. Sign in again.
18:  digest: '1764923834'
20:[33248aef-3c84-493b-a05e-71ff1f21f666] products.archive NOT_FOUND: This product is not in the store. Refresh the list.
21:[b74ab713-bf1b-439a-b4b8-0d737d3dff72] products.crash INTERNAL_SERVER_ERROR: Failed query: select * from proof_missing_table
60:[df38a5fa-6aba-4e2e-9caf-3b5239e0ce3a] products.rename BAD_REQUEST: A product has this title. Enter a different title.
61:[a6aa3915-b98a-4800-8e50-a8edb42e369e] products.archive NOT_FOUND: This product is not in the store. Refresh the list.
62:[8063edf6-fd56-4f78-b71f-f42af135bd10] products.archive NOT_FOUND: This product is not in the store. Refresh the list.
63:[6cbddc76-0d6f-44a3-a3f5-e5aa7ef5b5aa] products.archive NOT_FOUND: This product is not in the store. Refresh the list.
64:[e73b4b45-1126-46bc-9627-1ddfff4de32b] products.archive NOT_FOUND: This product is not in the store. Refresh the list.
65:[7992eea0-a5c2-403f-a6d1-e37b2d69193e] products.flaky INTERNAL_SERVER_ERROR: Failed query: select * from proof_missing_table
115:  digest: '42297606',
154:[63e392b4-c693-492c-a234-2378000bd196] products.flaky INTERNAL_SERVER_ERROR: Failed query: select * from proof_missing_table
192:[a2412f90-5209-4b14-b114-ff805a94cc68] products.flaky INTERNAL_SERVER_ERROR: Failed query: select * from proof_missing_table
230:[08e265b9-d457-4c67-a092-3f5fd8e08723] products.flaky INTERNAL_SERVER_ERROR: Failed query: select * from proof_missing_table
268:[f9242bfe-7e85-4c43-b502-a4a21ed77640] products.flaky NOT_FOUND: This product is not in the store. Go back to the list.
282:  digest: '2247199706'
284:[9556ed74-dec9-4f77-bb79-a3b556a7049b] products.flaky NOT_FOUND: This product is not in the store. Go back to the list.
285:⨯ Error: the root layout failed
287:  digest: '2013969599'
```

What each test proves:

| # | Test | Result |
| --- | --- | --- |
| 1 | A returned failure | One toast: the title of the mutation, the returned message, no reference. |
| 2 | A thrown failure | One toast: the title, the fixed sentence, a reference. The test reads the reference from the screen and finds it in the server log line of `products.crash`. The SQL text is in the log and not on the screen. |
| 3 | The opt-out | The message shows at the field. No toast. |
| 4 | Two components use one mutation | One toast. |
| 5 | Three failed saves of one control with one `scope.id` | One toast. |
| 6 | A request with no answer | One toast: "The server gave no answer. Check your connection and try again." |
| 7 | A query fails in a route | The shared page shows with the reference. "Try again" loads the page. |
| 8 | A query with a returned failure (`orThrow` in a query) | The shared page shows the returned message and no reference. |
| 9 | The root layout throws | `global-error` shows the shared page with the `digest`. The same `digest` is in the server log. "Try again" loads the page. |
| 10 | An address with no page | HTTP 404 and `not-found`. |
| 11 | The browser goes offline | The banner shows and goes. A mutation that starts offline shows no toast and succeeds after the connection returns. |

### 5.4 What did not work as the hypothesis says

| Found | Change |
| --- | --- |
| "Try again" with `retry()` alone did not load a failed `useSuspenseQuery` again. | `RouteError` calls `reset()` of `useQueryErrorResetBoundary`, then `retry()`. |
| The error page of a failed prefetched query showed after about 7.4 s: the browser retries 3 times (the TanStack default). | The query `retry` skips a failure that the server sent on purpose. That page now shows after about 1.4 s. For a failure that nobody expected, the 3 retries and the wait stay. |
| A `retry` function in `defaultOptions` also runs on the server. | The function starts with `!isServer`. |
| The reference of a render failure cannot be the `requestId`: the failure does not pass through tRPC. | The page shows the `digest` of Next.js for that failure. |
| The `Register` type in `query-client.ts` broke the type check of `failure.ts` in an app that has no query client yet. | The type lives in `failure.ts`, the file that reads `meta`. |

## 6. The code of one new mutation

The same mutation, written as jig 1.3.6 says and as jig 1.4.0 says. The count is the failure code only.

| | Lines | Characters | The failure code |
| --- | --- | --- | --- |
| jig 1.3.6 | 5 | 216 | `if (answer.status !== "archived") {`<br>`toast.error("Couldn't archive the product", { description: answer.message });`<br>`return;`<br>`}`<br>`onError: (error) => toast.error("Couldn't archive the product", { description: error.message }),` |
| jig 1.4.0 | 1 | 55 | `meta: { failureTitle: "Couldn't archive the product" },` in the screen, and `orThrow(` `)` around the service call in the procedure (9 characters) |

A new failure of the server (for example a new refusal) needs no line in the screen: the service returns it, and the handler shows its message. A new status is one line of `FAILURE_CODE`.

## 7. The size of each changed skill

`wc -l` and `wc -w` of the body of each `SKILL.md` (the text after the frontmatter).

| Skill | Lines before | Lines after | Words before | Words after |
| --- | --- | --- | --- | --- |
| `backend-standards` | 454 | 456 | 5369 | 5410 |
| `frontend-standards` | 498 | 497 | 3466 | 3519 |
| `frontend-wiring` | 102 | 123 | 563 | 775 |
| `recipe-mutation-feedback` | 206 | 205 | 1176 | 1176 |
| `recipe-form-with-mutation` | 130 | 130 | 647 | 619 |
| `recipe-page-with-data` | 90 | 90 | 598 | 601 |
| `recipe-edit-surfaces` | 132 | 132 | 837 | 844 |
| `scaffold-repo` | 155 | 155 | 3014 | 3055 |
| Total | 1767 | 1788 | 15670 | 15999 |

- Shorter or equal in lines: 6 of 8 skills. The two recipes that held the hand-written toast are shorter or equal in words too.
- `frontend-wiring` is 21 lines longer: it now holds the handler of the query client, the table of the failure parts and the two lint comments of the `prefetch` sample.
- `backend-standards` is 2 lines longer for three new rules: `orThrow` at the entry, the identifier of the request, the words of a message.
- `frontend-standards`, `scaffold-repo`, `recipe-page-with-data` and `recipe-edit-surfaces` have the same or fewer lines and more words: each new rule names its gate or its asset.

## 8. Skill audit and evals

### 8.1 Skill audit

The 16 items of the `skill-audit` skill were walked on each changed skill, after the edits. A row is one item that failed. Each other item passed.

| Skill | Category | Item that failed | Evidence | Fix |
| --- | --- | --- | --- | --- |
| `backend-standards` | Document and asset creation | 6: body under 5,000 words | The body has 5,410 words. It had 5,369 words before this change. | NOT FIXED. The fix is a split of the skill, and `skill-audit` step 4 gives that decision to the developer. |
| `backend-standards` | | 10: correct examples | The sample of "Transactions" returned `message: "No such order."`, which breaks the new rule on the words of a message. | The sample now returns "This order is not in the store. Refresh the list." |
| `frontend-standards` | Document and asset creation | none | 497 lines, 3,519 words. Rules 54 and 56 each end with their gate. | |
| `frontend-wiring` | Document and asset creation | 8: each instruction is exact | The first text said "the `scaffold-repo` asset `failures/app/`", with no path that an agent can open: an eval agent ran `find /` to look for it. | The text now gives the path from the folder of the skill (`../scaffold-repo/assets/failures/app/`), and only for a file that is missing. `backend-standards` got the same fix. |
| `recipe-mutation-feedback` | Document and asset creation | 9: one home for each rule | Step 3, the Don't list and the Verify list each said how a failure toast is written. | Step 3 names `frontend-standards` 56. The Don't line on the boundary went: rule 56 has it. |
| `recipe-form-with-mutation` | Document and asset creation | 8: each instruction is exact | The first text of step 5 said "`errors.root` in a `FieldError`". | It now says `form.formState.errors.root` and "above the submit button". |
| `recipe-form-with-mutation` | | 9: no restated content | The Don't line on client validation said step 1 again. | Removed. |
| `recipe-page-with-data` | Document and asset creation | none | Step 6 names `frontend-standards` 54 for `error.tsx`. | |
| `recipe-edit-surfaces` | Document and asset creation | 10: correct examples | The mutation sample of the dialog had no `meta`: `pnpm lint` refuses that code. | The sample has `meta: { failureTitle: "Couldn't update the product" }`. |
| `scaffold-repo` | Workflow automation | none | Step 3 item 3 and step 4 name the files of `assets/failures/`. The Verify list has the folder. | |

Item 15 (loading paths): no new consumer needs a new path. `frontend-standards` 56 names `frontend-wiring`, but the rule holds each word that a feature needs (`meta`, `describeFailure`). The recipes name rules 54 and 56 of `frontend-standards`, the skill that loads them. The frontend reviewer walks the Rules of `frontend-standards` and the Verify list of each recipe, so rules 54 and 56 are in its walk. The backend reviewer walks the Review checklist of `backend-standards`: items 28, 36 and 37.

### 8.2 Evals

Tool: `claude plugin eval`, Claude Code 2.1.327, from `plugins/jig`, one arm (`--ablation none`), so each grader scores. Model under test: Sonnet. Judge: Sonnet. The builder cases ran with `--scaffold --allow-tools Write Edit Bash`. Cost that the harness reports for all runs of this change: $19.07, plus one run that was stopped (it had no tool grant).

New cases and new graders:

| Case | What is new | It checks |
| --- | --- | --- |
| `b05-mutation-feedback` | `r4-failure-title-in-meta`, `r5-no-hand-toast` (regex on the diff) | A builder with a mutation writes `failureTitle` in `meta` and no `toast.error`. |
| `b04-form-with-mutation` | the start state returns a failure with `field`; `r4-server-field-error` is rewritten; `r6-no-hand-toast` | A form uses `showsOwnFailure`, puts the failure on its field or on `root`, and has no `toast.error`. |
| `b03-page-with-data` | `r5-shared-error-page` (regex on the diff) | A builder that adds a route writes the one export of `RouteError`. |
| `b25-frontend-wiring` | `r6-mutation-failure-handler` (regex on the diff) | The query client has the `MutationCache` handler. |
| `b41-failure-channel-review` | new case, with `-ref-good` and `-ref-bad` | A reviewer flags the hand-written failure toasts, the error file with its own page, and the reference that the browser makes. |

The new standard (this working folder). The tables are the lines that the harness printed.

```
CASE                    SCORE PASS% RUNS COST    NOTES
b03-page-with-data      1.00  100%  3    $0.77
b04-form-with-mutation  1.00  100%  3    $1.09
b05-mutation-feedback   1.00  100%  3    $0.76
b25-frontend-wiring     0.91  0%    3    $0.80   lint-pass: pattern not found in file .eval/lint.txt
4 case(s) · 529s · $3.43

CASE                 SCORE PASS% RUNS COST    NOTES          (after the fix of the `prefetch` sample, see below)
b25-frontend-wiring  1.00  100%  3    $1.09
1 case(s) · 93s · $1.09

CASE                           SCORE PASS% RUNS COST    NOTES          (the final text of rule 56)
b27-frontend-standards-review  1.00  100%  3    $0.92
b41-failure-channel-review     1.00  100%  3    $0.58
2 case(s) · 81s · $1.50

CASE                           SCORE PASS% RUNS COST    NOTES          (the first text of rule 56)
a02-frontend-reviewer-context  1.00  100%  3    $0.46
b27-frontend-standards-review  0.95  67%   3    $0.88   r2-template-literal-class: judge votes: PASS FAIL FAIL
b41-failure-channel-review     1.00  100%  3    $0.53
c03-fires-backend-procedure    1.00  100%  3    $0.41
c07-fires-form                 1.00  100%  3    $0.42
5 case(s) · 156s · $2.70

CASE                                  SCORE PASS% RUNS COST    NOTES
b08-backend-layers                    1.00  100%  1    $0.36
b09-eve-tool                          1.00  100%  1    $0.17
b10-mcp-tool                          0.90  0%    1    $0.27   lint-pass: pattern not found in file .eval/lint.txt
b11-workflow                          1.00  100%  1    $0.18
b20-edit-surfaces                     0.90  0%    1    $0.44   lint-pass: pattern not found in file .eval/lint.txt
b29-one-concern-per-file              1.00  100%  1    $0.34
b31-call-trace                        1.00  100%  1    $0.41
b32-no-skeleton-on-return             1.00  100%  1    $0.20
b37-optimistic-toggle-follows-clicks  1.00  100%  1    $0.18
9 case(s) · 279s · $2.55
```

The calibration of `b41`: the fixed good answer scores 1.00, the fixed bad answer scores 0.00.

The old standard: the skills and the fixture of commit `3252cd7` (jig 1.3.6), with the new graders. `b04` keeps its old start state there, because the old fixture has no `orThrow`.

```
CASE                        SCORE PASS% RUNS COST    NOTES
b03-page-with-data          0.89  0%    3    $1.00   r5-shared-error-page: pattern not found in file .eval/diff-app.txt
b04-form-with-mutation      0.74  0%    3    $1.34   r2-field-parts: judge votes: FAIL FAIL FAIL
b05-mutation-feedback       0.71  0%    3    $0.64   r4-failure-title-in-meta: pattern not found in file .eval/diff-app.txt
b41-failure-channel-review  0.50  0%    3    $0.45   r1-hand-written-failure-toast: judge votes: FAIL FAIL FAIL
4 case(s) · 443s · $3.43

CASE                 SCORE PASS% RUNS COST    NOTES
b10-mcp-tool         0.95  50%   2    $0.83   lint-pass: pattern not found in file .eval/lint.txt
b20-edit-surfaces    0.90  0%    2    $0.89   lint-pass: pattern not found in file .eval/lint.txt
b25-frontend-wiring  0.90  0%    2    $0.50   lint-pass: pattern not found in file .eval/lint.txt
3 case(s) · 304s · $2.21
```

Each new grader, old standard against new standard (runs that pass, of 3):

| Grader | Old | New |
| --- | --- | --- |
| `b05` `r4-failure-title-in-meta` | 0 | 3 |
| `b05` `r5-no-hand-toast` | 0 | 3 |
| `b04` `r4-server-field-error` | 0 | 3 |
| `b04` `r6-no-hand-toast` | 0 | 3 |
| `b03` `r5-shared-error-page` | 0 | 3 |
| `b41` `r1-hand-written-failure-toast` | 0 | 3 (two times) |
| `b41` `r3-error-file-own-page` | 0 | 3 (two times) |
| `b41` `r2-reference-made-in-browser` | 3 | 3 (two times) |

What the runs found, and what changed:

| Found | Change |
| --- | --- |
| `b41` `r2` passes with the old standard too: a reviewer flags a reference from `crypto.randomUUID()` with no rule. The grader does not show that the new rule is necessary. | None. The grader stays as a check that the rule does no harm. |
| `b25` failed its lint grader in 3 of 3 runs, and in 2 of 2 runs with the old standard: the `prefetch` sample of `frontend-wiring` has two `any` and no disable comment. The fault is older than this change. | The sample now has the two `oxlint-disable-next-line` comments, as the fixture has them. Then 3 of 3 runs pass. |
| In `b25` the agent ran `find /` to look for "the `scaffold-repo` asset". | `frontend-wiring` and `backend-standards` give the path from the folder of the skill, and only for a file that is missing. |
| `b20` fails its lint grader in 2 of 3 runs, and in 2 of 2 runs with the old standard. A replay of one failed run shows `react(no-unescaped-entities)` on quote marks in JSX text. Each mutation of that run has `meta: { failureTitle }` and no `toast.error`. | NOT FIXED. The rule is not part of this change. |
| `b10` fails its lint grader in 3 of 3 runs, and in 1 of 2 runs with the old standard. A replay shows `backend-standards 25: multi-line inline function as a call argument` in the MCP tool. | NOT FIXED. The rule is not part of this change. |
| `b27` `r2-template-literal-class`: one run failed with judge votes PASS FAIL FAIL. A hand check of the answer: it names the fault and gives a lookup map of full class strings. The next 3 runs pass. | None. |
| In the kept runs of `b20` and `b25` the agents did not run `pnpm lint` before they stopped. So a lint rule alone does not stop a fault in a builder run; the hook at the commit does. | None in this change. |

## 9. Not proved, and limits

| # | Item | State |
| --- | --- | --- |
| 1 | `next build` of the pinned Next.js 16.4.3 | The build compiles and writes its output, then prints `SecurityFatalError: Your version of Next.js is affected by a known security vulnerability` and exits 1. The browser tests ran on that output. The pin needs an upgrade. This change does not do it. |
| 2 | The `scaffold-repo` skill, end to end | Not run. No new monorepo was made. The assets were proved in the layout of the fixture app (one app, `@/` imports). The imports from `{{SCOPE}}/ui` in `route-error.tsx` and `not-found.tsx` were not compiled in a monorepo. |
| 3 | The body of `backend-standards` | 5,410 words, above the limit of 5,000 words of `skill-audit` item 6. It was 5,369 words before this change. The fix is a split of the skill, which is a decision on its scope. Not done. |
| 4 | The React Hook Form code of `recipe-form-with-mutation` step 5 | The type check and the lint pass on the code that the eval agents wrote. No browser test ran on it. The browser proof of the opt-out used a form with a plain field message. |
| 5 | A failed background refetch of a query | The screen keeps the old data and shows nothing. TkDodo backs a toast from the `QueryCache` for this. Not built, not in the standard. |
| 6 | The wait before the error page of an unexpected failed query | About 7.4 s: 3 retries of the browser, the TanStack default. Not changed. |
| 7 | The offline banner on a page that loads with no connection | Not tested. The source says that the manager "assumes an active network connection" at the start, so the banner shows only after an `offline` event. |
| 8 | A success value that looks like a failure | `orThrow` reads a value with one of the four failure statuses and a string `message` as a failure. A success value must not have that shape. No type refuses it. |
| 9 | Rule 55 of `frontend-standards` (the inner `react-error-boundary`) | Not changed and not tested. `catchError` of Next.js 16.3 was not compared with it. |
| 10 | `instrumentation.ts` with `onRequestError` | Not added. Next.js writes the `digest` in the server log (proved, test 9). An app that sends errors to a provider needs it. |
| 11 | A failure of a workflow, an MCP tool or an eve agent tool | Not in the pattern. `backend-entry-points` has no change. |
| 12 | "Two components that use one mutation show one toast" | The test passes. It is not a gain: the old hand-written `onError` also showed one toast. |
| 13 | The other lint rules of the `lint-config` assets on the whole fixture | The config of the assets reports old fixture files for other rules, because the fixture has its own scopes. The two new rules ran on their paths with the config of the assets, and on the whole fixture with the config of the fixture. |
| 14 | The eval cases of skills that this change does not touch | Their start state passes the type check and the lint with the changed fixture (b15 and b25 miss one module on purpose). Their evals did not run again. |

