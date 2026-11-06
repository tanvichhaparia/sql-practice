import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Sparkles, 
  Lock, 
  CheckCircle2, 
  HelpCircle, 
  Code, 
  BookOpen, 
  Building2, 
  Database,
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { allCompanyQuestions, CompanyQuestion, QuestionType, QuestionDifficulty, QuestionTier } from '../data/companyQuestions';
import { UserProgress } from '../types';
import { CompanyQuestionModal } from './CompanyQuestionModal';

interface CompanyQuestionBankViewProps {
  progress: UserProgress;
  onProgressUpdate: () => void;
  onOpenUnlockModal: () => void;
}

const COMPANIES = [
  { code: 'ALL', name: 'All 26 Tracks', tier: 'All' },
  { code: 'CORE', name: 'Core SQL Pack', tier: 'Fundamentals' },
  { code: 'TCS', name: 'TCS', tier: 'IT Services' },
  { code: 'INF', name: 'Infosys', tier: 'IT Services' },
  { code: 'WIP', name: 'Wipro', tier: 'IT Services' },
  { code: 'CTS', name: 'Cognizant', tier: 'IT Services' },
  { code: 'HCL', name: 'HCLTech', tier: 'IT Services' },
  { code: 'ACN', name: 'Accenture', tier: 'IT Services' },
  { code: 'CAP', name: 'Capgemini', tier: 'IT Services' },
  { code: 'OIT', name: 'Tech Mahindra / LTI', tier: 'IT Services' },
  { code: 'AMZ', name: 'Amazon', tier: 'Product / Startup' },
  { code: 'GOOG', name: 'Google', tier: 'Product / Startup' },
  { code: 'MSFT', name: 'Microsoft', tier: 'Product / Startup' },
  { code: 'FKT', name: 'Flipkart', tier: 'Product / Startup' },
  { code: 'GS', name: 'Goldman Sachs / JPM', tier: 'Finance (BFSI)' },
  { code: 'SWG', name: 'Swiggy', tier: 'Product / Startup' },
  { code: 'ZMT', name: 'Zomato', tier: 'Product / Startup' },
  { code: 'PHP', name: 'PhonePe', tier: 'Product / Startup' },
  { code: 'PTM', name: 'Paytm', tier: 'Product / Startup' },
  { code: 'RZP', name: 'Razorpay', tier: 'Product / Startup' },
  { code: 'UBR', name: 'Uber & Ola', tier: 'Product / Startup' },
  { code: 'DEL', name: 'Deloitte', tier: 'Consulting & Big 4' },
  { code: 'BIG4', name: 'EY / PwC / KPMG', tier: 'Consulting & Big 4' },
  { code: 'WMT', name: 'Walmart Tech', tier: 'Product / Startup' },
  { code: 'MYN', name: 'Myntra & Meesho', tier: 'Product / Startup' },
  { code: 'ZOH', name: 'Zoho', tier: 'Product / Startup' },
  { code: 'FWS', name: 'Freshworks & SaaS', tier: 'Product / Startup' },
];

export const CompanyQuestionBankView: React.FC<CompanyQuestionBankViewProps> = ({
  progress,
  onProgressUpdate,
  onOpenUnlockModal,
}) => {
  const [selectedCompany, setSelectedCompany] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedTier, setSelectedTier] = useState<string>('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [accessFilter, setAccessFilter] = useState<'ALL' | 'FREE' | 'PRO'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [activeQuestion, setActiveQuestion] = useState<CompanyQuestion | null>(null);

  // Compute counts
  const solvedQueries = progress.companyBankProgress?.solvedQueries || {};
  const answeredMcqs = progress.companyBankProgress?.mcqAnswers || {};
  const masteredConcepts = progress.companyBankProgress?.masteredConcepts || {};

  const totalSolvedQueriesCount = Object.keys(solvedQueries).length;
  const totalAnsweredMcqsCount = Object.keys(answeredMcqs).length;
  const totalMasteredConceptsCount = Object.values(masteredConcepts).filter(Boolean).length;

  const filteredQuestions = useMemo(() => {
    return allCompanyQuestions.filter((q) => {
      if (selectedCompany !== 'ALL' && q.company !== selectedCompany) {
        return false;
      }
      if (selectedType !== 'ALL' && q.type !== selectedType) {
        return false;
      }
      if (selectedTier !== 'ALL' && q.tier !== selectedTier) {
        return false;
      }
      if (selectedDifficulty !== 'ALL' && q.difficulty !== selectedDifficulty.toLowerCase()) {
        return false;
      }
      if (accessFilter === 'FREE' && q.isPro) {
        return false;
      }
      if (accessFilter === 'PRO' && !q.isPro) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesText =
          q.question.toLowerCase().includes(query) ||
          q.topic.toLowerCase().includes(query) ||
          q.company_name.toLowerCase().includes(query) ||
          q.id.toLowerCase().includes(query) ||
          (q.schemas && q.schemas.some((s) => s.toLowerCase().includes(query)));
        if (!matchesText) return false;
      }
      return true;
    });
  }, [selectedCompany, selectedType, selectedTier, selectedDifficulty, accessFilter, searchQuery]);

  const handleOpenQuestion = (question: CompanyQuestion) => {
    if (question.isPro && !progress.isProUnlocked) {
      onOpenUnlockModal();
      return;
    }
    setActiveQuestion(question);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 animate-fade-in">
      {/* Hero Banner with Stats */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5" />
                  534 Practice Questions • 26 Company Tracks
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 text-[11px] font-semibold">
                  236 Free Questions
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
                Company Placement Question Bank
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Comprehensive interview & OA problems from top tech startups, FAANG, consulting, BFSI, and mass recruitment leaders. Run queries against 10 realistic schemas in WASM SQLite.
              </p>
            </div>

            {/* Quick Unlock Banner if not pro */}
            {!progress.isProUnlocked && (
              <div className="flex flex-col items-end">
                <button
                  onClick={onOpenUnlockModal}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 fill-slate-950" />
                  <span>Unlock All 534 Questions (₹199 Student Pass)</span>
                </button>
                <span className="text-[10px] text-slate-400 mt-1">
                  Nominal One-Time Student Rate • No recurring fee
                </span>
              </div>
            )}
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-[11px] text-slate-400 font-medium">SQL Queries Solved</div>
              <div className="text-xl font-bold text-slate-100 mt-0.5 flex items-baseline gap-1">
                <span className="text-emerald-400">{totalSolvedQueriesCount}</span>
                <span className="text-xs text-slate-500">/ 412</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-[11px] text-slate-400 font-medium">MCQs Completed</div>
              <div className="text-xl font-bold text-slate-100 mt-0.5 flex items-baseline gap-1">
                <span className="text-blue-400">{totalAnsweredMcqsCount}</span>
                <span className="text-xs text-slate-500">/ 54</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-[11px] text-slate-400 font-medium">Concepts Mastered</div>
              <div className="text-xl font-bold text-slate-100 mt-0.5 flex items-baseline gap-1">
                <span className="text-purple-400">{totalMasteredConceptsCount}</span>
                <span className="text-xs text-slate-500">/ 68</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-[11px] text-slate-400 font-medium">Free Access Available</div>
              <div className="text-xl font-bold text-emerald-400 mt-0.5 flex items-baseline gap-1">
                <span>236 Qs</span>
                <span className="text-xs text-slate-500 font-normal">(Core & IT Services)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Company Tracks Quick Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
          <span className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
            Select Company Placement Track:
          </span>
          <span className="text-slate-500">{COMPANIES.length - 1} Company Tracks</span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {COMPANIES.map((c) => {
            const isSelected = selectedCompany === c.code;
            const count = c.code === 'ALL' 
              ? allCompanyQuestions.length 
              : allCompanyQuestions.filter((q) => q.company === c.code).length;

            return (
              <button
                key={c.code}
                onClick={() => setSelectedCompany(c.code)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-2 border shrink-0 ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850 hover:text-slate-100'
                }`}
              >
                <span>{c.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search and Advanced Filters */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by problem, topic (e.g. Window Functions, Self Join), schema, or ID..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Access filter (Free vs Pro) */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setAccessFilter('ALL')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                accessFilter === 'ALL' ? 'bg-slate-800 text-slate-100' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Access
            </button>
            <button
              onClick={() => setAccessFilter('FREE')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                accessFilter === 'FREE' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Free Tier Only (236)
            </button>
            <button
              onClick={() => setAccessFilter('PRO')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                accessFilter === 'PRO' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Pro Only (298)
            </button>
          </div>
        </div>

        {/* Filter Badges Row */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/60 text-xs">
          {/* Question Type filter */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-slate-500 font-semibold mr-1">Type:</span>
            {['ALL', 'query', 'mcq', 'concept'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition capitalize ${
                  selectedType === type
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950'
                }`}
              >
                {type === 'ALL' ? 'All Types' : type.toUpperCase()}
              </button>
            ))}
          </div>

          <span className="text-slate-700 hidden sm:inline">|</span>

          {/* Difficulty filter */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-slate-500 font-semibold mr-1">Difficulty:</span>
            {['ALL', 'Easy', 'Medium', 'Hard'].map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-2 py-1 rounded-md text-[11px] font-medium transition ${
                  selectedDifficulty === diff
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>

          <span className="text-slate-700 hidden sm:inline">|</span>

          {/* Tier filter */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-slate-500 font-semibold mr-1">Tier:</span>
            {['ALL', 'Fundamentals', 'IT Services', 'Product / Startup', 'Finance (BFSI)', 'Consulting & Big 4'].map((tier) => (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={`px-2 py-1 rounded-md text-[11px] font-medium transition ${
                  selectedTier === tier
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          Showing <strong className="text-slate-200">{filteredQuestions.length}</strong> questions
        </span>
        <span>
          Click any card to open the interactive solver
        </span>
      </div>

      {/* Questions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredQuestions.map((q) => {
          const isSolved = solvedQueries[q.id];
          const isAnsweredMcq = !!answeredMcqs[q.id];
          const isMastered = !!masteredConcepts[q.id];
          const isLocked = q.isPro && !progress.isProUnlocked;

          return (
            <div
              key={q.id}
              onClick={() => handleOpenQuestion(q)}
              className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between group relative ${
                isLocked
                  ? 'bg-slate-900/40 border-slate-850 hover:border-slate-750 opacity-90'
                  : 'bg-slate-900 border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850/80 shadow-sm'
              }`}
            >
              <div>
                {/* Card header */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 font-semibold">
                      {q.id}
                    </span>
                    <span className="text-xs font-bold text-slate-200 truncate max-w-[130px]">
                      {q.company}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Type badge */}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase ${
                      q.type === 'query'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : q.type === 'mcq'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                    }`}>
                      {q.type}
                    </span>

                    {/* Difficulty pill */}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                      q.difficulty === 'easy'
                        ? 'text-emerald-400 bg-emerald-500/10'
                        : q.difficulty === 'medium'
                        ? 'text-amber-400 bg-amber-500/10'
                        : 'text-rose-400 bg-rose-500/10'
                    }`}>
                      {q.difficulty}
                    </span>

                    {/* Pro Lock */}
                    {isLocked ? (
                      <span className="text-amber-400/80 p-0.5" title="Pro Placement Pass Required">
                        <Lock className="w-3.5 h-3.5" />
                      </span>
                    ) : q.isPro ? (
                      <span className="text-emerald-400 p-0.5" title="Pro Unlocked">
                        <Sparkles className="w-3.5 h-3.5" />
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Problem Statement */}
                <h3 className="text-xs font-semibold text-slate-200 group-hover:text-emerald-300 transition line-clamp-2 leading-relaxed mb-2">
                  {q.question}
                </h3>
              </div>

              {/* Card Footer: Topic and Schema Tags */}
              <div className="pt-2 border-t border-slate-800/60 mt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span className="truncate max-w-[150px] text-slate-400 font-medium">
                  {q.topic}
                </span>

                <div className="flex items-center gap-1.5">
                  {q.schemas && q.schemas.length > 0 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                      {q.schemas.join(', ')}
                    </span>
                  )}

                  {/* Completion indicator */}
                  {(isSolved || isAnsweredMcq || isMastered) && (
                    <span className="text-emerald-400 flex items-center gap-0.5 text-[10px] font-bold">
                      <CheckCircle2 className="w-3 h-3" />
                      Done
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredQuestions.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800">
          <Database className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-300 mb-1">No questions match your filter criteria</h3>
          <p className="text-xs text-slate-500">Try clearing the search box or adjusting the company and difficulty filters.</p>
        </div>
      )}

      {/* Solver Modal */}
      <CompanyQuestionModal
        question={activeQuestion}
        onClose={() => setActiveQuestion(null)}
        progress={progress}
        onProgressUpdate={onProgressUpdate}
        onOpenUnlockModal={onOpenUnlockModal}
      />
    </div>
  );
};
