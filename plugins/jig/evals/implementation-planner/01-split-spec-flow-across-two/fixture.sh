#!/bin/bash
set -euo pipefail
mkdir -p docs/store apps/admin/src/features/team/ui packages/e2e/flows/admin
cat > docs/store/spec.md <<'MD'
# Store admin — spec 02: invites

The Team page (`/settings/team`) is built: it lists the members. This spec adds invites.
The Team page with its invite dialog is one PR. The page that the emailed link opens is a second PR: the two do not fit in one.

1. The Owner invites a person by email from the Team page. The invite shows as "Pending".
2. An address that is already a member is refused: "This person is already on the team."
3. The person opens the emailed link, sets a name and a password, and lands on the Team page as a member.
4. A link that was used shows "This invite was already used."
5. On the Team page of the Owner, the invite then shows as "Accepted".

No design exists for the two screens: build them with the stock components.
MD
cat > apps/admin/package.json <<'JSON'
{ "name": "@store/admin", "private": true, "scripts": { "dev": "next dev -p 3000", "build": "next build", "lint": "eslint .", "typecheck": "tsc --noEmit" } }
JSON
cat > apps/admin/src/features/team/ui/team-page.tsx <<'TSX'
export function TeamPage() {
  return <h1>Team</h1>;
}
TSX
cat > packages/e2e/playwright.config.ts <<'TS'
import { defineConfig } from "@playwright/test";

export default defineConfig({ testDir: "flows/admin", fullyParallel: true, workers: 2 });
TS
git init -q
git add -A
git -c user.name=fixture -c user.email=fixture@example.com commit -q -m "chore: the repo"
