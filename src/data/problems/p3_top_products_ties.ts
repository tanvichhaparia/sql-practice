import { Problem } from '../../types';

export const p3TopProductsTies: Problem = {
  id: 'p3_top_products_ties',
  title: 'Top 2 Selling Products per Category With Revenue Ties',
  difficulty: 'Medium',
  domain: 'Marketplace / Flipkart-Amazon Style',
  companyTags: ['Flipkart', 'Amazon', 'Meesho', 'Myntra'],
  patterns: ['Window Functions', 'DENSE_RANK vs ROW_NUMBER', 'COALESCE NULL Traps'],
  isPro: false,
  businessContext: `Marketplace category managers analyze top revenue-generating products to award badge placements on search pages. In real sales data, items often receive partial discounts or get returned by customers, and ties in revenue frequently occur.

Write a query to find the Top 2 selling products by Net GMV within each product category. If multiple products are tied for 1st or 2nd place in a category, all tied products must be included!

Business Rules:
1. Net GMV for an order item is defined as:
   \`(quantity * unit_price - COALESCE(discount_amount, 0))\` for items where \`is_returned = 0\`. If \`is_returned = 1\`, that item contributes 0 to Net GMV.
2. Note that \`discount_amount\` can be \`NULL\` (meaning zero discount). Subtracting NULL directly results in NULL in SQL, which will corrupt total revenue!
3. Only consider products that have generated \`net_gmv > 0\`.
4. Use \`DENSE_RANK()\` over \`net_gmv DESC\` partitioned by category so that tied ranks share the same rank number and no rank is skipped. Include all products with \`revenue_rank <= 2\`.
5. Expected columns: \`category_name\`, \`product_name\`, \`net_gmv\`, \`revenue_rank\`.
6. Order results by \`category_name ASC, revenue_rank ASC, product_name ASC\`.`,
  expectedColumns: [
    { name: 'category_name', type: 'VARCHAR', description: 'Name of the product category' },
    { name: 'product_name', type: 'VARCHAR', description: 'Product title' },
    { name: 'net_gmv', type: 'DECIMAL', description: 'Total net revenue after discounts and returns' },
    { name: 'revenue_rank', type: 'INTEGER', description: 'Dense rank (1 or 2)' },
  ],
  orderingRule: 'ORDER BY category_name ASC, revenue_rank ASC, product_name ASC',
  schema: [
    {
      tableName: 'categories',
      description: 'Product taxonomy classifications',
      columns: [
        { name: 'category_id', type: 'INTEGER', isPk: true },
        { name: 'category_name', type: 'VARCHAR' },
      ],
    },
    {
      tableName: 'products',
      description: 'Catalog items with category mappings',
      columns: [
        { name: 'product_id', type: 'INTEGER', isPk: true },
        { name: 'category_id', type: 'INTEGER', isFk: true },
        { name: 'product_name', type: 'VARCHAR' },
      ],
    },
    {
      tableName: 'order_items',
      description: 'Purchased order lines with price, discount, and return flags',
      columns: [
        { name: 'item_id', type: 'INTEGER', isPk: true },
        { name: 'product_id', type: 'INTEGER', isFk: true },
        { name: 'quantity', type: 'INTEGER' },
        { name: 'unit_price', type: 'DECIMAL(10,2)' },
        { name: 'discount_amount', type: 'DECIMAL(10,2)' },
        { name: 'is_returned', type: 'INTEGER', description: '1 if returned, 0 otherwise' },
      ],
    },
  ],
  stages: {
    sample: {
      name: 'Stage 1: Visible Sample Dataset',
      title: 'Visible Sample Dataset',
      ddl: `
CREATE TABLE categories (
  category_id INTEGER PRIMARY KEY,
  category_name VARCHAR(50)
);
CREATE TABLE products (
  product_id INTEGER PRIMARY KEY,
  category_id INTEGER,
  product_name VARCHAR(100)
);
CREATE TABLE order_items (
  item_id INTEGER PRIMARY KEY,
  product_id INTEGER,
  quantity INTEGER,
  unit_price DECIMAL(10,2),
  discount_amount DECIMAL(10,2),
  is_returned INTEGER
);`,
      seed: `
INSERT INTO categories VALUES (1, 'Electronics'), (2, 'Footwear');

INSERT INTO products VALUES
(101, 1, 'Noise Wireless Earbuds'),
(102, 1, 'Boat Smartwatch'),
(103, 1, 'Anker PowerBank'),
(201, 2, 'Nike Air Zoom'),
(202, 2, 'Puma Running Shoes');

INSERT INTO order_items VALUES
-- Electronics
(1, 101, 2, 2000.00, 200.00, 0), -- Net: 3800
(2, 102, 1, 3000.00, 0.00, 0),   -- Net: 3000
(3, 103, 1, 1500.00, 100.00, 0), -- Net: 1400
-- Footwear
(4, 201, 1, 6000.00, 500.00, 0), -- Net: 5500
(5, 202, 2, 2500.00, 200.00, 0); -- Net: 4800`,
      previewRows: {
        categories: [
          { category_id: 1, category_name: 'Electronics' },
          { category_id: 2, category_name: 'Footwear' },
        ],
        products: [
          { product_id: 101, category_id: 1, product_name: 'Noise Wireless Earbuds' },
          { product_id: 102, category_id: 1, product_name: 'Boat Smartwatch' },
          { product_id: 103, category_id: 1, product_name: 'Anker PowerBank' },
        ],
        order_items: [
          { item_id: 1, product_id: 101, quantity: 2, unit_price: 2000, discount_amount: 200, is_returned: 0 },
          { item_id: 2, product_id: 102, quantity: 1, unit_price: 3000, discount_amount: 0, is_returned: 0 },
          { item_id: 3, product_id: 103, quantity: 1, unit_price: 1500, discount_amount: 100, is_returned: 0 },
        ],
      },
    },
    edgeCaseA: {
      name: 'Stage 2: NULL Discount Trap',
      title: 'Hidden Edge Case A — NULL Discount Trap',
      trapDescription: 'discount_amount contains NULL values. If not wrapped in COALESCE(discount_amount, 0), the net GMV calculates as NULL.',
      diagnosticHint: 'Your query failed Stage 2 (NULL Discount Trap). In SQL, subtracting NULL yields NULL (e.g., 5000 - NULL = NULL). Wrap discounts in COALESCE(discount_amount, 0).',
      ddl: `
CREATE TABLE categories (
  category_id INTEGER PRIMARY KEY,
  category_name VARCHAR(50)
);
CREATE TABLE products (
  product_id INTEGER PRIMARY KEY,
  category_id INTEGER,
  product_name VARCHAR(100)
);
CREATE TABLE order_items (
  item_id INTEGER PRIMARY KEY,
  product_id INTEGER,
  quantity INTEGER,
  unit_price DECIMAL(10,2),
  discount_amount DECIMAL(10,2),
  is_returned INTEGER
);`,
      seed: `
INSERT INTO categories VALUES (1, 'Apparel');
INSERT INTO products VALUES (11, 1, 'Levis Denim Jeans'), (12, 1, 'Zara Linen Shirt'), (13, 1, 'H&M Hoodie');
INSERT INTO order_items VALUES
(101, 11, 2, 2500.00, NULL, 0), -- 5000 - NULL -> must be 5000
(102, 12, 1, 3200.00, 200.00, 0), -- 3000
(103, 13, 1, 1800.00, NULL, 0);   -- 1800`,
    },
    edgeCaseB: {
      name: 'Stage 3: Revenue Tie-Breaker Trap (DENSE_RANK vs ROW_NUMBER)',
      title: 'Hidden Edge Case B — Tie-Breaker Trap',
      trapDescription: 'Two products in the same category are tied for 2nd rank. Naive queries using ROW_NUMBER() arbitrarily drop one tied product.',
      diagnosticHint: 'Your query failed Stage 3 (Revenue Tie-Breaker Trap). Two products tied for rank 2 must both appear in the final report! Replace ROW_NUMBER() with DENSE_RANK() so tied items share rank 2.',
      ddl: `
CREATE TABLE categories (
  category_id INTEGER PRIMARY KEY,
  category_name VARCHAR(50)
);
CREATE TABLE products (
  product_id INTEGER PRIMARY KEY,
  category_id INTEGER,
  product_name VARCHAR(100)
);
CREATE TABLE order_items (
  item_id INTEGER PRIMARY KEY,
  product_id INTEGER,
  quantity INTEGER,
  unit_price DECIMAL(10,2),
  discount_amount DECIMAL(10,2),
  is_returned INTEGER
);`,
      seed: `
INSERT INTO categories VALUES (1, 'Kitchen');
INSERT INTO products VALUES
(21, 1, 'Philips Mixer'),
(22, 1, 'Prestige Cooker'),
(23, 1, 'Hawkins Pan'),
(24, 1, 'Pigeon Kettle');

INSERT INTO order_items VALUES
(201, 21, 1, 5000.00, 0.00, 0), -- Rank 1: 5000
(202, 22, 1, 3000.00, 0.00, 0), -- Rank 2 Tie: 3000
(203, 23, 1, 3000.00, 0.00, 0), -- Rank 2 Tie: 3000
(204, 24, 1, 1200.00, 0.00, 0); -- Rank 3: 1200`,
    },
    edgeCaseC: {
      name: 'Stage 4: 100% Return & Zero Sales Trap',
      title: 'Hidden Edge Case C — 100% Return Trap',
      trapDescription: 'A product has high gross sales, but 100% of its orders were returned (is_returned = 1). Its net GMV is 0 and must not be ranked as top seller.',
      diagnosticHint: 'Your query failed Stage 4 (Returned Orders Trap). Only non-returned orders (is_returned = 0) count towards Net GMV. Products with net GMV = 0 should be excluded.',
      ddl: `
CREATE TABLE categories (
  category_id INTEGER PRIMARY KEY,
  category_name VARCHAR(50)
);
CREATE TABLE products (
  product_id INTEGER PRIMARY KEY,
  category_id INTEGER,
  product_name VARCHAR(100)
);
CREATE TABLE order_items (
  item_id INTEGER PRIMARY KEY,
  product_id INTEGER,
  quantity INTEGER,
  unit_price DECIMAL(10,2),
  discount_amount DECIMAL(10,2),
  is_returned INTEGER
);`,
      seed: `
INSERT INTO categories VALUES (1, 'Books');
INSERT INTO products VALUES
(31, 1, 'Atomic Habits'),
(32, 1, 'Psychology of Money'),
(33, 1, 'Faulty Encyclopedia');

INSERT INTO order_items VALUES
(301, 31, 5, 400.00, 0.00, 0),   -- Net: 2000 (Rank 1)
(302, 32, 3, 350.00, 50.00, 0),  -- Net: 1000 (Rank 2)
(303, 33, 10, 5000.00, 0.00, 1); -- 50000 gross but ALL RETURNED! Net GMV is 0`,
    },
  },
  starterSql: `-- Write your SQL solution below
WITH ProductRevenue AS (
  SELECT 
    c.category_name,
    p.product_name,
    -- Calculate net_gmv handling NULL discounts and returned items
    SUM(CASE WHEN oi.is_returned = 0 THEN (oi.quantity * oi.unit_price - COALESCE(oi.discount_amount, 0)) ELSE 0 END) AS net_gmv
  FROM categories c
  JOIN products p ON c.category_id = p.category_id
  JOIN order_items oi ON p.product_id = oi.product_id
  GROUP BY c.category_name, p.product_name
)
-- Rank and filter top 2
SELECT * FROM ProductRevenue;`,
  solutionSql: `WITH ProductRevenue AS (
  SELECT 
    c.category_name,
    p.product_name,
    SUM(CASE WHEN oi.is_returned = 0 THEN (oi.quantity * oi.unit_price - COALESCE(oi.discount_amount, 0)) ELSE 0 END) AS net_gmv
  FROM categories c
  JOIN products p ON c.category_id = p.category_id
  JOIN order_items oi ON p.product_id = oi.product_id
  GROUP BY c.category_name, p.product_name
  HAVING net_gmv > 0
),
RankedProducts AS (
  SELECT 
    category_name,
    product_name,
    net_gmv,
    DENSE_RANK() OVER (PARTITION BY category_name ORDER BY net_gmv DESC) AS revenue_rank
  FROM ProductRevenue
)
SELECT 
  category_name,
  product_name,
  net_gmv,
  revenue_rank
FROM RankedProducts
WHERE revenue_rank <= 2
ORDER BY category_name ASC, revenue_rank ASC, product_name ASC;`,
  hints: {
    edgeCase: 'Use COALESCE(discount_amount, 0) to prevent NULL arithmetic and DENSE_RANK() to include tied items.',
    approach: 'Calculate net GMV with CASE WHEN is_returned = 0 in a CTE. In a second CTE, apply DENSE_RANK() OVER (PARTITION BY category_name ORDER BY net_gmv DESC). Finally, filter for revenue_rank <= 2.',
    annotatedSolution: `-- Canonical Solution
WITH ProductRevenue AS (
  SELECT 
    c.category_name,
    p.product_name,
    SUM(CASE WHEN oi.is_returned = 0 THEN (oi.quantity * oi.unit_price - COALESCE(oi.discount_amount, 0)) ELSE 0 END) AS net_gmv
  FROM categories c
  JOIN products p ON c.category_id = p.category_id
  JOIN order_items oi ON p.product_id = oi.product_id
  GROUP BY c.category_name, p.product_name
  HAVING net_gmv > 0
),
RankedProducts AS (
  SELECT 
    category_name,
    product_name,
    net_gmv,
    DENSE_RANK() OVER (PARTITION BY category_name ORDER BY net_gmv DESC) AS revenue_rank
  FROM ProductRevenue
)
SELECT 
  category_name,
  product_name,
  net_gmv,
  revenue_rank
FROM RankedProducts
WHERE revenue_rank <= 2
ORDER BY category_name ASC, revenue_rank ASC, product_name ASC;`,
    whyNaiveFails: 'ROW_NUMBER() randomly chooses one item when two are tied. If rank 2 has two products with ₹3,000 net GMV, ROW_NUMBER() will assign one product rank 2 and the other rank 3, dropping a valid top seller.',
  },
};
