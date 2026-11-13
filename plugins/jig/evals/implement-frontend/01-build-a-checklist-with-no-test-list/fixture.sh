#!/bin/bash
set -euo pipefail
mkdir -p docs/store/checklists
cat > docs/store/spec.md <<'MD'
# Store admin — spec

## 4. Invites

1. The Owner invites a person by email from the Team page. The invite shows as "Pending".
2. An address that is already a member is refused: "This person is already on the team."
3. The person opens the emailed link, sets a name and a password, and lands on the Team page as a member.
4. A link that was used shows "This invite was already used."
5. The Owner cancels a pending invite. The row goes away, and its link shows "This invite was cancelled."
6. The Owner sends an invite again from its row. The old link shows "This invite was replaced by a newer one."
MD
cat > docs/store/tracker.md <<'MD'
# Store admin — tracker

| # | Checklist | Status |
| --- | --- | --- |
| 06 | Team page | Done |
| 07 | Invites | Backend done |
MD
cat > docs/store/checklists/07-invites.md <<'MD'
# 07 — Invites

## Scope

The Owner invites a person to the team, and the person accepts. Spec: `docs/store/spec.md`, section 4.
Target: admin, feature invites. Builds on: 06.
Type: feat. Branch: `feat/invites`.

## Backend

- [x] B1 `invites.create` makes a pending invite and sends the email
- [x] B2 `invites.create` refuses an address that is already a member
- [x] B3 `invites.accept` makes the member and marks the invite used
- [x] B4 `invites.cancel` removes a pending invite
- [x] B5 `invites.resend` replaces the link and sends the email again

## Frontend + Integration

### Behavior

- [ ] F1 The Team page has an "Invite member" button that opens a dialog with an Email field
- [ ] F2 "Send invite" adds the row as "Pending" and closes the dialog
- [ ] F3 An address that is already a member shows "This person is already on the team."
- [ ] F4 The emailed link opens the setup page: a name, a password, then the Team page
- [ ] F5 A link that was used shows "This invite was already used."
- [ ] F6 "Cancel invite" in the row menu removes the row
- [ ] F7 "Send again" in the row menu sends a new link

## Manual verification

- Walk the invite flow on the running app.

## Done

- [ ] Every F item is checked
- [ ] `pnpm lint` and `pnpm typecheck` exit 0
- [ ] The flow walks `## Manual verification`
MD
mkdir -p apps/admin/src/features/invites/api apps/admin/src/features/team/ui packages/e2e/flows/admin docs/designs
cat > apps/admin/package.json <<'JSON'
{ "name": "@store/admin", "private": true, "scripts": { "dev": "next dev -p 3000", "build": "next build", "lint": "eslint .", "typecheck": "tsc --noEmit" } }
JSON
cat > apps/admin/src/features/invites/api/invites.router.ts <<'TS'
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@store/trpc";
import { acceptInviteSchema, createInviteSchema, inviteIdSchema } from "./invites.schema";
import * as invites from "./invites.service";

export const invitesRouter = createTRPCRouter({
  list: protectedProcedure.query(({ ctx }) => invites.list(ctx)),
  create: protectedProcedure.input(createInviteSchema).mutation(({ ctx, input }) => invites.create(ctx, input)),
  accept: publicProcedure.input(acceptInviteSchema).mutation(({ ctx, input }) => invites.accept(ctx, input)),
  cancel: protectedProcedure.input(inviteIdSchema).mutation(({ ctx, input }) => invites.cancel(ctx, input)),
  resend: protectedProcedure.input(inviteIdSchema).mutation(({ ctx, input }) => invites.resend(ctx, input)),
});
TS
cat > apps/admin/src/features/team/ui/team-page.tsx <<'TSX'
export function TeamPage() {
  return <h1>Team</h1>;
}
TSX
cat > packages/e2e/playwright.config.ts <<'TS'
import { defineConfig } from "@playwright/test";

export default defineConfig({ testDir: "flows/admin", fullyParallel: true, workers: 2 });
TS
cat > packages/e2e/flows/admin/team.spec.ts <<'TS'
import { expect, test } from "@playwright/test";

test("the owner opens the Team page", async ({ page }) => {
  await page.goto("/settings/team");
  await expect(page.getByRole("heading", { name: "Team" })).toBeVisible();
});
TS
git init -q -b feat/invites
git add -A
git -c user.name=fixture -c user.email=fixture@example.com commit -q -m "chore: the repo"
