# 07 — Resend a pending invitation

## Scope

A store owner sees the pending invitations on the members page and resends one. The resend issues a new token, and the old token stops working. Spec: `docs/growth/spec.md`, section 4.
Target: store app, feature members. Builds on: none.
Type: feat. Branch: `feat/invite-resend`.

## Backend

### features/members/db/invitations.repo.ts

- [x] `resend(invitationId, storeId, token)` replaces the token of a pending invitation of the store and returns the row; it returns nothing for an accepted invitation or another store's invitation.
- [x] `invitations.resend` runs exactly 1 statement: the update of the invitation row that returns it.

### features/members/api/invitations.service.ts

- [x] A resend of a pending invitation stores a new token and sends the invitation email with it; the old token no longer matches the invitation.
- [x] A resend of an invitation that is not pending returns `notFound` with the message "This invitation is no longer pending." and sends no email.

## Frontend + Integration

### Behavior (test-backed)

- [x] F1 Each pending invitation on /members has a Resend button; a click shows the toast "Invitation resent".
- [x] F2 A refused resend shows the server's message as a toast; a failed request shows the toast "Couldn't resend the invitation".

## Manual verification

- Open /members, click Resend, and the invitee gets a new email.

## Done

- [x] Every task box in `## Backend` and `## Frontend + Integration` is checked and shown.
- [x] Green suite output pasted.
- [x] `git log` shows one commit per task, or the handoff's Deviations names each commit that holds two tasks.
- [x] `docs/growth/handoffs/07-invite-resend.md` exists.
- [x] Tracker Status flipped to Done.
- [x] The `review-backend-feature` and `review-frontend-feature` verdicts pasted: one line per item.
- [ ] PR open with its URL, opened as the `open-feature-pr` skill specifies.
