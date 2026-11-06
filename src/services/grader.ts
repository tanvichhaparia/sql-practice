import { Problem, StageEvaluationResult, FullEvaluationReport } from '../types';
import { getSqlEngine, executeQuery, compareResults, rewriteQueryForCte, QueryResult, explainQuery } from './sqlEngine';

export async function runQueryOnStage(
  ddl: string,
  seed: string,
  sql: string
): Promise<QueryResult> {
  const SQL = await getSqlEngine();
  const db = new SQL.Database();
  try {
    // Run DDL and seed data
    db.run(ddl);
    db.run(seed);
    // Execute user query
    return executeQuery(db, sql);
  } finally {
    db.close();
  }
}

export async function runExplainPlanOnStage(
  ddl: string,
  seed: string,
  sql: string
): Promise<QueryResult> {
  const SQL = await getSqlEngine();
  const db = new SQL.Database();
  try {
    db.run(ddl);
    db.run(seed);
    return explainQuery(db, sql);
  } finally {
    db.close();
  }
}

export async function runCteInspection(
  problem: Problem,
  userSql: string,
  cteName: string
): Promise<QueryResult> {
  const rewritten = rewriteQueryForCte(userSql, cteName);
  return runQueryOnStage(problem.stages.sample.ddl, problem.stages.sample.seed, rewritten);
}

export async function evaluateSingleStage(
  stageKey: 'sample' | 'edgeCaseA' | 'edgeCaseB' | 'edgeCaseC',
  stageName: string,
  stageTitle: string,
  ddl: string,
  seed: string,
  userSql: string,
  solutionSql: string,
  diagnosticHint?: string
): Promise<StageEvaluationResult> {
  const SQL = await getSqlEngine();
  const db = new SQL.Database();

  try {
    db.run(ddl);
    db.run(seed);

    // Dynamic ground truth: run canonical solution against this exact dataset
    const expectedRes = executeQuery(db, solutionSql);

    // Run candidate's SQL
    const userRes = executeQuery(db, userSql);

    const diff = compareResults(userRes, expectedRes, true);

    return {
      stageKey,
      stageName,
      stageTitle,
      passed: diff.isMatch,
      executionTimeMs: userRes.executionTimeMs,
      userResult: {
        columns: userRes.columns,
        values: userRes.values,
        error: userRes.error,
      },
      expectedResult: {
        columns: expectedRes.columns,
        values: expectedRes.values,
      },
      diagnosticHint: diff.isMatch ? undefined : diagnosticHint,
      diffSummary: {
        userRowCount: diff.userRowCount,
        expectedRowCount: diff.expectedRowCount,
        columnMismatch: diff.columnMismatch,
        userColumns: diff.userColumns,
        expectedColumns: diff.expectedColumns,
        firstMismatch: diff.firstMismatch,
      },
      error: userRes.error,
    };
  } catch (err: any) {
    return {
      stageKey,
      stageName,
      stageTitle,
      passed: false,
      executionTimeMs: 0,
      diagnosticHint,
      error: err.message || String(err),
    };
  } finally {
    db.close();
  }
}

export async function evaluateAllStages(
  problem: Problem,
  userSql: string
): Promise<FullEvaluationReport> {
  const startTime = performance.now();

  const stageKeys: ('sample' | 'edgeCaseA' | 'edgeCaseB' | 'edgeCaseC')[] = [
    'sample',
    'edgeCaseA',
    'edgeCaseB',
    'edgeCaseC',
  ];

  const results: StageEvaluationResult[] = [];

  for (const key of stageKeys) {
    const stage = problem.stages[key];
    const res = await evaluateSingleStage(
      key,
      stage.name,
      stage.title,
      stage.ddl,
      stage.seed,
      userSql,
      problem.solutionSql,
      stage.diagnosticHint
    );
    results.push(res);
  }

  const samplePassed = results[0]?.passed ?? false;
  const allPassed = results.every((r) => r.passed);
  const totalExecutionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;

  return {
    problemId: problem.id,
    timestamp: Date.now(),
    stages: results,
    allPassed,
    samplePassed,
    totalExecutionTimeMs,
  };
}
