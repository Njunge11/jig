# Recipe: Live page preview

Use this recipe when the UI shows a live preview of rendered
output beside an editor — a job posting, an email, a public page
being configured.

## The mechanism

A draft preview is **the real rendering component, in the same
document, fed the live draft as props**. Not a second app in an
iframe, not a lookalike copy. Prop changes re-render instantly —
no network, no `postMessage`, no reload.

## Build order

1. **Extract the render.** The previewed page's rendering becomes
   one shared component that takes its data as props and fetches
   nothing. The real public page feeds it query data; the preview
   feeds it the live draft (`form.watch()`, editor state). One
   component — the preview cannot drift from the page.

2. **Render it in-document:**

   ```tsx
   <div className="overflow-y-auto rounded-lg border">
     <JobPosting {...draftValues} />
   </div>
   ```

3. **Reproduce the target's CSS environment** when it differs
   from the host page: wrap the preview in the target's theme
   scope (its `data-theme` attribute or theme-class wrapper) so
   tokens and fonts resolve as they do on the real page.

4. **Keep type-to-paint instant.** Do not debounce the preview
   render. Debounce only a provably expensive derivation on the
   way in (markdown → HTML, syntax highlighting), per the search
   recipe's draft-commit split.

5. **Device form-factor toggle.** Media queries follow the real
   viewport — a 375px box inside a desktop page still gets
   desktop breakpoint styles. A device toggle therefore uses a
   **resizable same-origin iframe**: a minimal preview route of
   the same app renders the same shared component, and the
   toggle sets the iframe's width. This is the Storybook
   viewport mechanism ("adjust the dimensions of the iframe your
   story is rendered in") and how v0-style previews work. Scale
   the iframe to fit its slot with `transform: scale()`; never
   boot a second deployed app for this.

   Make the toggle cost zero at click time — there is no browser
   prefetch for iframes (speculation rules cover top-level
   navigations only), and none is needed:

   - **Mount the one iframe when the preview pane mounts**, not
     on toggle click. Iframes load eagerly by default, so its
     document is loaded and hydrated while the user is still
     editing.
   - **The toggle changes CSS width only.** Never change `src`
     and never remount via a React `key` — both reload the
     document. A CSS resize does not.
   - **Keep the preview route tiny:** the shared render
     component, the theme scope, nothing else — no app shell, no
     providers it does not need. Same app means its JS chunks are
     already in the browser cache.
   - **Push draft updates through the same-origin window**, not
     by reloading: the route registers a setter
     (`window.__updatePreview = setProps`) and the parent calls
     `iframeRef.current.contentWindow.__updatePreview(draft)`.

6. **Foreign or untrusted HTML** (an email body, user-submitted
   markup) never enters the document: render it in a sandboxed
   `<iframe srcDoc sandbox="">` — that is style isolation AND
   script containment.

## Don't — common failures

- Don't boot another app in an iframe and sync it with
  `postMessage` to preview a draft — a full app load to show a
  title change is why previews feel slow.
- Don't re-implement the page as a lookalike preview component —
  it drifts from the real page the week after it ships; extract
  and share the real one.
- Don't fetch inside the shared render component — props in,
  markup out.
- Don't inject foreign HTML with `dangerouslySetInnerHTML` for a
  preview.
- Don't debounce the whole preview — only the expensive
  derivation feeding it.

## Verify

- [ ] The preview and the real page render the same shared
      component; the preview component fetches nothing.
- [ ] Typing updates the preview with zero network requests.
- [ ] No cross-app iframe or `postMessage` in the draft path.
- [ ] The preview sits in the target's theme scope; tokens and
      fonts match the real page.
- [ ] Foreign HTML renders only inside a sandboxed `srcDoc`
      iframe.
- [ ] If a device-width mode exists, it uses the same-origin
      preview route; the iframe mounts with the pane, the toggle
      changes only CSS width, and `src`/`key` never change after
      mount.
