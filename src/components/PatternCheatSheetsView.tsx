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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in text-slate-100">
      
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-[#0c1328] via-[#090e1f] to-[#0c1630] border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-[#635bff]/15 rounded-full filter blur-[80px] pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-xs font-semibold text-[#00d4ff]">
            <Sparkles className="w-3.5 h-3.5 text-[#635bff]" />
            <span>High-Signal SQL Patterns</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">5 Canonical Architectures</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            OA Pattern <span className="stripe-accent-gradient">Cheat Sheets</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            The 5 core SQL query structures tested in 90% of Data Analyst, Business Analyst, and Analytics Engineering assessments. Master these templates to navigate edge-case traps cleanly.
          </p>
        </div>
      </div>

      {/* Cheat Sheet Cards */}
      <div className="space-y-6">
        {cheatSheets.map((sheet) => (
          <div
            key={sheet.id}
            className="rounded-3xl bg-[#0b1329]/90 border border-white/10 overflow-hidden shadow-xl backdrop-blur-xl transition hover:border-white/20"
          >
            {/* Card Header */}
            <div className="p-6 border-b border-white/10 bg-white/[0.02]">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="px-3 py-1 rounded-full bg-[#635bff]/20 text-[#00d4ff] text-xs font-bold border border-[#635bff]/30">
                  {sheet.category}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {sheet.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                {sheet.summary}
              </p>
            </div>

            {/* Card Body */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Business Scenario */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Real Business Context
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-[#080d1a] p-4 rounded-2xl border border-white/10">
                  {sheet.businessScenario}
                </p>
              </div>

              {/* Syntax & Code Example */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#00d4ff]">
                    Canonical SQL Pattern Template
                  </h4>
                  <button
                    onClick={() => handleCopyCode(sheet.id, sheet.exampleSql)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-slate-300 hover:text-white transition"
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

                <pre className="p-5 bg-[#070b18] border border-white/10 rounded-2xl text-xs sm:text-sm font-mono text-indigo-200 overflow-x-auto leading-relaxed shadow-inner">
                  {sheet.exampleSql}
                </pre>
              </div>

              {/* Common Pitfalls Checklist */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-3 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  Common OA Pitfalls & Why Queries Break
                </h4>
                <ul className="space-y-2">
                  {sheet.commonPitfalls.map((pitfall, idx) => (
                    <li
                      key={idx}
                      className="text-xs sm:text-sm text-slate-300 flex items-start gap-3 bg-rose-950/20 border border-rose-900/30 p-3.5 rounded-xl"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 mt-2" />
                      <span className="leading-relaxed">{pitfall}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommended Problems */}
              <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                <span className="text-xs font-semibold text-slate-400">
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
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-[#635bff] text-slate-200 hover:text-white text-xs font-semibold transition"
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
