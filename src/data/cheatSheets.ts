import { CheatSheet } from '../types';

export const cheatSheets: CheatSheet[] = [
  {
    id: 'window-functions',
    title: 'Window Functions (ROW_NUMBER vs RANK vs DENSE_RANK)',
    category: 'Ranking & Partitioning',
    summary:
      'The #1 most frequently tested concept in SQL Online Assessments. Understand how tie-breakers affect row counts and why naive queries fail.',
    syntaxTemplate: `SELECT 
  employee_id, 
  department_id, 
  salary,
  ROW_NUMBER() OVER (PARTITION BY department_id ORDER BY salary DESC) as row_num,
  RANK()       OVER (PARTITION BY department_id ORDER BY salary DESC) as rnk,
  DENSE_RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) as dense_rnk
FROM salaries;`,
    businessScenario:
      'When an e-commerce platform asks for the "Top 2 selling products per category", if two products share 2nd place with identical revenue, ROW_NUMBER() will arbitrarily pick one and drop the other (failing test cases). DENSE_RANK() preserves both tied products and keeps ranks sequential (1, 2, 2, 3). RANK() skips numbers on ties (1, 2, 2, 4).',
    exampleSql: `-- Find top 2 products per category including ties
WITH RankedProducts AS (
  SELECT 
    category_id,
    product_id,
    net_sales,
    DENSE_RANK() OVER (PARTITION BY category_id ORDER BY net_sales DESC) as rnk
  FROM category_sales
)
SELECT category_id, product_id, net_sales, rnk
FROM RankedProducts
WHERE rnk <= 2
ORDER BY category_id ASC, rnk ASC, product_id ASC;`,
    commonPitfalls: [
      'Using WHERE clause directly with window functions — window functions execute AFTER WHERE and GROUP BY; they must be wrapped in a CTE or subquery.',
      'Using ROW_NUMBER() instead of DENSE_RANK() when ties exist in business requirements.',
      'Missing deterministic secondary order columns in ORDER BY when unique ordering is strictly expected.',
    ],
    recommendedProblems: ['p3_top_products_ties', 'p6_running_balance_overdraft'],
  },
  {
    id: 'gaps-and-islands',
    title: 'Gaps & Islands (Streaks & Consecutive Intervals)',
    category: 'Sequential Analysis',
    summary:
      'Find consecutive active days, delivery streaks, or periods of system downtime using the ROW_NUMBER difference technique.',
    syntaxTemplate: `WITH GroupedActivity AS (
  SELECT 
    user_id,
    activity_date,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY activity_date) as seq,
    -- In SQLite / Postgres, subtracting seq days creates an invariant island group ID
    date(activity_date, '-' || ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY activity_date) || ' days') as island_id
  FROM logins
)
SELECT user_id, COUNT(*) as streak_length, MIN(activity_date) as start_date, MAX(activity_date) as end_date
FROM GroupedActivity
GROUP BY user_id, island_id;`,
    businessScenario:
      'Food delivery and ride-hailing platforms (Swiggy, Zomato, Uber) evaluate rider bonuses based on "longest streak of consecutive on-time orders" without late deliveries.',
    exampleSql: `-- Group consecutive on-time delivery flags
WITH IndexedOrders AS (
  SELECT 
    rider_id,
    delivery_id,
    is_ontime,
    delivery_time,
    ROW_NUMBER() OVER (PARTITION BY rider_id ORDER BY delivery_time) as overall_seq,
    ROW_NUMBER() OVER (PARTITION BY rider_id, is_ontime ORDER BY delivery_time) as state_seq
  FROM deliveries
)
SELECT 
  rider_id,
  COUNT(*) as ontime_streak
FROM IndexedOrders
WHERE is_ontime = 1
GROUP BY rider_id, (overall_seq - state_seq)
ORDER BY ontime_streak DESC;`,
    commonPitfalls: [
      'Forgetting that riders/users with 0 successful events should return a streak of 0, not be missing from the result set.',
      'Assuming sequence IDs are contiguous without gaps (always generate a fresh ROW_NUMBER sequence).',
    ],
    recommendedProblems: ['p4_rider_ontime_streak', 'p9_rolling_sla_breach'],
  },
  {
    id: 'self-joins-time-windows',
    title: 'Self-Joins & Sliding Time Windows',
    category: 'Relational Matching',
    summary:
      'Match records from the same table within relative time offsets (e.g. within 10 minutes or 24 hours) to catch duplicate charges or circular transfers.',
    syntaxTemplate: `SELECT 
  t1.id as original_id,
  t2.id as follow_up_id,
  t1.merchant_id,
  t1.amount
FROM transactions t1
JOIN transactions t2 
  ON t1.merchant_id = t2.merchant_id
  AND t1.id < t2.id
  AND strftime('%s', t2.created_at) - strftime('%s', t1.created_at) BETWEEN 0 AND 600;`,
    businessScenario:
      'UPI and Fintech platforms (Razorpay, PhonePe) flag network retry duplicates when identical settlements happen within 10 minutes of each other.',
    exampleSql: `-- Finding duplicate payments within 600 seconds
SELECT 
  t1.merchant_id,
  t1.amount,
  t1.transaction_id as first_txn,
  t2.transaction_id as dup_txn,
  (strftime('%s', t2.created_at) - strftime('%s', t1.created_at)) as seconds_apart
FROM transactions t1
JOIN transactions t2 
  ON t1.merchant_id = t2.merchant_id
  AND t1.amount = t2.amount
  AND t1.transaction_id < t2.transaction_id
  AND strftime('%s', t2.created_at) - strftime('%s', t1.created_at) <= 600
WHERE t1.status = 'SUCCESS' AND t2.status = 'SUCCESS';`,
    commonPitfalls: [
      'Using t1.id != t2.id instead of t1.id < t2.id, causing every duplicate pair to be returned twice (A-B and B-A).',
      'Using naive string comparison on timestamps instead of epoch seconds (strftime("%s", ...)).',
    ],
    recommendedProblems: ['p1_upi_duplicate_payout', 'p11_circular_money_ring'],
  },
  {
    id: 'left-join-null-traps',
    title: 'LEFT JOIN vs WHERE Clause (The Zero-Row Trap)',
    category: 'Filtering & Joins',
    summary:
      'Why putting filters on right-table columns in the WHERE clause silently turns an outer join into an inner join, dropping all zero-count entities.',
    syntaxTemplate: `-- WRONG: Silently drops all products with 0 sales
SELECT p.product_id, COUNT(o.order_id)
FROM products p
LEFT JOIN orders o ON p.product_id = o.product_id
WHERE o.order_date >= '2026-01-01' -- Drops NULL rows where no orders exist!
GROUP BY p.product_id;

-- CORRECT: Preserves products with 0 sales
SELECT p.product_id, COUNT(o.order_id)
FROM products p
LEFT JOIN orders o 
  ON p.product_id = o.product_id 
  AND o.order_date >= '2026-01-01'
GROUP BY p.product_id;`,
    businessScenario:
      'Quick commerce dark store inventory: "Find all dark-store items with positive stock that had ZERO delivered orders in the last 7 days".',
    exampleSql: `-- Dark stores with inventory but zero orders
SELECT 
  i.store_id,
  i.sku_id,
  i.stock_quantity
FROM inventory i
LEFT JOIN orders o 
  ON i.store_id = o.store_id 
  AND i.sku_id = o.sku_id
  AND o.status = 'DELIVERED'
  AND o.order_date >= date('now', '-7 days')
WHERE i.stock_quantity > 0 
  AND o.order_id IS NULL;`,
    commonPitfalls: [
      'Placing filters on the right table inside WHERE instead of ON.',
      'Using COUNT(*) instead of COUNT(right_table.id) on a LEFT JOIN, which reports 1 instead of 0 for non-matching rows.',
    ],
    recommendedProblems: ['p2_darkstore_inventory_waste', 'p5_saas_nrr_retention'],
  },
  {
    id: 'integer-division-boundaries',
    title: 'Integer Division & Zero-Denominator Safety',
    category: 'Mathematical Precision',
    summary:
      'Avoid silent 0% results from SQL integer division and crashes from division-by-zero on empty cohorts or 0-count denominators.',
    syntaxTemplate: `-- In SQLite / ANSI SQL: 5 / 10 = 0 (integer division)
-- Safe Float Conversion:
ROUND(100.0 * numerator / NULLIF(denominator, 0), 2)

-- Or with explicit CASE WHEN:
CASE 
  WHEN denominator = 0 OR denominator IS NULL THEN 0.00
  ELSE ROUND(100.0 * numerator / denominator, 2)
END;`,
    businessScenario:
      'Ride-hailing surge cancellation rates or B2B SaaS retention percentages where initial revenue or denominator counts can be zero.',
    exampleSql: `-- Safe cancellation rate computation
SELECT 
  city,
  COUNT(*) as total_requests,
  SUM(CASE WHEN status = 'USER_CANCELLED' THEN 1 ELSE 0 END) as cancelled_count,
  ROUND(
    100.0 * SUM(CASE WHEN status = 'USER_CANCELLED' THEN 1 ELSE 0 END) / 
    NULLIF(COUNT(*), 0), 
    2
  ) as cancellation_rate_pct
FROM ride_requests
GROUP BY city;`,
    commonPitfalls: [
      'Writing `COUNT(cancelled) / COUNT(total) * 100` — integer truncation causes 0.00.',
      'Not wrapping denominators with `NULLIF(col, 0)` or `CASE WHEN` to guard against zero-division.',
    ],
    recommendedProblems: ['p5_saas_nrr_retention', 'p8_surge_cancellation_rate'],
  },
];
