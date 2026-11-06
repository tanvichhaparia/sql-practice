import React, { useState } from 'react';
import { 
  MapPin, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  ChevronDown, 
  Sparkles, 
  Lock, 
  Play, 
  BookOpen, 
  Building2, 
  Award, 
  Compass,
  ArrowRight,
  Code
} from 'lucide-react';
import { PLACEMENT_ROADMAPS, Roadmap, RoadmapStep } from '../data/roadmaps';
import { getCompanyQuestionById, CompanyQuestion } from '../data/companyQuestions';
import { UserProgress } from '../types';
import { CompanyQuestionModal } from './CompanyQuestionModal';

interface RoadmapsViewProps {
  progress: UserProgress;
  onProgressUpdate: () => void;
  onOpenUnlockModal: () => void;
}

export const RoadmapsView: React.FC<RoadmapsViewProps> = ({
  progress,
  onProgressUpdate,
  onOpenUnlockModal,
}) => {
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string>('it-services');
  const [expandedStepId, setExpandedStepId] = useState<string>('it-s1');
  const [activeQuestion, setActiveQuestion] = useState<CompanyQuestion | null>(null);

  const activeRoadmap = PLACEMENT_ROADMAPS.find((r) => r.id === selectedRoadmapId) || PLACEMENT_ROADMAPS[0];

  // Calculate solved stats for roadmap
  const solvedQueries = progress.companyBankProgress?.solvedQueries || {};
  const answeredMcqs = progress.companyBankProgress?.mcqAnswers || {};
  const masteredConcepts = progress.companyBankProgress?.masteredConcepts || {};

  const isQuestionCompleted = (qid: string) => {
    return !!solvedQueries[qid] || !!answeredMcqs[qid] || !!masteredConcepts[qid];
  };

  const allRoadmapQuestionIds = activeRoadmap.steps.flatMap((s) => s.questionIds);
  const totalRoadmapQuestions = allRoadmapQuestionIds.length;
  const completedRoadmapQuestions = allRoadmapQuestionIds.filter(isQuestionCompleted).length;
  const roadmapPercent = totalRoadmapQuestions > 0 ? Math.round((completedRoadmapQuestions / totalRoadmapQuestions) * 100) : 0;

  const handleOpenQuestion = (q: CompanyQuestion) => {
    if (q.isPro && !progress.isProUnlocked) {
      onOpenUnlockModal();
      return;
    }
    setActiveQuestion(q);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                Structured Learning Paths
              </span>
              <span className="text-xs text-slate-400">Step-by-step guided milestones</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
              Placement Prep Roadmaps
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Don't get overwhelmed by hundreds of random questions. Choose a specialized track tailored to your campus placement goals and follow structured, sequential milestones.
            </p>
          </div>

          {!progress.isProUnlocked && activeRoadmap.tier === 'Pro Tier' && (
            <button
              onClick={onOpenUnlockModal}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>Unlock Track (₹199 One-Time)</span>
            </button>
          )}
        </div>
      </div>

      {/* Roadmap Selection Cards (Tabs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {PLACEMENT_ROADMAPS.map((r) => {
          const isSelected = selectedRoadmapId === r.id;
          const qIds = r.steps.flatMap((s) => s.questionIds);
          const completedCount = qIds.filter(isQuestionCompleted).length;
          const percent = qIds.length > 0 ? Math.round((completedCount / qIds.length) * 100) : 0;
          const isProLocked = r.tier === 'Pro Tier' && !progress.isProUnlocked;

          return (
            <button
              key={r.id}
              onClick={() => {
                setSelectedRoadmapId(r.id);
                setExpandedStepId(r.steps[0].id);
              }}
              className={`p-4 rounded-xl border text-left transition flex flex-col justify-between relative group ${
                isSelected
                  ? 'bg-slate-850 border-emerald-500 shadow-lg shadow-emerald-500/10'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-850/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    r.tier === 'Free Tier' 
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                      : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                  }`}>
                    {r.tier}
                  </span>

                  {isProLocked ? (
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                  ) : percent === 100 ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : null}
                </div>

                <h3 className={`text-xs font-bold transition leading-snug ${
                  isSelected ? 'text-emerald-300' : 'text-slate-200 group-hover:text-slate-100'
                }`}>
                  {r.title}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  {r.shortDescription}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span>Progress</span>
                  <span className="font-mono font-bold text-slate-200">{completedCount}/{qIds.length}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Roadmap Detailed View */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        {/* Active Track Title & Description */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono font-semibold border border-slate-700">
                {activeRoadmap.difficulty}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Est. {activeRoadmap.estimatedWeeks} Weeks ({activeRoadmap.steps.length} Steps)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-100">
              {activeRoadmap.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
              {activeRoadmap.detailedDescription}
            </p>
          </div>

          {/* Track Progress Card */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 shrink-0 w-full md:w-64">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
              <span>Track Completion</span>
              <span className="text-emerald-400 font-mono">{roadmapPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${roadmapPercent}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>{completedRoadmapQuestions} of {totalRoadmapQuestions} questions solved</span>
              {roadmapPercent === 100 && (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" />
                  Mastered
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Milestone Steps Timeline */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Sequential Milestones ({activeRoadmap.steps.length} Steps)
          </h3>

          <div className="space-y-3">
            {activeRoadmap.steps.map((step, sIdx) => {
              const isExpanded = expandedStepId === step.id;
              const stepQuestions = step.questionIds
                .map((qid) => getCompanyQuestionById(qid))
                .filter((q): q is CompanyQuestion => !!q);

              const stepCompletedCount = step.questionIds.filter(isQuestionCompleted).length;
              const stepPercent = step.questionIds.length > 0 
                ? Math.round((stepCompletedCount / step.questionIds.length) * 100) 
                : 0;

              const isStepDone = stepCompletedCount === step.questionIds.length && step.questionIds.length > 0;

              return (
                <div
                  key={step.id}
                  className={`rounded-xl border transition overflow-hidden ${
                    isExpanded 
                      ? 'bg-slate-950/80 border-slate-700 shadow-lg' 
                      : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Step Header Accordion Toggle */}
                  <button
                    onClick={() => setExpandedStepId(isExpanded ? '' : step.id)}
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-900/50 transition gap-4"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs ${
                        isStepDone 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {isStepDone ? <CheckCircle2 className="w-4 h-4" /> : sIdx + 1}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-100 truncate">
                            {step.title}
                          </h4>
                          {isStepDone && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              Completed
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                          {step.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right hidden sm:block">
                        <div className="text-xs font-mono font-bold text-slate-200">
                          {stepCompletedCount} / {step.questionIds.length} Solved
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Est. {step.estimatedHours} hrs
                        </div>
                      </div>

                      <div className="text-slate-400 p-1">
                        {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                      </div>
                    </div>
                  </button>

                  {/* Step Questions List */}
                  {isExpanded && (
                    <div className="p-4 pt-1 border-t border-slate-800/80 bg-slate-900/40">
                      <div className="text-xs text-slate-400 mb-3 flex items-center justify-between">
                        <span>Milestone Questions ({stepQuestions.length}):</span>
                        <span className="text-[11px] text-slate-500">Click any card to solve in WASM runner</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {stepQuestions.map((q) => {
                          const solved = isQuestionCompleted(q.id);
                          const isLocked = q.isPro && !progress.isProUnlocked;

                          return (
                            <div
                              key={q.id}
                              onClick={() => handleOpenQuestion(q)}
                              className={`p-3 rounded-lg border text-left transition cursor-pointer flex items-center justify-between gap-3 ${
                                solved
                                  ? 'bg-emerald-950/10 border-emerald-500/30 hover:border-emerald-500/50'
                                  : isLocked
                                  ? 'bg-slate-950/40 border-slate-850 hover:border-slate-800'
                                  : 'bg-slate-950 border-slate-800 hover:border-emerald-500/40 hover:bg-slate-900'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                {solved ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                ) : isLocked ? (
                                  <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                                ) : (
                                  <Code className="w-4 h-4 text-slate-500 shrink-0" />
                                )}

                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-mono text-[10px] text-slate-400 font-semibold">
                                      {q.id}
                                    </span>
                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-medium">
                                      {q.company}
                                    </span>
                                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold uppercase ${
                                      q.type === 'query' ? 'text-blue-400' : q.type === 'mcq' ? 'text-amber-400' : 'text-purple-400'
                                    }`}>
                                      {q.type}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-200 truncate mt-0.5 font-medium">
                                    {q.question}
                                  </p>
                                </div>
                              </div>

                              <button className="text-xs text-slate-400 group-hover:text-emerald-400 shrink-0 p-1">
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
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
