---
type: llm
weight: 1
---

PASS if one of the listed changes adds the origin of the test run's server (a port that is not 3000, 3001 or 3002) to the CORS of the storage bucket.
FAIL if no listed change touches the CORS of the bucket.
