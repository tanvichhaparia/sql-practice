// sql.js is loaded as a plain <script> tag in index.html (UMD bundle),
// which sets window.initSqlJs. We use types-only from 'sql.js'.
import type { Database, SqlJsStatic } from 'sql.js';

declare const initSqlJs: (config: { locateFile: (file: string) => string }) => Promise<SqlJsStatic>;

let SQL: SqlJsStatic | null = null;
let sqlInitPromise: Promise<SqlJsStatic> | null = null;

export async function getSqlEngine(): Promise<SqlJsStatic> {
  if (SQL) return SQL;
  if (sqlInitPromise) return sqlInitPromise;

  sqlInitPromise = (async () => {
    // window.initSqlJs is set by /sql-wasm.js script tag
    const initFn: typeof initSqlJs =
      (window as any).initSqlJs ?? initSqlJs;
    const sql = await initFn({
      locateFile: () => `/sql-wasm.wasm`,
    });
    SQL = sql;
    return sql;
  })();

  return sqlInitPromise;
}

export interface QueryResult {
  columns: string[];
  values: (string | number | boolean | Uint8Array | null)[][];
  executionTimeMs: number;
  error?: string;
}

export function executeQuery(db: Database, sql: string): QueryResult {
  const startTime = performance.now();
  try {
    const results = db.exec(sql);
    const executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;
    if (!results || results.length === 0) {
      return {
        columns: [],
        values: [],
        executionTimeMs,
      };
    }
    // Return the last statement result (e.g. if script has multiple queries)
    const lastRes = results[results.length - 1];
    return {
      columns: lastRes.columns,
      values: lastRes.values,
      executionTimeMs,
    };
  } catch (err: any) {
    const executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;
    return {
      columns: [],
      values: [],
      executionTimeMs,
      error: err.message || String(err),
    };
  }
}

export function explainQuery(db: Database, sql: string): QueryResult {
  // Strip comments and trailing semicolons for EXPLAIN
  const cleanSql = sql.replace(/--.*$/gm, '').trim().replace(/;+$/, '');
  return executeQuery(db, `EXPLAIN QUERY PLAN ${cleanSql};`);
}

/**
 * Normalizes values for flexible comparison:
 * - Trims strings
 * - Treats null, undefined, 'NULL' equivalently
 * - Rounds floating point numbers to 2 decimals
 * - Converts numeric strings to numbers if comparable
 */
export function normalizeValue(val: any): string {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') {
    // Format to 2 decimal places if it has fractional parts
    return Number.isInteger(val) ? val.toString() : val.toFixed(2);
  }
  if (typeof val === 'boolean') {
    return val ? '1' : '0';
  }
  const str = String(val).trim();
  const num = Number(str);
  if (!isNaN(num) && str !== '') {
    return Number.isInteger(num) ? num.toString() : num.toFixed(2);
  }
  return str.toLowerCase();
}

export interface DiffDetail {
  isMatch: boolean;
  columnMismatch: boolean;
  userColumns: string[];
  expectedColumns: string[];
  userRowCount: number;
  expectedRowCount: number;
  firstMismatch?: {
    rowIndex: number;
    colIndex: number;
    userCol: string;
    expectedCol: string;
    userVal: any;
    expectedVal: any;
  };
  mismatchedRows: number[];
}

export function compareResults(
  userRes: QueryResult,
  expectedRes: QueryResult,
  strictOrder: boolean = true
): DiffDetail {
  if (userRes.error) {
    return {
      isMatch: false,
      columnMismatch: false,
      userColumns: userRes.columns,
      expectedColumns: expectedRes.columns,
      userRowCount: 0,
      expectedRowCount: expectedRes.values.length,
      mismatchedRows: [],
    };
  }

  // Check columns match (case-insensitive)
  const normUserCols = userRes.columns.map((c) => c.toLowerCase().trim());
  const normExpCols = expectedRes.columns.map((c) => c.toLowerCase().trim());

  const columnMismatch =
    normUserCols.length !== normExpCols.length ||
    normUserCols.some((col, idx) => col !== normExpCols[idx]);

  const userRowCount = userRes.values.length;
  const expectedRowCount = expectedRes.values.length;

  if (columnMismatch) {
    return {
      isMatch: false,
      columnMismatch: true,
      userColumns: userRes.columns,
      expectedColumns: expectedRes.columns,
      userRowCount,
      expectedRowCount,
      mismatchedRows: [],
    };
  }

  const mismatchedRows: number[] = [];
  let firstMismatch: DiffDetail['firstMismatch'] | undefined;

  if (strictOrder) {
    const maxRows = Math.max(userRowCount, expectedRowCount);
    for (let r = 0; r < maxRows; r++) {
      const userRow = userRes.values[r];
      const expRow = expectedRes.values[r];

      if (!userRow || !expRow) {
        mismatchedRows.push(r);
        if (!firstMismatch) {
          firstMismatch = {
            rowIndex: r,
            colIndex: 0,
            userCol: normUserCols[0] || 'N/A',
            expectedCol: normExpCols[0] || 'N/A',
            userVal: userRow ? 'Row exists' : 'Missing row',
            expectedVal: expRow ? 'Row exists' : 'Unexpected extra row',
          };
        }
        continue;
      }

      let rowMatches = true;
      for (let c = 0; c < normExpCols.length; c++) {
        const uVal = normalizeValue(userRow[c]);
        const eVal = normalizeValue(expRow[c]);
        if (uVal !== eVal) {
          rowMatches = false;
          if (!firstMismatch) {
            firstMismatch = {
              rowIndex: r,
              colIndex: c,
              userCol: userRes.columns[c],
              expectedCol: expectedRes.columns[c],
              userVal: userRow[c],
              expectedVal: expRow[c],
            };
          }
        }
      }
      if (!rowMatches) {
        mismatchedRows.push(r);
      }
    }
  } else {
    // Unordered comparison (multiset match)
    const stringifyRow = (row: any[]) =>
      row.map((v) => normalizeValue(v)).join('___');

    const expectedRowCounts = new Map<string, number>();
    for (const row of expectedRes.values) {
      const key = stringifyRow(row);
      expectedRowCounts.set(key, (expectedRowCounts.get(key) || 0) + 1);
    }

    const userRowCounts = new Map<string, number>();
    for (let i = 0; i < userRes.values.length; i++) {
      const row = userRes.values[i];
      const key = stringifyRow(row);
      userRowCounts.set(key, (userRowCounts.get(key) || 0) + 1);
    }

    if (userRowCount !== expectedRowCount) {
      mismatchedRows.push(0);
    } else {
      for (const [key, count] of expectedRowCounts.entries()) {
        if (userRowCounts.get(key) !== count) {
          mismatchedRows.push(0);
          break;
        }
      }
    }
  }

  const isMatch = !columnMismatch && mismatchedRows.length === 0 && userRowCount === expectedRowCount;

  return {
    isMatch,
    columnMismatch,
    userColumns: userRes.columns,
    expectedColumns: expectedRes.columns,
    userRowCount,
    expectedRowCount,
    firstMismatch,
    mismatchedRows,
  };
}

/**
 * Extracts CTE names from a query:
 * e.g. "WITH cte1 AS (...), cte2 AS (...) SELECT ..."
 * Returns ['cte1', 'cte2']
 */
export function extractCteNames(sql: string): string[] {
  const cteNames: string[] = [];
  // Clean comments
  const cleanSql = sql.replace(/--.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
  
  // Look for WITH or WITH RECURSIVE
  const withMatch = cleanSql.match(/^\s*WITH\s+(?:RECURSIVE\s+)?/i);
  if (!withMatch) return cteNames;

  let pos = withMatch[0].length;
  let inString: string | null = null;
  let parenDepth = 0;
  let currentToken = '';
  let lookingForName = true;
  let currentCteName = '';

  while (pos < cleanSql.length) {
    const char = cleanSql[pos];

    if (inString) {
      if (char === inString) {
        if (cleanSql[pos + 1] === inString) {
          pos++; // Escaped quote
        } else {
          inString = null;
        }
      }
      pos++;
      continue;
    }

    if (char === "'" || char === '"' || char === '`') {
      inString = char;
      pos++;
      continue;
    }

    if (char === '(') {
      parenDepth++;
      pos++;
      continue;
    }
    if (char === ')') {
      parenDepth--;
      pos++;
      continue;
    }

    if (parenDepth === 0) {
      if (lookingForName) {
        // Gathering CTE name
        if (/[\w_]/i.test(char)) {
          currentToken += char;
        } else if (/\s/.test(char) && currentToken.length > 0) {
          // Check if followed by AS
          const rest = cleanSql.slice(pos).trimStart();
          if (/^AS\s*\(/i.test(rest)) {
            currentCteName = currentToken;
            cteNames.push(currentCteName);
            currentToken = '';
            lookingForName = false;
            // Advance past 'AS'
            const asMatch = rest.match(/^AS\s*/i);
            if (asMatch) {
              pos += asMatch[0].length + (cleanSql.slice(pos).length - rest.length);
              continue;
            }
          } else {
            currentToken = '';
          }
        }
      } else {
        // Inside or after CTE definition at depth 0
        if (char === ',') {
          lookingForName = true;
          currentToken = '';
        } else if (/\bSELECT\b/i.test(cleanSql.slice(pos, pos + 8))) {
          // Reached main SELECT query
          break;
        }
      }
    }

    pos++;
  }

  return Array.from(new Set(cteNames));
}

/**
 * Rewrites user query to inspect a specific CTE
 * e.g. given "WITH c1 AS (SELECT 1), c2 AS (SELECT 2) SELECT * FROM c2"
 * and target "c1", rewrites to "WITH c1 AS (SELECT 1), c2 AS (SELECT 2) SELECT * FROM c1 LIMIT 100;"
 */
export function rewriteQueryForCte(sql: string, cteName: string): string {
  const cleanSql = sql.replace(/--.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').trim().replace(/;+$/, '');
  
  // Find where the top-level main query begins (outside parenthesis)
  let parenDepth = 0;
  let inString: string | null = null;
  let lastCloseParenIndex = -1;

  for (let i = 0; i < cleanSql.length; i++) {
    const char = cleanSql[i];
    if (inString) {
      if (char === inString) {
        if (cleanSql[i + 1] === inString) i++;
        else inString = null;
      }
      continue;
    }
    if (char === "'" || char === '"' || char === '`') {
      inString = char;
      continue;
    }
    if (char === '(') {
      parenDepth++;
    } else if (char === ')') {
      parenDepth--;
      if (parenDepth === 0) {
        lastCloseParenIndex = i;
      }
    }
  }

  if (lastCloseParenIndex !== -1) {
    const withClausePart = cleanSql.slice(0, lastCloseParenIndex + 1);
    return `${withClausePart}\nSELECT * FROM ${cteName} LIMIT 100;`;
  }

  return `${cleanSql}\nSELECT * FROM ${cteName} LIMIT 100;`;
}
