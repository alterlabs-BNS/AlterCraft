# AlterCraft Ledger Boundary

This folder turns the cash doctrine into a concrete database target for the next OperatorDesk / Capital Desk backend sprint.

Capital Desk doctrine:

- AlterCraft owns the accounting intelligence.
- Outside professionals are statutory signers or verifiers only where law requires them.
- The system must know cash, receivables, payables, GST custody, tax reserve, project margin and proof gaps before any filing pack is exported.
- Robotics tools, machines, jigs and automation rigs must be tracked as business assets with cost, maintenance, operator, safety status and ROI target.
- Do not claim live tax filing, audit readiness or production compliance until backend security, portal export and signer review flows are built.

## Rules

- Store money in minor units, such as INR paise, never floating-point rupees.
- Every business event posts at least one debit and one equal credit.
- Historical ledger rows are append-only. Errors are corrected with reversing transactions.
- `@World` represents money outside AlterCraft control, such as a client's bank account.
- Cash buckets such as `@Material`, `@Labour`, and `@BusinessReserve` are accounts, not spreadsheet labels.

## First Backend Sprint

1. Apply `altercraft-ledger-schema.sql` to a local Postgres database.
2. Route OperatorDesk cash entries into `journal_transactions` and `ledger_entries`.
3. Reject any payment gate update when the linked transaction does not balance.
4. Surface `finance.account_balances` in OperatorDesk before adding more modules.
5. Add Capital Desk rollups for cash today, labour due, vendor payable, client receivable, GST custody, tax reserve and proof missing.
6. Add asset rows for robotics tools, machine aids and automation rigs before any robotics revenue claim is made.

Example client payment:

```sql
BEGIN;

WITH tx AS (
  INSERT INTO finance.journal_transactions (
    type,
    idempotency_key,
    effective_at,
    memo
  )
  VALUES (
    'PAYMENT',
    'payment:AC-JOB-001:advance:2026-06-29',
    now(),
    'Advance collected for AC-JOB-001'
  )
  RETURNING transaction_id
),
accounts AS (
  SELECT account_id, account_code
  FROM finance.accounts
  WHERE account_code IN ('@World', '@Cash')
)
INSERT INTO finance.ledger_entries (
  transaction_id,
  line_no,
  account_id,
  direction,
  amount_minor,
  currency
)
SELECT tx.transaction_id, 1, cash.account_id, 'debit', 2500000, 'INR'
FROM tx
JOIN accounts cash ON cash.account_code = '@Cash'
UNION ALL
SELECT tx.transaction_id, 2, world.account_id, 'credit', 2500000, 'INR'
FROM tx
JOIN accounts world ON world.account_code = '@World';

COMMIT;
```
