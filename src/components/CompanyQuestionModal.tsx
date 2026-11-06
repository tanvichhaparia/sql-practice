import React, { useState, useEffect } from 'react';
import { 
  X, 
  Play, 
  CheckCircle2, 
  XCircle, 
  Lightbulb, 
  Code, 
  HelpCircle, 
  BookOpen, 
  Lock, 
  Database, 
  Table, 
  Sparkles,
  ChevronDown,
  ChevronRight,
  Clock,
  RotateCcw
} from 'lucide-react';
import { CompanyQuestion } from '../data/companyQuestions';
import { evaluateCompanyQuery, CompanyEvaluationResult } from '../services/companySqlEngine';
import { SCHEMA_MAP, SchemaInfo } from '../data/schemasMetadata';
import { UserProgress } from '../types';
import { 
  recordCompanyQuerySuccess, 
  recordMcqAnswer, 
  toggleConceptMastered, 
  saveCompanyUserSql 
} from '../services/storage';

interface CompanyQuestionModalProps {
  question: CompanyQuestion | null;
  onClose: () => void;
  progress: UserProgress;
  onProgressUpdate: () => void;
  onOpenUnlockModal: () => void;
}

export const CompanyQuestionModal: React.FC<CompanyQuestionModalProps> = ({
  question,
  onClose,
  progress,
  onProgressUpdate,
  onOpenUnlockModal,
}) => {
  if (!question) return null;

  const isLocked = question.isPro && !progress.isProUnlocked;

  // Query state
  const savedSql = progress.companyBankProgress?.savedUserSql[question.id] || '';
  const [userSql, setUserSql] = useState(
    savedSql || (question.type === 'query' ? 'SELECT * FROM ' + (question.schemas?.[0] ? SCHEMA_MAP[question.schemas[0]]?.tables[0] || 'departments' : 'employees') + ' LIMIT 10;' : '')
  );
  const [evalResult, setEvalResult] = useState<CompanyEvaluationResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  // MCQ state
  const savedMcq = progress.companyBankProgress?.mcqAnswers[question.id];
  const [selectedOption, setSelectedOption] = useState<string | null>(savedMcq?.selected || null);
  const [submittedMcq, setSubmittedMcq] = useState<boolean>(!!savedMcq);

  // Concept state
  const isMastered = !!progress.companyBankProgress?.masteredConcepts[question.id];
  const [conceptNote, setConceptNote] = useState('');
  const [showModelAnswer, setShowModelAnswer] = useState(false);

  // Schema browser state
  const [activeSchemaTab, setActiveSchemaTab] = useState<string>(question.schemas?.[0] || 'HR');
  const [showSchemaDrawer, setShowSchemaDrawer] = useState(true);

  useEffect(() => {
    // Reset view state when question changes
    const initialSql = progress.companyBankProgress?.savedUserSql[question.id] || '';
    setUserSql(
      initialSql || (question.type === 'query' ? 'SELECT * FROM ' + (question.schemas?.[0] ? SCHEMA_MAP[question.schemas[0]]?.tables[0] || 'employees' : 'employees') + ';' : '')
    );
    setEvalResult(null);
    setShowSolution(false);
    setSelectedOption(progress.companyBankProgress?.mcqAnswers[question.id]?.selected || null);
    setSubmittedMcq(!!progress.companyBankProgress?.mcqAnswers[question.id]);
    setShowModelAnswer(false);
    if (question.schemas && question.schemas.length > 0) {
      setActiveSchemaTab(question.schemas[0]);
    }
  }, [question.id]);

  const handleRunQuery = async () => {
    if (!userSql.trim()) return;
    setIsRunning(true);
    setEvalResult(null);
    try {
      saveCompanyUserSql(question.id, userSql);
      const res = await evaluateCompanyQuery(userSql, question);
      setEvalResult(res);
      if (res.passed) {
        recordCompanyQuerySuccess(question.id);
        onProgressUpdate();
      }
    } catch (err: any) {
      setEvalResult({
        passed: false,
        executionTimeMs: 0,
        userColumns: [],
        userRows: [],
        expectedColumns: question.columns || [],
        expectedRows: question.expected_rows || [],
        error: err.message || 'Execution failed',
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSelectMcq = (opt: string) => {
    if (submittedMcq) return;
    setSelectedOption(opt);
  };

  const handleSubmitMcq = () => {
    if (!selectedOption || !question.answer) return;
    const isCorrect = selectedOption.toUpperCase() === question.answer.toUpperCase();
    setSubmittedMcq(true);
    recordMcqAnswer(question.id, selectedOption, isCorrect);
    onProgressUpdate();
  };

  const handleToggleConceptMastered = () => {
    toggleConceptMastered(question.id);
    onProgressUpdate();
  };

  const activeSchemaInfo: SchemaInfo | undefined = SCHEMA_MAP[activeSchemaTab];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
              {question.id}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-medium border border-emerald-500/30">
                {question.company_name}
              </span>
              <span className={`text-[11px] px-2 py-0.5 rounded font-semibold uppercase ${
                question.type === 'query' 
                  ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30' 
                  : question.type === 'mcq' 
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' 
                  : 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
              }`}>
                {question.type}
              </span>
              <span className={`text-[11px] px-2 py-0.5 rounded font-medium ${
                question.difficulty === 'easy' 
                  ? 'text-emerald-400 bg-emerald-500/10' 
                  : question.difficulty === 'medium' 
                  ? 'text-amber-400 bg-amber-500/10' 
                  : 'text-rose-400 bg-rose-500/10'
              }`}>
                {question.difficulty.toUpperCase()}
              </span>
              {question.isPro && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Pro
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Locked Pro Overlay if user is on free tier */}
        {isLocked ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-950/60">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 text-emerald-400 shadow-xl shadow-emerald-500/10">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-100 mb-2">
              Pro Tier Company Track Question
            </h3>
            <p className="text-slate-400 text-sm max-w-md mb-6">
              This question is part of the <strong>{question.company_name}</strong> placement track. 
              Unlock full access to all 534 company questions with our nominal student placement pass.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={onOpenUnlockModal}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition shadow-lg shadow-emerald-500/20"
              >
                Unlock Student Pass (₹199 / $4.99)
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm transition"
              >
                Go Back
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 min-h-0 flex flex-col">
            {/* Question prompt header */}
            <div className="px-5 py-3.5 bg-slate-950/40 border-b border-slate-800 shrink-0">
              <div className="text-xs font-semibold text-slate-400 mb-1 flex items-center gap-2">
                <span>Topic: <strong className="text-slate-200">{question.topic}</strong></span>
                <span className="text-slate-600">•</span>
                <span>Group: <strong className="text-slate-200">{question.topic_group}</strong></span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-100 leading-snug">
                {question.question}
              </h3>
            </div>

            {/* Content area based on Type */}
            {question.type === 'query' && (
              <div className="flex-1 min-h-0 flex flex-col lg:flex-row">
                {/* Left/Middle: Editor & Results */}
                <div className="flex-1 flex flex-col min-h-0 border-r border-slate-800">
                  {/* Editor toolbar */}
                  <div className="px-4 py-2 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Code className="w-4 h-4 text-emerald-400" />
                      <span className="font-mono font-medium">SQL Editor (MySQL 8 / SQLite WASM)</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {question.solution_sql && (
                        <button
                          onClick={() => setShowSolution(!showSolution)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition flex items-center gap-1.5"
                        >
                          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                          <span>{showSolution ? 'Hide Solution' : 'Reveal Solution'}</span>
                        </button>
                      )}

                      <button
                        onClick={handleRunQuery}
                        disabled={isRunning}
                        className="px-4 py-1 rounded-md bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow-sm shadow-emerald-500/20 disabled:opacity-50"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{isRunning ? 'Running...' : 'Run Query'}</span>
                      </button>
                    </div>
                  </div>

                  {/* SQL Text Area */}
                  <div className="h-44 shrink-0 bg-slate-950 p-3 font-mono text-xs text-emerald-300 border-b border-slate-800">
                    <textarea
                      value={userSql}
                      onChange={(e) => setUserSql(e.target.value)}
                      placeholder="Write your SQL query here (e.g. SELECT ... FROM ...)"
                      className="w-full h-full bg-transparent resize-none focus:outline-none leading-relaxed text-slate-200 selection:bg-emerald-500/30"
                      spellCheck={false}
                    />
                  </div>

                  {/* Solution View if toggled */}
                  {showSolution && question.solution_sql && (
                    <div className="p-3 bg-amber-950/20 border-b border-amber-500/30 text-xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-amber-400 flex items-center gap-1.5">
                          <Lightbulb className="w-3.5 h-3.5" />
                          Reference Model Solution:
                        </span>
                        <button
                          onClick={() => setUserSql(question.solution_sql!)}
                          className="text-[11px] text-amber-300 hover:underline"
                        >
                          Copy into editor
                        </button>
                      </div>
                      <pre className="p-2.5 rounded bg-slate-950 font-mono text-emerald-400 overflow-x-auto text-xs whitespace-pre-wrap">
                        {question.solution_sql}
                      </pre>
                    </div>
                  )}

                  {/* Query Execution Output / Results */}
                  <div className="flex-1 min-h-0 bg-slate-950 flex flex-col p-3 overflow-hidden">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-semibold">
                      <span className="text-slate-400">Execution Result & Verification</span>
                      {evalResult && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 text-[11px] flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {evalResult.executionTimeMs}ms
                          </span>
                          {evalResult.passed ? (
                            <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Passed (Matches Expected Output)
                            </span>
                          ) : (
                            <span className="text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" />
                              Result Mismatch
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-h-0 overflow-auto pt-2">
                      {!evalResult ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
                          <Play className="w-6 h-6 mb-2 opacity-40 text-slate-400" />
                          <span>Click "Run Query" to execute against the seed database.</span>
                        </div>
                      ) : evalResult.error ? (
                        <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 font-mono text-xs">
                          <strong>SQL Error:</strong> {evalResult.error}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {evalResult.mismatchReason && (
                            <div className={`p-2.5 rounded-lg text-xs ${
                              evalResult.passed 
                                ? 'bg-amber-950/30 border border-amber-500/20 text-amber-300' 
                                : 'bg-rose-950/30 border border-rose-500/20 text-rose-300'
                            }`}>
                              {evalResult.mismatchReason}
                            </div>
                          )}

                          {/* Data Table */}
                          <div className="border border-slate-800 rounded-lg overflow-x-auto">
                            <table className="w-full text-left text-xs font-mono">
                              <thead className="bg-slate-900 border-b border-slate-800 text-slate-300 sticky top-0">
                                <tr>
                                  <th className="p-2 text-slate-500 text-[10px] w-10">#</th>
                                  {evalResult.userColumns.map((col, idx) => (
                                    <th key={idx} className="p-2 font-semibold text-slate-200">
                                      {col}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-850">
                                {evalResult.userRows.map((row, rIdx) => (
                                  <tr key={rIdx} className="hover:bg-slate-900/50">
                                    <td className="p-2 text-slate-600 text-[10px]">{rIdx + 1}</td>
                                    {row.map((val, cIdx) => (
                                      <td key={cIdx} className="p-2 text-slate-300">
                                        {val === null || val === undefined ? (
                                          <span className="text-slate-600 italic">NULL</span>
                                        ) : (
                                          String(val)
                                        )}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Schema & Table Inspector Drawer */}
                <div className="w-full lg:w-72 bg-slate-900/70 flex flex-col shrink-0 border-t lg:border-t-0 border-slate-800">
                  <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300 flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-emerald-400" />
                      Schema Inspector
                    </span>
                    <span className="text-[10px] text-slate-500">Seed Tables</span>
                  </div>

                  {/* Schema selector tabs */}
                  {question.schemas && question.schemas.length > 1 && (
                    <div className="flex gap-1 p-2 bg-slate-950/60 border-b border-slate-800 overflow-x-auto">
                      {question.schemas.map((s) => (
                        <button
                          key={s}
                          onClick={() => setActiveSchemaTab(s)}
                          className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap transition ${
                            activeSchemaTab === s
                              ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Table and column definitions list */}
                  <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3">
                    {activeSchemaInfo ? (
                      <>
                        <div className="text-[11px] text-slate-400 bg-slate-950/50 p-2 rounded border border-slate-850">
                          <strong className="text-emerald-400">{activeSchemaInfo.id}:</strong> {activeSchemaInfo.description}
                        </div>

                        {activeSchemaInfo.tableDetails.map((tbl) => (
                          <div key={tbl.tableName} className="rounded-lg border border-slate-800 bg-slate-950/60 p-2.5 text-xs">
                            <div className="flex items-center gap-1.5 font-bold text-slate-200 mb-1.5 font-mono">
                              <Table className="w-3.5 h-3.5 text-emerald-400" />
                              <span>{tbl.tableName}</span>
                            </div>
                            <div className="space-y-1 pl-2">
                              {tbl.columns.map((col) => (
                                <div key={col.name} className="flex items-center justify-between font-mono text-[11px] text-slate-400">
                                  <span className={col.isPk ? 'text-amber-400 font-semibold' : 'text-slate-300'}>
                                    {col.name}
                                    {col.isPk && ' (PK)'}
                                  </span>
                                  <span className="text-[10px] text-slate-500">{col.type}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="text-xs text-slate-500 p-2">No schema metadata found.</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Content area: MCQ */}
            {question.type === 'mcq' && (
              <div className="flex-1 min-h-0 overflow-y-auto p-6 max-w-3xl mx-auto w-full">
                <div className="space-y-3 mb-6">
                  {question.options &&
                    Object.entries(question.options).map(([key, text]) => {
                      const isSelected = selectedOption === key;
                      const isAnswer = question.answer && key.toUpperCase() === question.answer.toUpperCase();
                      let style = 'border-slate-800 bg-slate-950/60 hover:bg-slate-800/60 text-slate-200';
                      
                      if (submittedMcq) {
                        if (isAnswer) {
                          style = 'border-emerald-500/50 bg-emerald-500/15 text-emerald-200';
                        } else if (isSelected && !isAnswer) {
                          style = 'border-rose-500/50 bg-rose-500/15 text-rose-200';
                        }
                      } else if (isSelected) {
                        style = 'border-emerald-500 bg-emerald-500/10 text-emerald-200';
                      }

                      return (
                        <button
                          key={key}
                          onClick={() => handleSelectMcq(key)}
                          disabled={submittedMcq}
                          className={`w-full p-4 rounded-xl border text-left text-sm font-medium transition flex items-start gap-3 ${style}`}
                        >
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            isSelected ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {key}
                          </div>
                          <span className="pt-0.5 leading-relaxed">{text}</span>
                        </button>
                      );
                    })}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <div className="text-xs text-slate-400">
                    {!submittedMcq ? (
                      <span>Select an option and click Submit Answer.</span>
                    ) : selectedOption?.toUpperCase() === question.answer?.toUpperCase() ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        Correct Answer! Well done!
                      </span>
                    ) : (
                      <span className="text-rose-400 font-bold flex items-center gap-1.5">
                        <XCircle className="w-4 h-4" />
                        Incorrect. The correct answer was option {question.answer}.
                      </span>
                    )}
                  </div>

                  {!submittedMcq ? (
                    <button
                      onClick={handleSubmitMcq}
                      disabled={!selectedOption}
                      className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition disabled:opacity-40"
                    >
                      Submit Answer
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSubmittedMcq(false);
                        setSelectedOption(null);
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Retry Question
                    </button>
                  )}
                </div>

                {submittedMcq && question.explanation && (
                  <div className="mt-6 p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <h4 className="text-xs font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
                      <Lightbulb className="w-4 h-4" />
                      Detailed Interview Explanation
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {question.explanation}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Content area: Concept */}
            {question.type === 'concept' && (
              <div className="flex-1 min-h-0 overflow-y-auto p-6 max-w-3xl mx-auto w-full space-y-5">
                {/* Scratchpad for notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2">
                    Your Candidate Talking Points / Rough Notes:
                  </label>
                  <textarea
                    value={conceptNote}
                    onChange={(e) => setConceptNote(e.target.value)}
                    placeholder="Structure your thoughts here as if answering in an interview (e.g. definitions, trade-offs, internal storage)..."
                    className="w-full h-32 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                {/* Model Answer Toggle */}
                <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
                  <button
                    onClick={() => setShowModelAnswer(!showModelAnswer)}
                    className="w-full p-4 flex items-center justify-between text-left text-xs font-bold text-slate-200 hover:bg-slate-800/40 transition"
                  >
                    <span className="flex items-center gap-2 text-emerald-400">
                      <BookOpen className="w-4 h-4" />
                      Interviewer Model Answer & Evaluation Key
                    </span>
                    {showModelAnswer ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                  </button>

                  {showModelAnswer && question.model_answer && (
                    <div className="p-4 border-t border-slate-800 bg-slate-950 text-xs text-slate-200 leading-relaxed font-sans">
                      {question.model_answer}
                    </div>
                  )}
                </div>

                {/* Mastered toggle */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <span className="text-xs text-slate-400">
                    Mark this concept as mastered once you can explain it effortlessly in an interview.
                  </span>

                  <button
                    onClick={handleToggleConceptMastered}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                      isMastered
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    <CheckCircle2 className={`w-4 h-4 ${isMastered ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span>{isMastered ? 'Mastered' : 'Mark as Mastered'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
