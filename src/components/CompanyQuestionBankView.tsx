import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Sparkles, 
  Lock, 
  CheckCircle2, 
  Code, 
  HelpCircle, 
  BookOpen, 
  Building2, 
  Database,
  ArrowRight,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal
} from 'lucide-react';
import { allCompanyQuestions, CompanyQuestion } from '../data/companyQuestions';
import { UserProgress } from '../types';
import { CompanyQuestionModal } from './CompanyQuestionModal';

interface CompanyQuestionBankViewProps {
  progress: UserProgress;
  onProgressUpdate: () => void;
  onOpenUnlockModal: () => void;
  preselectedCompany?: string;
}

const COMPANIES = [
  { code: 'ALL', name: 'All 26 Companies', tier: 'All' },
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

const ITEMS_PER_PAGE = 20;

export const CompanyQuestionBankView: React.FC<CompanyQuestionBankViewProps> = ({
  progress,
  onProgressUpdate,
  onOpenUnlockModal,
  preselectedCompany = 'ALL',
}) => {
  const [selectedCompany, setSelectedCompany] = useState<string>(preselectedCompany);
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [accessFilter, setAccessFilter] = useState<'ALL' | 'FREE' | 'PRO'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SOLVED' | 'UNSOLVED'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);

  const [activeQuestion, setActiveQuestion] = useState<CompanyQuestion | null>(null);

  useEffect(() => {
    if (preselectedCompany) {
      setSelectedCompany(preselectedCompany);
    }
  }, [preselectedCompany]);

  // Compute completion lookups
  const solvedQueries = progress.companyBankProgress?.solvedQueries || {};
  const answeredMcqs = progress.companyBankProgress?.mcqAnswers || {};
  const masteredConcepts = progress.companyBankProgress?.masteredConcepts || {};

  const isCompleted = (qid: string) => {
    return !!solvedQueries[qid] || !!answeredMcqs[qid] || !!masteredConcepts[qid];
  };

  const filteredQuestions = useMemo(() => {
    return allCompanyQuestions.filter((q) => {
      if (selectedCompany !== 'ALL' && q.company !== selectedCompany) {
        return false;
      }
      if (selectedType !== 'ALL' && q.type !== selectedType) {
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
      if (statusFilter === 'SOLVED' && !isCompleted(q.id)) {
        return false;
      }
      if (statusFilter === 'UNSOLVED' && isCompleted(q.id)) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matches =
          q.question.toLowerCase().includes(query) ||
          q.topic.toLowerCase().includes(query) ||
          q.company_name.toLowerCase().includes(query) ||
          q.id.toLowerCase().includes(query) ||
          (q.schemas && q.schemas.some((s) => s.toLowerCase().includes(query)));
        if (!matches) return false;
      }
      return true;
    });
  }, [selectedCompany, selectedType, selectedDifficulty, accessFilter, statusFilter, searchQuery, solvedQueries, answeredMcqs, masteredConcepts]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCompany, selectedType, selectedDifficulty, accessFilter, statusFilter, searchQuery]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / ITEMS_PER_PAGE));
  const paginatedQuestions = filteredQuestions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const resetAllFilters = () => {
    setSelectedCompany('ALL');
    setSelectedType('ALL');
    setSelectedDifficulty('ALL');
    setAccessFilter('ALL');
    setStatusFilter('ALL');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleOpenQuestion = (question: CompanyQuestion) => {
    if (question.isPro && !progress.isProUnlocked) {
      onOpenUnlockModal();
      return;
    }
    setActiveQuestion(question);
  };

  const hasActiveFilters = 
    selectedCompany !== 'ALL' || 
    selectedType !== 'ALL' || 
    selectedDifficulty !== 'ALL' || 
    accessFilter !== 'ALL' || 
    statusFilter !== 'ALL' || 
    searchQuery.trim() !== '';

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-5 animate-fade-in">
      {/* Top Bar: Title & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">
              Structured Catalog
            </span>
            <span className="text-xs text-slate-400">534 Total • 236 Free Tier</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-100">
            Company Question Bank
          </h1>
        </div>

        {/* Search bar & Filter toggle for mobile */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by topic, keyword, schema, or ID..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden p-2 rounded-xl bg-slate-800 text-slate-300 border border-slate-700"
            title="Toggle Filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Layout: Sidebar + Question List */}
      <div className="flex flex-col md:flex-row gap-5 items-start">
        {/* Left Filter Sidebar */}
        <div className={`w-full md:w-64 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4 shrink-0 shadow-lg ${
          showMobileFilters ? 'block' : 'hidden md:block'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-emerald-400" />
              Filter Catalog
            </span>
            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Question Type Filter */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Question Type
            </label>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {[
                { id: 'ALL', label: 'All (534)' },
                { id: 'query', label: 'Queries (412)' },
                { id: 'mcq', label: 'MCQs (54)' },
                { id: 'concept', label: 'Concepts (68)' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedType(t.id)}
                  className={`py-1.5 px-2 rounded-lg text-left font-medium transition ${
                    selectedType === t.id
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Target Company Track Filter */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Company Track
            </label>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              {COMPANIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Difficulty
            </label>
            <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              {['ALL', 'Easy', 'Medium', 'Hard'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`flex-1 py-1 rounded-lg font-medium transition text-[11px] ${
                    selectedDifficulty === diff
                      ? 'bg-slate-800 text-emerald-400 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Access Filter (Free vs Pro) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Placement Access
            </label>
            <div className="space-y-1 text-xs">
              <button
                onClick={() => setAccessFilter('ALL')}
                className={`w-full py-1.5 px-2.5 rounded-lg text-left font-medium transition ${
                  accessFilter === 'ALL'
                    ? 'bg-slate-800 text-slate-200 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All Questions (534)
              </button>
              <button
                onClick={() => setAccessFilter('FREE')}
                className={`w-full py-1.5 px-2.5 rounded-lg text-left font-medium transition flex items-center justify-between ${
                  accessFilter === 'FREE'
                    ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Free Tier Only</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400">236</span>
              </button>
              <button
                onClick={() => setAccessFilter('PRO')}
                className={`w-full py-1.5 px-2.5 rounded-lg text-left font-medium transition flex items-center justify-between ${
                  accessFilter === 'PRO'
                    ? 'bg-blue-500/20 text-blue-300 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Pro Tier Only</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400">298</span>
              </button>
            </div>
          </div>

          {/* Solved Status Filter */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Status
            </label>
            <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              {[
                { id: 'ALL', label: 'All' },
                { id: 'SOLVED', label: 'Solved' },
                { id: 'UNSOLVED', label: 'Unsolved' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStatusFilter(s.id as any)}
                  className={`flex-1 py-1 rounded-lg font-medium transition text-[11px] ${
                    statusFilter === s.id
                      ? 'bg-slate-800 text-emerald-400 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Main Questions Panel */}
        <div className="flex-1 min-w-0 space-y-3 w-full">
          {/* Active Filter summary & Results count */}
          <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-900/60 border border-slate-800 px-4 py-2.5 rounded-xl">
            <div className="flex items-center gap-2">
              <span>
                Showing <strong className="text-slate-200">{filteredQuestions.length}</strong> matching questions
              </span>
              {selectedCompany !== 'ALL' && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {selectedCompany}
                </span>
              )}
            </div>

            <div className="text-[11px] text-slate-500">
              Page {currentPage} of {totalPages}
            </div>
          </div>

          {/* Structured Question List (Row/Card Format) */}
          <div className="space-y-2">
            {paginatedQuestions.map((q) => {
              const solved = isCompleted(q.id);
              const isLocked = q.isPro && !progress.isProUnlocked;

              return (
                <div
                  key={q.id}
                  onClick={() => handleOpenQuestion(q)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group ${
                    solved
                      ? 'bg-emerald-950/10 border-emerald-500/25 hover:border-emerald-500/50'
                      : isLocked
                      ? 'bg-slate-900/40 border-slate-850 hover:border-slate-800'
                      : 'bg-slate-900 border-slate-800 hover:border-emerald-500/40 hover:bg-slate-850/70'
                  }`}
                >
                  {/* Left: Status, ID, Title & Schema */}
                  <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                    <div className="mt-0.5 sm:mt-0 shrink-0">
                      {solved ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      ) : isLocked ? (
                        <div className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center">
                          <Lock className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-mono text-[10px]">
                          {q.type === 'query' ? <Code className="w-3.5 h-3.5" /> : q.type === 'mcq' ? <HelpCircle className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-300 font-semibold border border-slate-800">
                          {q.id}
                        </span>
                        <span className="text-xs font-bold text-slate-200">
                          {q.company_name}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          • {q.topic}
                        </span>
                      </div>

                      <h3 className="text-xs sm:text-sm font-semibold text-slate-100 group-hover:text-emerald-300 transition line-clamp-1">
                        {q.question}
                      </h3>
                    </div>
                  </div>

                  {/* Right: Badges & Action */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase ${
                      q.type === 'query'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : q.type === 'mcq'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                    }`}>
                      {q.type}
                    </span>

                    <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                      q.difficulty === 'easy'
                        ? 'text-emerald-400 bg-emerald-500/10'
                        : q.difficulty === 'medium'
                        ? 'text-amber-400 bg-amber-500/10'
                        : 'text-rose-400 bg-rose-500/10'
                    }`}>
                      {q.difficulty}
                    </span>

                    <button className="px-3 py-1 rounded-lg bg-slate-800 group-hover:bg-emerald-500 group-hover:text-slate-950 text-slate-300 font-bold text-xs transition flex items-center gap-1">
                      <span>{solved ? 'Review' : 'Solve'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredQuestions.length === 0 && (
            <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <Database className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-slate-300">No questions match your current filters</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">Try clearing your search query or adjusting the selected company and question type.</p>
              <button
                onClick={resetAllFilters}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-850 disabled:opacity-40 flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = i + 1;
                  if (totalPages > 5 && currentPage > 3) {
                    pageNum = Math.min(totalPages - 4 + i, Math.max(1, currentPage - 2 + i));
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-7 h-7 rounded-lg font-mono text-xs font-bold transition ${
                        currentPage === pageNum
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-850 disabled:opacity-40 flex items-center gap-1"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

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
