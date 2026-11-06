import { Problem } from '../../types';

export const p7AdtechAttribution: Problem = {
  id: 'p7_adtech_attribution',
  title: 'First-Touch vs. Last-Touch Marketing Attribution',
  difficulty: 'Medium',
  domain: 'AdTech & Growth Marketing',
  companyTags: ['Google', 'Meta', 'Flipkart', 'Uber', 'HubSpot'],
  patterns: ['Attribution Modeling', 'Window Functions', 'Time Windows'],
  isPro: true,
  businessContext: `Growth marketers evaluate marketing budget ROI by attributing customer purchase conversions across touchpoint journeys (e.g. Paid Search, Paid Social, Email, SEO, Direct).

Write a query to attribute each purchase conversion to both its First Touchpoint Channel and Last Touchpoint Channel within a 30-day lookback window prior to conversion.

Business Rules:
1. Only touchpoints where \`touch_time < conversion_time\` and occurring within 30 days (<= 2,592,000 seconds) prior to \`conversion_time\` qualify.
2. In multi-touch attribution, ignore the \`'Direct'\` channel if any paid or organic non-direct channels exist for that customer. Only attribute to \`'Direct'\` if 'Direct' was the sole touchpoint recorded.
3. If a conversion only had a single qualifying touchpoint, that channel serves as both \`first_channel\` and \`last_channel\`.
4. Output columns: \`conversion_id\`, \`customer_id\`, \`first_channel\`, \`last_channel\`, \`order_revenue\`.
5. Order results by \`conversion_id ASC\`.`,
  expectedColumns: [
    { name: 'conversion_id', type: 'INTEGER', description: 'Conversion ID' },
    { name: 'customer_id', type: 'VARCHAR', description: 'Customer ID' },
    { name: 'first_channel', type: 'VARCHAR', description: 'First qualifying touchpoint channel' },
    { name: 'last_channel', type: 'VARCHAR', description: 'Last qualifying touchpoint channel' },
    { name: 'order_revenue', type: 'DECIMAL', description: 'Total revenue of the conversion' },
  ],
  orderingRule: 'ORDER BY conversion_id ASC',
  schema: [
    {
      tableName: 'conversions',
      description: 'Customer completed purchase transactions',
      columns: [
        { name: 'conversion_id', type: 'INTEGER', isPk: true },
        { name: 'customer_id', type: 'VARCHAR' },
        { name: 'order_revenue', type: 'DECIMAL(10,2)' },
        { name: 'conversion_time', type: 'DATETIME' },
      ],
    },
    {
      tableName: 'touchpoints',
      description: 'Customer ad clicks, email opens, and website visits',
      columns: [
        { name: 'touchpoint_id', type: 'INTEGER', isPk: true },
        { name: 'customer_id', type: 'VARCHAR' },
        { name: 'channel', type: 'VARCHAR', description: "'Google Ads', 'Meta', 'Email', 'SEO', 'Direct'" },
        { name: 'touch_time', type: 'DATETIME' },
      ],
    },
  ],
  stages: {
    sample: {
      name: 'Stage 1: Visible Sample Dataset',
      title: 'Visible Sample Dataset',
      ddl: `
CREATE TABLE conversions (
  conversion_id INTEGER PRIMARY KEY,
  customer_id VARCHAR(20),
  order_revenue DECIMAL(10,2),
  conversion_time DATETIME
);
CREATE TABLE touchpoints (
  touchpoint_id INTEGER PRIMARY KEY,
  customer_id VARCHAR(20),
  channel VARCHAR(50),
  touch_time DATETIME
);`,
      seed: `
INSERT INTO conversions VALUES
(1, 'C101', 4500.00, '2026-03-20 18:00:00'),
(2, 'C102', 1200.00, '2026-03-21 12:00:00');

INSERT INTO touchpoints VALUES
-- C101: Google Ads -> Meta -> Direct -> Purchase
(101, 'C101', 'Google Ads', '2026-03-01 10:00:00'),
(102, 'C101', 'Meta', '2026-03-10 14:00:00'),
(103, 'C101', 'Direct', '2026-03-20 17:50:00'),
-- C102: Only Email
(104, 'C102', 'Email', '2026-03-15 09:00:00');`,
      previewRows: {
        conversions: [
          { conversion_id: 1, customer_id: 'C101', order_revenue: 4500, conversion_time: '2026-03-20 18:00:00' },
          { conversion_id: 2, customer_id: 'C102', order_revenue: 1200, conversion_time: '2026-03-21 12:00:00' },
        ],
        touchpoints: [
          { touchpoint_id: 101, customer_id: 'C101', channel: 'Google Ads', touch_time: '2026-03-01 10:00:00' },
          { touchpoint_id: 102, customer_id: 'C101', channel: 'Meta', touch_time: '2026-03-10 14:00:00' },
          { touchpoint_id: 103, customer_id: 'C101', channel: 'Direct', touch_time: '2026-03-20 17:50:00' },
        ],
      },
    },
    edgeCaseA: {
      name: 'Stage 2: Direct-Only vs Direct-Assisted Trap',
      title: 'Hidden Edge Case A — Direct Channel Trap',
      trapDescription: 'Direct channel should only be attributed if no non-direct channel was touched.',
      diagnosticHint: 'Your query failed Stage 2 (Direct Channel Trap). When non-direct channels exist, "Direct" must be ignored for both first and last touch.',
      ddl: `
CREATE TABLE conversions (
  conversion_id INTEGER PRIMARY KEY,
  customer_id VARCHAR(20),
  order_revenue DECIMAL(10,2),
  conversion_time DATETIME
);
CREATE TABLE touchpoints (
  touchpoint_id INTEGER PRIMARY KEY,
  customer_id VARCHAR(20),
  channel VARCHAR(50),
  touch_time DATETIME
);`,
      seed: `
INSERT INTO conversions VALUES
(11, 'C201', 3000.00, '2026-03-25 15:00:00'),
(12, 'C202', 2000.00, '2026-03-25 16:00:00');

INSERT INTO touchpoints VALUES
-- C201: Direct ONLY
(201, 'C201', 'Direct', '2026-03-24 10:00:00'),
-- C202: Direct first, then SEO
(202, 'C202', 'Direct', '2026-03-20 10:00:00'),
(203, 'C202', 'SEO', '2026-03-22 10:00:00');`,
    },
    edgeCaseB: {
      name: 'Stage 3: Outside 30-Day Window Trap',
      title: 'Hidden Edge Case B — 30-Day Lookback Trap',
      trapDescription: 'Touchpoints occurring 31 days prior to conversion must be ignored.',
      diagnosticHint: 'Your query failed Stage 3 (Lookback Window Trap). Ensure touch_time >= date(conversion_time, "-30 days").',
      ddl: `
CREATE TABLE conversions (
  conversion_id INTEGER PRIMARY KEY,
  customer_id VARCHAR(20),
  order_revenue DECIMAL(10,2),
  conversion_time DATETIME
);
CREATE TABLE touchpoints (
  touchpoint_id INTEGER PRIMARY KEY,
  customer_id VARCHAR(20),
  channel VARCHAR(50),
  touch_time DATETIME
);`,
      seed: `
INSERT INTO conversions VALUES (21, 'C301', 5000.00, '2026-03-31 12:00:00');
INSERT INTO touchpoints VALUES
(301, 'C301', 'Old Ad', '2026-02-01 12:00:00'), -- 58 days ago (ignored)
(302, 'C301', 'Email', '2026-03-15 12:00:00');  -- Within 30 days`,
    },
    edgeCaseC: {
      name: 'Stage 4: Post-Conversion Touchpoint Trap',
      title: 'Hidden Edge Case C — Post-Conversion Touchpoint Trap',
      trapDescription: 'Touchpoints occurring after conversion_time must be completely excluded.',
      diagnosticHint: 'Your query failed Stage 4 (Post-Conversion Trap). Verify touch_time < conversion_time.',
      ddl: `
CREATE TABLE conversions (
  conversion_id INTEGER PRIMARY KEY,
  customer_id VARCHAR(20),
  order_revenue DECIMAL(10,2),
  conversion_time DATETIME
);
CREATE TABLE touchpoints (
  touchpoint_id INTEGER PRIMARY KEY,
  customer_id VARCHAR(20),
  channel VARCHAR(50),
  touch_time DATETIME
);`,
      seed: `
INSERT INTO conversions VALUES (31, 'C401', 8000.00, '2026-03-10 10:00:00');
INSERT INTO touchpoints VALUES
(401, 'C401', 'YouTube', '2026-03-05 10:00:00'),
(402, 'C401', 'Post-Order Survey', '2026-03-10 10:05:00'); -- 5 mins AFTER order!`,
    },
  },
  starterSql: `-- Write your SQL solution below
WITH ValidTouchpoints AS (
  SELECT 
    c.conversion_id,
    c.customer_id,
    c.order_revenue,
    t.channel,
    t.touch_time
  FROM conversions c
  JOIN touchpoints t ON c.customer_id = t.customer_id
  -- Add time filters and Direct channel logic
)
SELECT * FROM ValidTouchpoints;`,
  solutionSql: `WITH FilteredTouches AS (
  SELECT 
    c.conversion_id,
    c.customer_id,
    c.order_revenue,
    t.channel,
    t.touch_time,
    strftime('%s', c.conversion_time) - strftime('%s', t.touch_time) AS diff_sec
  FROM conversions c
  JOIN touchpoints t ON c.customer_id = t.customer_id
  WHERE t.touch_time < c.conversion_time
    AND (strftime('%s', c.conversion_time) - strftime('%s', t.touch_time)) <= 2592000
),
NonDirectCounts AS (
  SELECT 
    conversion_id,
    COUNT(CASE WHEN channel != 'Direct' THEN 1 END) AS non_direct_count
  FROM FilteredTouches
  GROUP BY conversion_id
),
AttributableTouches AS (
  SELECT 
    ft.conversion_id,
    ft.customer_id,
    ft.order_revenue,
    ft.channel,
    ft.touch_time,
    ROW_NUMBER() OVER (PARTITION BY ft.conversion_id ORDER BY ft.touch_time ASC, ft.channel ASC) AS first_rn,
    ROW_NUMBER() OVER (PARTITION BY ft.conversion_id ORDER BY ft.touch_time DESC, ft.channel DESC) AS last_rn
  FROM FilteredTouches ft
  JOIN NonDirectCounts ndc ON ft.conversion_id = ndc.conversion_id
  WHERE (ndc.non_direct_count = 0) OR (ndc.non_direct_count > 0 AND ft.channel != 'Direct')
),
FirstTouches AS (
  SELECT conversion_id, channel AS first_channel
  FROM AttributableTouches
  WHERE first_rn = 1
),
LastTouches AS (
  SELECT conversion_id, channel AS last_channel
  FROM AttributableTouches
  WHERE last_rn = 1
)
SELECT 
  c.conversion_id,
  c.customer_id,
  ft.first_channel,
  lt.last_channel,
  c.order_revenue
FROM conversions c
JOIN FirstTouches ft ON c.conversion_id = ft.conversion_id
JOIN LastTouches lt ON c.conversion_id = lt.conversion_id
ORDER BY c.conversion_id ASC;`,
  hints: {
    edgeCase: 'Exclude "Direct" if non-direct channels exist for that conversion; otherwise keep "Direct" if it is the sole touchpoint.',
    approach: 'First, join touchpoints within 30 days before conversion. Count non-direct channels per conversion. Filter out Direct if non-direct channels exist. Use ROW_NUMBER() ASC for first touch and DESC for last touch.',
    annotatedSolution: `-- Canonical Solution
WITH FilteredTouches AS (
  SELECT 
    c.conversion_id,
    c.customer_id,
    c.order_revenue,
    t.channel,
    t.touch_time
  FROM conversions c
  JOIN touchpoints t ON c.customer_id = t.customer_id
  WHERE t.touch_time < c.conversion_time
    AND (strftime('%s', c.conversion_time) - strftime('%s', t.touch_time)) <= 2592000
),
NonDirectCounts AS (
  SELECT 
    conversion_id,
    COUNT(CASE WHEN channel != 'Direct' THEN 1 END) AS non_direct_count
  FROM FilteredTouches
  GROUP BY conversion_id
),
AttributableTouches AS (
  SELECT 
    ft.conversion_id,
    ft.customer_id,
    ft.order_revenue,
    ft.channel,
    ft.touch_time,
    ROW_NUMBER() OVER (PARTITION BY ft.conversion_id ORDER BY ft.touch_time ASC, ft.channel ASC) AS first_rn,
    ROW_NUMBER() OVER (PARTITION BY ft.conversion_id ORDER BY ft.touch_time DESC, ft.channel DESC) AS last_rn
  FROM FilteredTouches ft
  JOIN NonDirectCounts ndc ON ft.conversion_id = ndc.conversion_id
  WHERE (ndc.non_direct_count = 0) OR (ndc.non_direct_count > 0 AND ft.channel != 'Direct')
)
SELECT 
  c.conversion_id,
  c.customer_id,
  ft.channel AS first_channel,
  lt.channel AS last_channel,
  c.order_revenue
FROM conversions c
JOIN AttributableTouches ft ON c.conversion_id = ft.conversion_id AND ft.first_rn = 1
JOIN AttributableTouches lt ON c.conversion_id = lt.conversion_id AND lt.last_rn = 1
ORDER BY c.conversion_id ASC;`,
    whyNaiveFails: 'Failing to eliminate Direct touchpoints when paid ads exist credits the conversion to Direct instead of the real paid channel.',
  },
};
