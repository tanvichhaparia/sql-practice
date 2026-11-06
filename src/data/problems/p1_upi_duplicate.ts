import { Problem } from '../../types';

export const p1UpiDuplicate: Problem = {
  id: 'p1_upi_duplicate_payout',
  title: 'Duplicate Merchant Payout Detection',
  difficulty: 'Easy',
  domain: 'UPI & Fintech Ledgers',
  companyTags: ['Razorpay', 'PhonePe', 'Paytm', 'Stripe'],
  patterns: ['Self-Joins', 'Sliding Time Windows', 'NULL Filters'],
  isPro: false,
  businessContext: `Fintech settlement engines process billions in merchant payouts daily. During transient network timeouts or banking partner webhook retries, a merchant might receive multiple duplicate payouts for the same settlement batch.

Write a query to identify all duplicate settlement payouts made to the same merchant for the identical payout amount occurring within 10 minutes (600 seconds) of an earlier payout.

Business Rules:
1. Both settlement transactions must have \`status = 'SUCCESS'\`. Ignore any payouts where the status is \`'FAILED'\`, \`'REVERSED'\`, or \`NULL\`.
2. A pair of duplicate payouts should only be reported once, with the earlier settlement listed as \`first_settlement_id\` and the later settlement as \`second_settlement_id\`.
3. If two settlements occurred at the exact same second, break the tie by requiring \`first_settlement_id < second_settlement_id\`.
4. Calculate \`seconds_apart\` as the time difference between the second payout and first payout.
5. Order results by \`merchant_id ASC, first_settlement_id ASC, second_settlement_id ASC\`.`,
  expectedColumns: [
    { name: 'merchant_id', type: 'VARCHAR', description: 'Unique identifier of the merchant' },
    { name: 'amount', type: 'DECIMAL', description: 'Payout amount that was duplicated' },
    { name: 'first_settlement_id', type: 'INTEGER', description: 'ID of the initial successful settlement' },
    { name: 'second_settlement_id', type: 'INTEGER', description: 'ID of the duplicate payout' },
    { name: 'seconds_apart', type: 'INTEGER', description: 'Time elapsed between payouts in seconds' },
  ],
  orderingRule: 'ORDER BY merchant_id ASC, first_settlement_id ASC, second_settlement_id ASC',
  schema: [
    {
      tableName: 'settlements',
      description: 'Records of merchant bank account payouts and settlement statuses',
      columns: [
        { name: 'settlement_id', type: 'INTEGER', isPk: true, description: 'Primary key' },
        { name: 'merchant_id', type: 'VARCHAR', description: 'Merchant ID' },
        { name: 'amount', type: 'DECIMAL(10,2)', description: 'Payout amount in INR' },
        { name: 'status', type: 'VARCHAR', description: "'SUCCESS', 'FAILED', 'REVERSED', or NULL" },
        { name: 'settlement_time', type: 'DATETIME', description: 'Timestamp of the payout (YYYY-MM-DD HH:MM:SS)' },
      ],
    },
  ],
  stages: {
    sample: {
      name: 'Stage 1: Visible Sample Dataset',
      title: 'Visible Sample Dataset',
      ddl: `
CREATE TABLE settlements (
  settlement_id INTEGER PRIMARY KEY,
  merchant_id VARCHAR(50),
  amount DECIMAL(10,2),
  status VARCHAR(20),
  settlement_time DATETIME
);`,
      seed: `
INSERT INTO settlements VALUES
(101, 'M_BLR_01', 5000.00, 'SUCCESS', '2026-03-01 10:00:00'),
(102, 'M_BLR_01', 5000.00, 'SUCCESS', '2026-03-01 10:04:30'), -- duplicate within 270s
(103, 'M_BLR_01', 5000.00, 'SUCCESS', '2026-03-01 10:25:00'), -- outside 10 mins (15 mins later)
(104, 'M_DEL_02', 12000.00, 'SUCCESS', '2026-03-01 11:00:00'),
(105, 'M_DEL_02', 8000.00, 'SUCCESS', '2026-03-01 11:03:00'), -- different amount
(106, 'M_MUM_03', 2500.00, 'SUCCESS', '2026-03-01 12:00:00');`,
      previewRows: {
        settlements: [
          { settlement_id: 101, merchant_id: 'M_BLR_01', amount: 5000, status: 'SUCCESS', settlement_time: '2026-03-01 10:00:00' },
          { settlement_id: 102, merchant_id: 'M_BLR_01', amount: 5000, status: 'SUCCESS', settlement_time: '2026-03-01 10:04:30' },
          { settlement_id: 103, merchant_id: 'M_BLR_01', amount: 5000, status: 'SUCCESS', settlement_time: '2026-03-01 10:25:00' },
          { settlement_id: 104, merchant_id: 'M_DEL_02', amount: 12000, status: 'SUCCESS', settlement_time: '2026-03-01 11:00:00' },
        ],
      },
    },
    edgeCaseA: {
      name: 'Stage 2: NULL & Failed Status Trap',
      title: 'Hidden Edge Case A — NULL & Failed Status Trap',
      trapDescription: 'Transactions where status is FAILED, REVERSED, or NULL must not trigger duplicate alerts.',
      diagnosticHint: 'Your query failed Stage 2 (NULL & Status Trap). Ensure that both s1.status and s2.status are strictly "SUCCESS". If a transaction failed or reversed, it was not actually paid out.',
      ddl: `
CREATE TABLE settlements (
  settlement_id INTEGER PRIMARY KEY,
  merchant_id VARCHAR(50),
  amount DECIMAL(10,2),
  status VARCHAR(20),
  settlement_time DATETIME
);`,
      seed: `
INSERT INTO settlements VALUES
(201, 'M_PUN_04', 3500.00, 'SUCCESS', '2026-03-02 09:00:00'),
(202, 'M_PUN_04', 3500.00, 'FAILED', '2026-03-02 09:02:00'), -- Failed, NOT duplicate
(203, 'M_PUN_04', 3500.00, NULL, '2026-03-02 09:05:00'), -- NULL status, NOT duplicate
(204, 'M_HYD_05', 9900.00, 'SUCCESS', '2026-03-02 14:00:00'),
(205, 'M_HYD_05', 9900.00, 'SUCCESS', '2026-03-02 14:06:00'), -- Genuine duplicate (360s)
(206, 'M_HYD_05', 9900.00, 'REVERSED', '2026-03-02 14:08:00');`,
    },
    edgeCaseB: {
      name: 'Stage 3: Simultaneous Timestamp & Mirror Pair Trap',
      title: 'Hidden Edge Case B — Tie-Breaker & Mirror Pair Trap',
      trapDescription: 'Two transactions occur at the exact same second (0s apart). Using s1.id != s2.id produces inverted duplicate pairs (A-B and B-A).',
      diagnosticHint: 'Your query failed Stage 3 (Simultaneous Timestamps). Make sure you join on (s1.settlement_time < s2.settlement_time OR (s1.settlement_time = s2.settlement_time AND s1.settlement_id < s2.settlement_id)) or s1.settlement_id < s2.settlement_id to avoid reverse duplicate pairs.',
      ddl: `
CREATE TABLE settlements (
  settlement_id INTEGER PRIMARY KEY,
  merchant_id VARCHAR(50),
  amount DECIMAL(10,2),
  status VARCHAR(20),
  settlement_time DATETIME
);`,
      seed: `
INSERT INTO settlements VALUES
(301, 'M_KOL_06', 7200.00, 'SUCCESS', '2026-03-03 16:30:00'),
(302, 'M_KOL_06', 7200.00, 'SUCCESS', '2026-03-03 16:30:00'), -- Exact same timestamp
(303, 'M_CHE_07', 4100.00, 'SUCCESS', '2026-03-03 18:00:00'),
(304, 'M_CHE_07', 4100.00, 'SUCCESS', '2026-03-03 18:05:00');`,
    },
    edgeCaseC: {
      name: 'Stage 4: 10-Minute Boundary Trap',
      title: 'Hidden Edge Case C — 600-Second Boundary Trap',
      trapDescription: 'Checks exact 600 seconds (10 minutes) cutoff vs 601 seconds.',
      diagnosticHint: 'Your query failed Stage 4 (Boundary Trap). The requirement states "within 10 minutes", which means seconds_apart <= 600 and seconds_apart >= 0.',
      ddl: `
CREATE TABLE settlements (
  settlement_id INTEGER PRIMARY KEY,
  merchant_id VARCHAR(50),
  amount DECIMAL(10,2),
  status VARCHAR(20),
  settlement_time DATETIME
);`,
      seed: `
INSERT INTO settlements VALUES
(401, 'M_JAI_08', 1500.00, 'SUCCESS', '2026-03-04 12:00:00'),
(402, 'M_JAI_08', 1500.00, 'SUCCESS', '2026-03-04 12:10:00'), -- Exactly 600 seconds (INCLUDED)
(403, 'M_JAI_08', 1500.00, 'SUCCESS', '2026-03-04 12:20:01'), -- 601 seconds from 402 (EXCLUDED)
(404, 'M_SUR_09', 6000.00, 'SUCCESS', '2026-03-04 15:00:00');`,
    },
  },
  starterSql: `-- Write your SQL solution below
SELECT 
  s1.merchant_id,
  s1.amount,
  s1.settlement_id AS first_settlement_id,
  s2.settlement_id AS second_settlement_id,
  (strftime('%s', s2.settlement_time) - strftime('%s', s1.settlement_time)) AS seconds_apart
FROM settlements s1
-- Join and filter here
ORDER BY s1.merchant_id ASC, first_settlement_id ASC, second_settlement_id ASC;`,
  solutionSql: `SELECT 
  s1.merchant_id,
  s1.amount,
  s1.settlement_id AS first_settlement_id,
  s2.settlement_id AS second_settlement_id,
  (strftime('%s', s2.settlement_time) - strftime('%s', s1.settlement_time)) AS seconds_apart
FROM settlements s1
JOIN settlements s2 
  ON s1.merchant_id = s2.merchant_id
  AND s1.amount = s2.amount
  AND s1.status = 'SUCCESS'
  AND s2.status = 'SUCCESS'
  AND s1.settlement_id < s2.settlement_id
  AND strftime('%s', s2.settlement_time) >= strftime('%s', s1.settlement_time)
  AND (strftime('%s', s2.settlement_time) - strftime('%s', s1.settlement_time)) <= 600
ORDER BY s1.merchant_id ASC, first_settlement_id ASC, second_settlement_id ASC;`,
  hints: {
    edgeCase: 'Watch out for status filters (only SUCCESS counts) and ensure you do not emit duplicate pairs (A-B and B-A).',
    approach: 'Perform a self-join `settlements s1 JOIN settlements s2` on matching `merchant_id` and `amount`, with `s1.settlement_id < s2.settlement_id` and timestamp difference between 0 and 600 seconds.',
    annotatedSolution: `-- Canonical Solution
SELECT 
  s1.merchant_id,
  s1.amount,
  s1.settlement_id AS first_settlement_id,
  s2.settlement_id AS second_settlement_id,
  (strftime('%s', s2.settlement_time) - strftime('%s', s1.settlement_time)) AS seconds_apart
FROM settlements s1
JOIN settlements s2 
  ON s1.merchant_id = s2.merchant_id
  AND s1.amount = s2.amount
  AND s1.status = 'SUCCESS'
  AND s2.status = 'SUCCESS'
  AND s1.settlement_id < s2.settlement_id
  AND (strftime('%s', s2.settlement_time) - strftime('%s', s1.settlement_time)) BETWEEN 0 AND 600
ORDER BY s1.merchant_id ASC, first_settlement_id ASC, second_settlement_id ASC;`,
    whyNaiveFails: 'Naive solutions fail because they either use s1.settlement_id != s2.settlement_id (which returns every pair twice) or they put status filters in places that let NULL or FAILED records slip through.',
  },
};
