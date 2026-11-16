---
name: e2e-tests
description: The standard for end-to-end tests and for the design check. Playwright tests drive the built app in a real browser on a real PostgreSQL database, one test per step, failure path and edge case that a person can cause. The design check compares each built screen with its design source file. Gives the list of tests a checklist carries, the review checklist for a test, the rules for a test that fails, the report of a run, the design check, and the one setup. Use when writing, reviewing, or planning an end-to-end test, an e2e test, a Playwright test, or a browser test of a user flow; when asked to make sure that a user flow or a screen works, to map the flows and edge cases of a spec, or to fix a flow that is broken; when reporting the outcome of an e2e run; for a frontend, UI or component test (the standard has none: a flow proves the screen); when a built screen is checked against its design or the design check fails on it, also for a screen that must keep its look; or when creating the e2e test setup.
---

# End-to-end tests

> An e2e test fails because **a person cannot do in the built app what the spec says**. It is the proof of each screen. No test below it draws a component.

**One harness.** The setup in the **E2E test setup** section below is the only end-to-end harness: Playwright Test, in one `packages/e2e` package (`e2e/` at the root of a repo with one app). No agent starts a dev server or drives a browser by hand to verify: the run builds the app, starts it, and stops it.

## The two layers

| Layer | Runs on | Proves |
| --- | --- | --- |
| Backend tests (`backend-tests`) | PGlite, in milliseconds, in CI | each rule and each edge case of a procedure, a service, a repo, a machine |
| End-to-end tests (this skill) | the production build, a real browser, a real PostgreSQL database that the run starts on the machine | each step, each failure path and each edge case that a person can cause on a screen, through the whole wiring |

There is no third layer. No test draws a component in jsdom, and no test mocks the network. The recipes state the correct build of a component, the review checks each recipe item, and the e2e tests prove what a person sees.

A case that a browser cannot cause has its test in the backend layer only: the server time, a provider that fails, two people on one row, a cron job.

A rule with many value combinations (each role with each permission) has its full table in the backend tests. The flows prove one allowed action and one refused action per role, through the real screens. Never write one line per cell of the table.

## Gates

Run before a commit. Paste the output in the proof.

1. `pnpm lint` and `pnpm typecheck` exit `0` in the e2e package. Lint proves every Review item that ends with `Gate:`.
2. `pnpm flows` exits `0`. Paste its last line (`N passed`) and the path of the report.
3. `SCREENS="<Design>=<path> …" pnpm screens` exits `0` for each design that a route shows, or each difference that it prints is on a stock shadcn part and has that verdict (**The proof**). Paste its last line. A design that a flow step opens (`expectDesign`, `shot`) is proved by gate 2.
4. The pre-push hook runs the flow files that the push adds or changes and the smoke set, and refuses the push on a failure. The full suite runs outside a push. Never pass `--no-verify`, and never set `HUSKY=0`.

## The list first, the test code after the build

1. **The planner writes the list from the spec**, before the code exists: the `## E2E tests` section of the checklist, one `E<n>` line per test. So a test checks what the spec says, not what the builder made.
2. **The builder writes the test code after the backend and the screens of the checklist are built.** A test needs the real screens, their roles and their labels.
3. **The checklist is not done until each `E<n>` line passes.** The tests never wait for the end of the spec.

The list holds:

- one line per step of the flow, in order
- one line per failure path that the spec states: a refused sign-in, a missing permission, an expired link, a session that ended, a message of a field, a save that a reload must keep
- one line per edge case that a person can cause: an empty list, a second click, Back, a reload in the middle of the flow, a link opened a second time
- for a screen that a state machine drives: one line per event that a person can send in each state, read from the machine file
- for each sign-in flow of the app: its own lines, with each failure path that a person can cause (a wrong code, a link that was used, a link that a newer one replaced). The sign-in of the `session` project is the setup of the run: it proves no line. A code or a link that expires by time alone is a case of the server time
- no line for a case that a browser cannot cause

An agent writes the tests, so the cost of a test is its run time, not its text. Do not drop a line to save work. A limit of the server (a daily count, a pause) blocks no line: the test resets the limit on its own test data.

**A spec that is built and has no list gets the list first.** Write the `## E2E tests` list from the spec, per flow across its checklists, before you read a flow file. It holds each kind of line above: the steps, the failure paths, and the edge cases that a person can cause and the spec does not state. Then read the flow files and mark each line that an existing test proves, with the name of that test. Do the two in one answer: a person who asks where a spec stands gets the list with its marks. Put the list in the checklist files of the spec and commit it (`docs(<feature>): the e2e list`) before you write a test. Then write a test for each line that is left. A line that the built app cannot pass shows a fault of the app: fix the app in the same work, and never close the list with such a line open. Never write the list from the screens or from the tests that exist: such a list states what the builder made.

A flow has one file, `flows/<app>/<flow>.spec.ts`. The name of a test, or of a `test.step`, states the step and its outcome in the person's words (`"a forgotten password is set again from the emailed link"`). The developer reads the names in the report as the list of what works.

## Review checklist

Reject the test if any item is true. Each item names its source.

1. The test asserts **what a person cannot see or do**: a CSS class, a database row read by the test, a response body, a store. Assert what the page shows. The one exception is the server log as the person's inbox: the emailed link and the texted code. (Playwright, Best Practices, "Test user-visible behavior".)
2. The test locates by **CSS, XPath or test id** where a role, a label or a text locator exists (`getByRole`, `getByLabel`, `getByText`). (Best Practices, "Prefer user-facing attributes to XPath or CSS selectors".) A toast is read inside the toast region, with its full text (`toastOf` in `support/toast.ts`): the page can show the same words in a second place (the activity of a record, the row of a list) while the toast is on screen, and a locator of the text alone then answers two elements. Such a test passes on a slow database and fails on a fast one. A toast stays while the pointer is on it, and a toast that stays covers the controls under it: a click on one of them never lands. After a click that starts a toast, move the pointer off the toast before the next click near it (`toastGone`). One move of the pointer is not always enough: `toastGone` puts the pointer on the toast, takes it off again, and tries again while the toast stays.
3. The test uses a **manual assertion or a fixed wait**: `expect(await locator.isVisible()).toBe(true)`, `waitForTimeout`. Use a web-first assertion, which waits and retries: `await expect(locator).toBeVisible()`. (Best Practices, "Use web first assertions".)
4. A Playwright call has **no `await`**: the test passes without running the call. Gate: `pnpm lint`, rule `@typescript-eslint/no-floating-promises`. (Best Practices, "Lint your tests".)
5. The test takes **a response or a quiet network as the sign that the screen is ready**. A streamed tRPC answer sends HTTP 200 before the procedure ends, and the app prefetches without end. Wait for the screen's own answer: the field that closes, the row that shows, the heading of the next step. The address of a page is such an early sign too: a layout that streams its frame and then redirects (a `redirect()` under a `Suspense`) has the old address when the page loads. Read which page it is from what it shows (`expect(home.or(welcomeForm)).toBeVisible()`). A full page load that the app starts (a sign-out, `window.location`) changes the address before the scripts of the new page run, and a field of a form that is typed in before then loses its text: the helper that fills the form waits for the loaded page first (`page.waitForLoadState("load")`, or `page.waitForURL`, which waits for the load; `expect(page).toHaveURL` does not). After a filter, a tab or a search changes, the address also changes before the rows and the counts do: the test waits for a row or a count that only the new answer shows before it reads a number from the screen.
6. The test **depends on data it did not make**, or on data that a second test changes. Each test makes its own data, with a name that holds the test and the run, and removes it at the end. Data it cannot remove carries one fixed marked name, and each fixed value of that data (a phone, an address) is in one file, `support/flow-check.ts`: two flows never give one value to two people. (Playwright, Parallelism, "Give each test its own backend data".) A compare of two numbers that the page reads at different moments (the count on a tab and the total of its list) loads the page again on each retry: a second test can add a row between the two reads.
7. The file uses **`serial` mode**, or a test needs a second test to run first. Steps that build on each other are one test, with one `test.step` per step (`flowSteps` in `support/steps.ts`): the report lists each step. Two flows that only share a starting point (a member who is set up) are two tests, and a helper makes the starting point for each: a failure in the first then does not hide the second. (Parallelism, "Serial mode": "Using serial is not recommended.")
8. The test **changes or ends the session of the shared account**: it signs out, changes the password, removes the member. Such a test signs in as an account that it made. (Playwright, Authentication, "Basic: shared account in all tests", "When not to use".)
9. The run **reaches a third party for real**: an email, an SMS, a payment. The server of the run starts with no key for each sender, so each message prints to the server log. The test reads its own message there, by the address or the number that it made, and it reads the newest message that it has not read: the server sends a message after it answers the request, so the newest message in the log can be an old one. (Best Practices, "Avoid testing third-party dependencies".)
10. The test **mocks our own API** (`page.route` on our own routes). The real wiring is the subject of the test. `page.route` is only for a third party that the browser calls. A handler that only holds a request back and continues it unchanged (`route.continue()` after a wait on a promise the test resolves) is not a mock: it proves what the screen shows while an answer is on its way.
11. The test **does not fail on a fault the screen hides**: an error the page throws, an error it prints, a refused API call, a server failure. Collect them (`collectPageErrors`) and assert that the list is empty at the end of each test. A step whose point is a refusal empties the list itself and says why.
12. The run **uses a server it did not start**: a dev server, or a server that already answers on the port. The run builds the app and starts that build (`reuseExistingServer: false`).
13. The test holds a **pixel baseline (`toHaveScreenshot`)**. A baseline is a picture of what the builder made, not of the design, and it needs the same data on every run. The design check below compares the screen with the design itself.
14. An **expected value comes from the app**, not from the spec: a text copied from the screen that the builder made, when the spec states a different one.
15. The **name of the test** does not state the step and its outcome, or the body holds logic (a loop, a branch) that hides which step failed.
16. The test **sets its own time limit**: `test.setTimeout`, `test.slow`, a `timeout` of `describe.configure` or of a step. A raised limit is a guess, and a step that hangs then runs for the length of that limit. Each step of `flowSteps` has the limit of the config, and the test gets that time for each step. A step that needs more time is two steps. Gate: `pnpm lint`, rule `no-restricted-syntax`. (Playwright, Timeouts; `test.step`, option `timeout`.)

## A test that fails

1. Read the name of the test, its error, its last screenshot and its trace (`.output/results/<test>/trace.zip`).
2. **The fault is in the app: fix the app.** This is the usual case. When the rule had no backend test, add one.
3. **The fault is in the test** only when an item of the Review checklist is true for it, or the test contradicts the spec. Fix the test so that it says what the spec says.
4. Never weaken an assertion, never change an expected value to the value the app shows, never skip a test (`test.skip`, `test.fixme`), and never delete one.
5. **A test that fails on and off:** run the file a maximum of 3 times. Never loop a run. The cause is an item of the Review checklist (most often 3, 5, 6 or 8) or a real race in the app. Read the requests and their order in the trace. A real race in the app is a finding: fix the app in the same change. Two tests at the same moment are two people at the same moment, so a failure that shows only when the tests run in parallel is most often such a race: read the server log of the run (`.output/server-<app>.log`) for the failed statement before you change a test or the number of workers.
6. **A fault that you find, you fix in the same change**: in the app, in the test or in the setup of the run. A fault that the report names and the change leaves is a second fault.
7. **When a fix needs what you do not have** (a setting of a service, an access): look for a second fix first. It fits the resources and the stack of the repo, and it changes no infrastructure. Take it from the official docs of the product, the repo of the product or a web standard (MDN, an RFC). A blog or a forum answer with no such source proves nothing: test the claim. Stop only when no such fix exists, and do not push. The last message names the test, the cause, the sources that you read and the report file. This is the one case that reaches the developer.

## The design check

The design is the standard for a screen: to a person, the built screen looks like it, built with stock Tailwind and good practice. It is not a copy of each pixel: a design artifact can be wrong.

**The app is built with stock Tailwind classes only.** A size of the design that no stock class gives (13 px of type, a radius of 12 px) is built with the nearest stock class. Never add a size token to the theme and never write an arbitrary value (`text-[13px]`) to equal a design.

**The design is its source file**, `docs/designs/<Screen>.dc.html`: the HTML and CSS of the design artifact, which a browser draws as it is. `docs/designs/canvas.json` gives each design its title, its app and its size. The repo holds no picture of a design: a picture has no values, and the source file has each one. A design that exists only as a picture is a gap for the planner to resolve: ask for the source.

**A built screen that the developer changed after the design keeps its look.** The repo's `CLAUDE.md` names those screens. A difference on one is not a fault: no builder changes its look to equal the design, no flow calls `expectDesign` on it (`shot` records the screen and does not fail), and no `pnpm screens` gate lists it. On such a screen a builder fixes a fault of behavior only. A part that the spec states and the screen lacks is such a fault: the builder adds it and changes nothing that the screen shows. Never mark its `E<n>` line "no path on the screen" and leave it. A checklist that adds a part to such a screen builds only that part to the design.

**A page in a kept shell is compared in its own part.** `KEPT` in `support/apps.ts` holds, per app, the selectors of the parts that keep their look and are on each page (a side nav, a top bar), for the built page and for the design. The run leaves out each text inside them on the two screens, takes no box and no color from the frame around them, and measures the place of a text in the page's own part. This is the `mask` of a Playwright screenshot, for a check that reads values. So `<Design>-<width>.design.json` lists only the differences of the page's own part, also for a dialog or a sheet over the shell. A difference on a text of the own part is a fault, and the builder fixes it. The one exception is a stock shadcn part (below). A flow step calls `expectDesign` when the run prints no difference, and `shot` when each difference that is left is on a stock part. This is never a question for the developer.

**Each other screen and each other part looks like its design**, also a part that an earlier checklist built (a card, a preview). A difference that the design check or a review finds on it is a fault: the builder fixes it in the same checklist, in the shared part, one time. A checklist line that names an existing part never permits a difference from the design.

**A stock shadcn part (a badge, a button) keeps its stock size and weight.** A few pixels of height or one step of weight between it and the design is not a difference: the screen looks like the design. No builder changes the part for it, no review `fail` line on it is a fault, and it is never a question for the developer.

**A difference from a part of a later spec (a shell) or from the data of a run is no fault of the screen.** Record the screen with `shot` and judge the two pictures. Never write a check that fails on it.

### Build from the source

1. Before you build a screen, read the source file of its design: the markup of the screen whole, and the style rule of each class that the markup uses. Do not read the script.
2. Take each value from the source: the order of the parts, the texts word for word, each size, weight, color, radius, border and shadow.
3. Build each color with the token of the theme that gives it. When no token gives it, correct the theme file, in one place. Build each size with the stock Tailwind class that is nearest to it (`text-sm` for 13 px or 14 px, `h-9` for 36 px). Never write a raw color value or a one-off size in a component (the token rules of `frontend-standards`).
4. A part that many screens share (the side nav, the top bar, a button) is corrected where it lives, one time.

### Compare

- A route: `SCREENS="<Design>=<path>" pnpm screens`.
- A screen that a route alone does not show (a dialog, a sheet, a state of a record): `await expectDesign(page, "<Design>")` in the flow step that opens it. For the design of a loading state, pass `{ loading: true }`.

The run draws the built screen and the design source in the same browser at the same window size. It reads the computed look of each visible text on the two screens and pairs the texts that read the same (a number is data, so `22 active` pairs with `8 active`). It fails on a difference and prints the two values, with the nearest stock step when the built size is not that step:

```
Deals: 3 texts look different from the design, 104 look the same.

"New deal"
  font-weight: design 600, built 500
  box height: design 36px, built 32px, the nearest stock step is 36px
```

It compares, per text: color, font size, weight, family, line height, letter spacing, decoration and style; the color behind the text; the background, the border, the radius and the shadow of its box; for a control, the height, and the size and color of its icon; and the place of the first text of each line. It reads the computed look, so a design class and a Tailwind class that look the same are equal.

A size is a difference only when a stock step is nearer to the design than the built value is: 13 px of type lies between `text-xs` and `text-sm`, so the two pass and `text-base` fails. This holds for the type size, the line height, the letter spacing, the radius, the height, the icon size and the place of a text. A stock type size changes the width of a text, so a text is in its place when its left edge, its center or its right edge is where the design has it. A design text with no line height (`normal`) has the height that its font gives. A color, a weight, a border and a font have no steps: they are equal or they are a difference. A shadow is present or absent: stock Tailwind has no class for its layers.

The check code holds no value of a screen and no list of pairs. Never add one. Never add an exception for a text, never change a design file, and never change the check to make a screen pass: fix the screen, the shared part or the theme.

### What the run does not compare

Five things: the shape of an icon, the space between two blocks, the width of a table column, the layers of a shadow or a gradient, and the look of a text that only one screen shows (a row of data). For those, open the two screenshots of the run (`<Design>-<width>.png` and `<Design>-<width>-design.png`) with the Read tool in one step, and fix what a person sees at a glance: a part that is missing, a wrong or placeholder text, a layout that breaks or overflows, a wrong icon. Never measure the pictures. `<Design>-<width>.design.json` lists the texts that only one screen shows: a text of the design that is not sample data is a part that is not built.

A design has one width. At a different width the screen has no design: save a screenshot at that width (`WIDTH=<n>`), open it, and check it against the responsive rules of `frontend-standards`.

A full-page screenshot is taller than the window, so a side nav ends at the window's height. That is not a difference.

### The proof

1. The builder's proof of a design is the line of its design run (`pnpm screens`, or the flow step with `expectDesign` or `shot`): the passed line, or `N texts look different from the design, M look the same`. For each difference that the run prints, the builder gives one verdict: `fixed` with file:line, or `stock part` with the name of the stock shadcn part. Then one verdict for the five things: `pass`, or `fixed` with file:line.
2. The reviewer (`review-frontend-feature`) gives the verdict a second time with no access to the builder's session: it reads each `.design.json`, opens each pair of screenshots, and returns one verdict per design. A difference is a `fail` line. An agent that grades its own work grades it too high, so the judge is a second agent. (Anthropic, "Harness design for long-running application development".)
3. The developer checks no screen.

## The report

Each run writes the Playwright HTML report: `.output/report/<app>-flows/index.html` lists each test and each step, pass or fail, with the screen it ended on, and `.output/report/<app>-screens/index.html` shows each built screen beside its design (the "Side by side" tab) with the list of differences. The builder's last message names the two files. The report is the evidence of the run for the developer. It is never a task for the developer.

**The last message reports the lines of the list, by name.** It gives how many `E<n>` lines pass, and each line that fails, is blocked or has no test, with its name and the cause. It says that a flow or a feature works only when each line of that flow's list passed in this run. A count of tests (`13 passed`) is the output of the gate, never a statement about a feature.

**The result comes first, in plain words.** The first lines say what works now. Then what is not proved, with the cause. Then each side effect of the work (a schema push that changed more than the change, data that stays), one line each. A caveat never stands before the result.

## E2E test setup

The files under `assets/e2e/` are the standard: copy them to `packages/e2e/` (`gitignore` becomes `.gitignore`), and replace `{{SCOPE}}`, the rows of `support/apps.ts` and the rows of `SIGN_IN` in `support/session.setup.ts`. `flows/web/home.spec.ts` is the first flow of a new repo: move it to the folder of each app.

```
packages/e2e/
  playwright.config.ts     ← the server of the run, the workers, the projects, the report
  eslint.config.mjs        ← the no-floating-promises gate
  flows/<app>/<flow>.spec.ts
  screens/screens.spec.ts  ← draws each route of SCREENS and compares it with its design
  support/
    apps.ts                ← each app's port, design size, session life and output paths
    session.setup.ts       ← signs in once, saves the browser state (the repo writes it)
    inbox.ts               ← reads the emailed link and the texted code from the server log
    file-store.ts          ← carryUploads: sends an upload of the page to the real store
    flow-check.ts          ← each fixed value of the data that a flow cannot remove
    run.ts                 ← starts a run: one run at a time on the machine, the database of the run, a filter selects files of the package
    test-database.ts       ← the database of a run: a PostgreSQL server on the machine, its start data, its stop
    settle.ts              ← waits for the content; collects the page's errors
    toast.ts               ← toastOf: the toast with a text; toastGone: the pointer leaves and the toast closes
    clean-build.ts         ← empties the build folder of the app before the build of a run
    steps.ts               ← flowSteps: one `test.step` per step, its end screen, its hidden faults, its time limit
    read-look.ts           ← reads the computed look of each visible text of a page
    design.ts              ← draws a design source file and compares two looks
    stock-steps.ts         ← what each stock Tailwind class gives with the theme of the app
    shot.ts                ← shot, expectDesign
  .output/                 ← git-ignored: the report, the screenshots, the server log, the saved session and the test database (in the main checkout)
docs/designs/<Screen>.dc.html, canvas.json   ← the design source files
```

### The config

```ts
// playwright.config.ts
const build = `pnpm exec turbo run build --filter={{SCOPE}}/${app.name}`;
const start = `pnpm --filter {{SCOPE}}/${app.name} exec next start -p ${app.port}`;

export default defineConfig({
  outputDir: path.join(outputDir, "results"),
  reporter: [["list"], ["html", { outputFolder: app.reportDir, open: "never" }]],
  // Each test makes its own data, so the tests of a file run at the same time.
  fullyParallel: true,
  // Start with 2. Raise it only while a measured run gets shorter and no step runs out of time.
  workers: 2,
  forbidOnly: true,
  use: { baseURL: app.url, viewport: app.viewport, colorScheme: "light", trace: "retain-on-failure" },
  projects: [
    { name: "session", testDir: "support", testMatch: "session.setup.ts" },
    { name: "screens", testDir: "screens", dependencies: ["session"], use: { storageState: app.statePath } },
    // A flow starts signed in. A file that starts signed out says so.
    { name: "flows", testDir: path.join("flows", app.name), dependencies: ["session"], use: { storageState: app.statePath, screenshot: "on" } },
  ],
  webServer: {
    command: `${build} && ${start} > "${app.serverLogPath}" 2>&1`,
    url: app.url,
    // A server that already answers on the port is not this build: refuse it.
    reuseExistingServer: false,
    // No keys: the console senders print each email and each SMS to the server log.
    env: { AUTH_URL: app.url, EMAIL_API_KEY: "", SMS_API_KEY: "" },
  },
});
```

- The console sender of the app prints an email as `email to <address>: <subject>` with its text on the lines below, and an SMS as `sms to <phone>: <text>`. `support/inbox.ts` reads that form: a sender that prints a different form gives the test no message.
- No app of a run uses a dev port.
- **A flow that uploads carries the upload itself.** A storage bucket accepts the origins of the apps only and matches the port exactly, so it refuses the browser of a run. Never add a port of the run to the bucket: `await carryUploads(page)` (`support/file-store.ts`) sends each upload of the page to the real store from the run (`route.fetch`) and gives the page the answer of the store. (AWS, S3, "Elements of a CORS configuration"; Playwright, Network, "Modify responses".) A sign-in provider is different: its redirect list names the origin of each e2e port.
- The `session` project signs in once through the real sign-in screens and saves the browser state. A saved state is kept while it still opens the app and is younger than half the life of a session (`sessionHours` in `support/apps.ts`): an older session can end in the middle of a run, and each test after it fails. (Playwright, Authentication, "Basic: shared account in all tests".)
- A flow starts with that state. `test.use({ storageState: signedOut })` starts a file signed out, and `browser.newContext({ storageState: signedOut })` opens the browser of a second person. (Authentication, "Avoid authentication in some tests".)
- **The run has its own database, on the machine.** `support/run.ts` starts a PostgreSQL server (`support/test-database.ts`), gives its URL to the apps and the tests as `DATABASE_URL` in place of the one of `.env`, and stops the server at the end. Never run a flow on the database of `.env`: it is remote, each statement pays one round trip, and a request makes many (measured on one repo: 188 ms for a statement there and 0.1 ms on the machine).
  - The server has its own data folder (`.output/postgres` of the main checkout: one server for each checkout, and each worktree has its own database on it, with its own saved sessions, copied from the main checkout on its first run with `CREATE DATABASE ... TEMPLATE`, so two builders never change the schema or the rows of each other), its own port, the loopback address only, a password of its own (`--auth=scram-sha-256`), no socket file, and the settings of the PostgreSQL docs' "Non-Durable Settings". It touches no other PostgreSQL of the machine. (PostgreSQL docs, "Creating a Database Cluster", "Non-Durable Settings"; Playwright, Best Practices, "make sure you control the data".)
  - It has the major version, the encoding, the locale and the time zone of the remote database (`select version()`, `pg_database`), so a statement answers and sorts as it does there.
  - Each run writes the start data, with commands that change nothing on a second run (`START_DATA`): the schema of the checkout (`db:push`), then each seed command of the repo. The run first builds each package that those commands import (`buildForStartData`), so the first run of a new worktree needs no command before it. The start data is the account that the session setup signs in as, and each row that a screen reads and no flow makes: a setting, a rate, a bank account. A flow that fails on an empty database and passes on the remote one names such a row: add its seed command, and never put a row in the test database by hand. `drizzle-kit push` ends with code 0 and writes nothing when it has a question and no terminal (a table, a column or an enum that the database holds and the checkout does not know, while the checkout adds one): a run of a worktree then removes from its own database what the newest migration snapshot does not hold (`dropUnknown`) and pushes one more time, and stops with the cause when the push still asks.
  - A flow never depends on the rows that older runs left (Review item 6). A step that needs a full page of a list makes the rows that are missing. A step that needs a second person signs in one of the start data.
  - To start from an empty database, delete `.output/postgres` and the saved sessions of the main checkout: the next run makes them again.
- The workers share one server, one database and one server log. That is safe only while each test obeys Review items 6, 8 and 9.
- **A flow that crosses apps** is in the folder of the app where it starts: the run also starts the peers of that app (`PEERS` in `support/apps.ts`).
- **The number of workers is measured, not chosen.** Measure a slow run before a change: time one statement, and count the statements of one test with the call trace. With prepared statements (`scaffold-repo`, Step 3), 41 flows went from 24.8 to 5.2 minutes at 4 workers; at 6, steps ran out of time. Keep the fastest number at which each test passes, and write the measured numbers in the config.
- Do not make data that the test does not use: each helper call costs run time.
- The scripts: `"flows": "dotenv -e ../../.env -- node support/run.ts flows"` and `"screens": "dotenv -e ../../.env -- node support/run.ts screens"`, with `pnpm flows` and `pnpm screens` at the root. `APP=<app>` picks the app, `pnpm flows <name>` runs one file, and `pnpm flows --workers=<n>` sets the workers of one run.
- **One run at a time on a machine.** Each worktree of the repo uses the same ports and the same database server. A second run that starts while the first builds finds the first server on its port and tests that server: its emails are in the log of the other worktree, and its tests fail when the first run stops the server. `support/run.ts` makes a run wait for the run that holds `e2e.lock` in the shared git folder, and prints that it waits. Never start Playwright in a different way, never start a second run to get past the wait, and never remove the lock of a run that is active.
- **A filter selects files of the package.** Playwright compares a filter with the full path of a file, and a worktree has the name of its checklist: in `12-order-export/`, the filter `order-export` selects each file, and the run is the full suite. `support/run.ts` compares such a filter with the path inside the package.
- **The limit of a step is measured, not chosen.** `timeout` in the config is the limit of one step of `flowSteps`, and of a test with no step. Set it from a full run: the longest step, times the largest spread of one test between runs. Write the measured numbers in the config. (Playwright, Timeouts.)

### A flow

```ts
// flows/admin/invite-member.spec.ts — signed in as the owner (the project default)
test("an invited person sets up the account and opens the app", async ({ page, browser }, testInfo) => {
  // Own data: the name holds the test and the run.
  const address = `flow-${testInfo.testId.slice(-6)}${Date.now().toString(36)}@example.com`;
  // A second person, in a browser of their own, signed out.
  const visitor = await (await browser.newContext({ storageState: signedOut })).newPage();
  const { step } = flowSteps({ owner: page, member: visitor });

  await step("the owner invites a person and the invite shows as pending", async () => {
    await page.goto("/settings/team");
    await page.getByRole("button", { name: "Invite member" }).click();
    await expectDesign(page, "SettingsTeamInvite"); // the dialog looks like its design
    await page.getByLabel("Email").fill(address);
    await page.getByRole("button", { name: "Send invite" }).click();
    await expect(page.getByRole("row", { name: address })).toContainText("Pending");
  });

  await step("the invite link takes the person through the setup into the app", async () => {
    await visitor.goto(await linkEmailedTo(address));
    // …
  });
});
```

`flowSteps` runs each step as a `test.step`, puts the screen each page ended on into the report, and fails the step on a fault that the screen hides (Review item 11). It gives each step the time limit of the config and gives the test that time for each step (Review item 16), so a long flow sets no limit. A step returns the value of its body, so a later step uses what an earlier step made. The data that a test makes, and the removal of that data at the end of the test, belong in a fixture (`test.extend`): the removal then runs when the test fails too.

### The pre-push gate

The machine that pushes runs the tests: the run starts its own database there. The `scaffold-repo` skill owns and installs the hook, `.husky/pre-push` (`assets/husky/pre-push`).

**Two levels.** The check before a merge is fast and narrow, and the full suite runs after it, outside the loop of the person who pushes. (Playwright, Continuous Integration: `--only-changed` is a fast first pass and a heuristic, and the full suite runs after it. Kubernetes, testing strategy: a check before the merge runs only for its paths; end-to-end tests are the most expensive tests and run after the merge or on a schedule.)

**Level 1, the push.** For each app that the push reaches, the hook runs:

- the flow files that the push adds or changes, by their names, and
- the smoke set: the tests with `{ tag: "@smoke" }`.

One `--grep` expression selects the two, because Playwright tests it against the file name, the name and the tags of each test. The hook does not follow the imports of a flow (`--only-changed`): one changed line of a shared helper then selects most flows (measured: 127 of 168 tests for one new line of a list of names).

1. Documents, unit tests, their fixtures and setup: no run.
2. An app is in the run when the push changes one of its flow files, its code or a package that it uses (`turbo ls --affected`), or a helper of the flows (`packages/e2e` outside `flows/`).
3. The first push, or a change to the config, `support/apps.ts` or the session setup: each app.
4. One run at a time uses the ports and the database: each `pnpm flows` of the hook waits for the run that holds the lock (`support/run.ts`).
5. A push to main that does not hold `origin/main`: refused before the run, with the command that rebases. The remote refuses it only after the run.
6. The hook clears git's own variables first (`unset $(git rev-parse --local-env-vars)`). In a linked worktree git gives a hook `GIT_DIR` and no work tree, and a git command in `packages/e2e` then takes that folder as the top of the repo.

**The smoke set.** One test per main flow of an app: the happy path that the business cannot run without (the sign-in, the main record made, the main list, the money screen). The set of one app takes 2 minutes at most. A checklist that adds a main flow tags its happy-path test. A test with a second browser, an upload or a wait on a time is not in the set.

**Level 2, the full suite.** `pnpm flows:all` runs each flow of each app. It runs one time after a checklist is on main, while no push is active, and before a deploy. A flow that fails there is fixed before the next checklist starts. A builder that changes a helper under `support/` runs the flow files that use the changed part (`pnpm flows <name>`) before its push.

A failure refuses the push. Never make the hook run each flow on each push.

### Dev dependencies

```
@playwright/test  @tailwindcss/node  tailwindcss  dotenv-cli  eslint  typescript-eslint  typescript
```

Run `pnpm exec playwright install chromium` once on a new machine: only the browser the suite uses. (Best Practices, "Optimize browser downloads on CI".)

## Sources

- Playwright, Best Practices: https://playwright.dev/docs/best-practices
- Playwright, Parallelism: https://playwright.dev/docs/test-parallel
- Playwright, Authentication: https://playwright.dev/docs/auth
- Playwright, Web server: https://playwright.dev/docs/test-webserver
- Playwright, Network ("Modify responses"): https://playwright.dev/docs/network
- AWS, S3, Elements of a CORS configuration: https://docs.aws.amazon.com/AmazonS3/latest/userguide/ManageCorsUsing.html
- Playwright, `test.step`: https://playwright.dev/docs/api/class-test#test-step
- Playwright, Timeouts: https://playwright.dev/docs/test-timeouts
- Husky, Get started: https://typicode.github.io/husky/get-started.html
- Playwright, Continuous Integration: https://playwright.dev/docs/ci
- Turborepo, `--affected`: https://turborepo.dev/docs/reference/run
- Software Engineering at Google, chapter 23: https://abseil.io/resources/swe-book/html/ch23.html
- Anthropic, Claude Code best practices: https://code.claude.com/docs/en/best-practices
- Anthropic, Harness design for long-running application development: https://www.anthropic.com/research/harness-design-long-running-apps
- Anthropic, Using Claude for prototypes and UX: https://academy.claude.com/tutorials/using-claude-design-for-prototypes-and-ux
