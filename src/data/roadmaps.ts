export interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  questionIds: string[];
  estimatedHours: number;
}

export interface Roadmap {
  id: string;
  title: string;
  shortDescription: string;
  detailedDescription: string;
  tier: 'Free Tier' | 'Pro Tier';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Comprehensive';
  targetCompanies: string[];
  estimatedWeeks: number;
  steps: RoadmapStep[];
  color: string; // for accent colors
}

export const PLACEMENT_ROADMAPS: Roadmap[] = [
  {
    id: 'it-services',
    title: 'Campus IT Services & Mass Hiring Track',
    shortDescription: 'Structured step-by-step path for TCS NQT, Infosys DSE, Wipro Turbo, Cognizant GenC Next, and Accenture.',
    detailedDescription: 'Designed specifically for Indian engineering college campus drives. Covers essential SQL syntax, table operations, joins, aggregations, and standard interview MCQs.',
    tier: 'Free Tier',
    difficulty: 'Beginner',
    targetCompanies: ['TCS', 'Infosys', 'Wipro', 'Cognizant', 'HCLTech', 'Accenture', 'Capgemini'],
    estimatedWeeks: 2,
    color: 'emerald',
    steps: [
      {
        id: 'it-s1',
        title: 'Step 1: SELECT Basics, Filtering & Sorting',
        description: 'Master WHERE conditions, AND/OR logic, LIKE wildcards, IN, BETWEEN, and ORDER BY.',
        questionIds: ['CORE-01', 'CORE-02', 'CORE-03', 'TCS-12', 'INF-11', 'WIP-09', 'CTS-12', 'HCL-11'],
        estimatedHours: 4,
      },
      {
        id: 'it-s2',
        title: 'Step 2: Table Operations & DDL / DML',
        description: 'Differentiate between DROP, TRUNCATE, and DELETE. Understand primary keys, foreign keys, and constraints.',
        questionIds: ['CORE-07', 'CORE-08', 'TCS-07', 'TCS-08', 'INF-06', 'CTS-06', 'HCL-06', 'CAP-06'],
        estimatedHours: 4,
      },
      {
        id: 'it-s3',
        title: 'Step 3: Multi-Table INNER & OUTER Joins',
        description: 'Connecting employees to departments, students to courses, and orders to customers.',
        questionIds: ['CORE-14', 'CORE-15', 'CORE-16', 'TCS-13', 'INF-12', 'WIP-10', 'CTS-13', 'ACN-04'],
        estimatedHours: 5,
      },
      {
        id: 'it-s4',
        title: 'Step 4: Aggregations, GROUP BY & HAVING',
        description: 'Counting records, calculating department salary averages, and filtering aggregated groups.',
        questionIds: ['CORE-11', 'CORE-12', 'CORE-13', 'TCS-14', 'INF-13', 'WIP-11', 'CTS-14', 'ACN-05'],
        estimatedHours: 5,
      },
      {
        id: 'it-s5',
        title: 'Step 5: Subqueries & String/Date Functions',
        description: 'Correlated subqueries, date extraction (YEAR, MONTH), and string handling (CONCAT, SUBSTR).',
        questionIds: ['CORE-21', 'CORE-22', 'TCS-15', 'TCS-16', 'INF-14', 'CTS-15', 'CAP-12', 'OIT-04'],
        estimatedHours: 6,
      },
      {
        id: 'it-s6',
        title: 'Step 6: High-Frequency MCQs & Technical Interview Q&A',
        description: 'Rapid-fire assessment of normalization, indexing, ACID properties, and query execution order.',
        questionIds: ['CORE-01', 'CORE-04', 'CORE-05', 'TCS-01', 'TCS-02', 'INF-01', 'WIP-01', 'CTS-01'],
        estimatedHours: 3,
      },
    ],
  },
  {
    id: 'product-unicorn',
    title: 'Product & Unicorn Startups Track',
    shortDescription: 'Master advanced SQL for Amazon, Google, Microsoft, Flipkart, Swiggy, Zomato, PhonePe, and Uber.',
    detailedDescription: 'Focuses on production analytics, complex window functions, retention cohorts, rolling SLAs, and common table expressions tested in SDE and Data Analyst OAs.',
    tier: 'Pro Tier',
    difficulty: 'Advanced',
    targetCompanies: ['Amazon', 'Google', 'Microsoft', 'Flipkart', 'Swiggy', 'Zomato', 'PhonePe', 'Uber'],
    estimatedWeeks: 3,
    color: 'blue',
    steps: [
      {
        id: 'prod-s1',
        title: 'Step 1: Self Joins & Hierarchical Data',
        description: 'Manager-employee trees, consecutive event pairing, and customer repeat purchase analysis.',
        questionIds: ['AMZ-04', 'AMZ-05', 'FKT-03', 'MSFT-04', 'SWG-01', 'ZMT-01', 'UBR-01'],
        estimatedHours: 5,
      },
      {
        id: 'prod-s2',
        title: 'Step 2: Ranking Window Functions (ROW_NUMBER, RANK, DENSE_RANK)',
        description: 'Finding top-N products per category, salary ranks with ties, and consecutive streak calculations.',
        questionIds: ['CORE-24', 'CORE-25', 'AMZ-06', 'AMZ-07', 'GOOG-04', 'FKT-05', 'SWG-03', 'ZMT-03'],
        estimatedHours: 6,
      },
      {
        id: 'prod-s3',
        title: 'Step 3: Value Window Functions (LEAD, LAG, FIRST_VALUE)',
        description: 'Calculating month-over-month growth, time between consecutive ride requests, and user inactivity gaps.',
        questionIds: ['CORE-26', 'CORE-27', 'AMZ-08', 'GOOG-05', 'MSFT-06', 'SWG-05', 'PHP-04', 'UBR-03'],
        estimatedHours: 6,
      },
      {
        id: 'prod-s4',
        title: 'Step 4: Common Table Expressions (CTEs) & Modular Queries',
        description: 'Multi-stage data pipelines using WITH clauses to eliminate deeply nested, unmaintainable subqueries.',
        questionIds: ['CORE-29', 'AMZ-09', 'MSFT-07', 'FKT-07', 'WMT-04', 'ZOH-04', 'FWS-03'],
        estimatedHours: 5,
      },
      {
        id: 'prod-s5',
        title: 'Step 5: Retention Cohorts & Rolling SLA Metrics',
        description: 'Daily active user telemetry, delivery SLA breaches, and cumulative monthly recurring revenue.',
        questionIds: ['SWG-07', 'ZMT-05', 'PHP-06', 'UBR-05', 'MYN-04', 'FWS-05'],
        estimatedHours: 6,
      },
      {
        id: 'prod-s6',
        title: 'Step 6: Hidden Production Edge Cases (NULLs, Ties & Deduplication)',
        description: 'Defensive SQL patterns that survive empty tables, tie conditions, and zero-match left joins.',
        questionIds: ['AMZ-10', 'GOOG-06', 'FKT-09', 'WMT-06', 'PHP-08', 'RZP-05'],
        estimatedHours: 5,
      },
    ],
  },
  {
    id: 'fintech-bfsi',
    title: 'Fintech & Core BFSI Track',
    shortDescription: 'Tailored for Goldman Sachs, J.P. Morgan, Morgan Stanley, Barclays, Razorpay, and Paytm.',
    detailedDescription: 'Emphasizes double-entry bookkeeping, transaction ledgers, running account balances, circular money transfers, and ACID concurrency guarantees.',
    tier: 'Pro Tier',
    difficulty: 'Advanced',
    targetCompanies: ['Goldman Sachs', 'J.P. Morgan', 'Morgan Stanley', 'Barclays', 'Razorpay', 'Paytm'],
    estimatedWeeks: 2,
    color: 'amber',
    steps: [
      {
        id: 'fin-s1',
        title: 'Step 1: Ledger Balances & Running Totals (ROWS BETWEEN)',
        description: 'Calculating cumulative daily balances, deposit vs withdrawal reconciliations, and overdraft alerts.',
        questionIds: ['GS-04', 'GS-05', 'GS-06', 'PTM-03', 'RZP-03', 'PHP-03'],
        estimatedHours: 5,
      },
      {
        id: 'fin-s2',
        title: 'Step 2: Fraud Detection & Circular Money Rings',
        description: 'Detecting cyclic transaction loops (A -> B -> C -> A) and rapid succession transactions under 60 seconds.',
        questionIds: ['GS-07', 'GS-08', 'RZP-04', 'RZP-06', 'PHP-05'],
        estimatedHours: 6,
      },
      {
        id: 'fin-s3',
        title: 'Step 3: Stock Market Tick Data, Moving Averages & Volatility',
        description: '7-day moving averages, high-frequency price spreads, and trader buy/sell execution profits.',
        questionIds: ['GS-09', 'GS-10', 'GS-11', 'GS-12'],
        estimatedHours: 5,
      },
      {
        id: 'fin-s4',
        title: 'Step 4: Idempotency, Deduplication & Unique Constraints',
        description: 'Preventing duplicate payment deductions, unique order tokens, and payment retry pipelines.',
        questionIds: ['RZP-07', 'RZP-08', 'PTM-05', 'PTM-06'],
        estimatedHours: 5,
      },
      {
        id: 'fin-s5',
        title: 'Step 5: ACID Transactions & Concurrency Scenarios',
        description: 'Understanding isolation levels (READ COMMITTED, REPEATABLE READ, SERIALIZABLE) and phantom reads.',
        questionIds: ['GS-01', 'GS-02', 'GS-03', 'RZP-01', 'RZP-02', 'PTM-01'],
        estimatedHours: 4,
      },
    ],
  },
  {
    id: 'consulting-analytics',
    title: 'Consulting & Big 4 Analytics Track',
    shortDescription: 'Designed for Deloitte, EY, PwC, and KPMG technical and techno-functional SQL rounds.',
    detailedDescription: 'Covers business intelligence queries, margin analysis, multi-dimensional aggregations, data quality checks, and case-study reporting.',
    tier: 'Pro Tier',
    difficulty: 'Intermediate',
    targetCompanies: ['Deloitte', 'EY', 'PwC', 'KPMG'],
    estimatedWeeks: 2,
    color: 'purple',
    steps: [
      {
        id: 'cons-s1',
        title: 'Step 1: Revenue Breakdowns & Margin Analysis',
        description: 'Quarterly financial performance, gross margin percentages, and product category profitability.',
        questionIds: ['DEL-05', 'DEL-06', 'BIG4-03', 'BIG4-04'],
        estimatedHours: 4,
      },
      {
        id: 'cons-s2',
        title: 'Step 2: Customer Segmentation & RFM Metrics',
        description: 'Recency, Frequency, and Monetary value segmentation for client enterprise portfolios.',
        questionIds: ['DEL-07', 'DEL-08', 'BIG4-05', 'BIG4-06'],
        estimatedHours: 5,
      },
      {
        id: 'cons-s3',
        title: 'Step 3: Data Cleaning, NULLIF & Imputation',
        description: 'Standardizing dirty client data, replacing zeroes with NULL to prevent division-by-zero, and deduplication.',
        questionIds: ['DEL-09', 'DEL-10', 'BIG4-07', 'BIG4-08'],
        estimatedHours: 4,
      },
      {
        id: 'cons-s4',
        title: 'Step 4: Executive Business Intelligence Dashboards',
        description: 'Multi-level GROUP BY with ROLLUP, CUBE, conditional SUM(CASE WHEN ...), and pivot queries.',
        questionIds: ['DEL-11', 'DEL-12', 'BIG4-09', 'BIG4-10'],
        estimatedHours: 5,
      },
    ],
  },
  {
    id: 'zero-to-hero-30d',
    title: '30-Day Zero to SQL Hero (Daily Practice)',
    shortDescription: 'A disciplined, day-by-day roadmap covering fundamentals to advanced multi-stage OA edge cases.',
    detailedDescription: 'The complete comprehensive curriculum. Ideal for students starting 1 month before campus placements who want a guaranteed structured schedule.',
    tier: 'Free Tier',
    difficulty: 'Comprehensive',
    targetCompanies: ['All 26 Companies'],
    estimatedWeeks: 4,
    color: 'emerald',
    steps: [
      {
        id: 'zth-w1',
        title: 'Week 1 (Days 1–7): Syntax, Filtering & Table Schema Foundations',
        description: 'Master SELECT expressions, WHERE conditions, pattern matching, sorting, and database constraints.',
        questionIds: ['CORE-01', 'CORE-02', 'CORE-03', 'CORE-04', 'CORE-05', 'CORE-06', 'CORE-07', 'CORE-08', 'TCS-12', 'INF-11'],
        estimatedHours: 10,
      },
      {
        id: 'zth-w2',
        title: 'Week 2 (Days 8–14): Joins, Relationships & Set Operations',
        description: 'INNER JOIN, LEFT/RIGHT OUTER JOIN, FULL OUTER JOIN, CROSS JOIN, UNION, and INTERSECT.',
        questionIds: ['CORE-14', 'CORE-15', 'CORE-16', 'CORE-17', 'CORE-18', 'TCS-13', 'INF-12', 'WIP-10', 'AMZ-04', 'MSFT-04'],
        estimatedHours: 12,
      },
      {
        id: 'zth-w3',
        title: 'Week 3 (Days 15–21): Aggregations, GROUP BY, HAVING & Subqueries',
        description: 'Aggregating metrics across groups, filtering grouped outputs with HAVING, correlated subqueries, and EXISTS.',
        questionIds: ['CORE-11', 'CORE-12', 'CORE-13', 'CORE-21', 'CORE-22', 'TCS-14', 'INF-13', 'CTS-14', 'AMZ-05', 'FKT-03'],
        estimatedHours: 12,
      },
      {
        id: 'zth-w4',
        title: 'Week 4 (Days 22–30): Window Functions, CTEs & Real OA Simulations',
        description: 'ROW_NUMBER, RANK, DENSE_RANK, LEAD, LAG, Common Table Expressions, and 4-stage hidden edge-case testing.',
        questionIds: ['CORE-24', 'CORE-25', 'CORE-26', 'CORE-27', 'CORE-29', 'AMZ-06', 'GOOG-04', 'GS-04', 'SWG-03', 'RZP-03'],
        estimatedHours: 15,
      },
    ],
  },
];
