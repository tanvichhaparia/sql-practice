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
  SlidersHorizontal,
  X,
  Check
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
  { code: 'ALL', name: 'All 26 Companies' },
  { code: 'AMZ', name: 'Amazon' },
  { code: 'GOOG', name: 'Google' },
  { code: 'GS', name: 'Goldman Sachs' },
  { code: 'FKT', name: 'Flipkart' },
  { code: 'SWG', name: 'Swiggy' },
  { code: 'MSFT', name: 'Microsoft' },
  { code: 'TCS', name: 'TCS NQT' },
  { code: 'INF', name: 'Infosys' },
  { code: 'DEL', name: 'Deloitte' },
  { code: 'PHP', name: 'PhonePe' },
  { code: 'PTM', name: 'Paytm' },
  { code: 'ZMT', name: 'Zomato' },
  { code: 'WIP', name: 'Wipro' },
  { code: 'CTS', name: 'Cognizant' },
  { code: 'ACN', name: 'Accenture' },
  { code: 'CAP', name: 'Capgemini' },
  { code: 'CORE', name: 'Core SQL Pack' },
];

const ITEMS_PER_PAGE = 18;

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

  // Filter pipeline
  const filteredQuestions = useMemo(() => {
    return allCompanyQuestions.filter((q) => {
      // Company
      if (selectedCompany !== 'ALL' && q.company !== selectedCompany) {
        return false;
      }
      // Type
      if (selectedType !== 'ALL' && q.type !== selectedType) {
        return false;
      }
      // Difficulty
      if (selectedDifficulty !== 'ALL' && q.difficulty !== selectedDifficulty) {
        return false;
      }
      // Access (Free vs Pro)
      if (accessFilter === 'FREE' && q.isPro) return false;
      if (accessFilter === 'PRO' && !q.isPro) return false;
      // Status (Solved vs Unsolved)
      const done = isCompleted(q.id);
      if (statusFilter === 'SOLVED' && !done) return false;
      if (statusFilter === 'UNSOLVED' && done) return false;

      // Text Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in text-slate-100">
      
      {/* Top Hero Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0c1328] via-[#090e1f] to-[#0c1630] border border-white/10 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-xs font-semibold text-[#00d4ff]">
            <Database className="w-3.5 h-3.5 text-[#635bff]" />
            <span>Searchable Problem Repository</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">534 Curated Questions</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Company <span className="stripe-accent-gradient">Question Bank</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Practice real queries, MCQs, and concepts tested at 26 tech and consulting companies. Instant query validation in your browser with zero server wait.
          </p>
        </div>

        {/* Global Search Bar */}
        <div className="w-full md:w-80 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topic, company, or schema..."
              className="w-full bg-[#080d1a] border border-white/15 rounded-full pl-10 pr-9 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#635bff] shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modern Filter System: Horizontal Company Scroll + Quick Filter Pills */}
      <div className="space-y-3.5">
        
        {/* Row 1: Company Quick Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {COMPANIES.map((comp) => {
            const isSelected = selectedCompany === comp.code;
            return (
              <button
                key={comp.code}
                onClick={() => setSelectedCompany(comp.code)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 border ${
                  isSelected
                    ? 'bg-[#635bff] text-white border-[#635bff] shadow-md shadow-[#635bff]/30'
                    : 'bg-white/[0.03] text-slate-400 border-white/10 hover:border-white/20 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                {comp.name}
              </button>
            );
          })}
        </div>

        {/* Row 2: Secondary Filters (Type, Difficulty, Tier, Status) */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-md">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            
            {/* Format Filter */}
            <div className="flex items-center gap-1 bg-[#080d1a] p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setSelectedType('ALL')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  selectedType === 'ALL' ? 'bg-white/15 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                All Formats
              </button>
              <button
                onClick={() => setSelectedType('query')}
                className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1 ${
                  selectedType === 'query' ? 'bg-white/15 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Code className="w-3 h-3 text-[#00d4ff]" />
                <span>SQL Queries</span>
              </button>
              <button
                onClick={() => setSelectedType('mcq')}
                className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1 ${
                  selectedType === 'mcq' ? 'bg-white/15 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <HelpCircle className="w-3 h-3 text-amber-400" />
                <span>MCQs</span>
              </button>
              <button
                onClick={() => setSelectedType('concept')}
                className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1 ${
                  selectedType === 'concept' ? 'bg-white/15 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-3 h-3 text-emerald-400" />
                <span>Concepts</span>
              </button>
            </div>

            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="bg-[#080d1a] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-[#635bff]"
            >
              <option value="ALL">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            {/* Access Filter */}
            <select
              value={accessFilter}
              onChange={(e) => setAccessFilter(e.target.value as any)}
              className="bg-[#080d1a] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-[#635bff]"
            >
              <option value="ALL">All Tiers (Free & Pro)</option>
              <option value="FREE">Free Tier Only (236 Qs)</option>
              <option value="PRO">Pro Tier Only (298 Qs)</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-[#080d1a] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-[#635bff]"
            >
              <option value="ALL">All Status</option>
              <option value="SOLVED">Solved</option>
              <option value="UNSOLVED">Unsolved</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                className="text-xs text-slate-400 hover:text-rose-400 transition flex items-center gap-1 px-2 py-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Results Counter */}
          <div className="text-xs font-mono text-slate-400">
            Found <span className="font-bold text-white">{filteredQuestions.length}</span> questions
          </div>
        </div>

      </div>

      {/* Question Cards Grid */}
      {filteredQuestions.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white/[0.02] border border-white/10 text-center space-y-3">
          <Database className="w-8 h-8 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No questions match your current filters</h3>
          <p className="text-xs text-slate-400">Try loosening your search query or reset filters.</p>
          <button
            onClick={resetAllFilters}
            className="px-4 py-2 rounded-full bg-[#635bff] hover:bg-[#5349eb] text-white font-semibold text-xs"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedQuestions.map((q) => {
            const done = isCompleted(q.id);
            const isLocked = q.isPro && !progress.isProUnlocked;

            return (
              <div
                key={q.id}
                onClick={() => handleOpenQuestion(q)}
                className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between cursor-pointer group hover:-translate-y-0.5 ${
                  done 
                    ? 'bg-emerald-500/[0.04] border-emerald-500/30 hover:border-emerald-500/50' 
                    : isLocked
                    ? 'bg-white/[0.02] border-white/10 hover:border-white/20'
                    : 'bg-white/[0.03] border-white/10 hover:border-[#635bff]/60 hover:bg-white/[0.05] shadow-lg'
                }`}
              >
                <div className="space-y-3">
                  {/* Card Header: Company, Difficulty & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-white">
                        {q.company_name}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        q.difficulty === 'easy' ? 'text-emerald-400 bg-emerald-500/10' :
                        q.difficulty === 'medium' ? 'text-amber-400 bg-amber-500/10' :
                        'text-rose-400 bg-rose-500/10'
                      }`}>
                        {q.difficulty}
                      </span>
                    </div>

                    {isLocked ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>Pro</span>
                      </span>
                    ) : done ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>Solved</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-500">
                        {q.id}
                      </span>
                    )}
                  </div>

                  {/* Question Statement */}
                  <p className="text-xs font-semibold text-white group-hover:text-indigo-200 transition line-clamp-3 leading-relaxed">
                    {q.question}
                  </p>
                </div>

                {/* Card Footer: Topic Tag + Action */}
                <div className="pt-4 border-t border-white/5 mt-4 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400 bg-white/[0.04] px-2 py-0.5 rounded-md truncate max-w-[150px]">
                    {q.topic}
                  </span>

                  <button className="flex items-center gap-1 text-[11px] font-bold text-[#00d4ff] group-hover:text-white transition">
                    <span>{done ? 'Review' : 'Solve'}</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>Page <strong className="text-white">{currentPage}</strong> of <strong className="text-white">{totalPages}</strong></span>
            <span className="text-slate-600">•</span>
            <span>Showing {Math.min(filteredQuestions.length, (currentPage - 1) * ITEMS_PER_PAGE + 1)} - {Math.min(filteredQuestions.length, currentPage * ITEMS_PER_PAGE)}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white disabled:opacity-30 disabled:pointer-events-none transition"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white disabled:opacity-30 disabled:pointer-events-none transition"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Active Question Interactive Modal */}
      {activeQuestion && (
        <CompanyQuestionModal
          question={activeQuestion}
          progress={progress}
          onClose={() => {
            setActiveQuestion(null);
            onProgressUpdate();
          }}
          onProgressUpdate={onProgressUpdate}
          onOpenUnlockModal={onOpenUnlockModal}
        />
      )}

    </div>
  );
};
