# SQLEdge OA — Interactive SQL Assessment & Interview Simulator

> **Zero-Lag Browser SQL OA Simulator** running at $0 / ₹0 server cost via in-browser WASM SQLite / PostgreSQL.

[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)

---

## 🎯 Key Differentiators

1. **4-Stage Hidden Edge-Case Grader**:
   - **Stage 1**: `Visible Sample Dataset` (Immediate sanity checking)
   - **Stage 2**: `Hidden Edge Case A — NULL & Missing Foreign Key Trap` (COALESCE, LEFT JOIN vs WHERE filters)
   - **Stage 3**: `Hidden Edge Case B — Tie-Breaker & Duplicate Timestamp Trap` (DENSE_RANK vs ROW_NUMBER, deterministic ordering)
   - **Stage 4**: `Hidden Edge Case C — Boundary & Zero-Division Trap` (Empty groups, zero-denominator safety, date boundaries)
   - **Actionable Diagnostic Feedback**: Explains specifically *why* naive queries fail if a candidate passes sample data but breaks on hidden edge cases.

2. **Interactive CTE Step-by-Step Debugger ("Click-to-Inspect CTE")**:
   - Automatically parses `WITH <cte_name> AS (...)` statements in your query.
   - Generates clickable tabs: `[Final Output]`, `[Inspect: cte1]`, `[Inspect: cte2]`.
   - Inspect intermediate query states without manually commenting out code.

3. **Timed 45-Minute Company OA Simulator**:
   - 45:00 countdown timer with urgency alerts.
   - 3-Question assessment navigation.
   - Final **OA Scorecard** with benchmark percentages, time taken, question-level breakdowns, and interviewer feedback.

4. **12 Complete Real-World Seed Problems**:
   - Domain-specific multi-table schemas: UPI & Fintech Ledgers, Quick Commerce, E-Commerce Marketplaces, Food Delivery, SaaS Retention, AdTech Attribution, Ride-Hailing, Fraud Risk Rings, and HR Compensation.

5. **5 Interactive Pattern Cheat Sheets**:
   - Window Functions (`ROW_NUMBER`, `RANK`, `DENSE_RANK`)
   - Gaps & Islands (Streaks & Consecutive Intervals)
   - Self-Joins & Sliding Time Windows
   - `LEFT JOIN` vs `WHERE` Clause (The Zero-Row Trap)
   - Integer Division & Zero-Denominator Safety

---

## 🚀 Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev

# 3. Open in browser
# http://localhost:5173
```

---

## 📦 Static Deployment ($0 Server Cost)

Build static assets ready for Cloudflare Pages, GitHub Pages, or Vercel:

```bash
npm run build
```

The output `dist/` directory is completely standalone and contains the compiled static HTML, CSS, JavaScript, and `sql-wasm.wasm` engine.
