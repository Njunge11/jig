---
name: state-machines
description: The rules for XState v5 state machines, in three parts. Shared, how the machine module is set up, typed and modeled, and where a state's data lives (meta, tags, description). Backend, how a server computes a transition with pure functions, runs the returned actions, and persists the snapshot. Frontend, how a React client restores that snapshot and renders from it with useSelector, matches and hasTag. Every rule cites a page of the XState docs. Use when you add or change a state machine, a state, a transition, a guard, an action, an invoked or spawned actor, a persisted snapshot, server code that moves a machine, React code that renders a machine's state or lists the actions a user can take, or when you review a diff that touches a machine, its snapshot, or code that reads a machine's state.
---

# State machines

Every rule cites a page of the XState v5 docs. A page name is the last segment of `https://stately.ai/docs/<page>`. `references/xstate-docs-map.md` maps each slot to its page and side; open it in step 1. `references/sources.md` quotes the doc line behind each rule; load it only when a rule's ground is questioned.

## Who reads what

One machine module serves two sides.

| You are | Read |
| --- | --- |
| The author or reviewer of a machine file | Part A |
| The backend builder or reviewer | Part A, Part B |
| The frontend builder or reviewer | Part A, Part C |

## Before you change anything

1. **Open the doc page for the slot you change, from the docs map.** A rule the docs do not state is not a rule. The v4 API (`Machine`, `interpret`, `withConfig`, `cond`, `send`, `state.meta`) is gone. Source: `migration`.
2. **Check the installed version against the feature's "Since XState version" line.** Pure `transition` needs 5.19, `createStateConfig` 5.21, type-bound helpers 5.22, `setup.extend` 5.24, `getNextTransitions` 5.26, `mapState` 5.31. Run `pnpm ls xstate @xstate/react` in the app. Source: `machines`, `states`, `setup`.
3. **TypeScript 5.0 or newer, with `strictNullChecks` on.** Source: `typescript` § "Set up your tsconfig.json file".

## Part A. Shared: the machine module

The machine module imports `xstate` only. Each side provides its own implementations. Source: `setup`; `migration` § "Use machine.provide() instead of machine.withConfig()".

### Model the states

- **Start flat and small.** Add a finite state only when the logic behaves differently in it. Nest only when states share outgoing transitions or entry and exit actions. Keep the hierarchy shallow. Source: `finite-states` § "Start simple and shallow"; `parent-states` § "Start Flat, Then Nest" and § "Common Patterns for Parent States".
- **Different behavior is a different state. Same behavior is the same state.** Source: `finite-states` § "Identify distinct behaviors".
- **Name a state in domain words.** `signedOut`, `signingIn`, `authenticationFailed`, never `state1` or `error`. Source: `finite-states` § "Name states clearly".
- **Model the workflow, with its loading and error states.** Source: `finite-states` § "Model user workflows".
- **A parallel state is for independent regions.** Never transition from one region into another. Source: `parallel-states` § "Best Practices".
- **A top-level final state terminates the actor.** It has no transitions and no exit actions. A child final state marks its parent done, and the parent's `onDone` transition is taken. Source: `final-states`; `actions` § "Entry and exit actions".

### Set up the machine

- **Create every machine with `setup({ types, actions, guards, actors, delays }).createMachine(...)`.** Put `context`, `events`, `input`, `output`, `tags` and `emitted` types in `types`. Named sources are guaranteed to exist, and `send`, `matches` and `hasTag` become type safe. Source: `setup`; `typescript` § "Specifying types"; `tags` § "Tags and TypeScript".
- **Name every action, guard, actor and delay.** The shared module declares the name and its params type. It may hold a pure implementation, such as `assign`. A side effect that only one side can run is provided by that side with `machine.provide` (Part B, Part C). Source: `setup`; `actions` § "Inline actions"; `migration` § "Use machine.provide() instead of machine.withConfig()".
- **Read `params`, not `event`, inside an action or guard.** Reach for `assertEvent` only when params are infeasible. Source: `actions` § "Dynamic action parameters"; `typescript` § "Dynamic parameters" and § "Asserting events".
- **Write the full transition object.** `'feedback.good': { target: 'thanks' }`, never the string shorthand. Source: `transitions` § "Shorthands".
- **Split a large machine with `createStateConfig` and the type-bound helpers.** Both keep the setup's types in any file that imports the setup. Share one setup between machines with `setup.extend`. Source: `machines` § "Modularizing states" and § "Type-bound action helpers"; `setup` § "Extending setup".

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
  ```

### Keep a state's data on its state node

- **Static data about a state, such as what a UI shows for it, lives in that state's `meta`.** A state's `description` says why it exists. Source: `finite-states` § "Meta" and § "Document state purpose"; `states` § "State descriptions".
- **A group of states is a `tag`.** `loading`, `busy`, `interactive`, `visible`. Type the tags in `setup`. Source: `tags`; `finite-states` § "Group related functionality".
- **Both sides read a state's data from the snapshot, never from a table beside the machine.** `getMeta()` answers every active node's meta, keyed by state id. `hasTag(tag)` answers a group. `matches(value)` answers a state. `mapState(snapshot, mapper)` maps the active nodes with a mapper that mirrors the hierarchy and is type checked against it. `getNextTransitions(state)` lists the events the state can respond to, for a UI that shows the available actions. `can(event)` runs the guards for one event. A table keyed by state names gets no type check. Source: `states` § "state.getMeta()", § "state.hasTag(tag)", § "state.matches(stateValue)", § "mapState(snapshot, mapper)", § "state.can(eventType)"; `machines` § "Next transitions".
- **Prefer `hasTag` over `matches`.** A tag survives a rename of the state. Source: `states` § "state.hasTag(tag)".

  ```ts
  // Either side. Nothing is keyed by a state-name string.
  const meta = Object.values(snapshot.getMeta())[0];      // { form: "details", buttons: ["publish"] }
  const editable = snapshot.hasTag("editable");
  const events = getNextTransitions(snapshot).map((t) => t.eventType);
  ```

### Transitions, guards, actions

- **A guard is a pure, synchronous function that returns a boolean.** Reference it by name with params. Compose with `and`, `or`, `not`. Use `stateIn` only for parallel states, after trying to model the transition without it. Source: `guards`.
- **An event that only runs actions is a targetless transition.** A `target` on a parent's own transition re-resolves its children to their initial state. Set `reenter: true` only when the exit and entry actions must run again. Source: `transitions` § "Self-transitions" and § "Re-entering".
- **Context is immutable and serializable.** Change it with `assign`. Give a machine its starting data through `input` and a lazy `context` function, never a factory function around `createMachine`. Source: `context`; `input` § "Use-cases"; `persistence` § "Caveats".
- **A built-in action creator returns an action object.** Calling `assign(...)` or `raise(...)` inside a custom action function does nothing. Use `enqueueActions` for conditional or imperative sequences. Source: `actions` § "Built-in actions" and § "Enqueue actions".
- **An `always` transition has a `guard`, a `target`, or both.** A state entered and left by `always` in one step emits no snapshot: `matches`, `hasTag`, `subscribe` and `waitFor` never see it. Use `after: { 0: 'next' }` when the state must be observable. Source: `eventless-transitions` § "Avoid infinite loops" and § "Observability and transient states".
- **A delay is a named entry in `setup({ delays })`.** Source: `delayed-transitions` § "Referenced delays".
- **`raise` sends to self, `sendTo` sends to another actor, `emit` reaches handlers outside the machine.** Pass the parent's ref through `input` and `sendTo` it; do not use `sendParent`. Source: `actions` § "Raise action", § "Send-to action", § "Send-parent action"; `event-emitter`.
- **A wildcard `'*'` transition is the catch-all for unhandled events.** Throw in it when an unknown event must fail loudly. Source: `transitions` § "Wildcard transitions"; `migration` § "Use wildcard * transitions, not strict mode".

### Effects are actors

- **An action is fire-and-forget.** Async work whose result the machine needs is an invoked actor with `onDone` and `onError`. Source: `invoke` § "How are actors different from actions?".
- **Invoke a known set of actors tied to a state. Spawn a dynamic set.** Prefer `spawnChild` with an `id`. When a ref is stored in context, stop the child and clear the ref together. Source: `actors` § "Invoking and spawning actors"; `spawn` § "Best Practices".
- **Declare actor logic under `setup({ actors })` and reference it by `src` name.** `fromPromise`, `fromCallback`, `fromTransition`, `fromObservable`, `fromEventObservable` and `createMachine` are the logic creators. Source: `invoke` § "Source"; `migration` § "Use actor logic creators for invoke.src instead of functions".

### Test the machine module

- **Arrange, act, assert.** Create the actor, send events, assert `getSnapshot().value`, `.context`, `.matches(...)` or `.hasTag(...)`. Source: `testing` § "Testing logic"; `actors` § "Testing".
- **Prove every state is reachable with `xstate/graph`.** `getShortestPaths` covers states, `getSimplePaths` covers transitions. Give payload events through `events`; bound a dynamic context with `stopWhen` or `limit`; ignore context with `serializeState`. Import from `xstate/graph`; `@xstate/test` is deprecated. Source: `xstate-graph`; `testing` § "Using @xstate/test".
- **A transient state cannot be asserted through the snapshot.** Listen for `@xstate.microstep` inspection events, or change the machine to `after: { 0 }`. Source: `testing` § "Testing machines with eventless transitions".
- **Delays run on a simulated clock in tests.** `xstate` exports `SimulatedClock`. Source: `delayed-transitions` § "Testing".
- **The test file's name, layer and fakes follow the `backend-tests` skill.**

## Part B. Backend: move and persist the machine

One request restores the stored snapshot, computes one transition, stores it, runs the returned actions, and answers the snapshot.

- **Compute the next state with `initialTransition(machine, input?)` and `transition(machine, state, event)`.** They return `[nextState, actions]`, create no live actor, and execute no side effect. `getNextSnapshot` and `getInitialSnapshot` will be deprecated. Source: `pure-transitions`; `transitions` § "Determining the next state".
- **The returned actions are yours to run.** Custom actions come back as `{ type, params }`. Run each one through the backend's implementation after the transition is stored. Source: `pure-transitions` § "Actions".
- **Persist the snapshot, restore it with `resolveState`.** `JSON.stringify(state)` on the way out, `machine.resolveState(JSON.parse(stored))` on the way in, then `transition(machine, restored, event)`. To persist only the value, store `{ value, context }` and resolve that. Source: `pure-transitions` § "Resolving Persisted State"; `persistence` § "Persisting state machine values".
- **Answer the client with the persisted snapshot.** The client restores it with the `snapshot` option (Part C). Source: `persistence` (opening paragraph); `xstate-react` § "Persisted and rehydrated State".
- **When a live actor is needed, restore it with `createActor(machine, { snapshot }).start()`.** Actions do not run again on restore; invocations restart; spawned actors restore recursively. Source: `persistence` § "Restoring state" and § "Deep persistence".
- **A snapshot is JSON.** No functions, classes or dates that do not serialize. A restored snapshot can be incompatible after the machine changes. When actions must replay, persist the events from `inspect` and replay them. Source: `persistence` § "Caveats" and § "Event sourcing".
- **Use `getMicrosteps` when one event crosses several states.** It returns every intermediate `[snapshot, actions]`. Source: `pure-transitions` § "Microsteps".
- **Mock an effect at the implementation.** Give `machine.provide({ actions })` a fake action, and `fromPromise(mockFn)` for a promise actor. Assert the outcome through the fake's record, per `backend-tests`. Source: `testing` § "Mocking effects".

  ```ts
  // One request moves one stored machine.
  const before = postingMachine.resolveState(JSON.parse(row.snapshot));
  const [after, actions] = transition(postingMachine, before, event);
  await repo.save(row.id, JSON.stringify(after));
  for (const action of actions) await runServerAction(action);   // { type: "notifyPublished", params: { draftId } }
  return { snapshot: after };
  ```

### Backend failures

- **A route computes the state with `getNextSnapshot`.** It will be deprecated. Use `transition`. Source: `transitions` § "Determining the next state".
- **An action ran on the server that the client already ran.** The server executed the returned actions with client-only implementations. Each side runs only the implementations it provides. Source: `pure-transitions` § "Actions"; `migration` § "Use machine.provide()".
- **`JSON.stringify` drops a context field.** A function or class sits in context. Keep context serializable. Source: `persistence` § "Caveats".
- **A restored actor did not send its email.** Actions do not re-run on restore. Persist and replay events instead. Source: `persistence` § "Caveats".

## Part C. Frontend: restore and render the machine

The client restores the snapshot the backend answered, renders from it, and sends events.

- **`@xstate/react` is the client.** `useActorRef` gives a stable ref that does not rerender. `useSelector(actorRef, selector, compare?)` rerenders only when the selected value changes. Define selectors outside the component. Pass `shallowEqual` when a selector returns an object. `createActorContext` provides one actor to a tree. Source: `xstate-react` § "useActorRef", § "useSelector", § "Shallow comparison", § "createActorContext".
- **Restore the backend's snapshot with the `snapshot` option.** `useMachine(machine, { snapshot })` starts at that state, not at the machine's initial state. Source: `xstate-react` § "Persisted and rehydrated State".
- **Branch the view on `matches`, `hasTag` or `getMeta`.** Nested values are objects, so use `matches` in `if`, `switch (true)` or a ternary. Never compare `snapshot.value` to a string. Source: `xstate-react` § "Matching states"; `states`.
- **Provide the client's implementations with `machine.provide(...)` as the hook's first argument.** The hook keeps them up to date. No lazy machine creator, no implementations in the second argument. Source: `xstate-react` § "useMachine"; `migration` § "Use machine.provide() to provide implementations in hooks".
- **New data reaches a running actor as an event.** A changed `input` does not restart it. Source: `input` § "Passing new data to an actor".
- **An optional actor is `createEmptyActor()`.** `useSelector(props.actor ?? emptyActor, ...)` answers `undefined` until the actor exists. Source: `actors` § "Empty actors".
- **A UI test asserts what is on screen, never `snapshot.value`.** The `frontend-tests` skill owns the test rules.

  ```tsx
  const selectMeta = (s: SnapshotFrom<typeof postingMachine>) => Object.values(s.getMeta())[0];
  const selectEditable = (s: SnapshotFrom<typeof postingMachine>) => s.hasTag("editable");

  function Thread({ snapshot }: { snapshot: Snapshot<unknown> }) {
    const [, send, actorRef] = useMachine(
      postingMachine.provide({ actions: { notifyPublished: (_, params) => toast(params.draftId) } }),
      { snapshot },
    );
    const meta = useSelector(actorRef, selectMeta, shallowEqual);
    const editable = useSelector(actorRef, selectEditable);
    return <Form kind={meta.form} disabled={!editable} onSubmit={(e) => send(e)} />;
  }
  ```

### Frontend failures

- **A component rerenders on every snapshot.** Its selector returns a new object each time. Return a primitive, or pass `shallowEqual`. Source: `xstate-react` § "Shallow comparison".
- **`actor.send('start')` throws a type error.** Events are objects: `actor.send({ type: 'start' })`. Source: `migration` § "actor.send() no longer accepts string types".
- **A subscriber added after `start()` saw nothing.** Subscribing does not emit the current snapshot. Read `actor.getSnapshot()`. Source: `migration` § "Use actor.getSnapshot() to get actor's state".
- **The view shows the initial state although the server is further on.** The hook was called without the `snapshot` option. Source: `xstate-react` § "Persisted and rehydrated State".

## Shared failures

- **`assign` inside a custom action changes nothing.** It returned an action object no one interpreted. Move it to `actions: [assign(...)]` or `enqueueActions`. Source: `actions` § "Built-in actions".
- **A parent's transition reset its children.** The transition has `target: 'parent'`. Remove the target. Source: `transitions` § "Self-transitions with a target and child states".
- **`hasTag` or `matches` is never true for a state the machine passed through.** The state is transient. Use `after: { 0 }` or the microstep inspector. Source: `eventless-transitions` § "Observability and transient states".
- **`getShortestPaths` never returns.** The context makes the state space infinite. Add `stopWhen` or `limit`. Source: `xstate-graph` § "Working with context".

## Gates

Run the gates for your side before a commit. Paste the output in the proof.

1. **Every side:** the app's typecheck script exits `0`. A renamed state fails here through the `setup` types. Source: `setup`; `finite-states` § "Finite states and TypeScript".
2. **Part A and Part B:** the backend test script exits `0`, with the machine's reachability test in it.
3. **Part C:** the frontend test script exits `0`, with a render test per view the machine drives.

## Review checklist

Reject the change if any item is true. Walk the shared items against every changed file that imports `xstate`, and the items of your side against your side's files.

### Shared

1. A rule or an API in the diff is not on the XState docs page for its slot, or needs a version newer than the installed `xstate`.
2. A machine is created with bare `createMachine`, or its implementations ride the second argument of `createMachine` instead of `setup`.
3. The machine module imports something only one side can run, such as a database client or a React hook.
4. A state's UI data, group membership or available actions live in a table keyed by state-name strings outside the machine, instead of `meta`, `tags` and `description` read through `getMeta`, `hasTag`, `matches`, `mapState` or `getNextTransitions`.
5. An action or guard is an inline function outside a prototype, or reads `event` where `params` serve.
6. A transition uses the string shorthand, or carries a `target` to its own parent state to run actions only.
7. Async work whose result the machine needs runs in an action instead of an invoked or spawned actor.
8. A built-in action creator is called inside a custom action function.
9. An `always` transition has neither `guard` nor `target`, or a test waits for a transient state through the snapshot.
10. A path test over a machine with dynamic context has no `stopWhen` and no `limit`, or a test imports `@xstate/test`.
11. A parallel region targets a state in another region.

### Backend

12. A server computes the next state with `getNextSnapshot` or `getInitialSnapshot`, or starts a long-lived actor inside a request.
13. A server persists a snapshot with a non-serializable value, or restores one without `resolveState` or the `snapshot` option.
14. A server runs a returned action with an implementation the client provides, or drops a returned action without running it.

### Frontend

15. A React component branches on the raw `value` string of a nested state, or keeps its own table of states.
16. A React component starts the machine without the backend's snapshot, provides implementations through the hook's second argument, or passes new data through `input` instead of an event.
17. A selector returns a new object without `shallowEqual`, or is defined inside the component.
18. A UI test asserts `snapshot.value` or context instead of what is on screen.

### Every side

19. A gate in the Gates section was not run for this side, or its output is not in the proof.
