import { Problem } from '../../types';

export const p9RollingSla: Problem = {
  id: 'p9_rolling_sla_breach',
  title: '3-Day Rolling Average Delivery SLA Breach',
  difficulty: 'Hard',
  domain: 'Quick Commerce / Swiggy-Blinkit Style',
  companyTags: ['Zepto', 'Blinkit', 'Instamart', 'DoorDash'],
  patterns: ['Window Functions', 'Rolling Averages', 'Consecutive Periods', 'LEAD / LAG'],
  isPro: true,
  businessContext: `Quick-commerce promises 10-minute grocery delivery. Operations teams track the 3-Day Rolling Average Delivery Time per dark store to detect chronic congestion before customer churn accelerates.

Write a query to identify all dark stores that experienced an SLA breach (3-day rolling average delivery time strictly greater than 15.0 minutes) for at least 2 consecutive calendar days.

Business Rules:
1. Calculate the 3-day rolling average delivery time per store using:
   \`AVG(avg_delivery_minutes) OVER (PARTITION BY store_id ORDER BY metric_date ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)\`.
2. Only consider dates where at least 3 days of historical data exist for that store (i.e. \`row_number >= 3\`).
3. A store qualifies if there are at least two consecutive dates (where \`julianday(next_date) - julianday(date) = 1\`) where both days had \`rolling_avg > 15.0\`.
4. For each qualifying store, report the store ID and the highest 3-day rolling average observed across the entire period (\`max_rolling_avg\`, rounded to 2 decimals).
5. Expected columns: \`store_id\`, \`max_rolling_avg\`.
6. Order results by \`store_id ASC\`.`,
  expectedColumns: [
    { name: 'store_id', type: 'VARCHAR', description: 'Dark store location code' },
    { name: 'max_rolling_avg', type: 'DECIMAL', description: 'Highest 3-day rolling average delivery time' },
  ],
  orderingRule: 'ORDER BY store_id ASC',
  schema: [
    {
      tableName: 'store_daily_metrics',
      description: 'Daily aggregated delivery performance metrics per dark store',
      columns: [
        { name: 'metric_date', type: 'DATE', isPk: true },
        { name: 'store_id', type: 'VARCHAR', isPk: true },
        { name: 'avg_delivery_minutes', type: 'DECIMAL(5,2)' },
      ],
    },
  ],
  stages: {
    sample: {
      name: 'Stage 1: Visible Sample Dataset',
      title: 'Visible Sample Dataset',
      ddl: `
CREATE TABLE store_daily_metrics (
  metric_date DATE,
  store_id VARCHAR(20),
  avg_delivery_minutes DECIMAL(5,2),
  PRIMARY KEY (metric_date, store_id)
);`,
      seed: `
INSERT INTO store_daily_metrics VALUES
-- Store BLR_01: 4 days (Day 3 avg: 15.67, Day 4 avg: 16.33 -> 2 consecutive breach days!)
('2026-03-01', 'BLR_01', 14.0),
('2026-03-02', 'BLR_01', 16.0),
('2026-03-03', 'BLR_01', 17.0), -- 3-day avg: (14+16+17)/3 = 15.67 (Breach)
('2026-03-04', 'BLR_01', 16.0), -- 3-day avg: (16+17+16)/3 = 16.33 (Breach)
-- Store DEL_02: Safe store
('2026-03-01', 'DEL_02', 12.0),
('2026-03-02', 'DEL_02', 13.0),
('2026-03-03', 'DEL_02', 12.5);`,
      previewRows: {
        store_daily_metrics: [
          { metric_date: '2026-03-01', store_id: 'BLR_01', avg_delivery_minutes: 14.0 },
          { metric_date: '2026-03-02', store_id: 'BLR_01', avg_delivery_minutes: 16.0 },
          { metric_date: '2026-03-03', store_id: 'BLR_01', avg_delivery_minutes: 17.0 },
          { metric_date: '2026-03-04', store_id: 'BLR_01', avg_delivery_minutes: 16.0 },
        ],
      },
    },
    edgeCaseA: {
      name: 'Stage 2: Single-Day Breach (Non-Consecutive) Trap',
      title: 'Hidden Edge Case A — Single-Day Breach Trap',
      trapDescription: 'A store has a 3-day rolling average > 15.0 on only ONE day, not two consecutive days. It must be excluded.',
      diagnosticHint: 'Your query failed Stage 2 (Single-Day Breach). Stores with only 1 breach day must NOT appear. You must verify that at least 2 consecutive days had rolling_avg > 15.0.',
      ddl: `
CREATE TABLE store_daily_metrics (
  metric_date DATE,
  store_id VARCHAR(20),
  avg_delivery_minutes DECIMAL(5,2),
  PRIMARY KEY (metric_date, store_id)
);`,
      seed: `
INSERT INTO store_daily_metrics VALUES
('2026-03-01', 'MUM_03', 14.0),
('2026-03-02', 'MUM_03', 15.0),
('2026-03-03', 'MUM_03', 17.0), -- 3-day avg: 15.33 (Breach Day 1)
('2026-03-04', 'MUM_03', 12.0); -- 3-day avg: 14.67 (Safe, streak broken)`,
    },
    edgeCaseB: {
      name: 'Stage 3: Calendar Date Gap Trap',
      title: 'Hidden Edge Case B — Calendar Date Gap Trap',
      trapDescription: 'Two breach records that are not on consecutive calendar days (e.g. March 3rd and March 5th with March 4th missing).',
      diagnosticHint: 'Your query failed Stage 3 (Date Gap Trap). Consecutive days must have exactly 1 calendar day difference (julianday(date_b) - julianday(date_a) = 1).',
      ddl: `
CREATE TABLE store_daily_metrics (
  metric_date DATE,
  store_id VARCHAR(20),
  avg_delivery_minutes DECIMAL(5,2),
  PRIMARY KEY (metric_date, store_id)
);`,
      seed: `
INSERT INTO store_daily_metrics VALUES
('2026-03-01', 'HYD_04', 16.0),
('2026-03-02', 'HYD_04', 16.0),
('2026-03-03', 'HYD_04', 16.0), -- Breach on Mar 3 (16.0)
('2026-03-05', 'HYD_04', 16.0); -- Breach on Mar 5, but Mar 4 data is missing! Not consecutive calendar days`,
    },
    edgeCaseC: {
      name: 'Stage 4: Exactly 15.0 Minute Boundary Trap',
      title: 'Hidden Edge Case C — 15.0 Minute Boundary Trap',
      trapDescription: 'Testing rolling average of exactly 15.00 vs 15.01.',
      diagnosticHint: 'Your query failed Stage 4 (Boundary Trap). The SLA breach threshold is strictly greater than 15.0 (> 15.0, not >= 15.0).',
      ddl: `
CREATE TABLE store_daily_metrics (
  metric_date DATE,
  store_id VARCHAR(20),
  avg_delivery_minutes DECIMAL(5,2),
  PRIMARY KEY (metric_date, store_id)
);`,
      seed: `
INSERT INTO store_daily_metrics VALUES
('2026-03-01', 'PUN_05', 15.0),
('2026-03-02', 'PUN_05', 15.0),
('2026-03-03', 'PUN_05', 15.0), -- Exactly 15.00 (NOT a breach)
('2026-03-04', 'PUN_05', 15.0);`,
    },
  },
  starterSql: `-- Write your SQL solution below
WITH RollingMetrics AS (
  SELECT 
    metric_date,
    store_id,
    avg_delivery_minutes,
    ROW_NUMBER() OVER (PARTITION BY store_id ORDER BY metric_date) AS day_num,
    AVG(avg_delivery_minutes) OVER (
      PARTITION BY store_id 
      ORDER BY metric_date 
      ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
    ) AS rolling_3d_avg
  FROM store_daily_metrics
)
-- Complete query to find stores with >= 2 consecutive breach days
SELECT store_id, 0.0 AS max_rolling_avg FROM store_daily_metrics GROUP BY store_id;`,
  solutionSql: `WITH RollingMetrics AS (
  SELECT 
    metric_date,
    store_id,
    avg_delivery_minutes,
    ROW_NUMBER() OVER (PARTITION BY store_id ORDER BY metric_date) AS day_num,
    AVG(avg_delivery_minutes) OVER (
      PARTITION BY store_id 
      ORDER BY metric_date 
      ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
    ) AS rolling_3d_avg
  FROM store_daily_metrics
),
BreachDays AS (
  SELECT 
    metric_date,
    store_id,
    rolling_3d_avg,
    LEAD(metric_date) OVER (PARTITION BY store_id ORDER BY metric_date) AS next_date,
    LEAD(rolling_3d_avg) OVER (PARTITION BY store_id ORDER BY metric_date) AS next_rolling_avg
  FROM RollingMetrics
  WHERE day_num >= 3
),
ConsecutiveBreachStores AS (
  SELECT DISTINCT store_id
  FROM BreachDays
  WHERE rolling_3d_avg > 15.0 
    AND next_rolling_avg > 15.0
    AND (julianday(next_date) - julianday(metric_date)) = 1
),
MaxRolling AS (
  SELECT 
    store_id,
    ROUND(MAX(rolling_3d_avg), 2) AS max_rolling_avg
  FROM RollingMetrics
  WHERE day_num >= 3
  GROUP BY store_id
)
SELECT 
  cbs.store_id,
  mr.max_rolling_avg
FROM ConsecutiveBreachStores cbs
JOIN MaxRolling mr ON cbs.store_id = mr.store_id
ORDER BY cbs.store_id ASC;`,
  hints: {
    edgeCase: 'Check for consecutive calendar dates (julianday difference = 1) and make sure day_num >= 3.',
    approach: 'Compute rolling average with `AVG(...) OVER (PARTITION BY store_id ORDER BY metric_date ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)`. Use `LEAD()` to inspect the next calendar day. Filter for both rolling averages > 15.0 on consecutive days.',
    annotatedSolution: `-- Canonical Solution
WITH RollingMetrics AS (
  SELECT 
    metric_date,
    store_id,
    avg_delivery_minutes,
    ROW_NUMBER() OVER (PARTITION BY store_id ORDER BY metric_date) AS day_num,
    AVG(avg_delivery_minutes) OVER (
      PARTITION BY store_id 
      ORDER BY metric_date 
      ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
    ) AS rolling_3d_avg
  FROM store_daily_metrics
),
BreachDays AS (
  SELECT 
    metric_date,
    store_id,
    rolling_3d_avg,
    LEAD(metric_date) OVER (PARTITION BY store_id ORDER BY metric_date) AS next_date,
    LEAD(rolling_3d_avg) OVER (PARTITION BY store_id ORDER BY metric_date) AS next_rolling_avg
  FROM RollingMetrics
  WHERE day_num >= 3
),
ConsecutiveBreachStores AS (
  SELECT DISTINCT store_id
  FROM BreachDays
  WHERE rolling_3d_avg > 15.0 
    AND next_rolling_avg > 15.0
    AND (julianday(next_date) - julianday(metric_date)) = 1
),
MaxRolling AS (
  SELECT 
    store_id,
    ROUND(MAX(rolling_3d_avg), 2) AS max_rolling_avg
  FROM RollingMetrics
  WHERE day_num >= 3
  GROUP BY store_id
)
SELECT 
  cbs.store_id,
  mr.max_rolling_avg
FROM ConsecutiveBreachStores cbs
JOIN MaxRolling mr ON cbs.store_id = mr.store_id
ORDER BY cbs.store_id ASC;`,
    whyNaiveFails: 'Simply checking `COUNT(breach_days) >= 2` does not ensure that the breach days were consecutive calendar days.',
  },
};
