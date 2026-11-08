---
name: flow-diagram
description: Builds an interactive step-by-step flow diagram page from a system design or from one real code path, and opens it in the browser. Each box is a stage or a step, the card under it explains that step, and "How it works" gives the detail. Use when the developer asks to see, show, visualize or diagram how a system, a feature or a process flows, asks how some code works or how a feature works in the codebase, asks to be walked through a code path step by step (a route, a procedure, a handler, a job or a UI event), asks to trace a path from an entry point, or when a system design is agreed and the developer wants to see its flow.
argument-hint: "[the design to show, or the entry point to trace]"
---

# Flow Diagram

Turn one process into one HTML page that the developer clicks through, box by box. A bundled script builds the page from a data file. You write the data file. You never write the HTML, and you never edit the template or the script to make a data file pass.

## Steps

### Step 1: Pick the mode and trace the path

Pick one mode:

- **System mode.** The source is a design the developer agreed to, in this session or in a doc. Each box is a component or a stage of that design.
- **Code mode.** The source is the code. Start at the entry point the developer names: a route, a handler, a job, or a UI event. Read every file on the path before you write. Each box is one step on that path.

The diagram is one linear path with no branch. A condition, a business rule, or an alternate path is a "How it works" item on the step where the code decides it. Use 3 to 12 boxes. When a path needs more than 12 boxes, stop and ask the developer where to cut it into two diagrams.

**Gate (code mode):** you have read the code of every step, and you can give a `file:line` for each one. A step you did not read is not in the diagram.

### Step 2: Write the data file

Write `docs/flows/<slug>.json`, where `<slug>` is the title in kebab-case (`order-cancellation`). Create `docs/flows/` when it does not exist. The file has this shape:

```json
{
  "title": "How an order is cancelled",
  "mode": "code",
  "intro": "Click the outlined box to go to the next step. Open \"How it works\" for the detail.",
  "start": { "title": "Start here", "summary": "The procedure orders.cancel starts the path (features/orders/api/orders.router.ts:12)." },
  "end": { "title": "The order is cancelled", "summary": "Four steps. Click any box to see it again." },
  "steps": [
    { "label": "orders.cancel" },
    {
      "label": "Load the order",
      "title": "The service reads the order",
      "summary": "cancelOrder reads the order by id and stops when it is not open (features/orders/api/cancel.service.ts:18).",
      "items": [
        { "heading": "Read", "text": "ordersRepo.byId runs one SELECT on orders (features/orders/db/orders.repo.ts:9)." },
        { "heading": "Rule: only open orders", "text": "A status other than open throws NOT_FOUND (features/orders/api/cancel.service.ts:21)." }
      ],
      "example": "const order = await ordersRepo.byId(db, input.id);\nif (order.status !== \"open\") throw new TRPCError({ code: \"NOT_FOUND\" });"
    }
  ]
}
```

Field rules:

| Field | Rule |
| --- | --- |
| `title` | The process, as a noun phrase or a "How ..." phrase. 80 characters maximum. |
| `mode` | `system` or `code`. |
| `intro` | One instruction sentence, 20 words maximum. Keep the default text unless the page needs a different instruction. |
| `start` | The card under the first box. `title` 60 characters maximum, `summary` 1 to 3 sentences. In code mode the summary cites the entry point as `file:line`. |
| `end` | The card shown when the last step is done. Same limits as `start`. |
| `steps[0]` | `label` only. Its card is `start`. |
| `steps[i]`, i ≥ 1 | `label`, `title` (60 characters maximum), `summary` (1 to 3 sentences), `items` (0 or more `{heading, text}`), and an optional `example` (a code or data sample, as a string with `\n` line breaks). |
| `label` | 1 to 3 words. It fits a 132 px box in Geist 14px: 2 lines maximum, each line 120 px maximum. `Send email` fits. `Send confirmation email` fits on 2 lines. `Write the order row and release the stock` does not. |
| `items[].heading` | 2 to 6 words. 80 characters maximum. |
| `items[].text` | 1 to 4 sentences. |

Write every text field in Simplified Technical English (the section below). The script rejects a sentence over the limit, a semicolon, a label that does not fit, and a code-mode step with no citation.

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
3. Every second-look item (the Content rules below), one line each, with its `file:line` in code mode.

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
4. **Code mode states only what you read in the code.** Each step cites `file:line` in its title, summary, an item, or the example. The `start` summary cites the entry point. "How it works" lists the methods called, the reads, the writes and mutations, the third-party services, and the business logic.
5. **Mark an inference.** When you state what the code is likely to do but did not read, start the item text with "Inference:" and say what you did not read.
6. **Redact secrets.** A key, a token, a password, or a connection string in an example becomes `<redacted>`.
7. **The visual design and the animation are final.** They live in the template and the script. You change neither.

## Simplified Technical English

Every text field obeys these rules of ASD-STE100 Issue 9 (Part 1, Writing rules):

| Rule | Text |
| --- | --- |
| 1.1, 1.3 | Use approved words only, with their approved meanings. A technical name from the code (a file, a function, a table, a service) is an approved technical noun. Write it as the code spells it. |
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
| 8.5 to 8.7 | A number, a number with its unit, an abbreviation, a `file:line` identifier, quoted text, and a hyphenated word each count as one word. Text in parentheses counts as one word. |

Before and after:

- Before (34 words, passive, a noun for an action, a semicolon): "Validation of the payload is performed by the handler; in the event that the signature cannot be verified, the request will be rejected and a 401 response is returned to the caller."
- After (12 + 11 words, active, one topic per sentence): "The handler validates the payload signature (lib/webhooks/verify.ts:14). When the signature does not match, the handler returns 401."

## Where the files live

`docs/flows/` holds every flow: the data file `<slug>.json` and the page `<slug>.html`. The `structure` skill names no home for a generated document, so this skill extends the `docs/<project>/` convention that the `implementation-planner` skill uses for trackers and checklists. Commit both files: the data file is the source, and the page is what a teammate opens without a rebuild.

## Build errors and the fix

| The script prints | Fix |
| --- | --- |
| `steps[i].label: "..." needs 3 lines` or `the line "..." is N px wide` | Shorten the label to 1 to 3 short words. Move the detail into the card title. |
| `...: "..." has N words, maximum 25 (Rule 6.3)` | Split the sentence into two. Each sentence keeps one topic. |
| `intro: "..." has N words, maximum 20 (Rule 5.1)` | Shorten the instruction, or use the default intro. |
| `...: a semicolon` | Replace the semicolon with a period and start a new sentence. |
| `steps[i]: code mode needs a file:line citation` | Add the citation to the item that states what the code does. Read the code first when you do not have the line. |
| `start.summary: code mode needs a file:line citation of the entry point` | Cite the route, handler, job, or event handler that starts the path. |
| `steps[0].title: the first step has a label only` | Move that card's content into `start`. |
| `could not open a browser (...)` | Not an error: the page is written. A sandbox or a remote session has no browser. Give the path and the `file://` URL in the report. |
| `<path> exists. Pass --force to replace it` | A different process: pick a new slug. The same process, on the developer's request: add `--force`. |
| `error: ... not valid JSON` | Fix the JSON. A line break inside a string is `\n`. |

## Check before you finish

- [ ] One mode, one linear path, 3 to 12 boxes.
- [ ] Every second-look detail on the path is its own item with its own heading.
- [ ] Code mode: every step and the `start` card cite `file:line`, each inference is marked, and no secret is in an example.
- [ ] The script printed `wrote docs/flows/<slug>.html` and the `file://` URL.
- [ ] The reply gives the path, the steps, and the second-look items, and nothing else from the files.
