import { Problem } from '../../types';

export const p5SaasNrr: Problem = {
  id: 'p5_saas_nrr_retention',
  title: 'Monthly Net Revenue Retention (NRR) & Churned Cohort',
  difficulty: 'Medium',
  domain: 'B2B SaaS / Subscription Analytics',
  companyTags: ['Postman', 'BrowserStack', 'Freshworks', 'Chargebee'],
  patterns: ['Cohort Retention', 'Safe Division', 'LEFT JOIN Aggregation'],
  isPro: false,
  businessContext: `SaaS investors and leadership measure product health using Net Revenue Retention (NRR). NRR tracks the percentage of recurring revenue retained from an initial customer cohort after one month, factoring in churn, downgrades, and expansion upgrades.

For each signup cohort (defined by \`cohort_month\`), calculate:
1. \`month_0_rev\`: Total subscription revenue collected from the cohort in their initial signup month (\`billing_month = cohort_month\`).
2. \`month_1_rev\`: Total subscription revenue collected from the same cohort in their second month (\`billing_month = date(cohort_month, '+1 month')\`).
3. \`nrr_percentage\`: \`ROUND((month_1_rev / month_0_rev) * 100.0, 2)\`.

Business Rules:
1. If a cohort generated ₹0 in Month 0 (e.g. free trials/freemium signups), report \`nrr_percentage\` as \`0.00\` to avoid division-by-zero crashes.
2. If customers churned completely in Month 1 and paid nothing, report \`month_1_rev\` as \`0.00\` and \`nrr_percentage\` as \`0.00\`.
3. Expected columns: \`cohort_month\`, \`month_0_rev\`, \`month_1_rev\`, \`nrr_percentage\`.
4. Order results by \`cohort_month ASC\`.`,
  expectedColumns: [
    { name: 'cohort_month', type: 'VARCHAR', description: 'Signup cohort month (YYYY-MM)' },
    { name: 'month_0_rev', type: 'DECIMAL', description: 'Initial revenue in Month 0' },
    { name: 'month_1_rev', type: 'DECIMAL', description: 'Retained revenue in Month 1' },
    { name: 'nrr_percentage', type: 'DECIMAL', description: 'Net Revenue Retention percentage (rounded to 2 decimals)' },
  ],
  orderingRule: 'ORDER BY cohort_month ASC',
  schema: [
    {
      tableName: 'customers',
      description: 'Customer profiles and initial signup month',
      columns: [
        { name: 'customer_id', type: 'VARCHAR', isPk: true },
        { name: 'cohort_month', type: 'VARCHAR', description: 'Format: YYYY-MM' },
      ],
    },
    {
      tableName: 'subscriptions',
      description: 'Monthly recurring billing transactions per customer',
      columns: [
        { name: 'sub_id', type: 'INTEGER', isPk: true },
        { name: 'customer_id', type: 'VARCHAR', isFk: true },
        { name: 'billing_month', type: 'VARCHAR', description: 'Format: YYYY-MM' },
        { name: 'amount_paid', type: 'DECIMAL(10,2)' },
      ],
    },
  ],
  stages: {
    sample: {
      name: 'Stage 1: Visible Sample Dataset',
      title: 'Visible Sample Dataset',
      ddl: `
CREATE TABLE customers (
  customer_id VARCHAR(20) PRIMARY KEY,
  cohort_month VARCHAR(7)
);
CREATE TABLE subscriptions (
  sub_id INTEGER PRIMARY KEY,
  customer_id VARCHAR(20),
  billing_month VARCHAR(7),
  amount_paid DECIMAL(10,2)
);`,
      seed: `
INSERT INTO customers VALUES
('C101', '2026-01'),
('C102', '2026-01'),
('C201', '2026-02');

INSERT INTO subscriptions VALUES
-- 2026-01 cohort
(1, 'C101', '2026-01', 1000.00), -- M0
(2, 'C102', '2026-01', 2000.00), -- M0 (total M0: 3000)
(3, 'C101', '2026-02', 1000.00), -- M1
(4, 'C102', '2026-02', 2500.00), -- M1 upgraded (total M1: 3500 => NRR: 116.67%)
-- 2026-02 cohort
(5, 'C201', '2026-02', 1500.00), -- M0
(6, 'C201', '2026-03', 750.00);  -- M1 downgraded (NRR: 50.00%)`,
      previewRows: {
        customers: [
          { customer_id: 'C101', cohort_month: '2026-01' },
          { customer_id: 'C102', cohort_month: '2026-01' },
          { customer_id: 'C201', cohort_month: '2026-02' },
        ],
        subscriptions: [
          { sub_id: 1, customer_id: 'C101', billing_month: '2026-01', amount_paid: 1000 },
          { sub_id: 2, customer_id: 'C102', billing_month: '2026-01', amount_paid: 2000 },
          { sub_id: 3, customer_id: 'C101', billing_month: '2026-02', amount_paid: 1000 },
          { sub_id: 4, customer_id: 'C102', billing_month: '2026-02', amount_paid: 2500 },
        ],
      },
    },
    edgeCaseA: {
      name: 'Stage 2: 100% Churn in Month 1 Trap',
      title: 'Hidden Edge Case A — 100% Churn in Month 1 Trap',
      trapDescription: 'All customers in a cohort churned before Month 1. Month 1 revenue must be 0.00 and NRR must be 0.00, not NULL.',
      diagnosticHint: 'Your query failed Stage 2 (100% Churn Trap). When month_1_rev is 0 or NULL, ensure you use COALESCE(SUM(amount_paid), 0) to report 0.00 rather than NULL.',
      ddl: `
CREATE TABLE customers (
  customer_id VARCHAR(20) PRIMARY KEY,
  cohort_month VARCHAR(7)
);
CREATE TABLE subscriptions (
  sub_id INTEGER PRIMARY KEY,
  customer_id VARCHAR(20),
  billing_month VARCHAR(7),
  amount_paid DECIMAL(10,2)
);`,
      seed: `
INSERT INTO customers VALUES
('C301', '2026-01'),
('C302', '2026-01');

INSERT INTO subscriptions VALUES
(31, 'C301', '2026-01', 500.00),
(32, 'C302', '2026-01', 500.00);
-- Nobody renewed in 2026-02!`,
    },
    edgeCaseB: {
      name: 'Stage 3: Zero Initial Revenue / Free-Tier Trap',
      title: 'Hidden Edge Case B — Zero Initial Revenue Trap (Division by Zero)',
      trapDescription: 'A cohort had free-tier signups with ₹0.00 in Month 0. Dividing by 0 crashes standard queries.',
      diagnosticHint: 'Your query failed Stage 3 (Division by Zero Trap). When month_0_rev is 0, protect the division using CASE WHEN month_0_rev = 0 THEN 0.00 ELSE ... END.',
      ddl: `
CREATE TABLE customers (
  customer_id VARCHAR(20) PRIMARY KEY,
  cohort_month VARCHAR(7)
);
CREATE TABLE subscriptions (
  sub_id INTEGER PRIMARY KEY,
  customer_id VARCHAR(20),
  billing_month VARCHAR(7),
  amount_paid DECIMAL(10,2)
);`,
      seed: `
INSERT INTO customers VALUES
('C401', '2026-03'),
('C402', '2026-03');

INSERT INTO subscriptions VALUES
(41, 'C401', '2026-03', 0.00), -- Free trial
(42, 'C402', '2026-03', 0.00), -- Free trial
(43, 'C401', '2026-04', 1000.00); -- Upgraded to paid in Month 1`,
    },
    edgeCaseC: {
      name: 'Stage 4: Net Expansion NRR (>100%) Trap',
      title: 'Hidden Edge Case C — Net Expansion NRR Trap',
      trapDescription: 'Customers significantly expand their subscriptions in Month 1 (NRR > 100%).',
      diagnosticHint: 'Your query failed Stage 4 (NRR Calculation). Verify calculation matches ROUND((month_1_rev * 100.0) / month_0_rev, 2).',
      ddl: `
CREATE TABLE customers (
  customer_id VARCHAR(20) PRIMARY KEY,
  cohort_month VARCHAR(7)
);
CREATE TABLE subscriptions (
  sub_id INTEGER PRIMARY KEY,
  customer_id VARCHAR(20),
  billing_month VARCHAR(7),
  amount_paid DECIMAL(10,2)
);`,
      seed: `
INSERT INTO customers VALUES
('C501', '2026-04');

INSERT INTO subscriptions VALUES
(51, 'C501', '2026-04', 1000.00),
(52, 'C501', '2026-05', 2750.00); -- 275% NRR`,
    },
  },
  starterSql: `-- Write your SQL solution below
WITH CohortRevenue AS (
  SELECT 
    c.cohort_month,
    -- Calculate Month 0 and Month 1 revenue
    0 AS month_0_rev,
    0 AS month_1_rev
  FROM customers c
  GROUP BY c.cohort_month
)
SELECT * FROM CohortRevenue;`,
  solutionSql: `WITH Month0 AS (
  SELECT 
    c.cohort_month,
    COALESCE(SUM(s.amount_paid), 0.00) AS month_0_rev
  FROM customers c
  JOIN subscriptions s 
    ON c.customer_id = s.customer_id 
    AND s.billing_month = c.cohort_month
  GROUP BY c.cohort_month
),
Month1 AS (
  SELECT 
    c.cohort_month,
    COALESCE(SUM(s.amount_paid), 0.00) AS month_1_rev
  FROM customers c
  JOIN subscriptions s 
    ON c.customer_id = s.customer_id 
    AND s.billing_month = strftime('%Y-%m', date(c.cohort_month || '-01', '+1 month'))
  GROUP BY c.cohort_month
),
AllCohorts AS (
  SELECT DISTINCT cohort_month FROM customers
)
SELECT 
  ac.cohort_month,
  COALESCE(m0.month_0_rev, 0.00) AS month_0_rev,
  COALESCE(m1.month_1_rev, 0.00) AS month_1_rev,
  CASE 
    WHEN COALESCE(m0.month_0_rev, 0.00) = 0 THEN 0.00
    ELSE ROUND((COALESCE(m1.month_1_rev, 0.00) * 100.0) / m0.month_0_rev, 2)
  END AS nrr_percentage
FROM AllCohorts ac
LEFT JOIN Month0 m0 ON ac.cohort_month = m0.cohort_month
LEFT JOIN Month1 m1 ON ac.cohort_month = m1.cohort_month
ORDER BY ac.cohort_month ASC;`,
  hints: {
    edgeCase: 'Guard against division by zero when Month 0 revenue is 0, and use LEFT JOIN for Month 1 so fully churned cohorts are not dropped.',
    approach: 'Compute Month 0 revenue in one CTE and Month 1 revenue (using `strftime(\'%Y-%m\', date(cohort_month || \'-01\', \'+1 month\'))`) in another CTE. Join both back to distinct cohorts.',
    annotatedSolution: `-- Canonical Solution
WITH Month0 AS (
  SELECT 
    c.cohort_month,
    COALESCE(SUM(s.amount_paid), 0.00) AS month_0_rev
  FROM customers c
  JOIN subscriptions s 
    ON c.customer_id = s.customer_id 
    AND s.billing_month = c.cohort_month
  GROUP BY c.cohort_month
),
Month1 AS (
  SELECT 
    c.cohort_month,
    COALESCE(SUM(s.amount_paid), 0.00) AS month_1_rev
  FROM customers c
  JOIN subscriptions s 
    ON c.customer_id = s.customer_id 
    AND s.billing_month = strftime('%Y-%m', date(c.cohort_month || '-01', '+1 month'))
  GROUP BY c.cohort_month
),
AllCohorts AS (
  SELECT DISTINCT cohort_month FROM customers
)
SELECT 
  ac.cohort_month,
  COALESCE(m0.month_0_rev, 0.00) AS month_0_rev,
  COALESCE(m1.month_1_rev, 0.00) AS month_1_rev,
  CASE 
    WHEN COALESCE(m0.month_0_rev, 0.00) = 0 THEN 0.00
    ELSE ROUND((COALESCE(m1.month_1_rev, 0.00) * 100.0) / m0.month_0_rev, 2)
  END AS nrr_percentage
FROM AllCohorts ac
LEFT JOIN Month0 m0 ON ac.cohort_month = m0.cohort_month
LEFT JOIN Month1 m1 ON ac.cohort_month = m1.cohort_month
ORDER BY ac.cohort_month ASC;`,
    whyNaiveFails: 'An INNER JOIN between Month 0 and Month 1 will drop any cohort that suffered 100% churn in Month 1, causing missing rows in the result set.',
  },
};
