#!/bin/bash
set -euo pipefail
mkdir -p docs/growth/checklists
cat > docs/growth/checklists/01-invite-list.md <<'MD'
# 01 — Invite list

## Scope

The pending-invitations list on the members page. Spec: `docs/growth/spec.md`, section 2.
Target: apps/web, feature invites. Builds on: none.
Type: feat. Branch: `feat/invite-list`.

## Frontend + Integration

### Behavior

- [ ] F1 The members page lists each pending invitation with its email and the date it was sent

### Responsive

- [ ] V1 At 375 the list is one column

## E2E tests

Flow file: `packages/e2e/flows/web/invite-list.spec.ts`.

- [ ] E1 the members page lists each pending invitation with its email and the date it was sent

## Done

- [ ] Every F item above is checked and shown; every V item is checked with the path of its screenshot.
- [ ] Every E item is checked: each line has a test or a `test.step` of that name, and `pnpm flows` printed its `N passed` line in this transcript.
MD
cat > docs/growth/tracker.md <<'MD'
# Tracker

| # | Checklist | Status |
| --- | --- | --- |
| 01 | [01 — Invite list](checklists/01-invite-list.md) | Not started |
MD
git init -q -b main && git add -A && git -c user.name=eval -c user.email=eval@example.com commit -q -m init
