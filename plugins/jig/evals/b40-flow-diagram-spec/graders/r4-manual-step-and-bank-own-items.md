---
type: llm
focus: {source: file, path: docs/flows/refund-request.json}
weight: 1
---

Judge only the one question below. The input is the data file of a flow diagram. If the file is missing, the verdict is FAIL.

Question: does the review step have an item of its own that says a person (an ops team member) does the review by hand, and does the decision or outcome step have an item of its own that says how long the money takes depends on the customer's bank?

Check two things only. (1) The review step has an item whose heading names the manual review, the manual step, or the person who reviews, and whose text says a person does the review. (2) The last step (decision or outcome) has an item whose heading names the bank, the timing, or the dependency, and whose text says the time depends on the customer's bank. The item's text may add a related gap or an open question. Other items on the same step that also mention the fact do not matter. PASS if both items exist. FAIL only if one of the two items is missing, or the fact is stated only in a summary or only inside an item whose heading names a different detail.
