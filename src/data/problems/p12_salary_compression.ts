import { Problem } from '../../types';

export const p12SalaryCompression: Problem = {
  id: 'p12_salary_compression',
  title: 'Department Salary Compression & Junior Peer Comparison',
  difficulty: 'Hard',
  domain: 'HR & People Analytics',
  companyTags: ['Google', 'Microsoft', 'Meta', 'Atlassian', 'Salesforce'],
  patterns: ['Self-Joins', 'Compensation Inversion', 'Aggregation & Filtering'],
  isPro: true,
  businessContext: `Due to tech hiring market cycles and aggressive compensation inflation for new hires, companies experience "Salary Compression" — where tenured senior employees earn less than newer, junior peers hired after them in the same department.

Write a query to identify all employees whose current salary is strictly less than the average salary of peers hired after them within the exact same department.

Business Rules:
1. For an employee (\`e1\`), a junior peer (\`e2\`) is defined as an employee in the same department (\`e2.dept_id = e1.dept_id\`) with a strictly later hire date (\`e2.hire_date > e1.hire_date\`).
2. An employee must have at least 1 junior peer in their department to be evaluated. Employees with zero junior peers (the newest hires) must be excluded.
3. Only report employees where \`e1.salary < AVG(e2.salary)\`.
4. Calculate \`junior_avg_salary\` as \`ROUND(AVG(e2.salary), 2)\` and \`salary_deficit\` as \`ROUND(AVG(e2.salary) - e1.salary, 2)\`.
5. Expected columns: \`dept_name\`, \`emp_name\`, \`salary\`, \`junior_avg_salary\`, \`salary_deficit\`.
6. Order results by \`dept_name ASC, salary_deficit DESC, emp_name ASC\`.`,
  expectedColumns: [
    { name: 'dept_name', type: 'VARCHAR', description: 'Department name' },
    { name: 'emp_name', type: 'VARCHAR', description: 'Employee name' },
    { name: 'salary', type: 'DECIMAL', description: "Employee's current annual salary" },
    { name: 'junior_avg_salary', type: 'DECIMAL', description: 'Average salary of peers hired after this employee' },
    { name: 'salary_deficit', type: 'DECIMAL', description: 'Difference between junior average salary and employee salary' },
  ],
  orderingRule: 'ORDER BY dept_name ASC, salary_deficit DESC, emp_name ASC',
  schema: [
    {
      tableName: 'departments',
      description: 'Internal organization business units',
      columns: [
        { name: 'dept_id', type: 'INTEGER', isPk: true },
        { name: 'dept_name', type: 'VARCHAR' },
      ],
    },
    {
      tableName: 'employees',
      description: 'Employee compensation and hiring records',
      columns: [
        { name: 'emp_id', type: 'INTEGER', isPk: true },
        { name: 'dept_id', type: 'INTEGER', isFk: true },
        { name: 'emp_name', type: 'VARCHAR' },
        { name: 'salary', type: 'DECIMAL(12,2)' },
        { name: 'hire_date', type: 'DATE' },
      ],
    },
  ],
  stages: {
    sample: {
      name: 'Stage 1: Visible Sample Dataset',
      title: 'Visible Sample Dataset',
      ddl: `
CREATE TABLE departments (
  dept_id INTEGER PRIMARY KEY,
  dept_name VARCHAR(50)
);
CREATE TABLE employees (
  emp_id INTEGER PRIMARY KEY,
  dept_id INTEGER,
  emp_name VARCHAR(50),
  salary DECIMAL(12,2),
  hire_date DATE
);`,
      seed: `
INSERT INTO departments VALUES (1, 'Engineering'), (2, 'Product');

INSERT INTO employees VALUES
-- Engineering: E101 (2022, 120k), E102 (2024, 150k), E103 (2025, 160k)
-- E101's junior avg: (150k + 160k)/2 = 155k -> deficit: 35k!
(101, 1, 'Amit', 120000.00, '2022-01-15'),
(102, 1, 'Bhavna', 150000.00, '2024-03-01'),
(103, 1, 'Chirag', 160000.00, '2025-06-10'),
-- Product: P201 (2023, 140k), P202 (2024, 130k) -> P201 junior avg is 130k (no deficit)
(201, 2, 'Deepa', 140000.00, '2023-05-01'),
(202, 2, 'Eshan', 130000.00, '2024-08-15');`,
      previewRows: {
        departments: [
          { dept_id: 1, dept_name: 'Engineering' },
          { dept_id: 2, dept_name: 'Product' },
        ],
        employees: [
          { emp_id: 101, dept_id: 1, emp_name: 'Amit', salary: 120000, hire_date: '2022-01-15' },
          { emp_id: 102, dept_id: 1, emp_name: 'Bhavna', salary: 150000, hire_date: '2024-03-01' },
          { emp_id: 103, dept_id: 1, emp_name: 'Chirag', salary: 160000, hire_date: '2025-06-10' },
        ],
      },
    },
    edgeCaseA: {
      name: 'Stage 2: Newest Hire (Zero Juniors) Trap',
      title: 'Hidden Edge Case A — Zero Junior Peers Trap',
      trapDescription: 'The newest employee in a department has nobody hired after them. They must be excluded.',
      diagnosticHint: 'Your query failed Stage 2 (Zero Junior Peers). Employees who have no peers hired after them must be excluded (HAVING COUNT(e2.emp_id) >= 1).',
      ddl: `
CREATE TABLE departments (
  dept_id INTEGER PRIMARY KEY,
  dept_name VARCHAR(50)
);
CREATE TABLE employees (
  emp_id INTEGER PRIMARY KEY,
  dept_id INTEGER,
  emp_name VARCHAR(50),
  salary DECIMAL(12,2),
  hire_date DATE
);`,
      seed: `
INSERT INTO departments VALUES (1, 'Design');
INSERT INTO employees VALUES
(1, 1, 'Farhan', 90000.00, '2026-01-01'); -- Sole employee in Design (0 juniors)`,
    },
    edgeCaseB: {
      name: 'Stage 3: Same Day Hire Date Tie Trap',
      title: 'Hidden Edge Case B — Same Day Hire Date Tie Trap',
      trapDescription: 'Two employees hired on the exact same date are not hired after each other. hire_date must be strictly greater (>).',
      diagnosticHint: 'Your query failed Stage 3 (Same Day Hire). Employees hired on the same date should not count as junior to each other (e2.hire_date > e1.hire_date).',
      ddl: `
CREATE TABLE departments (
  dept_id INTEGER PRIMARY KEY,
  dept_name VARCHAR(50)
);
CREATE TABLE employees (
  emp_id INTEGER PRIMARY KEY,
  dept_id INTEGER,
  emp_name VARCHAR(50),
  salary DECIMAL(12,2),
  hire_date DATE
);`,
      seed: `
INSERT INTO departments VALUES (1, 'Legal');
INSERT INTO employees VALUES
(11, 1, 'Gita', 100000.00, '2024-01-01'),
(12, 1, 'Hari', 110000.00, '2024-01-01'); -- Same hire date, neither is junior to the other!`,
    },
    edgeCaseC: {
      name: 'Stage 4: Exactly Equal Salary Boundary Trap',
      title: 'Hidden Edge Case C — Equal Salary Boundary Trap',
      trapDescription: 'Employee salary exactly equals the junior average (deficit = 0.00). Must be strictly less (<).',
      diagnosticHint: 'Your query failed Stage 4 (Boundary Trap). Salary compression requires e1.salary to be strictly less than junior average salary (<, not <=).',
      ddl: `
CREATE TABLE departments (
  dept_id INTEGER PRIMARY KEY,
  dept_name VARCHAR(50)
);
CREATE TABLE employees (
  emp_id INTEGER PRIMARY KEY,
  dept_id INTEGER,
  emp_name VARCHAR(50),
  salary DECIMAL(12,2),
  hire_date DATE
);`,
      seed: `
INSERT INTO departments VALUES (1, 'Marketing');
INSERT INTO employees VALUES
(21, 1, 'Isha', 80000.00, '2023-01-01'),
(22, 1, 'Jatin', 80000.00, '2024-01-01'); -- Junior salary is exactly 80000 (no deficit)`,
    },
  },
  starterSql: `-- Write your SQL solution below
SELECT 
  d.dept_name,
  e1.emp_name,
  e1.salary,
  ROUND(AVG(e2.salary), 2) AS junior_avg_salary,
  ROUND(AVG(e2.salary) - e1.salary, 2) AS salary_deficit
FROM departments d
JOIN employees e1 ON d.dept_id = e1.dept_id
JOIN employees e2 ON e1.dept_id = e2.dept_id AND e2.hire_date > e1.hire_date
GROUP BY d.dept_name, e1.emp_id, e1.emp_name, e1.salary
HAVING e1.salary < AVG(e2.salary)
ORDER BY d.dept_name ASC, salary_deficit DESC, e1.emp_name ASC;`,
  solutionSql: `SELECT 
  d.dept_name,
  e1.emp_name,
  e1.salary,
  ROUND(AVG(e2.salary), 2) AS junior_avg_salary,
  ROUND(AVG(e2.salary) - e1.salary, 2) AS salary_deficit
FROM departments d
JOIN employees e1 ON d.dept_id = e1.dept_id
JOIN employees e2 ON e1.dept_id = e2.dept_id AND e2.hire_date > e1.hire_date
GROUP BY d.dept_name, e1.emp_id, e1.emp_name, e1.salary
HAVING e1.salary < AVG(e2.salary)
ORDER BY d.dept_name ASC, salary_deficit DESC, e1.emp_name ASC;`,
  hints: {
    edgeCase: 'Use `e2.hire_date > e1.hire_date` so that same-day hires are not considered junior.',
    approach: 'Join `departments d` to `employees e1` and then self-join `employees e2` on `e1.dept_id = e2.dept_id AND e2.hire_date > e1.hire_date`. Group by employee and apply `HAVING e1.salary < AVG(e2.salary)`.',
    annotatedSolution: `-- Canonical Solution
SELECT 
  d.dept_name,
  e1.emp_name,
  e1.salary,
  ROUND(AVG(e2.salary), 2) AS junior_avg_salary,
  ROUND(AVG(e2.salary) - e1.salary, 2) AS salary_deficit
FROM departments d
JOIN employees e1 ON d.dept_id = e1.dept_id
JOIN employees e2 ON e1.dept_id = e2.dept_id AND e2.hire_date > e1.hire_date
GROUP BY d.dept_name, e1.emp_id, e1.emp_name, e1.salary
HAVING e1.salary < AVG(e2.salary)
ORDER BY d.dept_name ASC, salary_deficit DESC, e1.emp_name ASC;`,
    whyNaiveFails: 'If an inner join is used without filtering out same-day hires, employees hired on the same date will dilute the junior average comparison.',
  },
};
