---
name: flow-diagram
description: Builds an interactive step-by-step flow diagram page from one real code path, from a system design, or from a product spec, and opens it in the browser. Each box is a stage or a step, the card under it explains that step, and "How it works" gives the detail. Use when the developer asks how some code works or how a feature works in the codebase, asks to be walked through a code path step by step (a route, a procedure, a handler, a job or a UI event), asks to trace a path from an entry point, asks to see, show, visualize or diagram how a system, a feature or a process flows, agrees a system design and wants to see its flow, or gives a spec, a PRD, a user story or a process doc (technical or not) and asks to see its steps or its flow.
argument-hint: "[the design or the spec to show, or the entry point to trace]"
---

# Flow Diagram

Turn one process into one HTML page that the developer clicks through, box by box. A bundled script builds the page from a data file. You write the data file. You never write the HTML, and you never edit the template or the script to make a data file pass.

## Steps

### Step 1: Pick the mode and trace the path

Pick one mode:

- **System mode.** The source is a technical design the developer agreed to, in this session or in a doc. There is often no code yet. Each box is a component or a stage of that design, and its card explains the design itself: what the component is responsible for, how it talks to the next one (a request, an event, a queue), where its state lives, what happens when it fails or is slow, and why this choice over the alternative.
- **Spec mode.** The source is a product spec, a PRD, a user story, or a process doc. A product manager or a stakeholder often wrote it, and it is often not technical. Each box is one step of the process as the people in it see it, and its card tells the step in the words of the spec: who acts (a customer, a team member, the system), what they do, what they see or get, and the rule that applies. Do not translate a step into technical parts. A service, a table, a queue or a function appears only when the spec names it.
- **Code mode.** The source is the code. Start at the entry point the developer names: a route, a handler, a job, or a UI event. Read every file on the path before you write. Each box is one step on that path, and its card tells the step the way a call trace tells it: which function runs, what it does, and what came back, with the calls it made under it.

The page exists so the reader understands how the system, the feature or the process works, one step at a time, without reading the code or the spec. In spec mode the reader can be the person who wrote the spec, so a card keeps the spec's own words. A card never names a file or a path. A function, a method, a table, a service, a stage or a status is a name the developer knows, so it stays. In code mode the `file:line` of what you read goes in the card's `code` field, which is your proof: the script checks it and leaves it out of the page.

The diagram is one linear path with no branch. A condition, a business rule, or an alternate path is a "How it works" item on the step where the code decides it. Use 3 to 12 boxes. When a path needs more than 12 boxes, stop and ask the developer where to cut it into two diagrams.

**Gate (code mode):** you have read the code of every step, and you can give a `file:line` for each call its card describes. A step you did not read is not in the diagram.

**Gate (spec mode):** every step and every rule on a card comes from the spec, or is marked as an inference (Content rule 8).

### Step 2: Write the data file

Write `docs/flows/<slug>.json`, where `<slug>` is the title in kebab-case (`order-cancellation`). Create `docs/flows/` when it does not exist. The file has this shape:

```json
{
  "title": "How an order is cancelled",
  "mode": "code",
  "intro": "Click the outlined box to go to the next step. Open \"How it works\" for the detail.",
  "start": { "title": "Start here", "summary": "The procedure orders.cancel starts the path when the customer presses Cancel.", "code": ["features/orders/api/orders.router.ts:12"] },
  "end": { "title": "The order is cancelled", "summary": "Four steps. Click any box to see it again." },
  "steps": [
    { "label": "orders.cancel" },
    {
      "label": "Load the order",
      "title": "The service reads the order",
      "summary": "cancelOrder reads the order by its id and stops when the order is not open. Found.",
      "items": [
        { "heading": "Read", "text": "ordersRepo.byId runs one SELECT on orders." },
        { "heading": "Rule: only open orders", "text": "A status other than open throws NOT_FOUND, and the customer sees \"Order not found\"." }
      ],
      "example": "const order = await ordersRepo.byId(db, input.id);\nif (order.status !== \"open\") throw new TRPCError({ code: \"NOT_FOUND\" });",
      "code": ["features/orders/api/cancel.service.ts:18-21", "features/orders/db/orders.repo.ts:9"]
    }
  ]
}
```

Field rules:

| Field | Rule |
| --- | --- |
| `title` | The process, as a noun phrase or a "How ..." phrase. 80 characters maximum. |
| `mode` | `system`, `spec` or `code`. |
| `intro` | One instruction sentence, 20 words maximum. Keep the default text unless the page needs a different instruction. |
| `start` | The card under the first box. `title` 60 characters maximum, `summary` 1 to 3 sentences. In code mode it also has `code`, with the `file:line` of the entry point. |
| `end` | The card shown when the last step is done. Same limits as `start`. |
| `steps[0]` | `label` only. Its card is `start`. |
| `steps[i]`, i ≥ 1 | `label`, `title` (60 characters maximum), `summary` (1 to 3 sentences), `items` (0 or more `{heading, text}`), an optional `example` (a code or data sample, as a string with `\n` line breaks), and in code mode `code`. |
| `code` | Code mode only. An array of `file:line` or `file:line-line` strings: one for each call the card describes, in the order the card tells them. It is your proof of what you read. The script checks it and leaves it out of the page. System mode and spec mode have no `code`: a design or a spec has no file to cite. |
| every text | No file name and no path, in any mode: not `cancel.service.ts`, not `features/orders/api`. Say what happens and which function does it. The `example` is the one field that may hold code as it is. |
| `label` | 1 to 3 words. It fits a 132 px box in Geist 14px: 2 lines maximum, each line 120 px maximum. `Send email` fits. `Send confirmation email` fits on 2 lines. `Write the order row and release the stock` does not. |
| `items[].heading` | 2 to 6 words. 80 characters maximum. |
| `items[].text` | 1 to 4 sentences. |

Write every text field in Simplified Technical English (the section below). The script rejects a sentence over the limit, a semicolon, a label that does not fit, a label with "or" in it, a file name or a path in a card, a code-mode card with no `code`, and a `code` entry that is not `file:line`.

### Step 3: Build the page

Run the bundled script on the data file:

```bash
node ${CLAUDE_SKILL_DIR}/scripts/build.mjs docs/flows/<slug>.json --open
```

The script validates the data file, writes `docs/flows/<slug>.html` beside it, prints the `file://` URL, and `--open` opens the page in the default browser (`open` on macOS, `xdg-open` on Linux, `start` on Windows). When the script prints `error:` lines, fix each named field in the data file and run the script again. Do not change the script or the template.

When `docs/flows/<slug>.html` already exists, the script stops. Pass `--force` only when the developer asked you to update this flow. Otherwise give the data file a new slug.

**Gate:** the script output has the line `wrote docs/flows/<slug>.html`.

### Step 4: Report

Reply with these items, in this order:

1. The path of the HTML file and the `file://` URL the script printed. When the browser did not open (a remote or headless session), say so and give the path.
2. The steps, one line each: the label and the title.
3. Every second-look item (the Content rules below), one line each, with its `file:line` from `code` in code mode.

Do not paste the data file or the HTML into the reply.

## Content rules

1. **One linear path.** No branch, no fork, no "or". Business logic, conditions, and alternate paths go in "How it works" items.
2. **No tags or labels on boxes or cards.** A box has its label only. A card has its title, summary, items, and example only.
3. **Concise text never hides a detail.** Each detail that needs a second look from the developer is its own "How it works" item, with a heading that names it. Never merge it into another item. Never soften it. Second-look details are:
   - data that changes: a write, a delete, an update, and whether it is irreversible
   - a call to an external service
   - missing or weak error handling: no retry, a swallowed error, a silent fallback
   - a security gap: missing authorization, unvalidated input, a secret in code
   - a race condition or an order dependency
   - a performance trap, for example a query inside a loop
   - an assumption the code does not check
   - a TODO or FIXME on the path

   In spec mode the second-look details are the ones a product reader needs:
   - an open decision or a question the spec leaves open
   - a gap: a case the spec does not cover (an empty state, a failure, a timeout, a user who stops halfway)
   - two rules in the spec that conflict
   - a step that a person does by hand
   - an assumption with no owner, or a number or a limit with no source
   - a dependency on another team, another system, or a third party
4. **Code mode states only what you read in the code, and tells it like a call trace.** The summary is the step's own line: the function that runs, what it does, and what came back ("runDraftCreate creates the draft and moves the chat. Success."). "How it works" lists the calls under it in the order they ran, service, then repo, then query: the methods called, the reads, the writes and mutations ("query insert job_drafts"), the model calls, the third-party services, and the business rules. A refusal or a failure is its own item, in the words the code returns. A stage change sits on the call that makes it. The `code` field holds the `file:line` of each of those calls, and the `start` card's `code` holds the entry point.
5. **System mode explains the design, not an implementation.** There is often no code. The summary says what the component or the stage is responsible for and what it hands to the next one. "How it works" says how it talks to the next one (a request, an event, a queue), where its state lives, what happens when it fails or is slow, and why this choice over the alternative. No function names, no files, no `code`.
6. **Spec mode tells the process in the words of the spec.** The summary says who acts, what they do, and what they see or get. "How it works" holds that step's rules, acceptance criteria, edge cases, and open questions, each as its own item in the spec's words. A step with two outcomes (approved or rejected, found or not found) is one box named for the decision, and each outcome is its own item. A technical name (a service, a table, a queue, a function) appears only when the spec names it. No `code`.
7. **No file names and no paths in a card, in any mode.** The developer reads the page to understand the system without reading the code. A function, a method, a table, a service, a stage or a status is part of the story and stays. A file or a folder is where the code lives, and it goes in `code` or nowhere.
8. **Mark an inference.** When you state what the code is likely to do but did not read, or what the spec does not state, start the item text with "Inference:" and say what you did not read or what the spec leaves out.
9. **Redact secrets.** A key, a token, a password, or a connection string in an example becomes `<redacted>`.
10. **The visual design and the animation are final.** They live in the template and the script. You change neither.

## Simplified Technical English

Every text field obeys these rules of ASD-STE100 Issue 9 (Part 1, Writing rules):

| Rule | Text |
| --- | --- |
| 1.1, 1.3 | Use approved words only, with their approved meanings. A technical name from the code, the design or the spec (a function, a method, a table, a service, a stage, a screen, a role) is an approved technical noun. Write it as the code spells it. A file name is not one: it never appears in a card. |
| 2.1 | Write multi-word nouns of no more than three words. Break a longer cluster with a preposition. |
| 3.2, 3.5 | Use only the infinitive, the imperative, the simple present, the simple past, the simple future, and the past participle as an adjective. Do not use an "-ing" form as a verb. |
| 3.6 | Use the active voice. Say who or what does the action. |
| 3.7 | Use a verb for an action, not a noun ("the service validates the input", not "validation of the input occurs"). |
| 4.3 | Use a vertical list for complex text: the "How it works" items are that list. |
| 4.5 | Use an article (the, a, an) or a demonstrative adjective (this, these) before a noun. |
| 5.1 | An instruction (the `intro`) has 20 words maximum. |
| 6.3 | A descriptive sentence (every `summary` and item `text`) has 25 words maximum. |
| 6.5, 6.6 | One topic per item. No item has more than six sentences. |
| 8.1 | No semicolon. |
| 8.5 to 8.7 | A number, a number with its unit, an abbreviation, a technical name such as `ordersRepo.byId`, quoted text, and a hyphenated word each count as one word. Text in parentheses counts as one word. |

Before and after:

- Before (34 words, passive, a noun for an action, a semicolon): "Validation of the payload is performed by the handler; in the event that the signature cannot be verified, the request will be rejected and a 401 response is returned to the caller."
- After (10 + 11 words, active, one topic per sentence, the proof in `code`): "verifySignature checks the payload signature. Valid. When the signature does not match, the handler returns 401." with `"code": ["lib/webhooks/verify.ts:14"]`.

## Where the files live

`docs/flows/` holds every flow: the data file `<slug>.json` and the page `<slug>.html`. The `structure` skill names no home for a generated document, so this skill extends the `docs/<project>/` convention that the `implementation-planner` skill uses for trackers and checklists. Commit both files: the data file is the source, and the page is what a teammate opens without a rebuild.

## Build errors and the fix

| The script prints | Fix |
| --- | --- |
| `steps[i].label: "..." names two paths` | A box is one step. Name the label for the decision (`Decision`, `Review`), and make each outcome its own "How it works" item. |
| `steps[i].label: "..." needs 3 lines` or `the line "..." is N px wide` | Shorten the label to 1 to 3 short words. Move the detail into the card title. |
| `...: "..." has N words, maximum 25 (Rule 6.3)` | Split the sentence into two. Each sentence keeps one topic. |
| `intro: "..." has N words, maximum 20 (Rule 5.1)` | Shorten the instruction, or use the default intro. |
| `...: a semicolon` | Replace the semicolon with a period and start a new sentence. |
| `...: "<name>" is a file name or a path` | Rewrite the text: say what happens and which function does it. Move the `file:line` into that card's `code`. |
| `steps[i].code: code mode needs the file:line of each call the card describes` | Add `code` with one `file:line` per call the card tells. Read the code first when you do not have the line. |
| `start.code: code mode needs the file:line of the entry point` | Add `code` to `start` with the route, handler, job, or event handler that starts the path. |
| `....code[j]: "..." is not a file:line` | Each entry is `path/to/file.ts:12` or `path/to/file.ts:12-20`. A file with no line is not proof. |
| `....code: only code mode has a code field` | A design or a spec has no file to cite. Remove `code`, or pick code mode when the source is the code. |
| `steps[0].title: the first step has a label only` | Move that card's content into `start`. |
| `could not open a browser (...)` | Not an error: the page is written. A sandbox or a remote session has no browser. Give the path and the `file://` URL in the report. |
| `<path> exists. Pass --force to replace it` | A different process: pick a new slug. The same process, on the developer's request: add `--force`. |
| `error: ... not valid JSON` | Fix the JSON. A line break inside a string is `\n`. |

## Check before you finish

- [ ] One mode, one linear path, 3 to 12 boxes.
- [ ] Every second-look detail on the path is its own item with its own heading.
- [ ] No card names a file or a path. Functions, methods, tables, services and stages are the names it uses.
- [ ] Code mode: every card reads like a trace line (the function, what it does, what came back), every step and the `start` card hold `code` with one `file:line` per call, each inference is marked, and no secret is in an example.
- [ ] System mode: every card explains the design (responsibility, how it talks to the next component, where state lives, failure and slowness, why this choice), with no function names and no `code`.
- [ ] Spec mode: every card tells the step in the spec's words (who acts, what they do, what they see or get, the rule), every open question, gap, conflict, manual step and unowned assumption is its own item, each inference is marked, and no card adds a technical part the spec does not name.
- [ ] The script printed `wrote docs/flows/<slug>.html` and the `file://` URL.
- [ ] The reply gives the path, the steps, and the second-look items, and nothing else from the files.
