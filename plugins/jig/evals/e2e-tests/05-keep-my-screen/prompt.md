---
max_turns: 6
timeout_seconds: 300
allowed_tools: [Read, Glob, Grep, Skill]
runs: 3
tags: [e2e-tests]
---

Don't change any UI. I already improved the Team page after the design, so don't touch how it looks. Just make sure the flow works, and fix what is broken. You get the repo after this answer. First tell me in a few lines what you will change and what you will leave. No code.

Two findings from your last run on the Team page (`/settings/team`, design `SettingsTeam`):

1. The design check printed:

```
SettingsTeam: 3 texts look different from the design, 76 look the same.

"Invite member"
  font-weight: design 600, built 500
  box height: design 36px, built 32px, the nearest stock step is 36px
"Team"
  font-size: design 24px, built 20px, the nearest stock step is 24px
"Pending"
  color: design rgb(180, 83, 9), built rgb(113, 113, 122)
```

2. In the flow, a second click on "Send again" while the first one is still on its way sends two emails.

Also tell me how you will stop the design check from failing on this page from now on.
