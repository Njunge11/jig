---
name: state-machines
description: The rules for XState v5 state machines, in three parts. Shared, how the machine module is set up, typed and modeled, and where a state's data lives (meta, tags, description). Backend, how a server computes a transition with pure functions, runs the returned actions, and persists the snapshot. Frontend, how a React client restores that snapshot and renders from it with useSelector, matches and hasTag. Use when you add or change a state machine, a state, a transition, a guard, an action, an invoked or spawned actor, a persisted snapshot, server code that moves a machine, React code that renders a machine's state or lists the actions a user can take, or when you review a diff that touches a machine, its snapshot, or code that reads a machine's state.
---

# State machines

`references/xstate-docs-map.md` maps each slot of a machine to its XState v5 docs page and side; open it in step 1. `references/sources.md` quotes the doc line behind each rule; load it only when a rule's ground is questioned.

## Structure

One machine is one folder. The `structure` skill places it.

```
machine/<name>/
  <name>.setup.ts            ← setup({ types, actions, guards, actors, delays }); imports xstate only
  <name>.states.ts           ← one createStateConfig per state: meta, tags, description, transitions
  <name>.machine.ts          ← setup.createMachine({ id, initial, context, states })
  __tests__/
    <name>.machine.test.ts   ← every state reachable; every transition asserted
```

## Layers

```
Machine module:  setup → states → machine                      pure; no I/O, no framework import
Backend:         entry → service → transition(machine, resolveState(row.snapshot), event)
                                 → repo stores the next snapshot → service runs the returned actions
Frontend:        page reads the snapshot → useMachine(machine.provide(impl), { snapshot })
                                 → useSelector(getMeta | hasTag | matches) → view
```

Each layer calls only the next. The stored snapshot is the only record of a stage. A condition on the stage is a guard. A fact about a stage is `meta` or a tag. No status field, enum or string-keyed table carries the stage beside the machine.

## Primitives

| Primitive | Use it for | Never for |
| --- | --- | --- |
| finite state | one behavior; different behavior is a different state | data that varies inside one behavior |
| context | the machine's data, changed by `assign` | a value that decides behavior |
| event | a thing that happened; the only way in | a command that names a target |
| transition | event to target, with a guard and actions | branching in code outside the machine |
| guard | a pure boolean on context and params | a side effect or async work |
| action | a fire-and-forget side effect | async work whose result the machine needs |
| invoked actor | async work tied to one state, a known set | a dynamic set |
| spawned actor | a dynamic set of children | one known effect |
| `meta` | static data about a state a reader shows or offers | data that changes at runtime |
| tag | a group of states one check answers | one state |
| `description` | why the state exists | a rule the code needs |
| delay | a named timing in `setup` | a timer inside an action |
| `input` | starting data | data that arrives later |
| `output` | the result of a top-level final state | a mid-run value |
| `emit` | a handler outside the machine | another actor |
| snapshot | the persisted state | a derived status field |

## Who reads what

| You are | Read |
| --- | --- |
| The author or reviewer of a machine file | Part A |
| The backend builder or reviewer | Part A, Part B |
| The frontend builder or reviewer | Part A, Part C |

## Before you change anything

1. **Open the doc page for the slot you change, from the docs map.** A rule the docs do not state is not a rule. The v4 API (`Machine`, `interpret`, `withConfig`, `cond`, `send`, `state.meta`) is gone.
2. **Check the installed version against the feature's "Since XState version" line.** Pure `transition` needs 5.19, `createStateConfig` 5.21, type-bound helpers 5.22, `setup.extend` 5.24, `getNextTransitions` 5.26, `mapState` 5.31. Run `pnpm ls xstate @xstate/react` in the app.
3. **TypeScript 5.0 or newer, with `strictNullChecks` on.**

## Part A. Shared: the machine module

The machine module holds the states and the transitions. Implementations are the code they name: actions, actors, guards and delays.

### Model the states

- **Start flat and small.** Add a finite state only when the logic behaves differently in it. Nest only when states share outgoing transitions or entry and exit actions. Keep the hierarchy shallow.
- **Different behavior is a different state. Same behavior is the same state.**
- **Name a state in domain words.** `signedOut`, `signingIn`, `authenticationFailed`, never `state1` or `error`.
- **Model the workflow, with its loading and error states.**
- **A parallel state is for independent regions.** Never transition from one region into another.
- **A top-level final state terminates the actor.** It has no transitions and no exit actions. A child final state marks its parent done, and the parent's `onDone` transition is taken.

### Set up the machine

- **Create every machine with `setup({ types, actions, guards, actors, delays }).createMachine(...)`.** Put `context`, `events`, `input`, `output`, `tags` and `emitted` types in `types`.
- **Reference actions and guards as objects, `{ type, params }`, not as inline functions.** Inline functions are for prototyping. The default implementation lives in `setup`; a caller overrides it with `machine.provide` (Part B, Part C).
- **Read `params`, not `event`, inside an action or guard.** Reach for `assertEvent` only when params are infeasible.
- **Write the full transition object.** `'feedback.good': { target: 'thanks' }`, never the string shorthand.
- **Split a large machine with `createStateConfig` and the type-bound helpers.** Both carry the setup's context, event, action, guard and tag types into any file that imports the setup. Share one setup between machines with `setup.extend`.

  ```ts
  // posting.setup.ts: one setup, typed once, imports xstate only
  export const postingSetup = setup({
    types: {
      context: {} as { draftId: string | null },
      events: {} as { type: "draft.created"; draftId: string } | { type: "published" },
      tags: {} as "editable" | "live",
    },
    actions: {
      recordDraft: assign({ draftId: (_, params: { draftId: string }) => params.draftId }),
      notifyPublished: (_, _params: { draftId: string }) => {}, // each side provides this
    },
  });

  // posting.states.ts: a state config carries the setup's types
  export const review = postingSetup.createStateConfig({ tags: ["editable"], meta: { form: "review", buttons: ["publish"] } });
  export const details = postingSetup.createStateConfig({
    tags: ["editable"],
    meta: { form: "details", buttons: ["publish"] },
    description: "The recruiter fills the job details.",
    on: {
      "draft.created": {
        target: "review",
        actions: { type: "recordDraft", params: ({ event }) => ({ draftId: event.draftId }) },
      },
    },
  });

  // posting.machine.ts
  export const postingMachine = postingSetup.createMachine({ id: "posting", context: { draftId: null }, initial: "details", states: { details, review } });
  ```

### Keep a state's data on its state node

- **Static data about a state, such as what a UI shows for it, lives in that state's `meta`.** A state's `description` says why it exists.
- **A group of states is a `tag`.** `loading`, `busy`, `interactive`, `visible`. Type the tags in `setup`.
- **Read a state's data from the snapshot.** `getMeta()` returns the meta of every active state node, keyed by state node id. `hasTag(tag)` answers a group. `matches(value)` answers a state. `mapState(snapshot, mapper)` maps the active state nodes with a mapper that mirrors the state hierarchy; its state keys are validated against the machine. `getNextTransitions(state)` lists the events the machine can respond to in its current state. `can(event)` also runs the transition guards.
- **Prefer `hasTag` over `matches`.** A tag survives a rename of the state.

  ```ts
  // getMeta() is keyed by state node id; the machine is flat, so its value is the leaf name.
  const meta = snapshot.getMeta()[`posting.${snapshot.value}`];   // { form: "details", buttons: ["publish"] } | undefined
  const editable = snapshot.hasTag("editable");
  const events = getNextTransitions(snapshot).map((t) => t.eventType);
  ```

### Transitions, guards, actions

- **A guard is a pure, synchronous function that returns a boolean.** Reference it by name with params. Compose with `and`, `or`, `not`. Use `stateIn` only for parallel states, after trying to model the transition without it.
- **An event that only runs actions is a targetless transition.** A `target` on a parent's own transition re-resolves its children to their initial state. Set `reenter: true` only when the exit and entry actions must run again.
- **Context is immutable and serializable.** Change it with `assign`. Give a machine its starting data through `input` and a lazy `context` function, never a factory function around `createMachine`.
- **A built-in action creator returns an action object.** Calling `assign(...)` or `raise(...)` inside a custom action function does nothing. Use `enqueueActions` for conditional or imperative sequences.
- **An `always` transition has a `guard`, a `target`, or both.** A state entered and left by `always` in one step emits no snapshot: `matches`, `hasTag`, `subscribe` and `waitFor` never see it. Use `after: { 0: 'next' }` when the state must be observable.
- **A delay is a named entry in `setup({ delays })`.**
- **`raise` sends to self, `sendTo` sends to another actor, `emit` reaches handlers outside the machine.** Pass the parent's ref through `input` and `sendTo` it; do not use `sendParent`.
- **A wildcard `'*'` transition is the catch-all for unhandled events.** Throw in it when an unknown event must fail loudly.

### Effects are actors

- **An action is fire-and-forget.** Async work whose result the machine needs is an invoked actor with `onDone` and `onError`.
- **Invoke a known set of actors tied to a state. Spawn a dynamic set.** Prefer `spawnChild` with an `id`. When a ref is stored in context, stop the child and clear the ref together.
- **Declare actor logic under `setup({ actors })` and reference it by `src` name.** `fromPromise`, `fromCallback`, `fromTransition`, `fromObservable`, `fromEventObservable` and `createMachine` are the logic creators.

### Test the machine module

- **Arrange, act, assert.** Create the actor, send events, assert `getSnapshot().value`, `.context`, `.matches(...)` or `.hasTag(...)`.
- **Prove every state is reachable with `xstate/graph`.** `getShortestPaths` covers states, `getSimplePaths` covers transitions. Give payload events through `events`; bound a dynamic context with `stopWhen` or `limit`; ignore context with `serializeState`. Import from `xstate/graph`; `@xstate/test` is deprecated.
- **A transient state cannot be asserted through the snapshot.** Listen for `@xstate.microstep` inspection events, or change the machine to `after: { 0 }`.
- **The test file's name, layer and fakes follow the `backend-tests` skill.**

## Part B. Backend: move and persist the machine

- **Compute the next state with `initialTransition(machine, input?)` and `transition(machine, state, event)`.** They return `[nextState, actions]`, create no live actor, and execute no side effect. `getNextSnapshot` and `getInitialSnapshot` will be deprecated.
- **The returned actions are yours to run.** Custom actions come back as `{ type, params }`. Run each one through the backend's implementation after the transition is stored.
- **Persist the snapshot, restore it with `resolveState`.** `JSON.stringify(state)` on the way out, `machine.resolveState(JSON.parse(stored))` on the way in, then `transition(machine, restored, event)`. To persist only the value, store `{ value, context }` and resolve that.
- **When a live actor is needed, restore it with `createActor(machine, { snapshot }).start()`.** Actions do not run again on restore; invocations restart; spawned actors restore recursively.
- **A snapshot is JSON.** No functions, classes or other non-serializable values. A restored snapshot can be incompatible after the machine changes. When actions must replay, persist the events from `inspect` and replay them.
- **Use `getMicrosteps` when one event crosses several states.** It returns every intermediate `[snapshot, actions]`.
- **Mock an effect at the implementation.** Give `setup({ actions })` a fake action, or override it with `machine.provide`, and use `fromPromise(mockFn)` for a promise actor. Assert the outcome through the fake's record, per `backend-tests`.

  ```ts
  // One request moves one stored machine.
  const before = postingMachine.resolveState(JSON.parse(row.snapshot));
  const [after, actions] = transition(postingMachine, before, event);
  await repo.save(row.id, JSON.stringify(after));
  for (const action of actions) await runServerAction(action);   // { type: "notifyPublished", params: { draftId } }
  return { snapshot: after };
  ```

## Part C. Frontend: restore and render the machine

- **`@xstate/react` is the client.** `useActorRef` gives a stable ref that does not rerender. `useSelector(actorRef, selector, compare?)` rerenders only when the selected value changes. Define selectors outside the component. Pass `shallowEqual` when a selector returns an object. `createActorContext` provides one actor to a tree.
- **Restore a persisted snapshot with the `snapshot` option.** `useMachine(machine, { snapshot })` starts at that state.
- **Branch the view on `matches`, and prefer `hasTag` where a group serves.** In a hierarchical or parallel machine the state value is an object, so use `matches` in `if`, `switch (true)` or a ternary.
- **Provide the client's implementations with `machine.provide(...)` as the hook's first argument.** The hook keeps them up to date. No lazy machine creator, no implementations in the second argument.
- **New data reaches a running actor as an event.** A changed `input` does not restart it.
- **An optional actor is `createEmptyActor()`.** `useSelector(props.actor ?? emptyActor, ...)` answers `undefined` until the actor exists.
- **A UI test asserts what is on screen, never `snapshot.value`.** The `frontend-tests` skill owns the test rules.

  ```tsx
  import { useMachine, useSelector, shallowEqual } from "@xstate/react";
  import type { Snapshot, SnapshotFrom } from "xstate";
  import { postingMachine } from "./posting.machine";

  const selectMeta = (s: SnapshotFrom<typeof postingMachine>) => s.getMeta()[`posting.${s.value}`];
  const selectEditable = (s: SnapshotFrom<typeof postingMachine>) => s.hasTag("editable");

  function Thread({ snapshot, notify }: { snapshot: Snapshot<unknown>; notify: (draftId: string) => void }) {
    const [, send, actorRef] = useMachine(
      postingMachine.provide({ actions: { notifyPublished: (_, params) => notify(params.draftId) } }),
      { snapshot },
    );
    const meta = useSelector(actorRef, selectMeta, shallowEqual);
    const editable = useSelector(actorRef, selectEditable);
    return <DraftForm kind={meta?.form} disabled={!editable} onCreated={(draftId) => send({ type: "draft.created", draftId })} />;
  }
  ```

## Gates

Run the gates for your side before a commit. Paste the output in the proof.

1. **Every side:** the app's typecheck script exits `0`.
2. **Part A and Part B:** the backend test script exits `0`, with the machine's reachability test in it.
3. **Part C:** the frontend test script exits `0`, with a render test per view the machine drives.

## Review checklist

Reject the change if any item is true. Walk the shared items against every changed file that imports `xstate`, and the items of your side against your side's files.

### Shared

1. A rule or an API in the diff is not on the XState docs page for its slot, or needs a version newer than the installed `xstate`.
2. A machine is created without `setup`, or its implementations ride the second argument of `createMachine`.
3. An implementation is neither a default in `setup` nor an override through `machine.provide`.
4. Static data about a state, such as what a UI shows for it, lives outside that state's `meta` and `tags`, or code reads it other than through `getMeta`, `hasTag`, `matches`, `mapState` or `getNextTransitions`.
5. An action or guard is an inline function outside a prototype, or reads `event` where `params` serve.
6. A transition uses the string shorthand, or carries a `target` to its own parent state to run actions only.
7. Async work whose result the machine needs runs in an action instead of an invoked or spawned actor.
8. A built-in action creator is called inside a custom action function.
9. An `always` transition has neither `guard` nor `target`, or a test waits for a transient state through the snapshot.
10. A path test over a machine with dynamic context has no `stopWhen` and no `limit`, or a test imports `@xstate/test`.
11. A parallel region targets a state in another region.

### Backend

12. A server computes the next state with `getNextSnapshot` or `getInitialSnapshot`, or creates a live actor to compute a transition.
13. A server persists a snapshot with a non-serializable value, or restores one without `resolveState` or the `snapshot` option.
14. The actions returned by `transition` are not handled.

### Frontend

15. A React component branches on the raw `value` of a hierarchical or parallel machine instead of `matches`.
16. A React component starts the machine without the backend's snapshot, provides implementations through the hook's second argument, or passes new data through `input` instead of an event.
17. A selector returns a new object without `shallowEqual`, or is defined inside the component.
18. A UI test asserts `snapshot.value` or context instead of what is on screen.

### Every side

19. A gate in the Gates section was not run for this side, or its output is not in the proof.
