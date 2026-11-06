import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Bookmark, 
  CheckCircle2, 
  Clock, 
  Lock, 
  ArrowRight, 
  Sparkles,
  Building2,
  Tag,
  AlertCircle
} from 'lucide-react';
import { Problem, UserProgress, Difficulty } from '../types';
import { allProblems, getAllPatterns, getAllDomains } from '../data/problems';

interface PracticeBankViewProps {
  progress: UserProgress;
  onSelectProblem: (problemId: string) => void;
  onToggleBookmark: (problemId: string) => void;
  onOpenUnlockModal: () => void;
}

export const PracticeBankView: React.FC<PracticeBankViewProps> = ({
  progress,
  onSelectProblem,
  onToggleBookmark,
  onOpenUnlockModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedDomain, setSelectedDomain] = useState<string>('All');
  const [selectedPattern, setSelectedPattern] = useState<string>('All');
  const [selectedTier, setSelectedTier] = useState<'All' | 'Free' | 'Pro'>('All');
  const [onlyBookmarks, setOnlyBookmarks] = useState(false);

  const patterns = useMemo(() => getAllPatterns(), []);
  const domains = useMemo(() => getAllDomains(), []);

  const filteredProblems = useMemo(() => {
    return allProblems.filter((p) => {
      // Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(query);
        const matchesDomain = p.domain.toLowerCase().includes(query);
        const matchesCompany = p.companyTags.some((c) => c.toLowerCase().includes(query));
        const matchesPattern = p.patterns.some((pat) => pat.toLowerCase().includes(query));
        if (!matchesTitle && !matchesDomain && !matchesCompany && !matchesPattern) {
          return false;
        }
      }

      // Difficulty
      if (selectedDifficulty !== 'All' && p.difficulty !== selectedDifficulty) {
        return false;
      }

      // Domain
      if (selectedDomain !== 'All' && p.domain !== selectedDomain) {
        return false;
      }

      // Pattern
      if (selectedPattern !== 'All' && !p.patterns.includes(selectedPattern)) {
        return false;
      }

      // Tier
      if (selectedTier === 'Free' && p.isPro) return false;
      if (selectedTier === 'Pro' && !p.isPro) return false;

      // Bookmarks
      if (onlyBookmarks && !progress.bookmarks.includes(p.id)) {
        return false;
      }

      return true;
    });
  }, [
    searchQuery,
    selectedDifficulty,
    selectedDomain,
    selectedPattern,
    selectedTier,
    onlyBookmarks,
    progress.bookmarks,
  ]);

  const difficultyBadgeColor = (diff: Difficulty) => {
    switch (diff) {
      case 'Easy':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'Medium':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'Hard':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    }
  };

  const getStatusBadge = (problemId: string) => {
    const status = progress.problemStatus[problemId];
    if (status === 'passed_all_edge_cases') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
          <CheckCircle2 className="w-3 h-3" />
          4/4 Edge Cases Passed
        </span>
      );
    }
    if (status === 'passed_sample') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-400 bg-teal-500/15 border border-teal-500/30 px-2 py-0.5 rounded-full">
          <CheckCircle2 className="w-3 h-3" />
          Sample Passed (1/4)
        </span>
      );
    }
    if (status === 'attempted') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-400 bg-blue-500/15 border border-blue-500/30 px-2 py-0.5 rounded-full">
          <Clock className="w-3 h-3" />
          Attempted
        </span>
      );
    }
    return (
      <span className="text-[11px] font-medium text-slate-500 bg-slate-800/60 border border-slate-700/60 px-2 py-0.5 rounded-full">
        Unsolved
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header Banner */}
      <div className="mb-6 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                  100% In-Browser SQL Assessment Engine
                </span>
                <span className="text-slate-400 text-xs">
                  • 4-Stage Edge-Case Grader
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
                Business SQL Online Assessment (OA) Bank
              </h1>
              <p className="text-sm text-slate-400 mt-1 max-w-2xl">
                Real candidate test questions from Flipkart, Swiggy, Razorpay, PhonePe & Uber. 
                Queries are graded against 4 hidden edge-case datasets (NULL traps, ties, zero-division, and date boundaries).
              </p>
            </div>

            {/* Quick stats counter */}
            <div className="flex items-center gap-4 bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
              <div className="text-center px-2">
                <div className="text-2xl font-black text-emerald-400">
                  {Object.values(progress.problemStatus).filter((s) => s === 'passed_all_edge_cases').length}
                </div>
                <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">
                  4/4 Solved
                </div>
              </div>
              <div className="w-px h-8 bg-slate-800" />
              <div className="text-center px-2">
                <div className="text-2xl font-black text-slate-200">
                  {allProblems.length}
                </div>
                <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">
                  Total Questions
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6 space-y-3 shadow-md">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search problems by title, company (Razorpay, Swiggy...), domain, or pattern..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          {/* Bookmark filter */}
          <button
            onClick={() => setOnlyBookmarks(!onlyBookmarks)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition ${
              onlyBookmarks
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${onlyBookmarks ? 'fill-amber-400' : ''}`} />
            <span>Bookmarked ({progress.bookmarks.length})</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
          {/* Difficulty */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
              Difficulty:
            </span>
            {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                  selectedDifficulty === diff
                    ? 'bg-slate-700 text-slate-100'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>

          <div className="w-px h-4 bg-slate-800 mx-1 hidden sm:block" />

          {/* Tier */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
              Tier:
            </span>
            {(['All', 'Free', 'Pro'] as const).map((tier) => (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                  selectedTier === tier
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>

          <div className="w-px h-4 bg-slate-800 mx-1 hidden sm:block" />

          {/* Domain Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Domain:
            </span>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All Domains</option>
              {domains.map((dom) => (
                <option key={dom} value={dom}>
                  {dom}
                </option>
              ))}
            </select>
          </div>

          {/* Pattern Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Pattern:
            </span>
            <select
              value={selectedPattern}
              onChange={(e) => setSelectedPattern(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All Patterns</option>
              {patterns.map((pat) => (
                <option key={pat} value={pat}>
                  {pat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Problem Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProblems.map((problem) => {
          const isLocked = problem.isPro && !progress.isProUnlocked;
          const isBookmarked = progress.bookmarks.includes(problem.id);

          return (
            <div
              key={problem.id}
              className={`flex flex-col justify-between rounded-xl border transition-all duration-200 relative group overflow-hidden ${
                isLocked
                  ? 'bg-slate-900/40 border-slate-800/60 opacity-90'
                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:shadow-xl hover:shadow-emerald-950/20'
              }`}
            >
              {/* Card Top */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${difficultyBadgeColor(
                        problem.difficulty
                      )}`}
                    >
                      {problem.difficulty}
                    </span>
                    {problem.isPro && (
                      <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        PRO
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md">
                      {problem.domain.split('/')[0]}
                    </span>
                  </div>

                  {/* Bookmark Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleBookmark(problem.id);
                    }}
                    className="text-slate-500 hover:text-amber-400 p-1 transition"
                  >
                    <Bookmark
                      className={`w-4 h-4 ${
                        isBookmarked ? 'fill-amber-400 text-amber-400' : ''
                      }`}
                    />
                  </button>
                </div>

                {/* Title */}
                <h3 className="font-bold text-slate-100 text-base group-hover:text-emerald-400 transition mb-2 leading-snug">
                  {problem.title}
                </h3>

                {/* Company Tags */}
                <div className="flex items-center gap-1.5 flex-wrap mb-3 text-xs text-slate-400">
                  <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  {problem.companyTags.map((tag) => (
                    <span
                      key={tag}
                      className="px-1.5 py-0.5 rounded bg-slate-800/60 text-slate-300 text-[10px]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Patterns */}
                <div className="flex items-center gap-1 flex-wrap text-xs text-slate-400">
                  <Tag className="w-3 h-3 text-slate-500 shrink-0" />
                  {problem.patterns.map((pat) => (
                    <span
                      key={pat}
                      className="text-[10px] text-slate-400 bg-slate-950/70 border border-slate-800 px-1.5 py-0.5 rounded"
                    >
                      {pat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Bottom / Action */}
              <div className="px-5 py-3.5 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between gap-3">
                {/* Status */}
                {getStatusBadge(problem.id)}

                {/* Solve Button or Pro Lock */}
                {isLocked ? (
                  <button
                    onClick={onOpenUnlockModal}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/20 transition"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    Unlock Pro
                  </button>
                ) : (
                  <button
                    onClick={() => onSelectProblem(problem.id)}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-sm shadow-emerald-500/20"
                  >
                    <span>Solve in IDE</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredProblems.length === 0 && (
        <div className="text-center py-16 bg-slate-900/50 border border-slate-800 rounded-xl mt-6">
          <AlertCircle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <h3 className="text-base font-semibold text-slate-300">No problems found</h3>
          <p className="text-sm text-slate-500 mt-1">
            Try adjusting your search filters or difficulty parameters.
          </p>
        </div>
      )}
    </div>
  );
};
