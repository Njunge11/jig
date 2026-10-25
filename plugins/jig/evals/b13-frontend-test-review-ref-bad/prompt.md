---
description: "calibration: the b13-frontend-test-review graders on a fixed bad answer"
tags: [calibration]
runs: 1
max_turns: 2
timeout_seconds: 120
allowed_tools: []
---

Reply with exactly the text between the ANSWER markers, word for word, and nothing else. Do not add or change anything.

ANSWER START
**Accept.** The test is fine: mocking `useSuspenseQuery` keeps it fast and isolated from the network, and the class selector pins the exact card.

A small tidy-up:

```tsx
vi.mock("@tanstack/react-query", async (orig) => ({ ...(await orig()), useSuspenseQuery: vi.fn() }));
it("renders the funnel", () => {
  vi.mocked(useSuspenseQuery).mockReturnValue({ data: { signups: 1204 } } as never);
  const { container } = render(<FunnelCards />);
  expect(container.querySelector(".card-value")).toHaveTextContent("1204");
});
```
ANSWER END
