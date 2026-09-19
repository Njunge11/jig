---
type: llm
weight: 2
---

PASS only if: the search narrowing is a `## Backend` task (the list procedure takes the search term and narrows the rows on the server, across every open job and not only the five shown); the frontend tasks describe what the user sees (the term in the URL, a debounced commit, the no-match empty state distinct from the no-data state); no task describes a browser-side filter of fetched rows; the text does not name one single recipe as "the recipe".

FAIL if any task has the client keep or hide rows from an already fetched list, or if there is no backend task for the search.
