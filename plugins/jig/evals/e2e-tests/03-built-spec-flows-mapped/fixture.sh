#!/bin/bash
set -euo pipefail
mkdir -p docs/store/checklists packages/e2e/flows/admin packages/e2e/support
cat > docs/store/spec.md <<'MD'
# Store admin — spec

## 4. Invites

1. The Owner invites a person by email from the Team page. The invite shows as "Pending".
2. An address that is already a member shows "This person is already on the team."
3. The person opens the emailed link, sets a name and a password, and lands on the Team page as a member.
4. A link that was used shows "This invite was already used."
5. The Owner cancels a pending invite. The row goes away, and the link then shows "This invite was cancelled."
6. The Owner sends the invite again from the row. The person gets a new link, and the old link shows "This invite was replaced by a newer one."
MD
cat > docs/store/tracker.md <<'MD'
# Store admin — tracker

| # | Checklist | Status |
| --- | --- | --- |
| 06 | Team page | Done |
| 07 | Invites: send and accept | Done |
| 08 | Invites: cancel and send again | Done |
MD
cat > docs/store/checklists/07-invites-send-accept.md <<'MD'
# 07 — Invites: send and accept

## Scope

The Owner invites a person to the team, and the person accepts. Spec: `docs/store/spec.md`, section 4, items 1 to 4.
Target: admin, feature invites. Builds on: 06.

## Frontend + Integration

### Behavior

- [x] F1 The Team page has an "Invite member" button that opens a dialog with an Email field
- [x] F2 "Send invite" adds the row as "Pending" and closes the dialog
- [x] F3 An address that is already a member shows "This person is already on the team."
- [x] F4 The emailed link opens the setup page: a name, a password, then the Team page
- [x] F5 A link that was used shows "This invite was already used."

## Manual verification

- Walk the invite flow on the running app.

## Done

- [x] Every F item is checked
- [x] The flow walks `## Manual verification`
MD
cat > docs/store/checklists/08-invites-cancel-resend.md <<'MD'
# 08 — Invites: cancel and send again

## Scope

The Owner cancels a pending invite or sends it again. Spec: `docs/store/spec.md`, section 4, items 5 and 6.
Target: admin, feature invites. Builds on: 07.

## Frontend + Integration

### Behavior

- [x] F1 "Cancel invite" in the row menu removes the row
- [x] F2 A cancelled link shows "This invite was cancelled."
- [x] F3 "Send again" in the row menu sends a new link
- [x] F4 The old link shows "This invite was replaced by a newer one."

## Manual verification

- Walk the cancel and the send-again on the running app.

## Done

- [x] Every F item is checked
- [x] The flow walks `## Manual verification`
MD
cat > packages/e2e/playwright.config.ts <<'TS'
import { defineConfig } from "@playwright/test";

export default defineConfig({ testDir: "flows/admin", fullyParallel: true, workers: 2 });
TS
cat > packages/e2e/flows/admin/invite-member.spec.ts <<'TS'
import { expect, test } from "../../support/member-test";
import { flowSteps } from "../../support/steps";

test("an invited person sets up the account and opens the app", async ({ page, visitor, person }) => {
  const { step } = flowSteps({ owner: page, member: visitor });
  await step("the owner invites a person and the invite shows as pending", async () => {
    await page.goto("/settings/team");
    await page.getByRole("button", { name: "Invite member" }).click();
    await page.getByLabel("Email").fill(person.email);
    await page.getByRole("button", { name: "Send invite" }).click();
    await expect(page.getByRole("row", { name: person.email })).toContainText("Pending");
  });
  await step("the invite link takes the person through the setup into the app", async () => {
    await visitor.goto(await person.inviteLink());
    await visitor.getByLabel("Name").fill(person.name);
    await visitor.getByLabel("Password").fill(person.password);
    await visitor.getByRole("button", { name: "Create account" }).click();
    await expect(visitor.getByRole("navigation")).toBeVisible();
  });
});

test("the invite dialog closes on Cancel", async ({ page }) => {
  await page.goto("/settings/team");
  await page.getByRole("button", { name: "Invite member" }).click();
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
});

test("the invite dialog shows the role select", async ({ page }) => {
  await page.goto("/settings/team");
  await page.getByRole("button", { name: "Invite member" }).click();
  await expect(page.getByLabel("Role")).toBeVisible();
});
TS
git init -q
git add -A
git -c user.name=fixture -c user.email=fixture@example.com commit -q -m "chore: the repo"
