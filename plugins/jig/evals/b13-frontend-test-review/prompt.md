---
description: "frontend-tests: mock at the network, never the component's hooks"
tags: [obedience, frontend]
runs: 1
max_turns: 8
timeout_seconds: 420
allowed_tools: [Read, Glob, Grep, Skill]
---

If a skill named `frontend-tests` is available to you, invoke it with the Skill tool before you answer. If it is not available, answer without it.

Review this frontend test. Say accept or reject, give each reason, and show the corrected test.

```tsx
vi.mock("@tanstack/react-query", async (orig) => ({ ...(await orig()), useSuspenseQuery: vi.fn() }));
it("renders the funnel", () => {
  (useSuspenseQuery as Mock).mockReturnValue({ data: { signups: 1204 } });
  const { container } = render(<FunnelCards />);
  expect(container.querySelector(".card-value")?.textContent).toBe("1204");
});
```

Do not write any file.
