import { getSqlEngine, executeQuery, normalizeValue, QueryResult } from './sqlEngine';
import type { Database } from 'sql.js';
import { CompanyQuestion } from '../data/companyQuestions';

let companyDbInstance: Database | null = null;
let companyDbInitPromise: Promise<Database> | null = null;

// Register custom functions for MySQL compatibility in SQLite
function registerCustomFunctions(db: Database) {
  try {
    db.create_function('YEAR', (d: any) => {
      if (!d) return null;
      const parsed = new Date(d);
      return isNaN(parsed.getTime()) ? null : parsed.getFullYear();
    });

    db.create_function('MONTH', (d: any) => {
      if (!d) return null;
      const parsed = new Date(d);
      return isNaN(parsed.getTime()) ? null : parsed.getMonth() + 1;
    });

    db.create_function('HOUR', (d: any) => {
      if (!d) return null;
      const str = String(d).trim();
      const parts = str.split(' ');
      const timePart = parts[1] || parts[0];
      const h = parseInt(timePart.split(':')[0], 10);
      return isNaN(h) ? null : h;
    });

    db.create_function('DAYOFWEEK', (d: any) => {
      if (!d) return null;
      const parsed = new Date(d);
      // MySQL standard: 1 = Sunday, 2 = Monday, ..., 7 = Saturday
      return isNaN(parsed.getTime()) ? null : parsed.getDay() + 1;
    });

    db.create_function('DATEDIFF', (d1: any, d2: any) => {
      if (!d1 || !d2) return null;
      const dt1 = new Date(d1);
      const dt2 = new Date(d2);
      if (isNaN(dt1.getTime()) || isNaN(dt2.getTime())) return null;
      const diffTime = dt1.getTime() - dt2.getTime();
      return Math.round(diffTime / (1000 * 60 * 60 * 24));
    });

    db.create_function('DATE_FORMAT', (d: any, fmt: any) => {
      if (!d) return null;
      const dt = new Date(d);
      if (isNaN(dt.getTime())) return String(d);
      if (fmt === '%Y-%m') {
        const y = dt.getFullYear();
        const m = String(dt.getMonth() + 1).padStart(2, '0');
        return `${y}-${m}`;
      }
      return String(d);
    });

    db.create_function('CONCAT', (...args: any[]) => {
      return args.filter((a) => a !== null && a !== undefined).join('');
    });

    db.create_function('POWER', (b: any, e: any) => Math.pow(Number(b), Number(e)));
    db.create_function('INSTR', (str: any, substr: any) => {
      if (!str || !substr) return 0;
      return String(str).indexOf(String(substr)) + 1;
    });
  } catch (err) {
    console.warn('Custom function registration warning:', err);
  }
}

export async function getCompanyDatabase(): Promise<Database> {
  if (companyDbInstance) return companyDbInstance;
  if (companyDbInitPromise) return companyDbInitPromise;

  companyDbInitPromise = (async () => {
    const SQL = await getSqlEngine();
    const db = new SQL.Database();
    registerCustomFunctions(db);

    // Fetch and execute schemas_and_seed.sql
    try {
      const response = await fetch('/schemas_and_seed.sql');
      if (!response.ok) {
        throw new Error(`Failed to load schemas_and_seed.sql: HTTP ${response.status}`);
      }
      const schemaSql = await response.text();
      db.run(schemaSql);
      companyDbInstance = db;
      return db;
    } catch (err) {
      console.error('Error initializing company database:', err);
      throw err;
    }
  })();

  return companyDbInitPromise;
}

export interface CompanyEvaluationResult {
  passed: boolean;
  executionTimeMs: number;
  userColumns: string[];
  userRows: (string | number | boolean | Uint8Array | null)[][];
  expectedColumns: string[];
  expectedRows: any[][];
  error?: string;
  mismatchReason?: string;
}

export async function evaluateCompanyQuery(
  userSql: string,
  question: CompanyQuestion
): Promise<CompanyEvaluationResult> {
  const db = await getCompanyDatabase();

  const userRes: QueryResult = executeQuery(db, userSql);
  if (userRes.error) {
    return {
      passed: false,
      executionTimeMs: userRes.executionTimeMs,
      userColumns: [],
      userRows: [],
      expectedColumns: question.columns || [],
      expectedRows: question.expected_rows || [],
      error: userRes.error,
    };
  }

  const expectedCols = question.columns || [];
  const expectedRows = question.expected_rows || [];

  // Check column count match
  if (expectedCols.length > 0 && userRes.columns.length !== expectedCols.length) {
    return {
      passed: false,
      executionTimeMs: userRes.executionTimeMs,
      userColumns: userRes.columns,
      userRows: userRes.values,
      expectedColumns: expectedCols,
      expectedRows: expectedRows,
      mismatchReason: `Expected ${expectedCols.length} columns (${expectedCols.join(', ')}), but query returned ${userRes.columns.length} columns (${userRes.columns.join(', ')}).`,
    };
  }

  // Row count check
  if (userRes.values.length !== expectedRows.length) {
    return {
      passed: false,
      executionTimeMs: userRes.executionTimeMs,
      userColumns: userRes.columns,
      userRows: userRes.values,
      expectedColumns: expectedCols,
      expectedRows: expectedRows,
      mismatchReason: `Expected ${expectedRows.length} rows, but query returned ${userRes.values.length} rows.`,
    };
  }

  // Order-sensitive check first
  let matchesStrict = true;
  for (let r = 0; r < expectedRows.length; r++) {
    const uRow = userRes.values[r];
    const eRow = expectedRows[r];
    for (let c = 0; c < expectedCols.length; c++) {
      if (normalizeValue(uRow[c]) !== normalizeValue(eRow[c])) {
        matchesStrict = false;
        break;
      }
    }
    if (!matchesStrict) break;
  }

  if (matchesStrict) {
    return {
      passed: true,
      executionTimeMs: userRes.executionTimeMs,
      userColumns: userRes.columns,
      userRows: userRes.values,
      expectedColumns: expectedCols,
      expectedRows: expectedRows,
    };
  }

  // Multiset (unordered) check
  const stringifyRow = (row: any[]) =>
    row.map((v) => normalizeValue(v)).join('___');

  const expCounts = new Map<string, number>();
  for (const r of expectedRows) {
    const k = stringifyRow(r);
    expCounts.set(k, (expCounts.get(k) || 0) + 1);
  }

  const userCounts = new Map<string, number>();
  for (const r of userRes.values) {
    const k = stringifyRow(r);
    userCounts.set(k, (userCounts.get(k) || 0) + 1);
  }

  let unorderedMatch = true;
  for (const [k, count] of expCounts.entries()) {
    if (userCounts.get(k) !== count) {
      unorderedMatch = false;
      break;
    }
  }

  if (unorderedMatch) {
    return {
      passed: true,
      executionTimeMs: userRes.executionTimeMs,
      userColumns: userRes.columns,
      userRows: userRes.values,
      expectedColumns: expectedCols,
      expectedRows: expectedRows,
      mismatchReason: 'Row values matched! (Note: Query output was in a different row order than the reference solution).',
    };
  }

  return {
    passed: false,
    executionTimeMs: userRes.executionTimeMs,
    userColumns: userRes.columns,
    userRows: userRes.values,
    expectedColumns: expectedCols,
    expectedRows: expectedRows,
    mismatchReason: 'Result values do not match expected output for this query.',
  };
}
