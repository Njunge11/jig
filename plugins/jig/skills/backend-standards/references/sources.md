# Sources — backend rules

Loaded on demand; not part of the skill body. Each entry maps
rules to the doc that grounds them.

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
