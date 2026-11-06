import React, { useState } from 'react';
import { 
  BookOpen, 
  Copy, 
  Check, 
  AlertTriangle, 
  ArrowRight, 
  Terminal, 
  Sparkles,
  Layers
} from 'lucide-react';
import { cheatSheets } from '../data/cheatSheets';
import { getProblemById } from '../data/problems';

interface PatternCheatSheetsViewProps {
  onSelectProblem: (problemId: string) => void;
}

export const PatternCheatSheetsView: React.FC<PatternCheatSheetsViewProps> = ({
  onSelectProblem,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              Interactive OA Patterns Reference
            </span>
            <span className="text-slate-400 text-xs">• 5 High-Signal Architectures</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            SQL Online Assessment Pattern Cheat Sheets
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            The 5 core SQL query structures tested in 90% of Data Analyst, Business Analyst, and Analytics Engineering
            assessments. Master these patterns to navigate edge-case traps cleanly.
          </p>
        </div>
      </div>

      {/* Cheat Sheet Cards */}
      <div className="space-y-6">
        {cheatSheets.map((sheet) => (
          <div
            key={sheet.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg"
          >
            {/* Card Header */}
            <div className="p-6 border-b border-slate-800/80 bg-slate-900/60">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-emerald-400 text-xs font-semibold">
                  {sheet.category}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-100">
                {sheet.title}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {sheet.summary}
              </p>
            </div>

            {/* Card Body */}
            <div className="p-6 space-y-5">
              {/* Business Scenario */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Real Business Context
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  {sheet.businessScenario}
                </p>
              </div>

              {/* Syntax & Code Example */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Canonical SQL Pattern Template
                  </h4>
                  <button
                    onClick={() => handleCopyCode(sheet.id, sheet.exampleSql)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-emerald-400 transition"
                  >
                    {copiedId === sheet.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy SQL</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
                  {sheet.exampleSql}
                </pre>
              </div>

              {/* Common Pitfalls Checklist */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Common OA Pitfalls & Why Queries Break
                </h4>
                <ul className="space-y-1.5">
                  {sheet.commonPitfalls.map((pitfall, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-slate-400 flex items-start gap-2 bg-rose-950/15 border border-rose-900/30 p-2.5 rounded-lg"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 mt-1.5" />
                      <span>{pitfall}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommended Problems */}
              <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-slate-400 font-medium">
                  Practice this pattern in problem bank:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {sheet.recommendedProblems.map((probId) => {
                    const prob = getProblemById(probId);
                    if (!prob) return null;
                    return (
                      <button
                        key={probId}
                        onClick={() => onSelectProblem(probId)}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold transition"
                      >
                        <span>{prob.title}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
