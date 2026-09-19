---
name: state-machines
description: The rules for XState v5 state machines, in three parts. Shared, how the machine module is set up, typed and modeled, and where a state's data lives (meta, tags, description). Backend, how a server computes a transition with pure functions, runs the returned actions, and persists the snapshot. Frontend, how a React client restores that snapshot and renders from it with useSelector, matches and hasTag. Use when you add or change a state machine, a state, a transition, a guard, an action, an invoked or spawned actor, a persisted snapshot, server code that moves a machine, React code that renders a machine's state or lists the actions a user can take, or when you review a diff that touches a machine, its snapshot, or code that reads a machine's state.
---

# State machines

The **XState docs map** section at the end of this skill maps each slot of a machine to its XState v5 docs page and side; use it in step 1. `references/sources.md` quotes the doc line behind each rule; load it only when a rule's ground is questioned.

## Structure

One machine is one folder for its setup and root, plus one states file per workflow that plugs in. The `structure` skill places them. If it is not already in your context, invoke it before you place a file.

```
machine/<name>/              ← with the owner of the conversation (an agent's machine sits in agent/machine/)
  <name>.setup.ts            ← setup({ types, actions, guards, actors, delays }); imports xstate only
  <name>.machine.ts          ← <last setup>.createMachine({ id, initial, context, states }); imports each workflow
  __tests__/
    <name>.machine.test.ts   ← every state reachable; every transition asserted
<owner>/machine/<workflow>.setup.ts    ← <base setup>.extend({ guards, actions, delays }) the workflow owns; imports the base setup
<owner>/machine/<workflow>.states.ts   ← one createStateConfig per state: meta, tags, description, transitions;
                                          a feature's workflow files live in that feature
```

The root machine is created from the last extended setup, so every base and workflow implementation is available to it. A workflow with no guards or actions of its own has no setup file and uses the base setup.

## Layers

```
Machine module:  setup → states → machine                      pure; no I/O, no framework import
Backend:         entry → service → transition(machine, machine.resolveState(row.snapshot), event)
                                 → repo stores the next snapshot → service runs the returned actions
Screen of a server-owned machine:
                 router returns the stored snapshot → machine.resolveState(stored)
                                 → getMeta | hasTag | matches → view; a user action is a request to the server
Browser-owned machine:
                 useMachine(machine.provide(impl), { snapshot }) → useSelector(getMeta | hasTag | matches) → view
```

Each layer calls only the next. The stored snapshot is the only record of a stage. No status field, enum or string-keyed table carries the stage beside the machine. One side owns the actor. When the backend moves the machine, no screen starts one, so there is never a second source of truth. The meta a screen reads names the part it draws. The `structure` skill says where that part lives and which module imports it.

## Primitives

| Primitive | Use it for | Never for |
| --- | --- | --- |
| finite state | one behavior; different behavior is a different state | data that varies inside one behavior |
| context | the extended state: the machine's data, changed by `assign` | a difference in behavior; that is a finite state |
| event | a signal, trigger or message that causes a transition | naming the target; the transition does |
| transition | event to target, with a guard and actions | branching in code outside the machine |
| guard | a pure boolean on context and params | a side effect or async work |
| action | a fire-and-forget side effect | async work whose result the machine needs |
| invoked actor | async work tied to one state, a known set | a dynamic set |
| spawned actor | a dynamic set of children | one known effect |
| `meta` | static data about a state a reader shows or offers | data that changes at runtime |
| tag | a group of states one check answers, such as `loading` | — |
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
2. **Check the installed version against the feature's "Since XState version" line.** `createStateConfig` needs 5.21, type-bound helpers 5.22, `setup.extend` 5.24, `getNextTransitions` 5.26, `mapState` 5.31. Run `pnpm ls xstate @xstate/react` in the app.
3. **TypeScript 5.0 or newer, with `strictNullChecks` on.**

## Part A. Shared: the machine module

The machine module holds the states and the transitions. Implementations are the code they name: actions, actors, guards and delays.

### Model the states

- **Start flat and small.** Add a finite state only when the logic behaves differently in it. Nest only when states share outgoing transitions or entry and exit actions. Keep the hierarchy shallow.
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

- **The owner of the actor decides the client.** When the backend moves the machine (Part B), the screen never creates an actor and never sends it an event. It resolves the stored snapshot with `machine.resolveState(stored)` and reads `getMeta`, `hasTag` and `matches` on the result. A user action goes to the server, which answers with the next stored snapshot. One reader module does the resolve and the reads for every screen. The rest of Part C is for a machine the browser owns.
- **`@xstate/react` is the client of a browser-owned machine.** `useActorRef` gives a stable ref that does not rerender. `useSelector(actorRef, selector, compare?)` rerenders only when the selected value changes. Define selectors outside the component. Pass `shallowEqual` when a selector returns an object. `createActorContext` provides one actor to a tree.
- **Restore a persisted snapshot with the `snapshot` option.** `useMachine(machine.provide(impl), { snapshot })` starts at that state.
- **Branch the view on `matches`, and prefer `hasTag` where a group serves.** In a hierarchical or parallel machine the state value is an object, so use `matches` in `if`, `switch (true)` or a ternary.
- **Provide the client's implementations with `machine.provide(...)` as the hook's first argument.** The hook keeps them up to date. No lazy machine creator, no implementations in the second argument.
- **New data reaches a running actor as an event.** A changed `input` does not restart it.
- **An optional actor is `createEmptyActor()`.** `useSelector(props.actor ?? emptyActor, ...)` answers `undefined` until the actor exists.
- **A UI test asserts what is on screen, never `snapshot.value`.** The `frontend-tests` skill owns the test rules.

  A browser-owned machine, a wizard whose snapshot the browser keeps (the page reads it from its own store and passes it in):

  ```tsx
  import { useMachine, useSelector, shallowEqual } from "@xstate/react";
  import type { Snapshot, SnapshotFrom } from "xstate";
  import { wizardMachine } from "./wizard.machine";

  const selectMeta = (s: SnapshotFrom<typeof wizardMachine>) => s.getMeta()[`wizard.${s.value}`];
  const selectEditable = (s: SnapshotFrom<typeof wizardMachine>) => s.hasTag("editable");

  function Wizard({ snapshot, notify }: { snapshot: Snapshot<unknown> | undefined; notify: (step: string) => void }) {
    const [, send, actorRef] = useMachine(
      wizardMachine.provide({ actions: { notifyStepDone: (_, params) => notify(params.step) } }),
      { snapshot },
    );
    const meta = useSelector(actorRef, selectMeta, shallowEqual);
    const editable = useSelector(actorRef, selectEditable);
    return <StepForm kind={meta?.form} disabled={!editable} onDone={(values) => send({ type: "step.done", values })} />;
  }
  ```

## Common failures

- **`actor.send('start')` fails to type-check.** An event is an object: `actor.send({ type: 'start' })`.
- **A subscriber added after `start()` sees nothing until the next event.** Subscribing does not emit the current snapshot. Read `actor.getSnapshot()` first.

## Gates

Run the gates for your side before a commit. Paste the output in the proof.

1. **Every side:** the app's typecheck script exits `0`.
2. **Part A and Part B:** the backend test script exits `0`, with the machine's reachability test in it.
3. **Part C:** the frontend test script exits `0`, with a render test per view the machine drives.

## Review checklist

Reject the change if any item is true. Walk the Shared items against every changed file that imports `xstate` and every file under a `machine/` folder. Walk the items of your side against your side's files. Then run the Gates of your side; a gate not run, or whose output is not in the proof, rejects the change.

### Shared

1. A rule or an API in the diff is not on the XState docs page for its slot. Or it needs a version newer than the installed `xstate`.
2. A machine is created without `setup`, or its implementations ride the second argument of `createMachine`.
3. An implementation is neither a default in `setup` nor an override through `machine.provide`.
4. Static data about a state, such as what a UI shows for it, lives outside that state's `meta` and `tags`. Or code reads it other than through `getMeta`, `hasTag`, `matches`, `mapState` or `getNextTransitions`.
5. An action or guard is an inline function outside a prototype, or reads `event` where `params` serve.
6. A transition uses the string shorthand, or carries a `target` to its own parent state to run actions only.
7. Async work whose result the machine needs runs in an action instead of an invoked or spawned actor.
8. A built-in action creator is called inside a custom action function.
9. An `always` transition has neither `guard` nor `target`, or a test waits for a transient state through the snapshot.
10. A path test over a machine with dynamic context has no `stopWhen` and no `limit`, or a test imports `@xstate/test`.
11. A parallel region targets a state in another region.
12. A machine's files are not laid out as the Structure section shows. The setup and the root machine sit in `machine/<name>/` with the owner of the conversation. Each workflow's states file sits in the folder of the feature that owns it. It gets a `<workflow>.setup.ts` extension only when the workflow owns guards, actions or delays. No states file holds two workflows.

### Backend

13. A server computes the next state with `getNextSnapshot` or `getInitialSnapshot`, or creates a live actor to compute a transition.
14. A server persists a snapshot with a non-serializable value, or restores one without `resolveState` or the `snapshot` option.
15. The actions returned by `transition` are not handled.

### Frontend

16. A React component branches on the raw `value` of a hierarchical or parallel machine instead of `matches`.
17. A screen of a server-owned machine creates an actor (`useMachine`, `useActorRef`, `createActor`) or sends an event to one. It must resolve the stored snapshot with `resolveState` and read it.
18. A browser-owned machine starts without its persisted snapshot when one exists. Or it provides implementations through the hook's second argument, or passes new data through `input` instead of an event.
19. A selector returns a new object without `shallowEqual`, or is defined inside the component.
20. A UI test asserts `snapshot.value` or context instead of what is on screen.

## XState docs map

Each slot in a machine, a server that moves it, or a client that renders it has one doc page. The Side column says who owns the slot: `shared` is the machine module (Part A), `backend` is Part B, `frontend` is Part C. Open the page before you change the slot. Every page lives under `https://stately.ai/docs/<page>`. The pages are the XState v5 docs; the version line at the top of a section says when a feature arrived.

| Slot | Side | Page | Section |
| --- | --- | --- | --- |
| Which states to model, how to name them | shared | `finite-states` | "Best practices for modeling finite states" |
| When to nest states | shared | `parent-states` | "Best Practices" |
| Independent regions | shared | `parallel-states` | "Best Practices" |
| A state that ends the machine or its parent | shared | `final-states` | "Top-level final states", "Child final states" |
| `setup({ types, actions, guards, actors, delays })` | shared | `setup` | whole page |
| Types for context, events, input, output, tags, emitted | shared | `typescript` | "Specifying types" |
| tsconfig settings | shared | `typescript` | "Set up your tsconfig.json file" |
| Type-bound `createAction`, `assign`, `raise`, `emit`, `sendTo` | shared | `machines` | "Type-bound action helpers" |
| `createStateConfig` for a state in its own file | shared | `machines` | "Modularizing states" |
| `setup.extend` | shared | `setup` | "Extending setup" |
| `meta` on a state node | shared | `finite-states` | "Meta" |
| `description` on a state or transition | shared | `states` | "State descriptions"; `transitions` "Transition descriptions" |
| `tags` on a state node | shared | `tags` | whole page |
| `snapshot.getMeta()`, `hasTag`, `matches`, `can` | shared | `states` | the section named after the method |
| `mapState(snapshot, mapper)` | shared | `states` | "mapState(snapshot, mapper)" |
| `getNextTransitions(state)` | shared | `machines` | "Next transitions" |
| Transition object, shorthand, selection order | shared | `transitions` | "Transitions and events", "Shorthands" |
| Self-transition, `reenter` | shared | `transitions` | "Self-transitions", "Re-entering" |
| Wildcard `*`, partial wildcard | shared | `transitions` | "Wildcard transitions", "Partial wildcard transitions" |
| Guard, `and`, `or`, `not`, `stateIn` | shared | `guards` | whole page |
| Action objects, params, entry, exit | shared | `actions` | "Entry and exit actions", "Dynamic action parameters" |
| `assign`, `raise`, `sendTo`, `emit`, `log`, `cancel`, `stopChild`, `spawnChild` | shared | `actions` | "Built-in actions" and the section named after the action |
| `enqueueActions` | shared | `actions` | "Enqueue actions" |
| `context`, lazy context | shared | `context` | whole page |
| `input` | shared | `input` | whole page |
| `always` transitions | shared | `eventless-transitions` | whole page |
| `after` transitions, named delays | shared | `delayed-transitions` | "Referenced delays", "Testing" |
| Invoke an actor, `onDone`, `onError`, `onSnapshot` | shared | `invoke` | whole page |
| Spawn an actor, `spawnChild` | shared | `spawn` | whole page |
| Actor logic creators: `fromPromise`, `fromCallback`, `fromTransition`, `fromObservable`, `fromEventObservable` | shared | `actors` | "Actor logic creators"; `promise-actors`, `callback-actors`, `transition-actors`, `observable-actors` |
| `emit` and `actor.on` | shared | `event-emitter` | whole page |
| `systemId`, `system.get` | backend | `system` | whole page |
| `inspect` option, `@xstate.microstep` | backend | `inspection` | whole page |
| `output` of a machine | shared | `output` | whole page |
| Pure `transition`, `initialTransition`, `getMicrosteps` | backend | `pure-transitions` | whole page |
| Persist and restore a snapshot | backend | `persistence` | whole page |
| `useMachine`, `useActorRef`, `useSelector`, `createActorContext` | frontend | `xstate-react` | the section named after the hook |
| Render from `matches` | frontend | `xstate-react` | "Matching states" |
| Restore a snapshot in React | frontend | `xstate-react` | "Persisted and rehydrated State" |
| Arrange, act, assert; mocking | shared | `testing` | "Testing logic", "Mocking effects" |
| Path generation, `createTestModel` | shared | `xstate-graph` | whole page |
| v4 to v5 renames | shared | `migration` | whole page |
| One-page reminder of every API | shared | `cheatsheet` | whole page |
