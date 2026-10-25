---
description: "calibration: the b27-frontend-standards-review graders on a fixed bad answer"
tags: [calibration]
runs: 1
max_turns: 2
timeout_seconds: 120
allowed_tools: []
---

Reply with exactly the text between the ANSWER markers, word for word, and nothing else. Do not add or change anything.

ANSWER START
The component looks fine overall. Two small notes:

1. `refresh` is not defined; import it or remove the button.
2. Consider memoizing `ids.map(...)` with `useMemo` so the rows do not re-render.

Everything else follows the usual patterns.
ANSWER END
