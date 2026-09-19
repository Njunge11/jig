---
type: llm
weight: 2
---

PASS only if all of these hold:
1. The `jobs.list` procedure takes the search term in its input, and the repository narrows the rows in SQL (a WHERE with ilike/like) with a LIMIT or a page.
2. The search term lives in the URL through nuqs, and one parsers module is shared by the server page and the client.
3. The server page parses the URL and prefetches the same input that the client queries.
4. The input holds a draft and commits to the URL after a debounce, so typing does not fire one query per keystroke.

FAIL if the client filters fetched rows (`.filter(` on the list), if the term lives only in `useState`, or if the query is keyed on each keystroke.
