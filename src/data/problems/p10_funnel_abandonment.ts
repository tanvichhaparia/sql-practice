import { Problem } from '../../types';

export const p10FunnelAbandonment: Problem = {
  id: 'p10_funnel_abandonment',
  title: 'Step-by-Step Cart Abandonment Drop-Off Funnel',
  difficulty: 'Hard',
  domain: 'E-Commerce Funnel Analytics',
  companyTags: ['Amazon', 'Flipkart', 'Shopify', 'Walmart', 'Target'],
  patterns: ['Funnel Analysis', 'LAG Window Function', 'User Deduplication', 'Division Safety'],
  isPro: true,
  businessContext: `Product analytics teams monitor the purchase conversion funnel to pinpoint friction points where potential buyers drop off during the checkout flow.

The 4 canonical steps in order are:
- Step 1: \`view_item\`
- Step 2: \`add_to_cart\`
- Step 3: \`checkout_initiated\`
- Step 4: \`payment_success\`

Write a query to calculate the count of distinct users at each funnel step and the percentage drop-off from the immediate preceding step.

Business Rules:
1. Count the number of unique \`user_id\`s who performed each step as \`unique_users\`. Duplicate actions by the same user within a step must only be counted once.
2. Calculate \`drop_off_pct\` as the percentage of users from the previous step who failed to complete the current step:
   \`ROUND(100.0 * (previous_step_users - current_step_users) / previous_step_users, 2)\`.
3. For Step 1 (\`view_item\`), \`drop_off_pct\` must be \`0.00\` (as there is no prior step).
4. If a prior step had 0 users, report \`drop_off_pct\` as \`0.00\` to guard against division-by-zero.
5. Expected columns: \`step_number\`, \`step_name\`, \`unique_users\`, \`drop_off_pct\`.
6. Order results by \`step_number ASC\`.`,
  expectedColumns: [
    { name: 'step_number', type: 'INTEGER', description: 'Funnel sequence order (1 to 4)' },
    { name: 'step_name', type: 'VARCHAR', description: 'Name of the funnel event step' },
    { name: 'unique_users', type: 'INTEGER', description: 'Count of unique users reaching this step' },
    { name: 'drop_off_pct', type: 'DECIMAL', description: 'Percentage drop-off from previous step' },
  ],
  orderingRule: 'ORDER BY step_number ASC',
  schema: [
    {
      tableName: 'funnel_events',
      description: 'Clickstream log of shopping session user actions',
      columns: [
        { name: 'event_id', type: 'INTEGER', isPk: true },
        { name: 'user_id', type: 'VARCHAR' },
        { name: 'session_id', type: 'VARCHAR' },
        { name: 'event_type', type: 'VARCHAR', description: "'view_item', 'add_to_cart', 'checkout_initiated', 'payment_success'" },
        { name: 'event_time', type: 'DATETIME' },
      ],
    },
  ],
  stages: {
    sample: {
      name: 'Stage 1: Visible Sample Dataset',
      title: 'Visible Sample Dataset',
      ddl: `
CREATE TABLE funnel_events (
  event_id INTEGER PRIMARY KEY,
  user_id VARCHAR(20),
  session_id VARCHAR(20),
  event_type VARCHAR(30),
  event_time DATETIME
);`,
      seed: `
INSERT INTO funnel_events VALUES
-- User U1 completes all 4 steps
(1, 'U1', 'S1', 'view_item', '2026-03-01 10:00:00'),
(2, 'U1', 'S1', 'add_to_cart', '2026-03-01 10:05:00'),
(3, 'U1', 'S1', 'checkout_initiated', '2026-03-01 10:10:00'),
(4, 'U1', 'S1', 'payment_success', '2026-03-01 10:15:00'),
-- User U2 drops after add_to_cart
(5, 'U2', 'S2', 'view_item', '2026-03-01 11:00:00'),
(6, 'U2', 'S2', 'add_to_cart', '2026-03-01 11:10:00'),
-- User U3 drops after view_item
(7, 'U3', 'S3', 'view_item', '2026-03-01 12:00:00'),
-- User U4 drops after checkout
(8, 'U4', 'S4', 'view_item', '2026-03-01 13:00:00'),
(9, 'U4', 'S4', 'add_to_cart', '2026-03-01 13:05:00'),
(10, 'U4', 'S4', 'checkout_initiated', '2026-03-01 13:10:00');`,
      previewRows: {
        funnel_events: [
          { event_id: 1, user_id: 'U1', session_id: 'S1', event_type: 'view_item', event_time: '2026-03-01 10:00:00' },
          { event_id: 2, user_id: 'U1', session_id: 'S1', event_type: 'add_to_cart', event_time: '2026-03-01 10:05:00' },
          { event_id: 3, user_id: 'U1', session_id: 'S1', event_type: 'checkout_initiated', event_time: '2026-03-01 10:10:00' },
          { event_id: 4, user_id: 'U1', session_id: 'S1', event_type: 'payment_success', event_time: '2026-03-01 10:15:00' },
        ],
      },
    },
    edgeCaseA: {
      name: 'Stage 2: Multiple Retries Per User Trap',
      title: 'Hidden Edge Case A — Multiple Retries Per User Trap',
      trapDescription: 'A user attempts payment 3 times in a row. Using COUNT(*) instead of COUNT(DISTINCT user_id) inflates step counts.',
      diagnosticHint: 'Your query failed Stage 2 (User Deduplication). Ensure you count unique users with COUNT(DISTINCT user_id) rather than COUNT(event_id).',
      ddl: `
CREATE TABLE funnel_events (
  event_id INTEGER PRIMARY KEY,
  user_id VARCHAR(20),
  session_id VARCHAR(20),
  event_type VARCHAR(30),
  event_time DATETIME
);`,
      seed: `
INSERT INTO funnel_events VALUES
(11, 'U10', 'S10', 'view_item', '2026-03-02 10:00:00'),
(12, 'U10', 'S10', 'view_item', '2026-03-02 10:02:00'), -- repeated view
(13, 'U10', 'S10', 'add_to_cart', '2026-03-02 10:05:00'),
(14, 'U10', 'S10', 'checkout_initiated', '2026-03-02 10:10:00'),
(15, 'U10', 'S10', 'payment_success', '2026-03-02 10:15:00'),
(16, 'U10', 'S10', 'payment_success', '2026-03-02 10:16:00'); -- retry payment`,
    },
    edgeCaseB: {
      name: 'Stage 3: 100% Conversion (0% Drop-off) Trap',
      title: 'Hidden Edge Case B — 100% Conversion Trap',
      trapDescription: 'All users who viewed an item successfully purchased it. drop_off_pct should be 0.00 across all steps.',
      diagnosticHint: 'Your query failed Stage 3 (Zero Drop-off). When all users convert, (prev_users - curr_users) = 0 and drop_off_pct should be 0.00.',
      ddl: `
CREATE TABLE funnel_events (
  event_id INTEGER PRIMARY KEY,
  user_id VARCHAR(20),
  session_id VARCHAR(20),
  event_type VARCHAR(30),
  event_time DATETIME
);`,
      seed: `
INSERT INTO funnel_events VALUES
(21, 'U21', 'S21', 'view_item', '2026-03-03 09:00:00'),
(22, 'U21', 'S21', 'add_to_cart', '2026-03-03 09:05:00'),
(23, 'U21', 'S21', 'checkout_initiated', '2026-03-03 09:10:00'),
(24, 'U21', 'S21', 'payment_success', '2026-03-03 09:15:00');`,
    },
    edgeCaseC: {
      name: 'Stage 4: Empty Next Step (100% Drop-off) Trap',
      title: 'Hidden Edge Case C — 100% Drop-off Trap',
      trapDescription: 'Users viewed items and added to cart, but ZERO users initiated checkout. The drop-off for checkout_initiated is 100.00%.',
      diagnosticHint: 'Your query failed Stage 4 (Total Abandonment). Ensure all 4 canonical steps are present even if unique_users is 0.',
      ddl: `
CREATE TABLE funnel_events (
  event_id INTEGER PRIMARY KEY,
  user_id VARCHAR(20),
  session_id VARCHAR(20),
  event_type VARCHAR(30),
  event_time DATETIME
);`,
      seed: `
INSERT INTO funnel_events VALUES
(31, 'U31', 'S31', 'view_item', '2026-03-04 14:00:00'),
(32, 'U31', 'S31', 'add_to_cart', '2026-03-04 14:10:00');`,
    },
  },
  starterSql: `-- Write your SQL solution below
WITH StepDefinitions AS (
  SELECT 1 AS step_number, 'view_item' AS step_name
  UNION ALL SELECT 2, 'add_to_cart'
  UNION ALL SELECT 3, 'checkout_initiated'
  UNION ALL SELECT 4, 'payment_success'
)
-- Complete query to calculate unique users and drop_off_pct
SELECT * FROM StepDefinitions;`,
  solutionSql: `WITH StepDefinitions (step_number, step_name) AS (
  VALUES 
    (1, 'view_item'),
    (2, 'add_to_cart'),
    (3, 'checkout_initiated'),
    (4, 'payment_success')
),
StepCounts AS (
  SELECT 
    sd.step_number,
    sd.step_name,
    COUNT(DISTINCT fe.user_id) AS unique_users
  FROM StepDefinitions sd
  LEFT JOIN funnel_events fe ON sd.step_name = fe.event_type
  GROUP BY sd.step_number, sd.step_name
),
WithPrevious AS (
  SELECT 
    step_number,
    step_name,
    unique_users,
    LAG(unique_users) OVER (ORDER BY step_number ASC) AS prev_users
  FROM StepCounts
)
SELECT 
  step_number,
  step_name,
  unique_users,
  CASE 
    WHEN step_number = 1 THEN 0.00
    WHEN prev_users IS NULL OR prev_users = 0 THEN 0.00
    ELSE ROUND(100.0 * (prev_users - unique_users) / prev_users, 2)
  END AS drop_off_pct
FROM WithPrevious
ORDER BY step_number ASC;`,
  hints: {
    edgeCase: 'Include all 4 steps using a static VALUES table and LEFT JOIN to funnel_events so 0-user steps are not omitted.',
    approach: 'Create a CTE with the 4 steps `(1, \'view_item\'), (2, \'add_to_cart\'), ...`. LEFT JOIN to `funnel_events` and count `COUNT(DISTINCT fe.user_id)`. Use `LAG(unique_users) OVER (ORDER BY step_number ASC)` to calculate drop-off.',
    annotatedSolution: `-- Canonical Solution
WITH StepDefinitions (step_number, step_name) AS (
  VALUES 
    (1, 'view_item'),
    (2, 'add_to_cart'),
    (3, 'checkout_initiated'),
    (4, 'payment_success')
),
StepCounts AS (
  SELECT 
    sd.step_number,
    sd.step_name,
    COUNT(DISTINCT fe.user_id) AS unique_users
  FROM StepDefinitions sd
  LEFT JOIN funnel_events fe ON sd.step_name = fe.event_type
  GROUP BY sd.step_number, sd.step_name
),
WithPrevious AS (
  SELECT 
    step_number,
    step_name,
    unique_users,
    LAG(unique_users) OVER (ORDER BY step_number ASC) AS prev_users
  FROM StepCounts
)
SELECT 
  step_number,
  step_name,
  unique_users,
  CASE 
    WHEN step_number = 1 THEN 0.00
    WHEN prev_users IS NULL OR prev_users = 0 THEN 0.00
    ELSE ROUND(100.0 * (prev_users - unique_users) / prev_users, 2)
  END AS drop_off_pct
FROM WithPrevious
ORDER BY step_number ASC;`,
    whyNaiveFails: 'If Step 3 has 0 users, a query that groups only on funnel_events will omit Step 3 entirely, distorting the sequence.',
  },
};
