#!/bin/bash
set -euo pipefail
mkdir -p docs/store/checklists packages/e2e/flows/admin
cat > docs/store/checklists/07-invites.md <<'MD'
# 07 — Invites

## Scope

The Owner invites a person to the team, and the person accepts. Spec: `docs/store/spec.md`, section 4.
Target: admin, feature invites. Builds on: 06.
Type: feat. Branch: `feat/invites`.

## Frontend + Integration

### Behavior

- [x] F1 The Team page has an "Invite member" button that opens a dialog with an Email field
- [x] F2 "Send invite" adds the row as "Pending" and closes the dialog
- [x] F3 An address that is already a member shows "This person is already on the team."
- [x] F4 The emailed link opens the setup page: a name, a password, then the Team page
- [x] F5 A link that was used shows "This invite was already used."
- [x] F6 A pending row has a Cancel action; the link then shows "This invite was cancelled."
- [x] F7 A pending row has a Send again action; the old link then shows "This invite was replaced by a newer one."

## E2E tests

Flow file: `packages/e2e/flows/admin/invite-member.spec.ts`.

- [x] E1 the owner invites a person and the invite shows as "Pending"
- [x] E2 an address that is already a member shows "This person is already on the team."
- [x] E3 the person opens the emailed link, sets a name and a password, and lands on the Team page
- [x] E4 a link that was used shows "This invite was already used."
- [ ] E5 the owner cancels a pending invite and the link shows "This invite was cancelled."
- [ ] E6 the owner sends the invite again and the old link shows "This invite was replaced by a newer one."

## Done

- [ ] Every F item above is checked and shown.
- [ ] Every E item is checked: each line has a test or a `test.step` of that name, and `pnpm flows` printed its `N passed` line in this transcript.
MD
cat > packages/e2e/flows/admin/invite-member.spec.ts <<'TS'
import { expect, test } from "../../support/member-test";
import { flowSteps } from "../../support/steps";

test("an invited person sets up the account and opens the app", async ({ page, visitor, person }) => {
  const { step } = flowSteps({ owner: page, member: visitor });
  await step('the owner invites a person and the invite shows as "Pending"', async () => {
    /* … */
  });
  await step("the person opens the emailed link, sets a name and a password, and lands on the Team page", async () => {
    /* … */
  });
});

test('an address that is already a member shows "This person is already on the team."', async ({ page }) => {
  /* … */
});

test('a link that was used shows "This invite was already used."', async ({ page, visitor, person }) => {
  /* … */
});
TS
git init -q -b main && git add -A && git -c user.name=eval -c user.email=eval@example.com commit -q -m init
