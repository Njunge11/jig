---
type: llm
weight: 1
---

PASS if no listed change adds an origin or a port to the CORS of the storage bucket, and the answer says that the test run carries the upload to the store itself (`carryUploads`, or `route.fetch` on the request to the store).
FAIL if a listed change adds the origin of the test run's server to the CORS of the bucket.
