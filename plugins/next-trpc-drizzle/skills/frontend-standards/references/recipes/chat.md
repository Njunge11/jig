# Recipe: Chat and AI surfaces (AI SDK + AI Elements)

Use this recipe for a chat panel, an assistant surface, or any
streamed AI output. Libraries: `ai` + `@ai-sdk/react` (v6 API)
and the AI Elements registry.

## Build order

1. **Install from the registry — never hand-roll chat UI.**
   `npx ai-elements@latest` adds the components (default:
   `components/ai-elements/`); they are shadcn-based, fully
   composable, and streaming-aware. Bubbles, autoscroll, loading
   states, and streamed-markdown rendering are solved problems —
   `Conversation`, `Message`, `Response`, `PromptInput`,
   `Loader`, `Tool`, `Reasoning`, `Sources` exist.

2. **Wire `useChat` with a transport.** `useChat` does NOT own
   the input — hold it in local state and send explicitly:

   ```tsx
   const [input, setInput] = useState("");
   const { messages, sendMessage, status, stop, error } = useChat({
     transport: new DefaultChatTransport({ api: "/api/chat" }),
   });
   ```

3. **Render messages as parts.** A `UIMessage` carries a `parts`
   array — switch on `part.type`; never treat a message as one
   text string:

   ```tsx
   <Conversation>
     <ConversationContent>
       {messages.map((m) => (
         <Message from={m.role} key={m.id}>
           <MessageContent>
             {m.parts.map((part, i) => {
               switch (part.type) {
                 case "text":
                   return <Response key={i}>{part.text}</Response>;
                 // case "data-candidateCard":
                 //   return <CandidateCard key={i} {...part.data} />;
                 default:
                   return null; // unknown parts render nothing, never crash
               }
             })}
           </MessageContent>
         </Message>
       ))}
     </ConversationContent>
     <ConversationScrollButton />
   </Conversation>
   ```

4. **Scrolling belongs to `Conversation`.** It wraps the messages,
   scrolls to the bottom on new content, and shows the scroll
   button when the user has scrolled up. Never write a scroll
   `useEffect` over `messages`.

5. **Status drives the composer.** `status` is `"submitted"`,
   `"streaming"`, `"ready"`, or `"error"`: while
   submitted/streaming, show the loader, swap send for a stop
   button wired to `stop()`; on error, surface `error` with a
   retry — a chat failure is inline in the conversation, not a
   route boundary.

6. **Structured AI output is typed data parts.** The server
   streams `data-*` parts; the client maps each `data-` type to
   its own component (a card, a form). A form inside chat follows
   `form-with-mutation.md`; streamed markdown renders through
   `Response` — never through a hand-parsed accumulator (the
   rich-text recipe's streaming rule).

7. **A docked chat panel is an expanded-panel surface.** Its
   collapse/expand follows `expanded-panel.md` — the same mounted
   component in every mode, so the input draft and scroll
   position survive toggling.

## Don't — common failures

- Don't hand-roll bubbles, autoscroll, or a streaming markdown
  renderer — install the registry components.
- Don't manage chat scroll with a `useEffect` on `messages`.
- Don't render a message as a single string — iterate `parts`
  and switch on type; unknown types render nothing.
- Don't leave send active while streaming — swap it for `stop()`.
- Don't route a chat error to the route boundary — it renders
  inline in the conversation with a retry.
- Don't fork an AI Elements component to restyle it — they are
  shadcn components; pass `className`, compose parts.

## Verify

- [ ] Conversation, message, input, and response rendering come
      from the registry components, not hand-rolled markup.
- [ ] Messages render through a `parts` switch; unknown part
      types are ignored safely.
- [ ] `status` is wired: loader while streaming, stop button
      live, send disabled; `error` surfaces inline with retry.
- [ ] No scroll effects; `Conversation` owns scrolling.
- [ ] Every streamed `data-*` type has a typed renderer.
- [ ] If docked/expandable, the panel follows the expanded-panel
      recipe (one mounted component; draft survives toggling).
