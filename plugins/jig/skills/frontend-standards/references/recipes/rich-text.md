# Recipe: Rich text editing (Lexical)

Use this recipe for any rich text surface — a description editor,
an email composer, an editable document. Library: `lexical` +
`@lexical/react` (install if missing).

## Build order

1. **One editor component per app.** Build a kit-level compound
   `RichTextEditor` once: its Root owns the `LexicalComposer` and
   `initialConfig` (`namespace`, `theme`, `onError`, `nodes`);
   its children are the plugin stack. A new surface composes
   plugins — it never builds a second editor:

   ```tsx
   <LexicalComposer initialConfig={initialConfig}>
     <RichTextPlugin
       contentEditable={<ContentEditable />}
       ErrorBoundary={LexicalErrorBoundary}
     />
     <HistoryPlugin />
     <ListPlugin />            {/* per-surface composition */}
     <MarkdownShortcutPlugin />
     <OnChangePlugin onChange={handleChange} />
   </LexicalComposer>
   ```

2. **Features are pairs; the surface is a manifest.** Every
   editing feature ships as a pair — its plugin and its toolbar
   control (`ListFeature.Plugin` + `ListFeature.ToolbarItem`).
   The toolbar is composable parts, so each surface declares
   exactly what it offers, and nothing else:

   ```tsx
   // Email compose: minimal
   <RichTextEditor value={value} onValueChange={onChange}>
     <RichTextEditorToolbar>
       <BoldFeature.ToolbarItem />
       <ItalicFeature.ToolbarItem />
       <LinkFeature.ToolbarItem />
     </RichTextEditorToolbar>
     <RichTextEditorContent />
     <LinkFeature.Plugin />
   </RichTextEditor>

   // JD editor: full
   //   + ListFeature, HeadingFeature, MarkdownShortcutFeature …
   // Chat composer: a compact toolbar (bold/italic/link/list),
   //   Slack-style. Bare notes: markdown shortcuts, no toolbar.
   // The surface decides — by composing, never by a mode prop.
   ```

   The pairing rule: a toolbar control never renders without its
   plugin mounted, and a plugin with user-facing state gets its
   control — half-features are the bug class this prevents.

3. **Toolbar and scroll layout.** The editor is a flex column:
   the toolbar is a static header, and the content region below
   it is the ONLY scroll container (`min-h-0 flex-1
   overflow-y-auto`). The toolbar never moves because only the
   content scrolls — no `sticky` needed. Do not make the toolbar
   `sticky` inside an outer scroller: sticky binds to the nearest
   ancestor with a "scrolling mechanism", and `overflow: hidden`
   on any intermediate wrapper counts as one — the toolbar then
   sticks to the wrong box and hangs mid-scroll.

4. **Theme through tokens.** The `theme` object maps Lexical's
   node classes to kit styles — semantic tokens and the type
   scale, like every other component.

5. **The state contract.** The serialized editor state JSON is
   the editing source of truth: persist
   `JSON.stringify(editorState.toJSON())`, restore with
   `editor.parseEditorState(stored)`. Render-only consumers (a
   public page, an email body) get HTML or markdown **derived at
   save time** (`$generateHtmlFromNodes`,
   `$convertToMarkdownString`) — never inside `onChange`, where a
   full-document export runs on every keystroke. HTML→Lexical
   conversion exists for paste interchange — never as the restore
   path; an HTML round-trip is lossy.

6. **Form integration.** The editor is a `Controller` field:
   `OnChangePlugin` serializes the state into `field.onChange`.
   The editor owns keystroke state — do not mirror it into
   page-level React state per keystroke.

7. **Streaming AI content in.** Never re-parse the accumulated
   text on every stream tick — converting the full markdown per
   chunk is quadratic and freezes long generations. Stream into a
   lightweight read-only view (a markdown renderer); when the
   stream completes, convert ONCE
   (`$convertFromMarkdownString`) into the editor and restore
   editability.

8. **Load it lazily.** The editor bundle is heavy: `next/dynamic`
   for surfaces where it is not the primary content.

## Don't — common failures

- Don't build a second editor for a second surface — one
  compound editor, per-surface plugin composition. Codebases
  accrete one editor per feature and pay for every divergence.
- Don't `$convertFromMarkdownString(accumulated)` on each stream
  tick — parse once at completion.
- Don't store HTML as the editing source of truth and re-import
  it into the editor.
- Don't lift editor state into page state per keystroke — read
  it through the change listener when needed.
- Don't drop the `ErrorBoundary` from `RichTextPlugin`.
- Don't `sticky` the toolbar inside an outer scroll region — flex
  column with a scrolling content region instead.
- Don't run `$convertToMarkdownString`/`$generateHtmlFromNodes`
  inside `onChange` — that is a full-document export per
  keystroke; derive at save time.

## Verify

- [ ] Exactly one editor component exists; this surface composes
      plugins on it.
- [ ] Features are plugin + toolbar pairs; no toolbar control
      without its plugin, no user-facing plugin without its
      control.
- [ ] The stored format is editor-state JSON; HTML is derived at
      save time for render-only consumers; no HTML restore path.
- [ ] Streaming renders in a read-only view and converts once at
      completion; the editor is non-editable during the stream.
- [ ] The theme maps to semantic tokens.
- [ ] The toolbar is a static flex-column header; only the
      content region scrolls; no `sticky` in the editor.
- [ ] `onChange` stores the JSON only; markdown/HTML exports run
      at save time.
- [ ] The editor loads via `next/dynamic` where it is not the
      primary content.
