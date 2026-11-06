import { Problem } from '../../types';

export const p6RunningBalance: Problem = {
  id: 'p6_running_balance_overdraft',
  title: 'Running Account Balance with Overdraft Breach Timestamp',
  difficulty: 'Hard',
  domain: 'Fintech Ledger & Banking',
  companyTags: ['Razorpay', 'Paytm', 'Jupiter', 'Stripe', 'Revolut'],
  patterns: ['Window Functions', 'Running Sum', 'Deterministic Ordering', 'Row Filtering'],
  isPro: false,
  businessContext: `Banking core ledgers record credits (deposits) and debits (withdrawals). When an account does not have an approved credit line, any debit driving the account balance below ₹0 constitutes an unapproved overdraft breach.

Write a query to identify each account that experienced an overdraft breach, reporting the exact first ledger entry where the running balance dropped strictly below 0 (\`running_balance < 0\`).

Business Rules:
1. Running balance is computed as cumulative credits minus debits:
   \`SUM(CASE WHEN entry_type = 'CREDIT' THEN amount ELSE -amount END)\`.
2. Ledger entries must be sequenced deterministically by \`created_at ASC, entry_id ASC\` to resolve any transactions sharing the same timestamp.
3. An account is breached only when \`running_balance < 0\`. A balance of exactly 0 is NOT a breach.
4. If an account breaches, recovers back to a positive balance, and breaches again later, report ONLY the earliest (first) breach.
5. Accounts that never breached below 0 must be completely excluded from the output.
6. Expected columns: \`account_id\`, \`breached_entry_id\`, \`breached_at\`, \`breach_balance\`.
7. Order results by \`account_id ASC\`.`,
  expectedColumns: [
    { name: 'account_id', type: 'VARCHAR', description: 'Account ID' },
    { name: 'breached_entry_id', type: 'INTEGER', description: 'Ledger entry ID where balance first fell below 0' },
    { name: 'breached_at', type: 'DATETIME', description: 'Timestamp of the first breach transaction' },
    { name: 'breach_balance', type: 'DECIMAL', description: 'Running balance immediately after this breach entry' },
  ],
  orderingRule: 'ORDER BY account_id ASC',
  schema: [
    {
      tableName: 'accounts',
      description: 'Customer account registrations',
      columns: [
        { name: 'account_id', type: 'VARCHAR', isPk: true },
        { name: 'customer_name', type: 'VARCHAR' },
      ],
    },
    {
      tableName: 'ledger_entries',
      description: 'Immutable ledger journal of financial movements',
      columns: [
        { name: 'entry_id', type: 'INTEGER', isPk: true },
        { name: 'account_id', type: 'VARCHAR', isFk: true },
        { name: 'entry_type', type: 'VARCHAR', description: "'CREDIT' or 'DEBIT'" },
        { name: 'amount', type: 'DECIMAL(12,2)' },
        { name: 'created_at', type: 'DATETIME' },
      ],
    },
  ],
  stages: {
    sample: {
      name: 'Stage 1: Visible Sample Dataset',
      title: 'Visible Sample Dataset',
      ddl: `
CREATE TABLE accounts (
  account_id VARCHAR(20) PRIMARY KEY,
  customer_name VARCHAR(50)
);
CREATE TABLE ledger_entries (
  entry_id INTEGER PRIMARY KEY,
  account_id VARCHAR(20),
  entry_type VARCHAR(10),
  amount DECIMAL(12,2),
  created_at DATETIME
);`,
      seed: `
INSERT INTO accounts VALUES ('ACC_001', 'Arjun'), ('ACC_002', 'Priya');

INSERT INTO ledger_entries VALUES
-- ACC_001: 5000 -> 1000 -> -500 (breach at entry 3) -> 1500
(1, 'ACC_001', 'CREDIT', 5000.00, '2026-03-01 10:00:00'),
(2, 'ACC_001', 'DEBIT', 4000.00, '2026-03-01 11:00:00'),
(3, 'ACC_001', 'DEBIT', 1500.00, '2026-03-01 12:00:00'), -- Breach: -500.00
(4, 'ACC_001', 'CREDIT', 2000.00, '2026-03-01 13:00:00'),
-- ACC_002: 10000 -> 6000 -> safe
(5, 'ACC_002', 'CREDIT', 10000.00, '2026-03-01 09:00:00'),
(6, 'ACC_002', 'DEBIT', 4000.00, '2026-03-01 10:30:00');`,
      previewRows: {
        accounts: [
          { account_id: 'ACC_001', customer_name: 'Arjun' },
          { account_id: 'ACC_002', customer_name: 'Priya' },
        ],
        ledger_entries: [
          { entry_id: 1, account_id: 'ACC_001', entry_type: 'CREDIT', amount: 5000, created_at: '2026-03-01 10:00:00' },
          { entry_id: 2, account_id: 'ACC_001', entry_type: 'DEBIT', amount: 4000, created_at: '2026-03-01 11:00:00' },
          { entry_id: 3, account_id: 'ACC_001', entry_type: 'DEBIT', amount: 1500, created_at: '2026-03-01 12:00:00' },
        ],
      },
    },
    edgeCaseA: {
      name: 'Stage 2: Simultaneous Timestamp Tie-Breaker Trap',
      title: 'Hidden Edge Case A — Simultaneous Timestamp Tie-Breaker Trap',
      trapDescription: 'Multiple ledger entries have the exact same created_at timestamp. Without entry_id in the window ORDER BY, results are non-deterministic.',
      diagnosticHint: 'Your query failed Stage 2 (Timestamp Tie-Breaker). When two transactions occur at the exact same second, you must break the tie deterministically using ORDER BY created_at ASC, entry_id ASC.',
      ddl: `
CREATE TABLE accounts (
  account_id VARCHAR(20) PRIMARY KEY,
  customer_name VARCHAR(50)
);
CREATE TABLE ledger_entries (
  entry_id INTEGER PRIMARY KEY,
  account_id VARCHAR(20),
  entry_type VARCHAR(10),
  amount DECIMAL(12,2),
  created_at DATETIME
);`,
      seed: `
INSERT INTO accounts VALUES ('ACC_003', 'Karan');
INSERT INTO ledger_entries VALUES
(11, 'ACC_003', 'CREDIT', 1000.00, '2026-03-02 10:00:00'),
(12, 'ACC_003', 'DEBIT', 1500.00, '2026-03-02 10:00:00'), -- Breach: -500.00 (same timestamp)
(13, 'ACC_003', 'CREDIT', 2000.00, '2026-03-02 10:00:00');`,
    },
    edgeCaseB: {
      name: 'Stage 3: Multiple Breaches & Rebound Trap',
      title: 'Hidden Edge Case B — Multiple Breaches & Rebound Trap',
      trapDescription: 'Account breaches, gets topped up, and breaches a second time. Only the first breach must be reported.',
      diagnosticHint: 'Your query failed Stage 3 (Multiple Breaches). An account that rebounded and breached again must only report its first breach. Use ROW_NUMBER() over breached entries ordered chronologically.',
      ddl: `
CREATE TABLE accounts (
  account_id VARCHAR(20) PRIMARY KEY,
  customer_name VARCHAR(50)
);
CREATE TABLE ledger_entries (
  entry_id INTEGER PRIMARY KEY,
  account_id VARCHAR(20),
  entry_type VARCHAR(10),
  amount DECIMAL(12,2),
  created_at DATETIME
);`,
      seed: `
INSERT INTO accounts VALUES ('ACC_004', 'Sneha');
INSERT INTO ledger_entries VALUES
(21, 'ACC_004', 'CREDIT', 2000.00, '2026-03-03 08:00:00'),
(22, 'ACC_004', 'DEBIT', 2500.00, '2026-03-03 09:00:00'), -- Breach 1 (-500)
(23, 'ACC_004', 'CREDIT', 10000.00, '2026-03-03 10:00:00'), -- Recovered
(24, 'ACC_004', 'DEBIT', 12000.00, '2026-03-03 11:00:00'); -- Breach 2 (-2500) - Should NOT be reported`,
    },
    edgeCaseC: {
      name: 'Stage 4: Exactly Zero Balance Boundary Trap',
      title: 'Hidden Edge Case C — Zero Balance Boundary Trap',
      trapDescription: 'Account balance reaches exactly 0.00. This is not a breach and must not be reported.',
      diagnosticHint: 'Your query failed Stage 4 (Zero Balance Boundary). An account balance of exactly 0.00 is NOT an overdraft breach. Only strictly negative balances (running_balance < 0) count.',
      ddl: `
CREATE TABLE accounts (
  account_id VARCHAR(20) PRIMARY KEY,
  customer_name VARCHAR(50)
);
CREATE TABLE ledger_entries (
  entry_id INTEGER PRIMARY KEY,
  account_id VARCHAR(20),
  entry_type VARCHAR(10),
  amount DECIMAL(12,2),
  created_at DATETIME
);`,
      seed: `
INSERT INTO accounts VALUES ('ACC_005', 'Vikram');
INSERT INTO ledger_entries VALUES
(31, 'ACC_005', 'CREDIT', 3000.00, '2026-03-04 12:00:00'),
(32, 'ACC_005', 'DEBIT', 3000.00, '2026-03-04 13:00:00'); -- Balance exactly 0.00, not < 0!`,
    },
  },
  starterSql: `-- Write your SQL solution below
WITH RunningBalances AS (
  SELECT 
    account_id,
    entry_id,
    created_at,
    -- Compute running balance
    SUM(CASE WHEN entry_type = 'CREDIT' THEN amount ELSE -amount END) OVER (
      PARTITION BY account_id 
      ORDER BY created_at ASC, entry_id ASC
    ) AS running_balance
  FROM ledger_entries
)
-- Filter for first breach where running_balance < 0
SELECT * FROM RunningBalances WHERE running_balance < 0;`,
  solutionSql: `WITH RunningBalances AS (
  SELECT 
    account_id,
    entry_id,
    created_at,
    SUM(CASE WHEN entry_type = 'CREDIT' THEN amount ELSE -amount END) OVER (
      PARTITION BY account_id 
      ORDER BY created_at ASC, entry_id ASC
    ) AS running_balance
  FROM ledger_entries
),
BreachedEntries AS (
  SELECT 
    account_id,
    entry_id AS breached_entry_id,
    created_at AS breached_at,
    running_balance AS breach_balance,
    ROW_NUMBER() OVER (
      PARTITION BY account_id 
      ORDER BY created_at ASC, entry_id ASC
    ) AS breach_rn
  FROM RunningBalances
  WHERE running_balance < 0
)
SELECT 
  account_id,
  breached_entry_id,
  breached_at,
  breach_balance
FROM BreachedEntries
WHERE breach_rn = 1
ORDER BY account_id ASC;`,
  hints: {
    edgeCase: 'Include entry_id in the window ORDER BY to resolve identical timestamps, and use ROW_NUMBER() to pick only the first breach.',
    approach: 'Compute running balance using SUM(...) OVER (PARTITION BY account_id ORDER BY created_at ASC, entry_id ASC). Filter for running_balance < 0, and use ROW_NUMBER() = 1 to select only the initial breach.',
    annotatedSolution: `-- Canonical Solution
WITH RunningBalances AS (
  SELECT 
    account_id,
    entry_id,
    created_at,
    SUM(CASE WHEN entry_type = 'CREDIT' THEN amount ELSE -amount END) OVER (
      PARTITION BY account_id 
      ORDER BY created_at ASC, entry_id ASC
    ) AS running_balance
  FROM ledger_entries
),
BreachedEntries AS (
  SELECT 
    account_id,
    entry_id AS breached_entry_id,
    created_at AS breached_at,
    running_balance AS breach_balance,
    ROW_NUMBER() OVER (
      PARTITION BY account_id 
      ORDER BY created_at ASC, entry_id ASC
    ) AS breach_rn
  FROM RunningBalances
  WHERE running_balance < 0
)
SELECT 
  account_id,
  breached_entry_id,
  breached_at,
  breach_balance
FROM BreachedEntries
WHERE breach_rn = 1
ORDER BY account_id ASC;`,
    whyNaiveFails: 'Without entry_id in the window ORDER BY clause, SQLite may process transactions that occurred at the same timestamp in an unpredictable order, producing incorrect breach timestamps.',
  },
};
