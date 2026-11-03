---
name: manual-qa
description: Writes a pull request's manual QA test cases into a Google Sheet, one row per thing an end user can verify, with a status dropdown and rows coloured by status, and keeps that sheet current as the PR changes. Use after the open-feature-pr skill opens a PR, before the push in a repo that pushes straight to main, after a later change alters what a user sees, or when the developer asks for manual QA, test cases, or a QA sheet for a PR or a task.
---

# Manual QA

One PR has one Google Sheet. The agent writes the test cases, and a person runs them and sets each row's status.

- **The sheet comes after the PR.** Run this skill when the PR exists, never before.
- **Steps come from the code.** Every label, path and screen in a step is read from the PR's code, never from the spec or from memory.
- **The expected outcome comes from the spec and the user's experience.** So a mismatch between the code and the spec shows as a failed row.
- **The agent never runs a test case and never sets Pass or Fail.** It sends no model turn and runs no eval. A case that needs a chat turn is written for the tester to run.
- **A missing connector never blocks the PR.** See [When a step fails](#when-a-step-fails).

## Straight to main

When the repo's `CLAUDE.md` says work goes straight to main, no PR exists. The sheet belongs to the task and comes before the push, once the review fixes are committed. Read "the PR" in the steps below as the task, with these changes:

- **Step 1:** the record is the task's handoff file (`docs/<project>/handoffs/NN-<slug>.md`), or the checklist file for a step checklist. When it has a `## Manual QA` section with a sheet link, go to Step 7. Run no `gh` command.
- **Step 2:** the diff is `git diff origin/main...HEAD`. The line for a change no user can see goes into the record file.
- **Step 5:** the title is `<repo> <checklist file name, without .md>: <checklist title>`.
- **Step 6:** write the `## Manual QA` section at the end of the record file, with the short sha of HEAD, and commit it: `docs(<scope>): link the manual QA sheet`. The push carries that commit.
- **Step 7:** a later fix is a later commit on main. Read the diff from the commit the section names, and write the new sha into the section in the fix's own commit.

## Instructions

### Step 1: Find the PR and its sheet

Run this in the PR's worktree:

```bash
gh pr view --json number,title,url,body,headRefName
gh repo view --json name -q .name
```

When the body has a `## Manual QA` section with a sheet link, go to [Step 7](#step-7-update-the-sheet). Otherwise go to Step 2.

**Gate:** the PR number is known, and you know if a sheet exists.

### Step 2: Check that a user can see the change

Read `git diff origin/main...HEAD --stat`, then the diff. Keep a behaviour when a person can do it or see it in the running product. An email or a message that a person receives counts.

When the PR changes nothing a person can see, such as a refactor or a test change, add this section to the PR body as Step 6 shows, and stop:

```
## Manual QA
This PR changes nothing a user can see, so it has no manual QA sheet.
```

**Gate:** you have a list of behaviours a person can see, or the PR body holds that line.

### Step 3: Read three things

Read these, and nothing else:

1. The diff from Step 2. It holds every label, heading and state the PR adds or changes.
2. The spec's section for this PR. It holds the expected outcomes.
3. The `## Manual verification` list of the PR's checklist, and the handoff when it exists.

Then go to Step 4. Do not read a file because the diff imports it. Do not read the server path behind an action. Do not read a machine's states beyond the lines the diff shows. When a row needs one fact the three reads do not hold, such as the path to a screen, run one `git grep` for it and read only the lines it returns.

**Gate:** the three reads are done, and you have made no other read.

### Step 4: Write the test cases

Write one row per test case, in the order a user meets the behaviours, so the sheet reads as one walkthrough.

**Test case column.** Name who does what, in the words of the end user. Keep it to one line.

- One row is one unit a tester can mark Pass or Fail. Two outcomes that can pass and fail apart are two rows.
- Never name a file, a function, a table, or a procedure.

**Steps to test column.** Put the preconditions first, then the test.

```
Setup:
1. <how to reach the starting state, from the signed-in app>

Steps:
1. <one action, with the real label>
```

- Write `Setup: none` when the case has no precondition.
- A precondition is never a bare statement. "A candidate on the Onsite stage" fails. Give the steps that put a candidate there: which account, which record, what to click.
- A precondition outside the app is a Setup step too: a second account, a migration, an environment value, a mailbox to watch.
- Setup may name another case when it builds on it: `Setup: complete "A recruiter invites a new member" first.` Use the case's exact name.
- When only a command reaches the state, give the exact command, and name the folder to run it from.
- When nothing a tester can do reaches the state, leave the case out, and name it in the report in Step 8.

**Expected outcome column.** Say what the user sees or receives, from the spec. Use the real text on the screen.

**Status column.** Write `Pending`.

Cover these, for each behaviour the PR adds or changes:

- The main path, and each step under `## Manual verification`.
- Each state a screen draws: empty, loading that a user can notice, error, refused, and each stage a machine shows.
- Each role that sees a different result.
- Each email or message a person receives.
- Undo, back and reload, where the feature offers them or the state must survive them.

Leave out what no person can see, and flows the PR does not touch.

When the code and the spec disagree, the expected outcome keeps the spec, and the row stays `Pending`. Name the mismatch in the report in Step 8. The sheet holds one version of the truth: never add a note, a correction, or a second list.

A correct row:

| Test case | Steps to test | Expected outcome | Status |
| --- | --- | --- | --- |
| A team owner resends a pending invitation | Setup:<br>1. Sign in as an owner.<br>2. Go to Settings > Team.<br>3. Click Invite member, enter a new email address, and click Send invite.<br><br>Steps:<br>1. In the Pending list, open the invitation's menu.<br>2. Click Resend invite. | The invitation says Sent just now. A second email arrives at that address. | Pending |

These rows fail:

- `resendInvite returns success` names the code, not what the user experiences.
- `Test invitations` names no behaviour and no outcome.
- `Has a pending invitation` as a Setup gives the tester no way to reach that state.

**Gate:** before you write to the sheet, check every label in the Steps column in one command, and fix each label that prints `missing`:

```bash
for l in "<label 1>" "<label 2>"; do git grep -qF "$l" -- <the app's source folders> || echo "missing: $l"; done
```

### Step 5: Create the sheet

Load the Google Sheets and Google Drive connector tools first. Their names end in `get_spreadsheet`, `update_spreadsheet`, `get_values`, `update_values`, `append_values`, `create_file` and `search_files`.

1. Find the folder with Drive `search_files`: `title = 'Manual QA' and mimeType = 'application/vnd.google-apps.folder' and owner = 'me'`. When none exists, create it with `create_file`, with `contentMimeType` set to `application/vnd.google-apps.folder`.
2. Create the sheet with `create_file`: `title` is `<repo> PR #<number>: <PR title>`, `contentMimeType` is `application/vnd.google-apps.spreadsheet`, and `parentId` is the folder. Its first tab has `sheetId` `0`.
3. Send this one `update_spreadsheet` batch. It makes the `QA` tab, the dropdown, and the colours. Its ranges have no end row, so a later row inherits them.

```json
{"requests": [
  {"updateSheetProperties": {"properties": {"sheetId": 0, "title": "QA", "gridProperties": {"frozenRowCount": 1}}, "fields": "title,gridProperties.frozenRowCount"}},
  {"repeatCell": {"range": {"sheetId": 0, "startRowIndex": 0, "endRowIndex": 1, "startColumnIndex": 0, "endColumnIndex": 4}, "cell": {"userEnteredFormat": {"textFormat": {"bold": true}}}, "fields": "userEnteredFormat.textFormat.bold"}},
  {"repeatCell": {"range": {"sheetId": 0, "startRowIndex": 1, "startColumnIndex": 0, "endColumnIndex": 4}, "cell": {"userEnteredFormat": {"wrapStrategy": "WRAP", "verticalAlignment": "TOP"}}, "fields": "userEnteredFormat.wrapStrategy,userEnteredFormat.verticalAlignment"}},
  {"updateDimensionProperties": {"range": {"sheetId": 0, "dimension": "COLUMNS", "startIndex": 0, "endIndex": 1}, "properties": {"pixelSize": 280}, "fields": "pixelSize"}},
  {"updateDimensionProperties": {"range": {"sheetId": 0, "dimension": "COLUMNS", "startIndex": 1, "endIndex": 2}, "properties": {"pixelSize": 520}, "fields": "pixelSize"}},
  {"updateDimensionProperties": {"range": {"sheetId": 0, "dimension": "COLUMNS", "startIndex": 2, "endIndex": 3}, "properties": {"pixelSize": 340}, "fields": "pixelSize"}},
  {"updateDimensionProperties": {"range": {"sheetId": 0, "dimension": "COLUMNS", "startIndex": 3, "endIndex": 4}, "properties": {"pixelSize": 100}, "fields": "pixelSize"}},
  {"setDataValidation": {"range": {"sheetId": 0, "startRowIndex": 1, "startColumnIndex": 3, "endColumnIndex": 4}, "rule": {"condition": {"type": "ONE_OF_LIST", "values": [{"userEnteredValue": "Pending"}, {"userEnteredValue": "Pass"}, {"userEnteredValue": "Fail"}]}, "showCustomUi": true, "strict": true}}},
  {"addConditionalFormatRule": {"index": 0, "rule": {"ranges": [{"sheetId": 0, "startRowIndex": 1, "startColumnIndex": 0, "endColumnIndex": 4}], "booleanRule": {"condition": {"type": "CUSTOM_FORMULA", "values": [{"userEnteredValue": "=$D2=\"Pass\""}]}, "format": {"backgroundColor": {"red": 0.776, "green": 0.937, "blue": 0.808}}}}}},
  {"addConditionalFormatRule": {"index": 1, "rule": {"ranges": [{"sheetId": 0, "startRowIndex": 1, "startColumnIndex": 0, "endColumnIndex": 4}], "booleanRule": {"condition": {"type": "CUSTOM_FORMULA", "values": [{"userEnteredValue": "=$D2=\"Fail\""}]}, "format": {"backgroundColor": {"red": 1, "green": 0.78, "blue": 0.808}}}}}},
  {"addConditionalFormatRule": {"index": 2, "rule": {"ranges": [{"sheetId": 0, "startRowIndex": 1, "startColumnIndex": 0, "endColumnIndex": 4}], "booleanRule": {"condition": {"type": "CUSTOM_FORMULA", "values": [{"userEnteredValue": "=$D2=\"Pending\""}]}, "format": {"backgroundColor": {"red": 1, "green": 0.922, "blue": 0.612}}}}}}
]}
```

4. Write the header and every row in one `update_values` call on `'QA'!A1`. The header row is exactly: `Test case`, `Steps to test`, `Expected outcome`, `Status`. Each cell's line breaks are `\n`.

Both write tools parse a value as the Sheets screen does. Put a leading `'` on a cell that starts with `=`, `+`, `-` or `@`, or that holds only a number or a date.

**Gate:** Step 8's checks pass.

### Step 6: Link the sheet in the PR body

Edit the body. Keep every other section as it is, and read the new body from a quoted heredoc:

```bash
gh pr edit <number> --body-file - <<'EOF'
<the current body>

## Manual QA
[Manual QA sheet](<sheet URL>) covers commit <short sha of HEAD>.
EOF
```

An edit to the body pushes nothing and runs no test suite.

**Gate:** `gh pr view <number> --json body -q .body` shows the section and every earlier section. Then go to Step 8.

### Step 7: Update the sheet

Run this step when the PR changes after the sheet exists. It holds a person's work, so write only the rows that the change affects.

1. Read the commit from the `## Manual QA` section, then read `git diff <commit>..HEAD`.
2. Read the sheet right before you write: `get_values` on `'QA'!A:D`. Find each row by its Test case text.
3. Act on each behaviour by this table:

| The change | The write |
| --- | --- |
| A new behaviour | `append_values` on `'QA'!A:D` adds the row at the end, with `Pending` |
| A changed behaviour, or a fix to a row at `Fail` | `update_values` on that row's own range, with its new text and `Pending` |
| A removed behaviour | `update_spreadsheet` with `deleteDimension` on that row, right after the read |
| No change | No write |

4. Write the new commit into the `## Manual QA` section, as Step 6 shows.

Never rewrite the whole sheet, and never replace the file: the link and each status must stay. Never write the Status column of a row the change does not affect.

**Gate:** Step 8's checks pass.

### Step 8: Check the sheet and report

1. Read `'QA'!A:D` with `get_values`. Check that the row count is what you wrote, and that no earlier status changed.
2. After a new sheet, read `get_spreadsheet` with `fields` set to `["sheets.properties", "sheets.conditionalFormats"]`. Check that the tab is `QA`, row 1 is frozen, and three colour rules exist.
3. After a new sheet, read `get_spreadsheet` with `includeGridData` true, `ranges` set to `["'QA'!D2"]`, and `fields` set to `["sheets.data.rowData.values.dataValidation"]`. Check that the rule lists `Pending`, `Pass` and `Fail`.
4. Show the sheet link and the count of rows added, changed and removed. Name each case you left out, and each mismatch between the code and the spec.

The run ends here.

## When a step fails

- **The Google Sheets tools are not in the session.** A connector added during a session loads only in a new session. Write this line in your output and stop, because the PR stands without the sheet: `Manual QA sheet not written: the Google Sheets connector is not on in this session.` Tell the developer to turn it on at claude.ai/customize/connectors and to start a new session. Never send a CSV, an uploaded .xlsx, or a Markdown table in its place.
- **The PR body has no sheet link, but a sheet exists.** Search Drive for the title before you create one. Never open a second sheet for a PR.
- **Drive says permission denied on the sheet.** The file is in the trash. Ask the developer to restore it. Do not create a new one.
- **`Unable to parse range`.** The tab name is wrong. Read `sheets.properties`, and use the exact title.
- **`Requested writing within range`.** The array is larger than the range. Give the range's top-left cell only.
- **A text cell became a number, a date, or a formula.** Write it again with a leading `'`.
- **`get_values` has no `values` key.** The range is empty. This is not an error.
- **`gh` fails.** Use the **When a step fails** section of the `open-feature-pr` skill.
