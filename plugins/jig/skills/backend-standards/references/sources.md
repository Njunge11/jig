# Sources — backend rules

Loaded on demand; not part of the skill body. Each entry maps
rules to the doc that grounds them.

## Structure

- One file, one concern (Structure, Review item 34) — verified
  2026-09-25.
  Parnas, "On the Criteria To Be Used in Decomposing Systems into
  Modules", Communications of the ACM, 1972, conclusion: "it is
  almost always incorrect to begin the decomposition of a system
  into modules on the basis of a flowchart. We propose instead that
  one begins with a list of difficult design decisions or design
  decisions which are likely to change. Each module is then
  designed to hide such a decision from the others."
  Dijkstra, "On the role of scientific thought", EWD447, 1974:
  "the separation of concerns, which, even if not perfectly
  possible, is yet the only available technique for effective
  ordering of one's thoughts".
  Stevens, Myers and Constantine, "Structured design", IBM Systems
  Journal 13(2), 1974: the cohesion scale, from coincidental
  (parts share a module for no reason) to functional (every part
  serves one task). A file that passes the sentence test has
  functional cohesion.
  Martin, Agile Software Development: Principles, Patterns, and
  Practices, 2003, p. 95: "A class should have only one reason to
  change." Martin credits the cohesion work (DeMarco, 1979;
  Page-Jones, 1988) as the source of the principle.

## Transactions

- External calls and the outbox row (Review item 33) — verified
  2026-09-19.
  [microservices.io — Transactional outbox](https://microservices.io/patterns/data/transactional-outbox.html):
  "If the database transaction commits then the messages must be
  sent. Conversely, if the database rolls back, the messages must
  not be sent"; the solution stores the message "in the database
  as part of the transaction that updates the business entities.
  A separate process then sends the messages".
  [AWS Prescriptive Guidance — Transactional outbox pattern](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html):
  "If the database update fails but the event notification is
  sent, data could get corrupted"; "Do not send out an event
  notification if the transaction is rolled back"; duplicate
  sends — "make the consuming service idempotent".

## The call trace

- One root per entry-point call, one `trace` line per call, one
  print per block (The call trace, Review item 35) — jig's own
  rule, verified 2026-09-25. The block format is the developer's:
  "calling function n to do x. it took n seconds. if there are
  queries, these are the queries each took. calling llm to do y.
  success." A context-free query log was rejected: "just logging
  queries randomly without context is utterly useless."
  One write per block: Node docs, `process.md`, "A note on process
  I/O": `console.log` writes synchronously to files and to
  terminals on POSIX, so one write per line would block the
  request once per line.
