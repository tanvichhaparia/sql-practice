export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type ProblemStatus = 'unsolved' | 'attempted' | 'passed_sample' | 'passed_all_edge_cases';

export interface ColumnDefinition {
  name: string;
  type: string;
  isPk?: boolean;
  isFk?: boolean;
  fkTarget?: string;
  description?: string;
}

export interface TableSchema {
  tableName: string;
  description?: string;
  columns: ColumnDefinition[];
}

export interface ExpectedColumn {
  name: string;
  type: string;
  description?: string;
}

export interface StageData {
  name: string;
  title: string;
  ddl: string;
  seed: string;
  trapDescription?: string;
  diagnosticHint?: string;
  previewRows?: Record<string, Record<string, any>[]>;
}

export interface ProblemStages {
  sample: StageData;
  edgeCaseA: StageData;
  edgeCaseB: StageData;
  edgeCaseC: StageData;
}

export interface ProblemHints {
  edgeCase: string;
  approach: string;
  annotatedSolution: string;
  whyNaiveFails: string;
}

export interface Problem {
  id: string;
  title: string;
  difficulty: Difficulty;
  domain: string;
  companyTags: string[];
  patterns: string[];
  isPro: boolean;
  businessContext: string;
  expectedColumns: ExpectedColumn[];
  orderingRule: string;
  schema: TableSchema[];
  stages: ProblemStages;
  starterSql: string;
  solutionSql: string;
  hints: ProblemHints;
}

export interface MockOA {
  id: string;
  title: string;
  company: string;
  role: string;
  durationMinutes: number;
  problemIds: string[];
  isPro: boolean;
  description: string;
  targetSLA: string;
}

export interface CheatSheet {
  id: string;
  title: string;
  category: string;
  summary: string;
  syntaxTemplate: string;
  businessScenario: string;
  exampleSql: string;
  commonPitfalls: string[];
  recommendedProblems: string[];
}

export interface StageEvaluationResult {
  stageKey: 'sample' | 'edgeCaseA' | 'edgeCaseB' | 'edgeCaseC';
  stageName: string;
  stageTitle: string;
  passed: boolean;
  executionTimeMs: number;
  userResult?: {
    columns: string[];
    values: (string | number | boolean | Uint8Array | null)[][];
    error?: string;
  };
  expectedResult?: {
    columns: string[];
    values: (string | number | boolean | Uint8Array | null)[][];
  };
  diagnosticHint?: string;
  diffSummary?: {
    userRowCount: number;
    expectedRowCount: number;
    columnMismatch: boolean;
    userColumns: string[];
    expectedColumns: string[];
    firstMismatch?: {
      rowIndex: number;
      colIndex: number;
      userCol: string;
      expectedCol: string;
      userVal: any;
      expectedVal: any;
    };
  };
  error?: string;
}

export interface FullEvaluationReport {
  problemId: string;
  timestamp: number;
  stages: StageEvaluationResult[];
  allPassed: boolean;
  samplePassed: boolean;
  totalExecutionTimeMs: number;
}

export interface UserProgress {
  problemStatus: Record<string, ProblemStatus>;
  savedCode: Record<string, string>;
  bookmarks: string[];
  streak: {
    count: number;
    lastSolvedDate: string;
  };
  isProUnlocked: boolean;
  licenseKey?: string;
  oaAttempts: {
    oaId: string;
    date: string;
    timeSpentSeconds: number;
    score: number;
    total: number;
    problemResults: Record<string, boolean>;
  }[];
}
