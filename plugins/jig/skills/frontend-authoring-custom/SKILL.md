# Authoring a custom component (rare)

Only when shadcn genuinely lacks the component AND you were told to
build custom. These are the components.build patterns, stated as
build instructions. Doc links: [`sources.md`](sources.md).

## Building the component's skeleton

- One exported component wraps one element. A wrapper that renders two
  elements blocks per-part styling and forces prop drilling — split it.
- Build the compound pattern: a `Root` container owns shared state in
  Context; named parts read it. `Root` extends the native attributes of
  its element.
- Name parts with the standard vocabulary: `Root`, `Item`, `Trigger`
  (initiates the action), `Content` (the shown/hidden body),
  `Header`/`Body`/`Footer`, `Title`, `Description`.
- `Trigger` renders a `button` by default, handles the click, manages
  focus, and carries the ARIA wiring (`aria-expanded`,
  `aria-controls`). `Content` renders conditionally and carries its
  ARIA attributes.

## Typing the props

- Extend the wrapped element:
  `type CardProps = React.ComponentProps<"div"> & { … }`.
- Export every prop type, named `<ComponentName>Props`.
- Spread props last, so callers can override:

```tsx
// Wrong: caller's className is discarded
<div {...props} className="border p-4" />

// Right: caller wins
<div className={cn("border p-4", className)} {...rest} />
```

- Do not use prop names that collide with HTML attributes: `heading`,
  not `title`, on a div-based component.
- Document each custom prop with JSDoc, including `@default`.

## asChild

- Implement with Radix `Slot`: `const Comp = asChild ? Slot : "button"`.
  Slot clones the child, merges className/data-attributes, composes
  event handlers, and forwards refs.
- The child must be exactly one element, not a Fragment, and it must
  spread its props — a child that drops props loses the trigger
  behavior.
- Nesting rule: a button cannot contain a button. `asChild` exists so
  `<Trigger asChild><a href>…</a></Trigger>` renders one merged
  element, not a wrapper pair.
- When the swapped element is not natively interactive, add the
  semantics back: role, keyboard handling, accessible name.
- Choose `asChild` over an `as` prop when composing with other
  components or when refs/props must merge; a plain `as` prop is
  acceptable only for simple element switching. Never create the
  rendered component type inside render — keep it a stable reference.

## State

- Support controlled and uncontrolled with `useControllableState`:
  `value` + `onValueChange` for controlled callers, `defaultValue` for
  uncontrolled — those exact names. Call `onValueChange` on every
  change.
- Expose state for styling as `data-state` with the Radix vocabulary:
  `open`/`closed`, `active`/`inactive`, `on`/`off`, plus `data-side`,
  `data-orientation`, `data-disabled` where they apply.
- Give every part `data-slot`, kebab-case, named by purpose:
  `data-slot="submit-button"`, never `blueButton` or a generic
  `button`.
- Decision line: props carry variants, sizes, and behavior;
  `data-state` carries interaction state for styling; `data-slot`
  carries identity for parent targeting. Never add a per-state
  className prop.

## Accessibility — yours to implement

- Semantic HTML first. Use ARIA to enhance, never to replace; do not
  change native semantics unless necessary; never hide a focusable
  element from assistive technology.
- Declare and implement the keyboard map before shipping: Tab order;
  ArrowUp/ArrowDown (or Left/Right) plus Home/End for list-like parts;
  Enter/Space activates; Escape dismisses.
- Focus management: set initial focus on open; roving tabindex
  (`0` active, `-1` others) for composite widgets; trap focus in modal
  surfaces; return focus to the trigger on close.
- Modal surfaces: `role="dialog"` + `aria-modal="true"` +
  `aria-labelledby` pointing at the title.
- Form parts: `<label htmlFor>`; `aria-invalid` + `aria-errormessage`
  on errors, with the error text in `role="alert"`;
  `<fieldset>`/`<legend>` for groups.
- Async status announces itself: `role="status"` +
  `aria-live="polite"` for progress, `role="alert"` for errors,
  `aria-busy="true"` while loading.
- Contrast: 4.5:1 for normal text, 3:1 for large text and non-text
  indicators.
