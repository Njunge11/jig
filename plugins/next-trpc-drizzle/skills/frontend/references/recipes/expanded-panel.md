# Recipe: Expanded and fullscreen panels

Use this recipe when a panel offers a maximize/expand mode — an
editor, a preview, a chat panel, a side workspace. One mechanism,
one shared component — codebases accrete one implementation per
surface and pay for every divergence.

## The mechanism

Expansion is **layout reallocation, not an overlay**. The panel
stays mounted and in document flow; expanding swaps the layout
classes at the nearest container that holds the panel and its
siblings — the panel's slot grows, siblings shrink or hide. No
portal, no `position: fixed` takeover, no second copy of the
content.

Why: an overlay re-renders the content in a different tree, so an
editor loses its draft and a chat loses its scroll on every
toggle; and a portaled takeover re-introduces the
overlay-vs-page event problems that rules 62–63 exist for.

## Build order

1. **One `expanded` boolean, one owner.** The panel owns it;
   move it to the URL only when the mode should survive reload
   and be shareable. Never a flag spread across three conditions.

2. **Reallocate at the container.** The parent lays out panel +
   siblings; `expanded` swaps its classes:

   ```tsx
   <div className="flex min-h-0 flex-1">
     <main className={cn("min-w-0 flex-1", expanded && "hidden")}>
       …page content…
     </main>
     <aside className={cn("w-[430px] shrink-0", expanded && "w-full")}>
       <EditorPanel />  {/* SAME component, both modes */}
     </aside>
   </div>
   ```

   The content component appears exactly once in the tree. Only
   container classes change between modes.

3. **The toggle** is an icon button in the panel's header:
   `aria-label="Expand panel"` / `"Collapse panel"`,
   `aria-expanded={expanded}`. `Escape` collapses — one `keydown`
   listener the panel owns while expanded (its external system is
   the DOM keyboard).

4. **Extract the shell once.** The first expandable panel becomes
   the app's one compound component
   (`Panel`/`PanelHeader`/`PanelExpandToggle`/`PanelBody`, per
   `references/authoring-custom.md`); the second surface reuses
   it. Never a second implementation.

5. **Responsive:** below `lg`, the docked mode usually cannot
   share the row — the panel becomes the whole width and the
   expand toggle disappears (there is nothing more to take).
   State the `md:` behavior deliberately.

## Don't — common failures

- Don't invent a per-surface mechanism — a boolean flipping class
  strings in one editor, a reducer + overlay in a wizard, a
  context toggle in a third surface. That road ends at four
  implementations and zero shared.
- Don't render a different tree for the expanded mode — an
  overlay that remounts the content kills drafts and scroll
  positions on every toggle.
- Don't gate rendering on stacked flags
  (`previewOpen && isFullscreen && isVisible`) — one boolean,
  one owner.
- Don't portal or `position: fixed` the expanded mode over the
  page.
- Don't leave Escape unhandled in an expanded mode.

## Verify

- [ ] The content component mounts once; typed text and scroll
      position survive expand → collapse → expand.
- [ ] No portal, `position: fixed`, or overlay in the expansion
      path; the DOM parent does not change between modes.
- [ ] One `expanded` boolean with one owner; in the URL only if
      the mode must survive reload.
- [ ] The toggle carries `aria-label` and `aria-expanded`;
      Escape collapses.
- [ ] The app has ONE expandable-panel shell; this surface
      reuses it.
- [ ] The below-`lg` behavior is stated and built.
