import { Problem } from '../../types';

export const p8SurgeCancellation: Problem = {
  id: 'p8_surge_cancellation_rate',
  title: 'Surge Pricing Cancellation Rate by City & Hour',
  difficulty: 'Medium',
  domain: 'Ride-Hailing & Mobility',
  companyTags: ['Uber', 'Ola', 'Lyft', 'Grab', 'Rapido'],
  patterns: ['Integer Division Trap', 'Aggregation & Grouping', 'Date Extraction'],
  isPro: true,
  businessContext: `Mobility marketplace pricing algorithms apply dynamic surge pricing during peak demand. However, excessively aggressive surge multipliers cause rider sticker shock and spike cancellation rates.

Write a query to calculate the User Cancellation Rate for all ride requests where the surge multiplier was strictly greater than 1.5x (\`surge_multiplier > 1.5\`), aggregated by \`city\` and hour of day (\`request_hour\`).

Business Rules:
1. Only evaluate ride requests where \`surge_multiplier > 1.5\`. Ignore requests where surge was <= 1.5.
2. Extract the hour (0 to 23 as an integer) from \`request_time\` as \`request_hour\`.
3. Count \`total_surge_requests\` and \`cancelled_requests\` (where \`status = 'USER_CANCELLED'\`). Do NOT count \`'DRIVER_CANCELLED'\` or \`'SYSTEM_TIMEOUT'\` as user cancellations.
4. Calculate \`cancellation_rate_pct\` as \`ROUND(100.0 * cancelled_requests / total_surge_requests, 2)\`. Ensure you avoid SQL integer truncation.
5. Expected columns: \`city\`, \`request_hour\`, \`total_surge_requests\`, \`cancelled_requests\`, \`cancellation_rate_pct\`.
6. Order results by \`city ASC, request_hour ASC\`.`,
  expectedColumns: [
    { name: 'city', type: 'VARCHAR', description: 'City name' },
    { name: 'request_hour', type: 'INTEGER', description: 'Hour of request (0-23)' },
    { name: 'total_surge_requests', type: 'INTEGER', description: 'Count of requests with surge > 1.5' },
    { name: 'cancelled_requests', type: 'INTEGER', description: 'Count of requests cancelled by user' },
    { name: 'cancellation_rate_pct', type: 'DECIMAL', description: 'User cancellation percentage (0.00 to 100.00)' },
  ],
  orderingRule: 'ORDER BY city ASC, request_hour ASC',
  schema: [
    {
      tableName: 'ride_requests',
      description: 'Historical trip requests with surge pricing and final lifecycle state',
      columns: [
        { name: 'request_id', type: 'INTEGER', isPk: true },
        { name: 'city', type: 'VARCHAR' },
        { name: 'request_time', type: 'DATETIME' },
        { name: 'surge_multiplier', type: 'DECIMAL(3,2)' },
        { name: 'status', type: 'VARCHAR', description: "'COMPLETED', 'USER_CANCELLED', 'DRIVER_CANCELLED'" },
      ],
    },
  ],
  stages: {
    sample: {
      name: 'Stage 1: Visible Sample Dataset',
      title: 'Visible Sample Dataset',
      ddl: `
CREATE TABLE ride_requests (
  request_id INTEGER PRIMARY KEY,
  city VARCHAR(50),
  request_time DATETIME,
  surge_multiplier DECIMAL(3,2),
  status VARCHAR(30)
);`,
      seed: `
INSERT INTO ride_requests VALUES
-- Bengaluru 18:00
(1, 'Bengaluru', '2026-03-01 18:05:00', 1.8, 'USER_CANCELLED'),
(2, 'Bengaluru', '2026-03-01 18:15:00', 2.0, 'COMPLETED'),
(3, 'Bengaluru', '2026-03-01 18:40:00', 1.5, 'USER_CANCELLED'), -- Ignored: surge not > 1.5
-- Bengaluru 19:00
(4, 'Bengaluru', '2026-03-01 19:10:00', 1.7, 'COMPLETED'),
-- Delhi 09:00
(5, 'Delhi', '2026-03-01 09:15:00', 2.2, 'USER_CANCELLED'),
(6, 'Delhi', '2026-03-01 09:30:00', 1.9, 'DRIVER_CANCELLED'); -- Driver cancelled, not user!`,
      previewRows: {
        ride_requests: [
          { request_id: 1, city: 'Bengaluru', request_time: '2026-03-01 18:05:00', surge_multiplier: 1.8, status: 'USER_CANCELLED' },
          { request_id: 2, city: 'Bengaluru', request_time: '2026-03-01 18:15:00', surge_multiplier: 2.0, status: 'COMPLETED' },
          { request_id: 3, city: 'Bengaluru', request_time: '2026-03-01 18:40:00', surge_multiplier: 1.5, status: 'USER_CANCELLED' },
          { request_id: 4, city: 'Bengaluru', request_time: '2026-03-01 19:10:00', surge_multiplier: 1.7, status: 'COMPLETED' },
        ],
      },
    },
    edgeCaseA: {
      name: 'Stage 2: Integer Division Trap',
      title: 'Hidden Edge Case A — Integer Division Trap',
      trapDescription: 'Writing cancelled / total in SQL performs integer division, yielding 0.00 instead of 50.00%.',
      diagnosticHint: 'Your query failed Stage 2 (Integer Division Trap). In SQL, dividing two integers produces an integer (e.g. 1 / 2 = 0). Multiply by 100.0 first.',
      ddl: `
CREATE TABLE ride_requests (
  request_id INTEGER PRIMARY KEY,
  city VARCHAR(50),
  request_time DATETIME,
  surge_multiplier DECIMAL(3,2),
  status VARCHAR(30)
);`,
      seed: `
INSERT INTO ride_requests VALUES
(11, 'Mumbai', '2026-03-02 08:10:00', 1.9, 'USER_CANCELLED'),
(12, 'Mumbai', '2026-03-02 08:20:00', 1.9, 'COMPLETED'),
(13, 'Mumbai', '2026-03-02 08:30:00', 1.9, 'COMPLETED'),
(14, 'Mumbai', '2026-03-02 08:40:00', 1.9, 'COMPLETED'); -- 1 / 4 = 25.00%`,
    },
    edgeCaseB: {
      name: 'Stage 3: Driver vs User Cancellation Trap',
      title: 'Hidden Edge Case B — Cancellation Status Trap',
      trapDescription: 'Only USER_CANCELLED counts as user cancellation; DRIVER_CANCELLED must count in the denominator but NOT in the numerator.',
      diagnosticHint: 'Your query failed Stage 3 (Cancellation Status). DRIVER_CANCELLED should only be counted in total_surge_requests, not in cancelled_requests.',
      ddl: `
CREATE TABLE ride_requests (
  request_id INTEGER PRIMARY KEY,
  city VARCHAR(50),
  request_time DATETIME,
  surge_multiplier DECIMAL(3,2),
  status VARCHAR(30)
);`,
      seed: `
INSERT INTO ride_requests VALUES
(21, 'Hyderabad', '2026-03-03 21:05:00', 2.1, 'DRIVER_CANCELLED'),
(22, 'Hyderabad', '2026-03-03 21:20:00', 2.1, 'COMPLETED');`,
    },
    edgeCaseC: {
      name: 'Stage 4: Strict 1.5x Inequality Boundary Trap',
      title: 'Hidden Edge Case C — 1.5x Multiplier Boundary Trap',
      trapDescription: 'Testing surge_multiplier = 1.50 vs surge_multiplier = 1.51.',
      diagnosticHint: 'Your query failed Stage 4 (Boundary Trap). The problem requires surge_multiplier strictly greater than 1.5 (> 1.5, not >= 1.5).',
      ddl: `
CREATE TABLE ride_requests (
  request_id INTEGER PRIMARY KEY,
  city VARCHAR(50),
  request_time DATETIME,
  surge_multiplier DECIMAL(3,2),
  status VARCHAR(30)
);`,
      seed: `
INSERT INTO ride_requests VALUES
(31, 'Chennai', '2026-03-04 15:00:00', 1.50, 'USER_CANCELLED'), -- Exactly 1.5 (Excluded)
(32, 'Chennai', '2026-03-04 15:10:00', 1.51, 'USER_CANCELLED'); -- 1.51 (Included)`,
    },
  },
  starterSql: `-- Write your SQL solution below
SELECT 
  city,
  CAST(strftime('%H', request_time) AS INTEGER) AS request_hour,
  COUNT(*) AS total_surge_requests,
  -- Calculate user cancellations and rate
  0 AS cancelled_requests,
  0.0 AS cancellation_rate_pct
FROM ride_requests
WHERE surge_multiplier > 1.5
GROUP BY city, request_hour
ORDER BY city ASC, request_hour ASC;`,
  solutionSql: `SELECT 
  city,
  CAST(strftime('%H', request_time) AS INTEGER) AS request_hour,
  COUNT(*) AS total_surge_requests,
  SUM(CASE WHEN status = 'USER_CANCELLED' THEN 1 ELSE 0 END) AS cancelled_requests,
  ROUND(
    100.0 * SUM(CASE WHEN status = 'USER_CANCELLED' THEN 1 ELSE 0 END) / COUNT(*),
    2
  ) AS cancellation_rate_pct
FROM ride_requests
WHERE surge_multiplier > 1.5
GROUP BY city, CAST(strftime('%H', request_time) AS INTEGER)
ORDER BY city ASC, request_hour ASC;`,
  hints: {
    edgeCase: 'Watch out for integer division by multiplying with 100.0 before dividing, and check > 1.5 strictly.',
    approach: 'Extract hour using `CAST(strftime(\'%H\', request_time) AS INTEGER)`. Group by `city` and that hour. Use `SUM(CASE WHEN status = \'USER_CANCELLED\' THEN 1 ELSE 0 END)` for the numerator.',
    annotatedSolution: `-- Canonical Solution
SELECT 
  city,
  CAST(strftime('%H', request_time) AS INTEGER) AS request_hour,
  COUNT(*) AS total_surge_requests,
  SUM(CASE WHEN status = 'USER_CANCELLED' THEN 1 ELSE 0 END) AS cancelled_requests,
  ROUND(
    100.0 * SUM(CASE WHEN status = 'USER_CANCELLED' THEN 1 ELSE 0 END) / COUNT(*),
    2
  ) AS cancellation_rate_pct
FROM ride_requests
WHERE surge_multiplier > 1.5
GROUP BY city, CAST(strftime('%H', request_time) AS INTEGER)
ORDER BY city ASC, request_hour ASC;`,
    whyNaiveFails: 'In SQL, `COUNT(cancelled) / COUNT(*)` evaluates to 0 because both are integers. You must multiply by 100.0 first.',
  },
};
