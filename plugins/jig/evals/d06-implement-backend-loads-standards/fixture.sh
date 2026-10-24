#!/bin/bash
set -euo pipefail
mkdir -p docs/growth/checklists
cat > docs/growth/checklists/01-invite-list.md <<'MD'
# 01 — Invite list

## Scope

The invitations repo and its list procedure. Spec: `docs/growth/spec.md`, section 2.
Target: apps/web, feature invites. Builds on: none.
Type: feat. Branch: `feat/invite-list`.

## Backend

### features/invites/db/invitations.repo.ts

- [ ] listInvitations returns the pending invitations of one company, newest first

## Manual verification

- Open /settings/members and see the pending invitations.

## Done

- [ ] Every task box in `## Backend` is checked and shown.
- [ ] Green suite output pasted.
MD
cat > docs/growth/tracker.md <<'MD'
# Tracker

| # | Checklist | Status |
| --- | --- | --- |
| 01 | [01 — Invite list](checklists/01-invite-list.md) | Not started |
MD
git init -q -b main && git add -A && git -c user.name=eval -c user.email=eval@example.com commit -q -m init
