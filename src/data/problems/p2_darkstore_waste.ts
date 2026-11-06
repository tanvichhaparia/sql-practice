import { Problem } from '../../types';

export const p2DarkstoreWaste: Problem = {
  id: 'p2_darkstore_inventory_waste',
  title: 'Zero-Order Dark Store Inventory Waste',
  difficulty: 'Easy',
  domain: 'Quick Commerce / Swiggy-Blinkit Style',
  companyTags: ['Blinkit', 'Zepto', 'Instamart', 'DoorDash'],
  patterns: ['LEFT JOIN Traps', 'NULL Handling', 'Aggregation'],
  isPro: false,
  businessContext: `Quick-commerce dark stores operate on rapid turns for fresh produce and FMCG. Stock sitting with zero sales ties up precious shelf space and risks spoilage.

Write a query to identify all dark-store SKUs that currently have positive stock (\`stock_quantity > 0\`) but have recorded ZERO successfully delivered orders in the last 7 days (reference window: between \`'2026-03-03'\` and \`'2026-03-10'\` inclusive).

Business Rules:
1. Include SKUs where \`stock_quantity > 0\`. Ignore SKUs with 0 or negative stock.
2. Only orders with \`status = 'DELIVERED'\` within the date range (\`'2026-03-03'\` to \`'2026-03-10'\`) count as valid sales. Cancelled or returned orders do NOT count as sales.
3. If an SKU has never been ordered at all, or only has cancelled orders, it must be included in the output.
4. Output columns: \`store_id\`, \`sku_id\`, \`stock_quantity\`.
5. Order results by \`store_id ASC, sku_id ASC\`.`,
  expectedColumns: [
    { name: 'store_id', type: 'VARCHAR', description: 'Dark store location code' },
    { name: 'sku_id', type: 'VARCHAR', description: 'Stock keeping unit identifier' },
    { name: 'stock_quantity', type: 'INTEGER', description: 'Current available inventory units' },
  ],
  orderingRule: 'ORDER BY store_id ASC, sku_id ASC',
  schema: [
    {
      tableName: 'inventory',
      description: 'Current real-time stock levels per dark store and SKU',
      columns: [
        { name: 'store_id', type: 'VARCHAR', isPk: true, description: 'Store code' },
        { name: 'sku_id', type: 'VARCHAR', isPk: true, description: 'SKU code' },
        { name: 'stock_quantity', type: 'INTEGER', description: 'Units in warehouse' },
      ],
    },
    {
      tableName: 'orders',
      description: 'Customer order line items and fulfillment statuses',
      columns: [
        { name: 'order_id', type: 'INTEGER', isPk: true, description: 'Order ID' },
        { name: 'store_id', type: 'VARCHAR', isFk: true, description: 'Store code' },
        { name: 'sku_id', type: 'VARCHAR', isFk: true, description: 'SKU code' },
        { name: 'status', type: 'VARCHAR', description: "'DELIVERED', 'CANCELLED', 'RETURNED'" },
        { name: 'order_date', type: 'DATE', description: 'Date order was placed' },
      ],
    },
  ],
  stages: {
    sample: {
      name: 'Stage 1: Visible Sample Dataset',
      title: 'Visible Sample Dataset',
      ddl: `
CREATE TABLE inventory (
  store_id VARCHAR(20),
  sku_id VARCHAR(20),
  stock_quantity INTEGER,
  PRIMARY KEY (store_id, sku_id)
);
CREATE TABLE orders (
  order_id INTEGER PRIMARY KEY,
  store_id VARCHAR(20),
  sku_id VARCHAR(20),
  status VARCHAR(20),
  order_date DATE
);`,
      seed: `
INSERT INTO inventory VALUES
('STORE_BLR_01', 'SKU_MILK_01', 50),
('STORE_BLR_01', 'SKU_BREAD_02', 30),
('STORE_BLR_01', 'SKU_AVO_03', 15),
('STORE_BLR_01', 'SKU_BERRY_04', 0),  -- 0 stock, ignore
('STORE_DEL_02', 'SKU_APPLE_05', 40);

INSERT INTO orders VALUES
(1, 'STORE_BLR_01', 'SKU_MILK_01', 'DELIVERED', '2026-03-05'), -- Sold
(2, 'STORE_BLR_01', 'SKU_BREAD_02', 'CANCELLED', '2026-03-06'), -- Cancelled, not delivered
(3, 'STORE_DEL_02', 'SKU_APPLE_05', 'DELIVERED', '2026-03-01'); -- Delivered outside 7-day window`,
      previewRows: {
        inventory: [
          { store_id: 'STORE_BLR_01', sku_id: 'SKU_MILK_01', stock_quantity: 50 },
          { store_id: 'STORE_BLR_01', sku_id: 'SKU_BREAD_02', stock_quantity: 30 },
          { store_id: 'STORE_BLR_01', sku_id: 'SKU_AVO_03', stock_quantity: 15 },
          { store_id: 'STORE_DEL_02', sku_id: 'SKU_APPLE_05', stock_quantity: 40 },
        ],
        orders: [
          { order_id: 1, store_id: 'STORE_BLR_01', sku_id: 'SKU_MILK_01', status: 'DELIVERED', order_date: '2026-03-05' },
          { order_id: 2, store_id: 'STORE_BLR_01', sku_id: 'SKU_BREAD_02', status: 'CANCELLED', order_date: '2026-03-06' },
          { order_id: 3, store_id: 'STORE_DEL_02', sku_id: 'SKU_APPLE_05', status: 'DELIVERED', order_date: '2026-03-01' },
        ],
      },
    },
    edgeCaseA: {
      name: 'Stage 2: LEFT JOIN vs WHERE Filter Trap',
      title: 'Hidden Edge Case A — LEFT JOIN vs WHERE Filter Trap',
      trapDescription: 'Placing orders.status = "DELIVERED" in the WHERE clause silently turns the LEFT JOIN into an INNER JOIN, dropping all items with zero orders.',
      diagnosticHint: 'Your query failed Stage 2 (The LEFT JOIN Trap). Did you write "WHERE o.status = \'DELIVERED\'"? In a LEFT JOIN, any condition on the right table inside the WHERE clause eliminates NULLs and drops zero-order items! Move "o.status = \'DELIVERED\'" into the ON condition.',
      ddl: `
CREATE TABLE inventory (
  store_id VARCHAR(20),
  sku_id VARCHAR(20),
  stock_quantity INTEGER,
  PRIMARY KEY (store_id, sku_id)
);
CREATE TABLE orders (
  order_id INTEGER PRIMARY KEY,
  store_id VARCHAR(20),
  sku_id VARCHAR(20),
  status VARCHAR(20),
  order_date DATE
);`,
      seed: `
INSERT INTO inventory VALUES
('STORE_MUM_03', 'SKU_CHIPS_11', 100), -- Zero orders ever
('STORE_MUM_03', 'SKU_COLA_12', 200),  -- Has orders
('STORE_MUM_03', 'SKU_DIP_13', 0);    -- 0 stock

INSERT INTO orders VALUES
(10, 'STORE_MUM_03', 'SKU_COLA_12', 'DELIVERED', '2026-03-08');`,
    },
    edgeCaseB: {
      name: 'Stage 3: Multiple Cancelled Orders Trap',
      title: 'Hidden Edge Case B — Multiple Cancelled Orders Trap',
      trapDescription: 'An item has 5 orders, but every single one was CANCELLED. It still has ZERO delivered orders and must be in the report.',
      diagnosticHint: 'Your query failed Stage 3 (Cancelled Orders Trap). An item with multiple orders that were all CANCELLED still has zero delivered orders. Ensure you only match orders where status is "DELIVERED".',
      ddl: `
CREATE TABLE inventory (
  store_id VARCHAR(20),
  sku_id VARCHAR(20),
  stock_quantity INTEGER,
  PRIMARY KEY (store_id, sku_id)
);
CREATE TABLE orders (
  order_id INTEGER PRIMARY KEY,
  store_id VARCHAR(20),
  sku_id VARCHAR(20),
  status VARCHAR(20),
  order_date DATE
);`,
      seed: `
INSERT INTO inventory VALUES
('STORE_HYD_04', 'SKU_MANGO_21', 45),
('STORE_HYD_04', 'SKU_PINE_22', 60);

INSERT INTO orders VALUES
(21, 'STORE_HYD_04', 'SKU_MANGO_21', 'CANCELLED', '2026-03-04'),
(22, 'STORE_HYD_04', 'SKU_MANGO_21', 'CANCELLED', '2026-03-05'),
(23, 'STORE_HYD_04', 'SKU_MANGO_21', 'RETURNED', '2026-03-07'),
(24, 'STORE_HYD_04', 'SKU_PINE_22', 'DELIVERED', '2026-03-09');`,
    },
    edgeCaseC: {
      name: 'Stage 4: Date Window Boundary Trap',
      title: 'Hidden Edge Case C — Date Window Boundary Trap',
      trapDescription: 'Testing exact boundaries 2026-03-03 (day 7 cutoff) and 2026-03-10 (current day).',
      diagnosticHint: 'Your query failed Stage 4 (Boundary Trap). Check your date boundary conditions: the window is inclusive of 2026-03-03 and 2026-03-10.',
      ddl: `
CREATE TABLE inventory (
  store_id VARCHAR(20),
  sku_id VARCHAR(20),
  stock_quantity INTEGER,
  PRIMARY KEY (store_id, sku_id)
);
CREATE TABLE orders (
  order_id INTEGER PRIMARY KEY,
  store_id VARCHAR(20),
  sku_id VARCHAR(20),
  status VARCHAR(20),
  order_date DATE
);`,
      seed: `
INSERT INTO inventory VALUES
('STORE_KOL_05', 'SKU_TEA_31', 80),
('STORE_KOL_05', 'SKU_COFFEE_32', 90);

INSERT INTO orders VALUES
(31, 'STORE_KOL_05', 'SKU_TEA_31', 'DELIVERED', '2026-03-02'), -- 8 days ago (outside window, tea has 0 in window)
(32, 'STORE_KOL_05', 'SKU_COFFEE_32', 'DELIVERED', '2026-03-03'); -- Exactly 7 days ago (inside window, coffee is sold)`,
    },
  },
  starterSql: `-- Write your SQL solution below
SELECT 
  i.store_id,
  i.sku_id,
  i.stock_quantity
FROM inventory i
-- Join with orders correctly
WHERE i.stock_quantity > 0
ORDER BY i.store_id ASC, i.sku_id ASC;`,
  solutionSql: `SELECT 
  i.store_id,
  i.sku_id,
  i.stock_quantity
FROM inventory i
LEFT JOIN orders o 
  ON i.store_id = o.store_id 
  AND i.sku_id = o.sku_id 
  AND o.status = 'DELIVERED'
  AND o.order_date >= '2026-03-03' 
  AND o.order_date <= '2026-03-10'
WHERE i.stock_quantity > 0 
  AND o.order_id IS NULL
ORDER BY i.store_id ASC, i.sku_id ASC;`,
  hints: {
    edgeCase: 'Crucial: Never put right-table filters (o.status = "DELIVERED") in the WHERE clause when using LEFT JOIN.',
    approach: 'LEFT JOIN `orders` ON `i.store_id = o.store_id AND i.sku_id = o.sku_id AND o.status = \'DELIVERED\' AND o.order_date BETWEEN \'2026-03-03\' AND \'2026-03-10\'`. Then filter in WHERE `i.stock_quantity > 0 AND o.order_id IS NULL`.',
    annotatedSolution: `-- Canonical Solution
SELECT 
  i.store_id,
  i.sku_id,
  i.stock_quantity
FROM inventory i
LEFT JOIN orders o 
  ON i.store_id = o.store_id 
  AND i.sku_id = o.sku_id 
  AND o.status = 'DELIVERED'
  AND o.order_date >= '2026-03-03' 
  AND o.order_date <= '2026-03-10'
WHERE i.stock_quantity > 0 
  AND o.order_id IS NULL
ORDER BY i.store_id ASC, i.sku_id ASC;`,
    whyNaiveFails: 'Putting o.status = "DELIVERED" inside the WHERE clause turns the LEFT JOIN into an INNER JOIN, because NULL = "DELIVERED" evaluates to FALSE, eliminating the very rows you want to find.',
  },
};
