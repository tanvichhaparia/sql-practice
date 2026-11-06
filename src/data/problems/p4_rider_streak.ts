import { Problem } from '../../types';

export const p4RiderStreak: Problem = {
  id: 'p4_rider_ontime_streak',
  title: 'Rider Consecutive On-Time Streak (Gaps & Islands)',
  difficulty: 'Medium',
  domain: 'Food Delivery / Quick Commerce',
  companyTags: ['Swiggy', 'Zomato', 'Zepto', 'DoorDash', 'UberEats'],
  patterns: ['Gaps & Islands', 'Window Functions', 'ROW_NUMBER Diff'],
  isPro: false,
  businessContext: `Hyperlocal delivery networks award performance incentive bonuses to fleet riders who maintain consistent on-time delivery streaks without service level breaches.

Write a query to calculate the maximum consecutive on-time delivery streak achieved by each rider, ordered chronologically by delivery time.

Business Rules:
1. Each delivery has \`is_ontime = 1\` (delivered within SLA) or \`is_ontime = 0\` (late delivery).
2. A streak is defined as a contiguous sequence of consecutive deliveries where \`is_ontime = 1\` for that rider, ordered by \`delivery_time ASC\`.
3. If a rider experiences a late delivery (\`is_ontime = 0\`), their current streak resets to 0.
4. If a rider has NEVER achieved an on-time delivery, their \`max_ontime_streak\` must be reported as \`0\`.
5. Expected columns: \`rider_id\`, \`max_ontime_streak\`.
6. Order results by \`rider_id ASC\`.`,
  expectedColumns: [
    { name: 'rider_id', type: 'VARCHAR', description: 'Unique identifier of the delivery partner' },
    { name: 'max_ontime_streak', type: 'INTEGER', description: 'Longest unbroken sequence of on-time deliveries' },
  ],
  orderingRule: 'ORDER BY rider_id ASC',
  schema: [
    {
      tableName: 'deliveries',
      description: 'Historical delivery completion logs with timestamp and SLA flags',
      columns: [
        { name: 'delivery_id', type: 'INTEGER', isPk: true },
        { name: 'rider_id', type: 'VARCHAR' },
        { name: 'delivery_time', type: 'DATETIME' },
        { name: 'is_ontime', type: 'INTEGER', description: '1 for on-time, 0 for late' },
      ],
    },
  ],
  stages: {
    sample: {
      name: 'Stage 1: Visible Sample Dataset',
      title: 'Visible Sample Dataset',
      ddl: `
CREATE TABLE deliveries (
  delivery_id INTEGER PRIMARY KEY,
  rider_id VARCHAR(20),
  delivery_time DATETIME,
  is_ontime INTEGER
);`,
      seed: `
INSERT INTO deliveries VALUES
-- Rider R1: 1, 1, 0, 1, 1, 1 -> max streak = 3
(1, 'R101', '2026-03-01 12:00:00', 1),
(2, 'R101', '2026-03-01 12:30:00', 1),
(3, 'R101', '2026-03-01 13:00:00', 0),
(4, 'R101', '2026-03-01 13:45:00', 1),
(5, 'R101', '2026-03-01 14:15:00', 1),
(6, 'R101', '2026-03-01 15:00:00', 1),
-- Rider R2: 1, 0, 1 -> max streak = 1
(7, 'R102', '2026-03-01 12:10:00', 1),
(8, 'R102', '2026-03-01 12:50:00', 0),
(9, 'R102', '2026-03-01 13:20:00', 1);`,
      previewRows: {
        deliveries: [
          { delivery_id: 1, rider_id: 'R101', delivery_time: '2026-03-01 12:00:00', is_ontime: 1 },
          { delivery_id: 2, rider_id: 'R101', delivery_time: '2026-03-01 12:30:00', is_ontime: 1 },
          { delivery_id: 3, rider_id: 'R101', delivery_time: '2026-03-01 13:00:00', is_ontime: 0 },
          { delivery_id: 4, rider_id: 'R101', delivery_time: '2026-03-01 13:45:00', is_ontime: 1 },
          { delivery_id: 5, rider_id: 'R101', delivery_time: '2026-03-01 14:15:00', is_ontime: 1 },
          { delivery_id: 6, rider_id: 'R101', delivery_time: '2026-03-01 15:00:00', is_ontime: 1 },
        ],
      },
    },
    edgeCaseA: {
      name: 'Stage 2: Zero On-Time Deliveries Trap',
      title: 'Hidden Edge Case A — Zero On-Time Deliveries Trap',
      trapDescription: 'A rider who has only late deliveries (is_ontime = 0) must report max_ontime_streak = 0, NOT be omitted from the output.',
      diagnosticHint: 'Your query failed Stage 2 (Zero On-Time Trap). Riders with zero on-time deliveries must appear with max_ontime_streak = 0. Use a LEFT JOIN from all distinct riders.',
      ddl: `
CREATE TABLE deliveries (
  delivery_id INTEGER PRIMARY KEY,
  rider_id VARCHAR(20),
  delivery_time DATETIME,
  is_ontime INTEGER
);`,
      seed: `
INSERT INTO deliveries VALUES
(11, 'R201', '2026-03-02 10:00:00', 0),
(12, 'R201', '2026-03-02 10:30:00', 0),
(13, 'R202', '2026-03-02 11:00:00', 1),
(14, 'R202', '2026-03-02 11:40:00', 1);`,
    },
    edgeCaseB: {
      name: 'Stage 3: Multiple Equal Peak Streaks Trap',
      title: 'Hidden Edge Case B — Multiple Equal Peak Streaks Trap',
      trapDescription: 'A rider achieves a 2-streak, gets delayed, and then achieves another 2-streak (e.g. 1, 1, 0, 1, 1). The max streak is 2.',
      diagnosticHint: 'Your query failed Stage 3 (Multiple Streaks). Ensure your Gaps & Islands group key correctly isolates independent islands of on-time orders.',
      ddl: `
CREATE TABLE deliveries (
  delivery_id INTEGER PRIMARY KEY,
  rider_id VARCHAR(20),
  delivery_time DATETIME,
  is_ontime INTEGER
);`,
      seed: `
INSERT INTO deliveries VALUES
(21, 'R301', '2026-03-03 09:00:00', 1),
(22, 'R301', '2026-03-03 09:30:00', 1),
(23, 'R301', '2026-03-03 10:00:00', 0),
(24, 'R301', '2026-03-03 10:30:00', 1),
(25, 'R301', '2026-03-03 11:00:00', 1),
(26, 'R302', '2026-03-03 12:00:00', 1),
(27, 'R302', '2026-03-03 12:30:00', 1),
(28, 'R302', '2026-03-03 13:00:00', 1),
(29, 'R302', '2026-03-03 13:30:00', 1);`,
    },
    edgeCaseC: {
      name: 'Stage 4: Single Delivery Boundary Trap',
      title: 'Hidden Edge Case C — Single Delivery Boundary Trap',
      trapDescription: 'A rider with exactly one delivery (either 1 or 0).',
      diagnosticHint: 'Your query failed Stage 4 (Boundary Trap). Verify handling when a rider has exactly 1 delivery in the database.',
      ddl: `
CREATE TABLE deliveries (
  delivery_id INTEGER PRIMARY KEY,
  rider_id VARCHAR(20),
  delivery_time DATETIME,
  is_ontime INTEGER
);`,
      seed: `
INSERT INTO deliveries VALUES
(31, 'R401', '2026-03-04 14:00:00', 1),
(32, 'R402', '2026-03-04 14:15:00', 0);`,
    },
  },
  starterSql: `-- Write your SQL solution below
WITH Sequenced AS (
  SELECT 
    rider_id,
    delivery_time,
    is_ontime,
    -- Calculate row numbers for gaps & islands grouping
    ROW_NUMBER() OVER (PARTITION BY rider_id ORDER BY delivery_time) AS overall_seq,
    ROW_NUMBER() OVER (PARTITION BY rider_id, is_ontime ORDER BY delivery_time) AS state_seq
  FROM deliveries
)
-- Complete query to find max streak per rider
SELECT rider_id, 0 AS max_ontime_streak FROM deliveries GROUP BY rider_id ORDER BY rider_id ASC;`,
  solutionSql: `WITH RiderBase AS (
  SELECT DISTINCT rider_id FROM deliveries
),
Sequenced AS (
  SELECT 
    rider_id,
    delivery_time,
    is_ontime,
    ROW_NUMBER() OVER (PARTITION BY rider_id ORDER BY delivery_time) AS overall_seq,
    ROW_NUMBER() OVER (PARTITION BY rider_id, is_ontime ORDER BY delivery_time) AS state_seq
  FROM deliveries
),
Streaks AS (
  SELECT 
    rider_id,
    COUNT(*) AS streak_length
  FROM Sequenced
  WHERE is_ontime = 1
  GROUP BY rider_id, (overall_seq - state_seq)
),
MaxStreaks AS (
  SELECT 
    rider_id,
    MAX(streak_length) AS max_ontime_streak
  FROM Streaks
  GROUP BY rider_id
)
SELECT 
  rb.rider_id,
  COALESCE(ms.max_ontime_streak, 0) AS max_ontime_streak
FROM RiderBase rb
LEFT JOIN MaxStreaks ms ON rb.rider_id = ms.rider_id
ORDER BY rb.rider_id ASC;`,
  hints: {
    edgeCase: 'Remember riders who had zero on-time deliveries should be returned with max_ontime_streak = 0.',
    approach: 'Use the difference between two ROW_NUMBER() calls: `ROW_NUMBER() OVER (PARTITION BY rider_id ORDER BY delivery_time)` minus `ROW_NUMBER() OVER (PARTITION BY rider_id, is_ontime ORDER BY delivery_time)` forms an unchanging group ID for each consecutive island of on-time orders.',
    annotatedSolution: `-- Canonical Solution
WITH RiderBase AS (
  SELECT DISTINCT rider_id FROM deliveries
),
Sequenced AS (
  SELECT 
    rider_id,
    delivery_time,
    is_ontime,
    ROW_NUMBER() OVER (PARTITION BY rider_id ORDER BY delivery_time) AS overall_seq,
    ROW_NUMBER() OVER (PARTITION BY rider_id, is_ontime ORDER BY delivery_time) AS state_seq
  FROM deliveries
),
Streaks AS (
  SELECT 
    rider_id,
    COUNT(*) AS streak_length
  FROM Sequenced
  WHERE is_ontime = 1
  GROUP BY rider_id, (overall_seq - state_seq)
),
MaxStreaks AS (
  SELECT 
    rider_id,
    MAX(streak_length) AS max_ontime_streak
  FROM Streaks
  GROUP BY rider_id
)
SELECT 
  rb.rider_id,
  COALESCE(ms.max_ontime_streak, 0) AS max_ontime_streak
FROM RiderBase rb
LEFT JOIN MaxStreaks ms ON rb.rider_id = ms.rider_id
ORDER BY rb.rider_id ASC;`,
    whyNaiveFails: 'Simple COUNT(CASE WHEN is_ontime = 1 THEN 1 END) gives the total number of on-time deliveries, not the longest consecutive streak. Gaps & Islands requires isolating contiguous blocks.',
  },
};
