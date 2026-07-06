CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SCHEMA IF NOT EXISTS finance;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ledger_direction') THEN
    CREATE TYPE finance.ledger_direction AS ENUM ('debit', 'credit');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'normal_balance') THEN
    CREATE TYPE finance.normal_balance AS ENUM ('debit', 'credit');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS finance.accounts (
  account_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_code text NOT NULL UNIQUE,
  account_name text NOT NULL,
  normal_balance finance.normal_balance NOT NULL,
  currency char(3) NOT NULL DEFAULT 'INR',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (account_code ~ '^[@A-Za-z0-9][@A-Za-z0-9:_-]*$'),
  CHECK (currency ~ '^[A-Z]{3}$')
);

CREATE TABLE IF NOT EXISTS finance.journal_transactions (
  transaction_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  idempotency_key text NOT NULL UNIQUE,
  source_event_id uuid,
  effective_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  memo text NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS finance.ledger_entries (
  entry_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL REFERENCES finance.journal_transactions(transaction_id),
  line_no smallint NOT NULL,
  account_id uuid NOT NULL REFERENCES finance.accounts(account_id),
  direction finance.ledger_direction NOT NULL,
  amount_minor bigint NOT NULL CHECK (amount_minor > 0),
  currency char(3) NOT NULL DEFAULT 'INR',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (transaction_id, line_no),
  CHECK (currency ~ '^[A-Z]{3}$')
);

CREATE INDEX IF NOT EXISTS ledger_entries_account_idx
  ON finance.ledger_entries (account_id, created_at);

CREATE INDEX IF NOT EXISTS ledger_entries_transaction_idx
  ON finance.ledger_entries (transaction_id);

CREATE OR REPLACE FUNCTION finance.prevent_ledger_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'Ledger records are append-only. Post a reversing transaction instead.';
END;
$$;

DROP TRIGGER IF EXISTS prevent_journal_transaction_update ON finance.journal_transactions;
CREATE TRIGGER prevent_journal_transaction_update
  BEFORE UPDATE OR DELETE ON finance.journal_transactions
  FOR EACH ROW EXECUTE FUNCTION finance.prevent_ledger_mutation();

DROP TRIGGER IF EXISTS prevent_ledger_entry_update ON finance.ledger_entries;
CREATE TRIGGER prevent_ledger_entry_update
  BEFORE UPDATE OR DELETE ON finance.ledger_entries
  FOR EACH ROW EXECUTE FUNCTION finance.prevent_ledger_mutation();

CREATE OR REPLACE FUNCTION finance.assert_transaction_balanced()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  target_transaction uuid;
  imbalance_count integer;
BEGIN
  target_transaction := COALESCE(NEW.transaction_id, OLD.transaction_id);

  SELECT count(*)
  INTO imbalance_count
  FROM (
    SELECT
      currency,
      sum(CASE WHEN direction = 'debit' THEN amount_minor ELSE 0 END) AS debits,
      sum(CASE WHEN direction = 'credit' THEN amount_minor ELSE 0 END) AS credits
    FROM finance.ledger_entries
    WHERE transaction_id = target_transaction
    GROUP BY currency
    HAVING sum(CASE WHEN direction = 'debit' THEN amount_minor ELSE 0 END)
        <> sum(CASE WHEN direction = 'credit' THEN amount_minor ELSE 0 END)
  ) imbalanced;

  IF imbalance_count > 0 THEN
    RAISE EXCEPTION 'Transaction % is not balanced by currency.', target_transaction;
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS assert_transaction_balanced ON finance.ledger_entries;
CREATE CONSTRAINT TRIGGER assert_transaction_balanced
  AFTER INSERT ON finance.ledger_entries
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION finance.assert_transaction_balanced();

CREATE OR REPLACE VIEW finance.account_balances AS
SELECT
  a.account_id,
  a.account_code,
  a.account_name,
  a.normal_balance,
  a.currency,
  COALESCE(sum(CASE WHEN e.direction = 'debit' THEN e.amount_minor ELSE 0 END), 0) AS debit_minor,
  COALESCE(sum(CASE WHEN e.direction = 'credit' THEN e.amount_minor ELSE 0 END), 0) AS credit_minor,
  CASE
    WHEN a.normal_balance = 'debit'
      THEN COALESCE(sum(CASE WHEN e.direction = 'debit' THEN e.amount_minor ELSE -e.amount_minor END), 0)
    ELSE COALESCE(sum(CASE WHEN e.direction = 'credit' THEN e.amount_minor ELSE -e.amount_minor END), 0)
  END AS balance_minor
FROM finance.accounts a
LEFT JOIN finance.ledger_entries e ON e.account_id = a.account_id
GROUP BY a.account_id, a.account_code, a.account_name, a.normal_balance, a.currency;

INSERT INTO finance.accounts (account_code, account_name, normal_balance, currency)
VALUES
  ('@World', 'External world outside AlterCraft ledger control', 'credit', 'INR'),
  ('@Cash', 'Collected cash and bank balance', 'debit', 'INR'),
  ('@ClientReceivable', 'Client receivables after written scope approval', 'debit', 'INR'),
  ('@Revenue', 'AlterCraft earned revenue', 'credit', 'INR'),
  ('@Material', 'Material cash bucket', 'debit', 'INR'),
  ('@Labour', 'Labour cash bucket', 'debit', 'INR'),
  ('@BusinessReserve', 'Business reserve bucket', 'debit', 'INR')
ON CONFLICT (account_code) DO NOTHING;
