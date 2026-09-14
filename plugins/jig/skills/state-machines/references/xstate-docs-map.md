# XState docs map

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
