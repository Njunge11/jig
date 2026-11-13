---
max_turns: 8
timeout_seconds: 420
allowed_tools: [Read, Glob, Grep, Skill]
runs: 3
tags: [e2e-tests]
---

We build this next week. Before the code exists, write the list of end-to-end tests that will prove it: one line per test, with the step or the case and what the person sees. No test code.

## Team (admin app)

1. Sign-in. A team member signs in with an email address and a six-digit code that the app emails. A wrong code shows "That code isn't right." A code is valid for 10 minutes. An older code shows "That code has expired. Send a new one."

2. Roles. A member has one role: Owner, Manager or Viewer.

| Action | Owner | Manager | Viewer |
| --- | --- | --- | --- |
| See the team list | yes | yes | yes |
| Invite a member | yes | yes | no |
| Change the role of a member | yes | no | no |
| Remove a member | yes | no | no |
| See the audit log | yes | yes | no |
| Export the audit log | yes | no | no |

A member who opens a screen without the permission sees "You don't have access to this page."

3. Invites. The Owner or a Manager invites a person by email. The invite shows as "Pending" in the team list. The person opens the emailed link, sets a name, and lands on the team list. A link that was used shows "This invite was already used."

4. Clean-up. A nightly job deletes each invite that is older than 7 days.

The test run signs in one time as the seeded Owner, and every test starts with that session.
