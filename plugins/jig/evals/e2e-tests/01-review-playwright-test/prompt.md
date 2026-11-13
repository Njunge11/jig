---
max_turns: 6
timeout_seconds: 300
allowed_tools: [Read, Glob, Grep, Skill]
runs: 3
tags: [e2e-tests]
---

Review this Playwright test before I merge it. Accept or reject, and give each reason in one line.

```ts
// packages/e2e/flows/admin/invite-member.spec.ts
import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "serial" });

test("invite works", async ({ page }) => {
  await page.route("**/api/trpc/team.invite*", (route) =>
    route.fulfill({ json: { result: { data: { id: "inv_1" } } } }),
  );
  await page.goto("/settings/team");
  await page.locator(".invite-btn").click();
  await page.locator("#email").fill("sam@example.com");
  const saved = page.waitForResponse("**/api/trpc/team.invite*");
  await page.locator("button.primary").click();
  expect((await saved).status()).toBe(200);
  await page.waitForTimeout(2000);
  expect(await page.locator(".toast").isVisible()).toBe(true);
  await expect(page).toHaveScreenshot("team-after-invite.png");
});

test("sign out works", async ({ page }) => {
  await page.goto("/settings/team");
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
});
```

The two tests run with the saved session of the one owner account that every test file shares.
