---
description: "calibration: the b13-frontend-test-review graders on a fixed good answer"
tags: [calibration]
runs: 1
max_turns: 2
timeout_seconds: 120
allowed_tools: []
---

Reply with exactly the text between the ANSWER markers, word for word, and nothing else. Do not add or change anything.

ANSWER START
**Reject.**

1. It mocks the component's own data hook: `vi.mock("@tanstack/react-query")` replaces `useSuspenseQuery`, so the test exercises the mock, not the component. The only mock boundaries are the network edge (MSW) and a seeded QueryClient cache.
2. It asserts a CSS class (`.card-value`) through `container.querySelector`, which the user cannot perceive. Assert the text the user sees with a Testing Library query.
3. It fails the litmus test: moving `FunnelCards` to another data library with the same screen would break it.

Corrected test (MSW at the network edge, rendered through the provider wrapper):

```tsx
import { screen } from "@testing-library/react";
import { server, trpcMsw } from "@/test/msw";
import { renderWithProviders } from "@/test/render";
import { FunnelCards } from "../funnel-cards";

it("renders the funnel", async () => {
  server.use(trpcMsw.users.funnel.query(() => ({ signups: 1204 })));
  renderWithProviders(<FunnelCards />);
  expect(await screen.findByText("1204")).toBeVisible();
});
```
ANSWER END
