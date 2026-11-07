import React, { useState, useEffect, useMemo, useRef } from 'react';
import Editor from '@monaco-editor/react';
import confetti from 'canvas-confetti';
import { 
  Play, 
  CheckCheck, 
  RotateCcw, 
  FileCode2, 
  Layers, 
  Table as TableIcon, 
  Lightbulb, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Key, 
  Copy, 
  Check, 
  Sparkles, 
  ArrowLeft,
  Terminal,
  Activity,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { 
  Problem, 
  UserProgress, 
  FullEvaluationReport, 
  StageEvaluationResult 
} from '../types';
import { 
  extractCteNames, 
  QueryResult, 
  compareResults 
} from '../services/sqlEngine';
import { 
  evaluateAllStages, 
  runQueryOnStage, 
  runCteInspection, 
  runExplainPlanOnStage 
} from '../services/grader';

interface ProblemWorkspaceProps {
  problem: Problem;
  progress: UserProgress;
  onSaveDraft: (problemId: string, code: string) => void;
  onRecordSuccess: (problemId: string, allPassed: boolean) => void;
  onBackToBank?: () => void;
  isInMockOa?: boolean;
}

export const ProblemWorkspace: React.FC<ProblemWorkspaceProps> = ({
  problem,
  progress,
  onSaveDraft,
  onRecordSuccess,
  onBackToBank,
  isInMockOa = false,
}) => {
  // Saved code draft or starter code
  const initialCode = progress.savedCode[problem.id] || problem.starterSql;
  const [code, setCode] = useState(initialCode);

  // Left Pane Tabs
  const [leftTab, setLeftTab] = useState<'context' | 'schema' | 'hints'>('context');

  // Right Bottom Pane Tabs
  const [bottomTab, setBottomTab] = useState<'diff' | 'grader' | 'explain'>('diff');

  // Active CTE Pill Selection: null = Final Output
  const [activeCte, setActiveCte] = useState<string | null>(null);

  // Output State
  const [isRunning, setIsRunning] = useState(false);
  const [userResult, setUserResult] = useState<QueryResult | null>(null);
  const [expectedResult, setExpectedResult] = useState<QueryResult | null>(null);
  const [explainResult, setExplainResult] = useState<QueryResult | null>(null);
  const [evaluationReport, setEvaluationReport] = useState<FullEvaluationReport | null>(null);
  const [activeOutputView, setActiveOutputView] = useState<'user' | 'expected'>('user');

  // Accordion state for hints
  const [openHintStep, setOpenHintStep] = useState<number | null>(null);
  const [copiedSolution, setCopiedSolution] = useState(false);

  // Detect CTEs in editor text
  const detectedCtes = useMemo(() => {
    return extractCteNames(code);
  }, [code]);

  // Keep code in sync if problem changes
  useEffect(() => {
    const saved = progress.savedCode[problem.id] || problem.starterSql;
    setCode(saved);
    setUserResult(null);
    setExpectedResult(null);
    setExplainResult(null);
    setEvaluationReport(null);
    setActiveCte(null);
    setLeftTab('context');
    setBottomTab('diff');
  }, [problem.id]);

  // Auto-save code on change
  const handleCodeChange = (newCode?: string) => {
    const val = newCode || '';
    setCode(val);
    onSaveDraft(problem.id, val);
  };

  // Run Sample (Ctrl+Enter)
  const handleRunSample = async () => {
    setIsRunning(true);
    setActiveCte(null);
    setBottomTab('diff');

    try {
      // 1. Run user's query against sample
      const uRes = await runQueryOnStage(
        problem.stages.sample.ddl,
        problem.stages.sample.seed,
        code
      );
      setUserResult(uRes);

      // 2. Run canonical solution against sample to compute exact dynamic expected output
      const eRes = await runQueryOnStage(
        problem.stages.sample.ddl,
        problem.stages.sample.seed,
        problem.solutionSql
      );
      setExpectedResult(eRes);

      // 3. Run explain plan in background
      const expRes = await runExplainPlanOnStage(
        problem.stages.sample.ddl,
        problem.stages.sample.seed,
        code
      );
      setExplainResult(expRes);

      // If sample matches, record partial progress
      if (!uRes.error && eRes && !eRes.error) {
        const diff = compareResults(uRes, eRes, true);
        if (diff.isMatch) {
          onRecordSuccess(problem.id, false);
        }
      }
    } catch (err: any) {
      setUserResult({
        columns: [],
        values: [],
        executionTimeMs: 0,
        error: err.message || String(err),
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Submit OA Test Suite (Ctrl+Shift+Enter) -> Runs all 4 stages
  const handleSubmitTestSuite = async () => {
    setIsRunning(true);
    setActiveCte(null);
    setBottomTab('grader');

    try {
      const report = await evaluateAllStages(problem, code);
      setEvaluationReport(report);

      // Set sample results in diff view as well
      const sampleStage = report.stages.find((s) => s.stageKey === 'sample');
      if (sampleStage && sampleStage.userResult && sampleStage.expectedResult) {
        setUserResult({
          columns: sampleStage.userResult.columns,
          values: sampleStage.userResult.values,
          executionTimeMs: sampleStage.executionTimeMs,
          error: sampleStage.userResult.error,
        });
        setExpectedResult({
          columns: sampleStage.expectedResult.columns,
          values: sampleStage.expectedResult.values,
          executionTimeMs: 0,
        });
      }

      // Record progress
      onRecordSuccess(problem.id, report.allPassed);

      // Trigger Confetti on 4/4 Passed
      if (report.allPassed) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#34d399', '#059669', '#6ee7b7'],
        });
      }
    } catch (err: any) {
      console.error('Test suite execution error:', err);
    } finally {
      setIsRunning(false);
    }
  };

  // Inspect CTE Tab Click
  const handleInspectCte = async (cteName: string | null) => {
    setActiveCte(cteName);
    setBottomTab('diff');

    if (!cteName) {
      // Revert to sample run
      handleRunSample();
      return;
    }

    setIsRunning(true);
    try {
      const res = await runCteInspection(problem, code, cteName);
      setUserResult(res);
      setExpectedResult(null); // Intermediate CTE has no official expected result
    } catch (err: any) {
      setUserResult({
        columns: [],
        values: [],
        executionTimeMs: 0,
        error: err.message || String(err),
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Reset to starter code
  const handleResetCode = () => {
    if (window.confirm('Reset editor to initial starter SQL template?')) {
      setCode(problem.starterSql);
      onSaveDraft(problem.id, problem.starterSql);
      setUserResult(null);
      setExpectedResult(null);
      setEvaluationReport(null);
    }
  };

  // Copy or Load Official Solution
  const handleLoadSolution = () => {
    if (window.confirm('Replace current editor code with the official annotated solution?')) {
      setCode(problem.solutionSql);
      onSaveDraft(problem.id, problem.solutionSql);
    }
  };

  const handleCopySolution = () => {
    navigator.clipboard.writeText(problem.solutionSql);
    setCopiedSolution(true);
    setTimeout(() => setCopiedSolution(false), 2000);
  };

  // Format SQL basic indentation
  const handleFormatSql = () => {
    // Simple clean uppercase keywords
    const keywords = [
      'SELECT', 'FROM', 'WHERE', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 
      'JOIN', 'ON', 'GROUP BY', 'HAVING', 'ORDER BY', 'LIMIT', 'WITH', 
      'AS', 'UNION ALL', 'UNION', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 
      'OVER', 'PARTITION BY', 'AND', 'OR', 'ASC', 'DESC'
    ];
    let formatted = code;
    keywords.forEach((kw) => {
      const regex = new RegExp(`\\b${kw}\\b`, 'gi');
      formatted = formatted.replace(regex, kw);
    });
    setCode(formatted);
    onSaveDraft(problem.id, formatted);
  };

  // Cell Diff Calculation
  const diffSummary = useMemo(() => {
    if (!userResult || !expectedResult) return null;
    return compareResults(userResult, expectedResult, true);
  }, [userResult, expectedResult]);

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-slate-950 overflow-hidden">
      {/* Workspace Top Action Bar */}
      <div className="h-11 border-b border-slate-800 bg-slate-900/90 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          {onBackToBank && (
            <button
              onClick={onBackToBank}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-100 transition px-2 py-1 rounded hover:bg-slate-800"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200 text-sm tracking-tight truncate max-w-[280px] sm:max-w-md">
              {problem.title}
            </span>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                problem.difficulty === 'Easy'
                  ? 'text-emerald-400 bg-emerald-500/10'
                  : problem.difficulty === 'Medium'
                  ? 'text-amber-400 bg-amber-500/10'
                  : 'text-rose-400 bg-rose-500/10'
              }`}
            >
              {problem.difficulty}
            </span>
          </div>
        </div>

        {/* Dialect Indicator */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
            <Terminal className="w-3 h-3 text-emerald-400" />
            <span>PostgreSQL / ANSI SQL Standard</span>
          </div>
        </div>
      </div>

      {/* Main 3-Pane Body */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
        {/* ================= LEFT PANE (40% Width) ================= */}
        <div className="w-full md:w-[42%] lg:w-[40%] border-r border-slate-800 flex flex-col bg-slate-900/40 min-h-0">
          {/* Sub-Tabs */}
          <div className="h-10 border-b border-slate-800 bg-slate-900/80 px-2 flex items-center gap-1 shrink-0">
            <button
              onClick={() => setLeftTab('context')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                leftTab === 'context'
                  ? 'bg-slate-800 text-emerald-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode2 className="w-3.5 h-3.5" />
              <span>Problem Context</span>
            </button>

            <button
              onClick={() => setLeftTab('schema')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                leftTab === 'schema'
                  ? 'bg-slate-800 text-emerald-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Schema & Tables</span>
            </button>

            <button
              onClick={() => setLeftTab('hints')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                leftTab === 'hints'
                  ? 'bg-slate-800 text-emerald-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Hints & Solution</span>
            </button>
          </div>

          {/* Left Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-slate-300 text-xs sm:text-sm">
            {leftTab === 'context' && (
              <div className="space-y-4">
                {/* Meta info tags */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-medium">
                    {problem.domain}
                  </span>
                  {problem.companyTags.map((co) => (
                    <span
                      key={co}
                      className="px-2 py-0.5 rounded bg-slate-800/60 text-slate-400 text-[11px]"
                    >
                      {co}
                    </span>
                  ))}
                  {problem.patterns.map((pat) => (
                    <span
                      key={pat}
                      className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px]"
                    >
                      {pat}
                    </span>
                  ))}
                </div>

                {/* Scenario & Rules */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Business Scenario & Rules
                  </h4>
                  <div className="whitespace-pre-line text-slate-300 text-xs leading-relaxed font-sans">
                    {problem.businessContext}
                  </div>
                </div>

                {/* Expected Output Specification */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Expected Output Columns
                  </h4>
                  <div className="border border-slate-800 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="py-2 px-3">Column Name</th>
                          <th className="py-2 px-3">Type</th>
                          <th className="py-2 px-3">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 bg-slate-900">
                        {problem.expectedColumns.map((col) => (
                          <tr key={col.name} className="hover:bg-slate-800/40">
                            <td className="py-2 px-3 font-mono font-semibold text-emerald-400">
                              {col.name}
                            </td>
                            <td className="py-2 px-3 text-slate-400 font-mono text-[11px]">
                              {col.type}
                            </td>
                            <td className="py-2 px-3 text-slate-300 text-xs">
                              {col.description || '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="text-[11px] text-amber-400/90 bg-amber-500/10 border border-amber-500/20 rounded-md p-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Sorting Requirement: <code className="font-mono text-amber-300 font-bold">{problem.orderingRule}</code></span>
                  </div>
                </div>
              </div>
            )}

            {leftTab === 'schema' && (
              <div className="space-y-4">
                <div className="text-xs text-slate-400">
                  Interactive preview of tables in the <strong className="text-slate-200">Visible Sample Dataset</strong>.
                </div>

                {problem.schema.map((tbl) => {
                  const previewData = problem.stages.sample.previewRows?.[tbl.tableName] || [];

                  return (
                    <div
                      key={tbl.tableName}
                      className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm"
                    >
                      {/* Table Header */}
                      <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TableIcon className="w-4 h-4 text-emerald-400" />
                          <span className="font-mono font-bold text-slate-200 text-xs">
                            {tbl.tableName}
                          </span>
                        </div>
                        {tbl.description && (
                          <span className="text-[11px] text-slate-400">
                            {tbl.description}
                          </span>
                        )}
                      </div>

                      {/* Columns list */}
                      <div className="p-3 bg-slate-900/80 border-b border-slate-800/80">
                        <div className="flex flex-wrap gap-1.5">
                          {tbl.columns.map((c) => (
                            <span
                              key={c.name}
                              className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300"
                            >
                              {c.isPk && (
                                <span title="Primary Key">
                                  <Key className="w-2.5 h-2.5 text-amber-400" />
                                </span>
                              )}
                              {c.isFk && (
                                <span className="text-[9px] text-blue-400 font-bold">FK</span>
                              )}
                              <span>{c.name}</span>
                              <span className="text-[10px] text-slate-500 font-sans">
                                ({c.type})
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Preview Rows */}
                      {previewData.length > 0 && (
                        <div className="overflow-x-auto max-h-48 overflow-y-auto">
                          <table className="w-full text-left text-[11px] font-mono">
                            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                              <tr>
                                {tbl.columns.map((col) => (
                                  <th key={col.name} className="py-1.5 px-3">
                                    {col.name}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                              {previewData.map((row, idx) => (
                                <tr key={idx} className="hover:bg-slate-800/30">
                                  {tbl.columns.map((col) => (
                                    <td key={col.name} className="py-1.5 px-3 text-slate-300">
                                      {row[col.name] !== undefined && row[col.name] !== null
                                        ? String(row[col.name])
                                        : <span className="text-slate-500 italic">NULL</span>}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {leftTab === 'hints' && (
              <div className="space-y-3">
                <div className="text-xs text-slate-400">
                  Progressive hints to guide your solution without giving away the full answer immediately.
                </div>

                {/* Hint 1 */}
                <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900">
                  <button
                    onClick={() => setOpenHintStep(openHintStep === 1 ? null : 1)}
                    className="w-full text-left px-4 py-3 flex items-center justify-between text-xs font-semibold text-slate-200 hover:bg-slate-800/50"
                  >
                    <span className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      Hint 1: Edge Case Trap to Watch For
                    </span>
                    <span className="text-slate-500">{openHintStep === 1 ? '−' : '+'}</span>
                  </button>
                  {openHintStep === 1 && (
                    <div className="px-4 pb-4 pt-1 text-xs text-slate-300 border-t border-slate-800 bg-slate-950/60 leading-relaxed">
                      {problem.hints.edgeCase}
                    </div>
                  )}
                </div>

                {/* Hint 2 */}
                <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900">
                  <button
                    onClick={() => setOpenHintStep(openHintStep === 2 ? null : 2)}
                    className="w-full text-left px-4 py-3 flex items-center justify-between text-xs font-semibold text-slate-200 hover:bg-slate-800/50"
                  >
                    <span className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-emerald-400" />
                      Hint 2: Recommended Function / Join Strategy
                    </span>
                    <span className="text-slate-500">{openHintStep === 2 ? '−' : '+'}</span>
                  </button>
                  {openHintStep === 2 && (
                    <div className="px-4 pb-4 pt-1 text-xs text-slate-300 border-t border-slate-800 bg-slate-950/60 leading-relaxed">
                      {problem.hints.approach}
                    </div>
                  )}
                </div>

                {/* Hint 3: Full Annotated Solution */}
                <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900">
                  <button
                    onClick={() => setOpenHintStep(openHintStep === 3 ? null : 3)}
                    className="w-full text-left px-4 py-3 flex items-center justify-between text-xs font-semibold text-slate-200 hover:bg-slate-800/50"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-teal-400" />
                      Hint 3: Full Annotated Solution & Explanation
                    </span>
                    <span className="text-slate-500">{openHintStep === 3 ? '−' : '+'}</span>
                  </button>
                  {openHintStep === 3 && (
                    <div className="px-4 pb-4 pt-2 border-t border-slate-800 bg-slate-950/90 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-400 font-mono">
                          Canonical Solution
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleCopySolution}
                            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition"
                          >
                            {copiedSolution ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={handleLoadSolution}
                            className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[11px] font-semibold transition"
                          >
                            <span>Load into Editor</span>
                          </button>
                        </div>
                      </div>

                      <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
                        {problem.hints.annotatedSolution}
                      </pre>

                      <div className="text-xs text-rose-300/90 bg-rose-500/10 border border-rose-500/20 rounded-md p-2.5">
                        <strong className="text-rose-300 font-semibold block mb-0.5">Why Naive Queries Fail:</strong>
                        {problem.hints.whyNaiveFails}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================= RIGHT PANE (60% Width) ================= */}
        <div className="flex-1 flex flex-col min-h-0 bg-slate-950">
          {/* Top Half: Editor + CTE Inspector */}
          <div className="h-[52%] flex flex-col border-b border-slate-800 min-h-0">
            {/* Editor Toolbar */}
            <div className="h-10 border-b border-slate-800 bg-slate-900/90 px-3 flex items-center justify-between shrink-0">
              {/* CTE Inspector Pills Bar */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-[50%]">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden lg:inline mr-1">
                  CTE Debugger:
                </span>
                <button
                  onClick={() => handleInspectCte(null)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition ${
                    activeCte === null
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Final Output
                </button>
                {detectedCtes.map((cte) => (
                  <button
                    key={cte}
                    onClick={() => handleInspectCte(cte)}
                    title={`Inspect intermediate rows generated by CTE "${cte}"`}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono transition flex items-center gap-1 ${
                      activeCte === cte
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 font-bold'
                        : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>Inspect:</span>
                    <span className="text-emerald-400">{cte}</span>
                  </button>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleFormatSql}
                  title="Format SQL Keywords"
                  className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition text-xs"
                >
                  Format
                </button>

                <button
                  onClick={handleResetCode}
                  title="Reset to starter template"
                  className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition text-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                {/* Run Sample */}
                <button
                  onClick={handleRunSample}
                  disabled={isRunning}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition disabled:opacity-50"
                  title="Run against Stage 1 sample dataset (Ctrl+Enter)"
                >
                  <Play className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                  <span>Run Sample</span>
                  <span className="text-[10px] text-slate-400 hidden sm:inline">(Ctrl+Enter)</span>
                </button>

                {/* Submit All 4 Edge Cases */}
                <button
                  onClick={handleSubmitTestSuite}
                  disabled={isRunning}
                  className="flex items-center gap-1.5 px-3.5 py-1 rounded-md text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-sm shadow-emerald-500/30 transition disabled:opacity-50"
                  title="Run query against all 4 edge-case test suites (Ctrl+Shift+Enter)"
                >
                  <CheckCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Submit OA Suite</span>
                  <span className="text-[10px] text-emerald-950 font-medium hidden sm:inline">(Ctrl+⇧+Enter)</span>
                </button>
              </div>
            </div>

            {/* Monaco SQL Editor */}
            <div className="flex-1 min-h-0 bg-[#1e1e1e]">
              <Editor
                height="100%"
                defaultLanguage="sql"
                value={code}
                onChange={handleCodeChange}
                theme="vs-dark"
                options={{
                  fontSize: 13,
                  fontFamily: 'JetBrains Mono, Menlo, monospace',
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  automaticLayout: true,
                  tabSize: 2,
                  lineNumbersMinChars: 3,
                  suggestOnTriggerCharacters: true,
                  renderLineHighlight: 'all',
                }}
                onMount={(editor, monaco) => {
                  // Keyboard shortcut: Ctrl+Enter / Cmd+Enter to Run Sample
                  editor.addCommand(
                    monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
                    () => {
                      handleRunSample();
                    }
                  );
                  // Keyboard shortcut: Ctrl+Shift+Enter to Submit Test Suite
                  editor.addCommand(
                    monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter,
                    () => {
                      handleSubmitTestSuite();
                    }
                  );
                }}
              />
            </div>
          </div>

          {/* Bottom Half: Grader & Output Tabs */}
          <div className="flex-1 flex flex-col min-h-0 bg-slate-900/60">
            {/* Output Sub-Tabs */}
            <div className="h-10 border-b border-slate-800 bg-slate-900/80 px-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setBottomTab('diff')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                    bottomTab === 'diff'
                      ? 'bg-slate-800 text-emerald-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  <span>Output & Diff</span>
                  {userResult && !userResult.error && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-700 text-slate-300">
                      {userResult.values.length} rows
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setBottomTab('grader')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                    bottomTab === 'grader'
                      ? 'bg-slate-800 text-emerald-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>4-Stage Edge-Case Grader</span>
                  {evaluationReport && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                        evaluationReport.allPassed
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {evaluationReport.stages.filter((s) => s.passed).length}/4
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setBottomTab('explain')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                    bottomTab === 'explain'
                      ? 'bg-slate-800 text-emerald-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Query Plan (EXPLAIN)</span>
                </button>
              </div>

              {/* Execution time indicator */}
              {userResult && (
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>{userResult.executionTimeMs} ms</span>
                </div>
              )}
            </div>

            {/* Bottom Content Area */}
            <div className="flex-1 overflow-y-auto p-3 min-h-0">
              {isRunning && (
                <div className="flex items-center justify-center h-full text-slate-400 text-xs gap-2">
                  <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                  <span>Executing query in browser engine...</span>
                </div>
              )}

              {!isRunning && bottomTab === 'diff' && (
                <div className="space-y-3">
                  {/* CTE Inspection Banner */}
                  {activeCte && (
                    <div className="flex items-center justify-between bg-teal-500/10 border border-teal-500/30 rounded-lg px-3 py-2 text-xs text-teal-300">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-teal-400" />
                        <span>
                          Inspecting intermediate CTE: <code className="font-bold text-white">"{activeCte}"</code> (showing top 100 rows)
                        </span>
                      </div>
                      <button
                        onClick={() => handleInspectCte(null)}
                        className="text-[11px] text-teal-200 hover:underline"
                      >
                        Exit Inspection
                      </button>
                    </div>
                  )}

                  {/* SQL Execution Error Alert */}
                  {userResult?.error && (
                    <div className="bg-rose-950/40 border border-rose-800/80 rounded-xl p-4 text-xs space-y-2">
                      <div className="flex items-center gap-2 text-rose-400 font-bold">
                        <XCircle className="w-4 h-4" />
                        <span>SQL Execution Error</span>
                      </div>
                      <pre className="font-mono text-rose-300 whitespace-pre-wrap bg-slate-950/80 p-2.5 rounded border border-rose-900/40">
                        {userResult.error}
                      </pre>
                    </div>
                  )}

                  {/* Output vs Expected Header / Diff Status */}
                  {userResult && !userResult.error && expectedResult && (
                    <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-xs">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          {diffSummary?.isMatch ? (
                            <span className="flex items-center gap-1 text-emerald-400 font-bold bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Exact Match
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-rose-400 font-bold bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 rounded">
                              <XCircle className="w-3.5 h-3.5" />
                              Output Mismatch
                            </span>
                          )}
                        </div>

                        {diffSummary && !diffSummary.isMatch && (
                          <div className="text-slate-400 text-[11px]">
                            {diffSummary.columnMismatch && (
                              <span className="text-rose-400 mr-2">Column names/count mismatch</span>
                            )}
                            {diffSummary.userRowCount !== diffSummary.expectedRowCount && (
                              <span className="text-amber-400 mr-2">
                                Row count mismatch: Your query returned {diffSummary.userRowCount} rows, expected {diffSummary.expectedRowCount} rows.
                              </span>
                            )}
                            {diffSummary.firstMismatch && (
                              <span className="text-slate-300">
                                Row #{diffSummary.firstMismatch.rowIndex + 1} mismatch in column <code className="text-emerald-400">{diffSummary.firstMismatch.expectedCol}</code>.
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Toggle between Output & Expected */}
                      <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded border border-slate-800">
                        <button
                          onClick={() => setActiveOutputView('user')}
                          className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${
                            activeOutputView === 'user'
                              ? 'bg-slate-800 text-slate-100'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          Your Output ({userResult.values.length})
                        </button>
                        <button
                          onClick={() => setActiveOutputView('expected')}
                          className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${
                            activeOutputView === 'expected'
                              ? 'bg-slate-800 text-slate-100'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          Expected Output ({expectedResult.values.length})
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Output Table */}
                  {userResult && !userResult.error && (
                    <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950 shadow-inner">
                      <div className="overflow-x-auto max-h-72 overflow-y-auto">
                        {activeOutputView === 'user' ? (
                          <table className="w-full text-left text-xs font-mono">
                            <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 sticky top-0">
                              <tr>
                                <th className="py-2 px-3 w-10 text-slate-600">#</th>
                                {userResult.columns.map((col, idx) => (
                                  <th key={idx} className="py-2 px-3 font-semibold text-slate-200">
                                    {col}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                              {userResult.values.map((row, rIdx) => {
                                const isMismatchedRow = diffSummary?.mismatchedRows.includes(rIdx);

                                return (
                                  <tr
                                    key={rIdx}
                                    className={`${
                                      isMismatchedRow
                                        ? 'bg-rose-950/20 hover:bg-rose-950/30'
                                        : 'hover:bg-slate-800/30'
                                    }`}
                                  >
                                    <td className="py-1.5 px-3 text-slate-600 select-none text-[10px]">
                                      {rIdx + 1}
                                    </td>
                                    {row.map((val, cIdx) => (
                                      <td key={cIdx} className="py-1.5 px-3 text-slate-300">
                                        {val !== null && val !== undefined ? (
                                          String(val)
                                        ) : (
                                          <span className="text-slate-500 italic">NULL</span>
                                        )}
                                      </td>
                                    ))}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        ) : (
                          <table className="w-full text-left text-xs font-mono">
                            <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 sticky top-0">
                              <tr>
                                <th className="py-2 px-3 w-10 text-slate-600">#</th>
                                {expectedResult?.columns.map((col, idx) => (
                                  <th key={idx} className="py-2 px-3 font-semibold text-emerald-400">
                                    {col}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                              {expectedResult?.values.map((row, rIdx) => (
                                <tr key={rIdx} className="hover:bg-slate-800/30">
                                  <td className="py-1.5 px-3 text-slate-600 select-none text-[10px]">
                                    {rIdx + 1}
                                  </td>
                                  {row.map((val, cIdx) => (
                                    <td key={cIdx} className="py-1.5 px-3 text-slate-300">
                                      {val !== null && val !== undefined ? (
                                        String(val)
                                      ) : (
                                        <span className="text-slate-500 italic">NULL</span>
                                      )}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}

                        {userResult.values.length === 0 && (
                          <div className="py-8 text-center text-slate-500 text-xs font-sans">
                            Query returned 0 rows.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {!userResult && (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-500 text-xs">
                      <Terminal className="w-6 h-6 mb-2 text-slate-600" />
                      <span>Click "Run Sample" or press Ctrl+Enter to execute SQL.</span>
                    </div>
                  )}
                </div>
              )}

              {!isRunning && bottomTab === 'grader' && (
                <div className="space-y-4">
                  {evaluationReport ? (
                    <>
                      {/* Overall Status Banner */}
                      <div
                        className={`rounded-xl p-4 border flex items-center justify-between ${
                          evaluationReport.allPassed
                            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                            : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {evaluationReport.allPassed ? (
                            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                          ) : (
                            <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
                          )}
                          <div>
                            <h4 className="font-bold text-sm">
                              {evaluationReport.allPassed
                                ? 'All 4/4 Edge-Case Test Suites Passed!'
                                : 'Query Failed on Hidden Edge-Case Datasets'}
                            </h4>
                            <p className="text-xs opacity-90 mt-0.5">
                              {evaluationReport.allPassed
                                ? 'Your query handled NULLs, tie-breakers, zero-division, and date boundaries perfectly.'
                                : 'Review the diagnostic feedback below to identify which edge case failed.'}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xl font-black">
                            {evaluationReport.stages.filter((s) => s.passed).length} / 4
                          </span>
                          <span className="text-[10px] block opacity-75">PASSED</span>
                        </div>
                      </div>

                      {/* 4 Test Stages Cards */}
                      <div className="grid grid-cols-1 gap-2.5">
                        {evaluationReport.stages.map((stage) => (
                          <div
                            key={stage.stageKey}
                            className={`border rounded-xl p-3.5 transition ${
                              stage.passed
                                ? 'bg-slate-900/60 border-slate-800'
                                : 'bg-rose-950/20 border-rose-800/60'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-2.5">
                                {stage.passed ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                                )}
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h5 className="font-bold text-xs text-slate-200">
                                      {stage.stageTitle}
                                    </h5>
                                    <span
                                      className={`text-[10px] font-bold px-2 py-0.2 rounded-full uppercase ${
                                        stage.passed
                                          ? 'bg-emerald-500/20 text-emerald-400'
                                          : 'bg-rose-500/20 text-rose-400'
                                      }`}
                                    >
                                      {stage.passed ? 'PASSED' : 'FAILED'}
                                    </span>
                                  </div>

                                  {/* Error or diff count */}
                                  {stage.error && (
                                    <p className="text-xs font-mono text-rose-400 mt-1">
                                      {stage.error}
                                    </p>
                                  )}

                                  {/* Actionable Diagnostic Feedback */}
                                  {!stage.passed && stage.diagnosticHint && (
                                    <div className="mt-2 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-md p-2.5 flex items-start gap-2">
                                      <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                                      <div className="leading-relaxed font-sans">
                                        <strong className="text-amber-200 block mb-0.5">
                                          Actionable Diagnostic Feedback:
                                        </strong>
                                        {stage.diagnosticHint}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <span className="text-[11px] font-mono text-slate-500">
                                {stage.executionTimeMs} ms
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-500 text-xs">
                      <Activity className="w-6 h-6 mb-2 text-slate-600" />
                      <span>Click "Submit OA Suite" to grade against all 4 hidden edge-case datasets.</span>
                    </div>
                  )}
                </div>
              )}

              {!isRunning && bottomTab === 'explain' && (
                <div className="space-y-3">
                  <div className="text-xs text-slate-400">
                    Query Execution Plan (<code className="font-mono text-emerald-400">EXPLAIN QUERY PLAN</code>) showing whether table scans, index scans, or temporary B-Trees were used:
                  </div>

                  {explainResult && !explainResult.error ? (
                    <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                          <tr>
                            {explainResult.columns.map((col, idx) => (
                              <th key={idx} className="py-2 px-3">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {explainResult.values.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-slate-800/30">
                              {row.map((val, cIdx) => (
                                <td key={cIdx} className="py-1.5 px-3 text-slate-300">
                                  {String(val)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : explainResult?.error ? (
                    <div className="bg-rose-950/40 border border-rose-800 rounded-xl p-3 text-xs font-mono text-rose-300">
                      {explainResult.error}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-500 text-xs font-mono">
                      Run query to view execution plan.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
