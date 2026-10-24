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

### Behavior (test-backed)

- [ ] F1 The members page lists each pending invitation with its email and the date it was sent

### Visual & responsive (browser-checked, never jsdom tests)

- [ ] V1 At 375 the list is one column

## Manual verification

- Open /settings/members and see the pending invitations.

## Done

- [ ] Every F item above is checked and shown; every V item is checked or listed as browser-check.
MD
cat > docs/growth/tracker.md <<'MD'
# Tracker

| # | Checklist | Status |
| --- | --- | --- |
| 01 | [01 — Invite list](checklists/01-invite-list.md) | Not started |
MD
git init -q -b main && git add -A && git -c user.name=eval -c user.email=eval@example.com commit -q -m init
