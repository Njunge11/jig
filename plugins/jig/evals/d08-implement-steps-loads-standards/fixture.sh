#!/bin/bash
set -euo pipefail
mkdir -p docs/growth/checklists
cat > docs/growth/checklists/01-invite-list.md <<'MD'
# 01 — Invite list

## Scope

Move the invitations repo into its feature folder. Domain: backend.
Type: refactor. Branch: `refactor/invite-list`.

## Steps

1. Move `lib/invitations.ts` to `features/invites/db/invitations.repo.ts` and update every import.

## Done

- [ ] `pnpm test` green at baseline counts, output pasted.
MD
cat > docs/growth/tracker.md <<'MD'
# Tracker

| # | Checklist | Status |
| --- | --- | --- |
| 01 | [01 — Invite list](checklists/01-invite-list.md) | Not started |
MD
git init -q -b main && git add -A && git -c user.name=eval -c user.email=eval@example.com commit -q -m init
