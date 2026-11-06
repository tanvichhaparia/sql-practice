import React from 'react';
import { 
  Compass, 
  Database, 
  Layers, 
  Clock, 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Flame, 
  Building2, 
  ShieldCheck, 
  TrendingUp,
  Award
} from 'lucide-react';
import { UserProgress } from '../types';
import { AuthUser } from '../services/auth';

interface HomeDashboardViewProps {
  progress: UserProgress;
  currentUser: AuthUser | null;
  onNavigate: (mode: 'roadmaps' | 'question-bank' | 'practice' | 'mock-oa' | 'cheat-sheets') => void;
  onSelectCompany: (companyCode: string) => void;
  onOpenUnlockModal: () => void;
}

const FEATURED_COMPANIES = [
  { code: 'TCS', name: 'TCS NQT', count: 32, tier: 'Free Tier', badge: 'Mass Hiring' },
  { code: 'INF', name: 'Infosys DSE', count: 28, tier: 'Free Tier', badge: 'Specialist' },
  { code: 'AMZ', name: 'Amazon', count: 30, tier: 'Pro Tier', badge: 'FAANG' },
  { code: 'GOOG', name: 'Google', count: 12, tier: 'Pro Tier', badge: 'Top Tier' },
  { code: 'GS', name: 'Goldman Sachs', count: 25, tier: 'Pro Tier', badge: 'Fintech BFSI' },
  { code: 'FKT', name: 'Flipkart', count: 22, tier: 'Pro Tier', badge: 'E-Commerce' },
  { code: 'SWG', name: 'Swiggy', count: 21, tier: 'Pro Tier', badge: 'Quick Commerce' },
  { code: 'DEL', name: 'Deloitte', count: 20, tier: 'Pro Tier', badge: 'Consulting' },
];

export const HomeDashboardView: React.FC<HomeDashboardViewProps> = ({
  progress,
  currentUser,
  onNavigate,
  onSelectCompany,
  onOpenUnlockModal,
}) => {
  const solvedQueries = Object.keys(progress.companyBankProgress?.solvedQueries || {}).length;
  const answeredMcqs = Object.keys(progress.companyBankProgress?.mcqAnswers || {}).length;
  const masteredConcepts = Object.values(progress.companyBankProgress?.masteredConcepts || {}).filter(Boolean).length;
  const solvedOaProblems = Object.values(progress.problemStatus).filter((s) => s === 'passed_all_edge_cases').length;

  const totalCompleted = solvedQueries + answeredMcqs + masteredConcepts;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Welcome Hero Section */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/50 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Zero-Lag In-Browser SQL Assessment Engine</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-slate-100 tracking-tight">
              {currentUser 
                ? `Welcome back, ${currentUser.name.split(' ')[0]}!` 
                : 'Master SQL for Indian Tech Placements'}
            </h1>

            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              {currentUser?.college ? `${currentUser.college} • ` : ''}
              534 real company questions across 26 tracks, 10 realistic schemas, and multi-stage edge case simulators — 100% offline via WebAssembly.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('roadmaps')}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center gap-2"
              >
                <Compass className="w-4 h-4 fill-slate-950" />
                <span>Start Guided Roadmap</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onNavigate('question-bank')}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition flex items-center gap-2"
              >
                <Database className="w-4 h-4 text-emerald-400" />
                <span>Browse 534 Questions</span>
              </button>
            </div>
          </div>

          {/* Quick Stats Card */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 shrink-0 w-full md:w-72 shadow-inner">
            <div className="flex items-center justify-between pb-3 border-b border-slate-850">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Placement Readiness</span>
              <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                <Flame className="w-4 h-4 fill-amber-400" />
                <span>{progress.streak.count}d streak</span>
              </div>
            </div>

            <div className="space-y-3 pt-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Total Solved</span>
                <span className="font-mono font-bold text-emerald-400">{totalCompleted} / 534</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round((totalCompleted / 534) * 100))}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-850">
                  <span className="text-slate-500 block">Queries</span>
                  <span className="font-bold text-slate-200">{solvedQueries} / 412</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-850">
                  <span className="text-slate-500 block">MCQs</span>
                  <span className="font-bold text-slate-200">{answeredMcqs} / 54</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Core Portals (Clean & Structured) */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span>Where Would You Like to Start?</span>
          </h2>
          <p className="text-xs text-slate-400">Choose between structured learning tracks, the complete question catalog, or realistic test simulations.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Portal 1: Roadmaps */}
          <div
            onClick={() => onNavigate('roadmaps')}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850/80 transition cursor-pointer group flex flex-col justify-between shadow-lg"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-105 transition">
                <Compass className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">Guided Tracks</div>
              <h3 className="text-base font-bold text-slate-100 group-hover:text-emerald-300 transition">
                Placement Roadmaps
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Step-by-step tracks for TCS/Infosys, Amazon/Product, Fintech BFSI, and a 30-Day plan.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between text-xs font-semibold text-emerald-400">
              <span>5 Curated Tracks</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Portal 2: Question Bank */}
          <div
            onClick={() => onNavigate('question-bank')}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850/80 transition cursor-pointer group flex flex-col justify-between shadow-lg"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-3 group-hover:scale-105 transition">
                <Database className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">Filterable Catalog</div>
              <h3 className="text-base font-bold text-slate-100 group-hover:text-blue-300 transition">
                500+ Company Bank
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Filter by 26 companies, question types (Query, MCQ, Concept), and difficulty.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between text-xs font-semibold text-blue-400">
              <span>534 Practice Qs</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Portal 3: OA Simulator */}
          <div
            onClick={() => onNavigate('practice')}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850/80 transition cursor-pointer group flex flex-col justify-between shadow-lg"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-105 transition">
                <Layers className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">Deep Edge Cases</div>
              <h3 className="text-base font-bold text-slate-100 group-hover:text-purple-300 transition">
                OA Simulator (12 Real OAs)
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                4-Stage hidden edge-case testing engine with diagnostic error hints for complex traps.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between text-xs font-semibold text-purple-400">
              <span>{solvedOaProblems} / 12 Mastered</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Portal 4: Timed Mock OAs */}
          <div
            onClick={() => onNavigate('mock-oa')}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850/80 transition cursor-pointer group flex flex-col justify-between shadow-lg"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-105 transition">
                <Clock className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">Timed Environment</div>
              <h3 className="text-base font-bold text-slate-100 group-hover:text-amber-300 transition">
                Timed Mock Exams
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Simulate 45-minute timed placement pressure with live scorecard and SLA benchmarks.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between text-xs font-semibold text-amber-400">
              <span>3 Full Assessments</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>
        </div>
      </div>

      {/* Featured Placement Tracks Spotlight */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-400" />
              <span>Target Company Tracks</span>
            </h2>
            <p className="text-xs text-slate-400">Explore questions filtered directly for your upcoming campus drive or interview.</p>
          </div>

          <button
            onClick={() => onNavigate('question-bank')}
            className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
          >
            <span>View All 26 Tracks</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {FEATURED_COMPANIES.map((comp) => (
            <div
              key={comp.code}
              onClick={() => {
                onSelectCompany(comp.code);
                onNavigate('question-bank');
              }}
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-850 transition cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                    {comp.code}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                    comp.tier === 'Free Tier' ? 'text-emerald-400 bg-emerald-500/10' : 'text-blue-400 bg-blue-500/10'
                  }`}>
                    {comp.tier}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-200 group-hover:text-emerald-300 transition">
                  {comp.name}
                </h4>
                <span className="text-[11px] text-slate-400 mt-0.5 block">{comp.badge}</span>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-850 flex items-center justify-between text-xs text-slate-400">
                <span>{comp.count} Questions</span>
                <span className="text-emerald-400 text-[11px] font-semibold group-hover:underline">Solve →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
