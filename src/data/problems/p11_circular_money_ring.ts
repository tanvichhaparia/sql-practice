import { Problem } from '../../types';

export const p11CircularMoneyRing: Problem = {
  id: 'p11_circular_money_ring',
  title: 'Self-Referral & Circular Transaction Ring Detection',
  difficulty: 'Hard',
  domain: 'Fintech Fraud & Risk Intelligence',
  companyTags: ['Razorpay', 'PhonePe', 'Google Pay', 'PayPal', 'Stripe'],
  patterns: ['Self-Joins', 'Circular Graph Cycles', 'Percentage Thresholds', 'Time Offsets'],
  isPro: true,
  businessContext: `Risk and fraud compliance systems flag suspected money laundering and credit card cash-out laundering where User A transfers funds to User B, and User B sends the funds back to User A within a short window.

Write a query to detect circular P2P transfer pairs where:
1. User A sends money to User B (\`t1\`), and subsequently User B sends money back to User A (\`t2\`).
2. Transfer 2 occurs after Transfer 1, but within 24 hours (<= 86,400 seconds) of Transfer 1.
3. Both transfers have \`status = 'COMPLETED'\`.
4. The return amount is within 5% of the original sent amount: \`ABS(t2.amount - t1.amount) <= (0.05 * t1.amount)\`.
5. Calculate \`hours_apart\` as \`ROUND((strftime('%s', t2.transfer_time) - strftime('%s', t1.transfer_time)) / 3600.0, 2)\`.
6. Expected columns: \`sender_id\`, \`receiver_id\`, \`first_transfer_id\`, \`return_transfer_id\`, \`amount_sent\`, \`amount_returned\`, \`hours_apart\`.
7. Order results by \`first_transfer_id ASC, return_transfer_id ASC\`.`,
  expectedColumns: [
    { name: 'sender_id', type: 'VARCHAR', description: 'User initiating the first transfer' },
    { name: 'receiver_id', type: 'VARCHAR', description: 'Counterparty receiving the first transfer' },
    { name: 'first_transfer_id', type: 'INTEGER', description: 'ID of original outbound transfer' },
    { name: 'return_transfer_id', type: 'INTEGER', description: 'ID of return circular transfer' },
    { name: 'amount_sent', type: 'DECIMAL', description: 'Original amount transferred' },
    { name: 'amount_returned', type: 'DECIMAL', description: 'Amount transferred back' },
    { name: 'hours_apart', type: 'DECIMAL', description: 'Hours elapsed between the two transfers' },
  ],
  orderingRule: 'ORDER BY first_transfer_id ASC, return_transfer_id ASC',
  schema: [
    {
      tableName: 'p2p_transfers',
      description: 'Peer-to-peer money transfers between users',
      columns: [
        { name: 'transfer_id', type: 'INTEGER', isPk: true },
        { name: 'sender_id', type: 'VARCHAR' },
        { name: 'receiver_id', type: 'VARCHAR' },
        { name: 'amount', type: 'DECIMAL(10,2)' },
        { name: 'transfer_time', type: 'DATETIME' },
        { name: 'status', type: 'VARCHAR', description: "'COMPLETED', 'FAILED', 'PENDING'" },
      ],
    },
  ],
  stages: {
    sample: {
      name: 'Stage 1: Visible Sample Dataset',
      title: 'Visible Sample Dataset',
      ddl: `
CREATE TABLE p2p_transfers (
  transfer_id INTEGER PRIMARY KEY,
  sender_id VARCHAR(20),
  receiver_id VARCHAR(20),
  amount DECIMAL(10,2),
  transfer_time DATETIME,
  status VARCHAR(20)
);`,
      seed: `
INSERT INTO p2p_transfers VALUES
-- Ring between U101 and U102 (within 4 hours, same amount)
(1, 'U101', 'U102', 10000.00, '2026-03-01 10:00:00', 'COMPLETED'),
(2, 'U102', 'U101', 9800.00, '2026-03-01 14:00:00', 'COMPLETED'), -- 2% diff, 4.0 hrs (Included)
-- Normal one-way payment
(3, 'U103', 'U104', 5000.00, '2026-03-01 11:00:00', 'COMPLETED'),
-- Return payment outside 24h
(4, 'U105', 'U106', 7000.00, '2026-03-01 09:00:00', 'COMPLETED'),
(5, 'U106', 'U105', 7000.00, '2026-03-02 12:00:00', 'COMPLETED'); -- 27 hrs later (Excluded)`,
      previewRows: {
        p2p_transfers: [
          { transfer_id: 1, sender_id: 'U101', receiver_id: 'U102', amount: 10000, transfer_time: '2026-03-01 10:00:00', status: 'COMPLETED' },
          { transfer_id: 2, sender_id: 'U102', receiver_id: 'U101', amount: 9800, transfer_time: '2026-03-01 14:00:00', status: 'COMPLETED' },
          { transfer_id: 3, sender_id: 'U103', receiver_id: 'U104', amount: 5000, transfer_time: '2026-03-01 11:00:00', status: 'COMPLETED' },
        ],
      },
    },
    edgeCaseA: {
      name: 'Stage 2: Failed/Pending Transfer Trap',
      title: 'Hidden Edge Case A — Transfer Status Trap',
      trapDescription: 'One of the legs in the transfer ring was FAILED or PENDING. Both legs must be COMPLETED.',
      diagnosticHint: 'Your query failed Stage 2 (Status Filter). Ensure both t1.status = "COMPLETED" AND t2.status = "COMPLETED".',
      ddl: `
CREATE TABLE p2p_transfers (
  transfer_id INTEGER PRIMARY KEY,
  sender_id VARCHAR(20),
  receiver_id VARCHAR(20),
  amount DECIMAL(10,2),
  transfer_time DATETIME,
  status VARCHAR(20)
);`,
      seed: `
INSERT INTO p2p_transfers VALUES
(11, 'U201', 'U202', 8000.00, '2026-03-02 08:00:00', 'COMPLETED'),
(12, 'U202', 'U201', 8000.00, '2026-03-02 10:00:00', 'FAILED'), -- Failed return leg!
(13, 'U203', 'U204', 6000.00, '2026-03-02 11:00:00', 'PENDING'),
(14, 'U204', 'U203', 6000.00, '2026-03-02 12:00:00', 'COMPLETED');`,
    },
    edgeCaseB: {
      name: 'Stage 3: Greater Than 5% Variance Trap',
      title: 'Hidden Edge Case B — 5% Threshold Trap',
      trapDescription: 'Return transfer amount deviates by more than 5% (e.g. 10000 sent, only 9000 returned = 10% diff).',
      diagnosticHint: 'Your query failed Stage 3 (Amount Variance). The return amount must be within 5% of original amount (ABS(t2.amount - t1.amount) <= 0.05 * t1.amount).',
      ddl: `
CREATE TABLE p2p_transfers (
  transfer_id INTEGER PRIMARY KEY,
  sender_id VARCHAR(20),
  receiver_id VARCHAR(20),
  amount DECIMAL(10,2),
  transfer_time DATETIME,
  status VARCHAR(20)
);`,
      seed: `
INSERT INTO p2p_transfers VALUES
(21, 'U301', 'U302', 10000.00, '2026-03-03 09:00:00', 'COMPLETED'),
(22, 'U302', 'U301', 9400.00, '2026-03-03 11:00:00', 'COMPLETED'), -- 6% diff (Excluded)
(23, 'U303', 'U304', 10000.00, '2026-03-03 12:00:00', 'COMPLETED'),
(24, 'U304', 'U303', 9500.00, '2026-03-03 13:00:00', 'COMPLETED'); -- Exactly 5% diff (Included)`,
    },
    edgeCaseC: {
      name: 'Stage 4: Exactly 24-Hour Boundary Trap',
      title: 'Hidden Edge Case C — 24-Hour Boundary Trap',
      trapDescription: 'Testing exactly 86,400 seconds (24.00 hours).',
      diagnosticHint: 'Your query failed Stage 4 (24h Boundary). Verify seconds_apart <= 86400.',
      ddl: `
CREATE TABLE p2p_transfers (
  transfer_id INTEGER PRIMARY KEY,
  sender_id VARCHAR(20),
  receiver_id VARCHAR(20),
  amount DECIMAL(10,2),
  transfer_time DATETIME,
  status VARCHAR(20)
);`,
      seed: `
INSERT INTO p2p_transfers VALUES
(31, 'U401', 'U402', 5000.00, '2026-03-04 10:00:00', 'COMPLETED'),
(32, 'U402', 'U401', 5000.00, '2026-03-05 10:00:00', 'COMPLETED'), -- Exactly 24h (Included)
(33, 'U403', 'U404', 5000.00, '2026-03-04 10:00:00', 'COMPLETED'),
(34, 'U404', 'U403', 5000.00, '2026-03-05 10:00:01', 'COMPLETED'); -- 24h + 1 sec (Excluded)`,
    },
  },
  starterSql: `-- Write your SQL solution below
SELECT 
  t1.sender_id,
  t1.receiver_id,
  t1.transfer_id AS first_transfer_id,
  t2.transfer_id AS return_transfer_id,
  t1.amount AS amount_sent,
  t2.amount AS amount_returned,
  ROUND((strftime('%s', t2.transfer_time) - strftime('%s', t1.transfer_time)) / 3600.0, 2) AS hours_apart
FROM p2p_transfers t1
-- Join circular transfer t2
ORDER BY first_transfer_id ASC, return_transfer_id ASC;`,
  solutionSql: `SELECT 
  t1.sender_id,
  t1.receiver_id,
  t1.transfer_id AS first_transfer_id,
  t2.transfer_id AS return_transfer_id,
  t1.amount AS amount_sent,
  t2.amount AS amount_returned,
  ROUND((strftime('%s', t2.transfer_time) - strftime('%s', t1.transfer_time)) / 3600.0, 2) AS hours_apart
FROM p2p_transfers t1
JOIN p2p_transfers t2
  ON t1.sender_id = t2.receiver_id
  AND t1.receiver_id = t2.sender_id
  AND t1.status = 'COMPLETED'
  AND t2.status = 'COMPLETED'
  AND t2.transfer_time > t1.transfer_time
  AND (strftime('%s', t2.transfer_time) - strftime('%s', t1.transfer_time)) <= 86400
  AND ABS(t2.amount - t1.amount) <= (0.05 * t1.amount)
ORDER BY first_transfer_id ASC, return_transfer_id ASC;`,
  hints: {
    edgeCase: 'Match sender_id to receiver_id and receiver_id to sender_id, ensuring transfer 2 is within 86400 seconds and 5% amount tolerance.',
    approach: 'Self-join `p2p_transfers t1 JOIN p2p_transfers t2 ON t1.sender_id = t2.receiver_id AND t1.receiver_id = t2.sender_id`. Check `t2.transfer_time > t1.transfer_time` and `ABS(t2.amount - t1.amount) <= (0.05 * t1.amount)`.',
    annotatedSolution: `-- Canonical Solution
SELECT 
  t1.sender_id,
  t1.receiver_id,
  t1.transfer_id AS first_transfer_id,
  t2.transfer_id AS return_transfer_id,
  t1.amount AS amount_sent,
  t2.amount AS amount_returned,
  ROUND((strftime('%s', t2.transfer_time) - strftime('%s', t1.transfer_time)) / 3600.0, 2) AS hours_apart
FROM p2p_transfers t1
JOIN p2p_transfers t2
  ON t1.sender_id = t2.receiver_id
  AND t1.receiver_id = t2.sender_id
  AND t1.status = 'COMPLETED'
  AND t2.status = 'COMPLETED'
  AND t2.transfer_time > t1.transfer_time
  AND (strftime('%s', t2.transfer_time) - strftime('%s', t1.transfer_time)) <= 86400
  AND ABS(t2.amount - t1.amount) <= (0.05 * t1.amount)
ORDER BY first_transfer_id ASC, return_transfer_id ASC;`,
    whyNaiveFails: 'Joining without specifying `t2.transfer_time > t1.transfer_time` will treat the reverse direction as a separate circular pair or match transactions backwards in time.',
  },
};
