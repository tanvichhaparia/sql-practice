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
  Code,
  Check,
  Zap,
  Target
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in text-slate-100">
      
      {/* Stripe-style Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-[#0c1328] via-[#090e1f] to-[#0c1630] border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-[#635bff]/15 rounded-full filter blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-72 h-72 bg-[#00d4ff]/10 rounded-full filter blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-xs font-semibold text-[#00d4ff]">
              <Compass className="w-3.5 h-3.5 text-[#635bff]" />
              <span>Structured Placement Tracks</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300">5 Curated Milestones</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Placement Prep <span className="stripe-accent-gradient">Roadmaps</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Step-by-step tracks tailored to campus recruitment formats: Service (TCS NQT, Infosys, Wipro), Tier-1 Product (Amazon, Google, Flipkart), and Fintech BFSI (Goldman Sachs). Master questions in logical sequence.
            </p>
          </div>

          {!progress.isProUnlocked && activeRoadmap.tier === 'Pro Tier' && (
            <button
              onClick={onOpenUnlockModal}
              className="px-5 py-3 rounded-full stripe-btn-primary font-bold text-xs shadow-xl shadow-[#635bff]/30 transition flex items-center gap-2 shrink-0"
            >
              <Sparkles className="w-4 h-4 text-[#00d4ff]" />
              <span>Unlock All Tracks (₹199)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Roadmap Selection Cards (Tabs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
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
              className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between relative group ${
                isSelected
                  ? 'bg-white/[0.08] border-[#635bff] shadow-xl shadow-[#635bff]/15 -translate-y-0.5'
                  : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-2.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    r.tier === 'Free Tier' 
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                      : 'bg-[#635bff]/15 text-[#00d4ff] border-[#635bff]/30'
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
                  isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'
                }`}>
                  {r.title}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {r.shortDescription}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5">
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span>Progress</span>
                  <span className="font-mono font-bold text-white">{completedCount}/{qIds.length}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#635bff] to-[#00d4ff] rounded-full transition-all duration-300"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Roadmap Detailed View */}
      <div className="bg-[#0b1329]/90 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8 backdrop-blur-xl">
        
        {/* Active Track Title & Description */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-white font-mono font-bold border border-white/15">
                {activeRoadmap.difficulty}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#00d4ff]" />
                Est. {activeRoadmap.estimatedWeeks} Weeks ({activeRoadmap.steps.length} Milestones)
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {activeRoadmap.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              {activeRoadmap.detailedDescription}
            </p>
          </div>

          {/* Track Progress Card */}
          <div className="p-5 rounded-2xl bg-[#080d1a] border border-white/10 shrink-0 w-full md:w-72 shadow-inner">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
              <span>Track Progress</span>
              <span className="text-[#00d4ff] font-mono font-bold">{roadmapPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/[0.05] overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-[#635bff] to-[#00d4ff] rounded-full transition-all duration-500"
                style={{ width: `${roadmapPercent}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>{completedRoadmapQuestions} of {totalRoadmapQuestions} solved</span>
              {roadmapPercent === 100 && (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" />
                  Track Mastered
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Milestone Steps Timeline */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Target className="w-3.5 h-3.5 text-[#635bff]" />
            Sequential Milestones ({activeRoadmap.steps.length} Steps)
          </h3>

          <div className="space-y-3.5">
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
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isExpanded 
                      ? 'bg-white/[0.04] border-white/20 shadow-xl' 
                      : 'bg-white/[0.02] border-white/10 hover:border-white/15'
                  }`}
                >
                  {/* Step Header Accordion Toggle */}
                  <button
                    onClick={() => setExpandedStepId(isExpanded ? '' : step.id)}
                    className="w-full p-5 flex items-center justify-between text-left hover:bg-white/[0.02] transition gap-4"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
                        isStepDone 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm' 
                          : 'bg-[#635bff]/20 text-indigo-300 border border-[#635bff]/40'
                      }`}>
                        {isStepDone ? <Check className="w-4 h-4 text-emerald-400" /> : sIdx + 1}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2.5">
                          <h4 className="text-sm font-bold text-white truncate">
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
                      <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400">
                        <span className="text-white font-bold">{stepCompletedCount}</span>
                        <span>/</span>
                        <span>{step.questionIds.length} Qs</span>
                      </div>
                      <div className="p-1 rounded-full bg-white/[0.05] text-slate-400">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </div>
                    </div>
                  </button>

                  {/* Step Details & Question Cards */}
                  {isExpanded && (
                    <div className="p-5 pt-0 border-t border-white/5 space-y-4 bg-[#080d1a]/50">
                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-300 leading-relaxed mt-4">
                        <span className="font-bold text-[#00d4ff] uppercase tracking-wider block text-[10px] mb-1">
                          Milestone Objective
                        </span>
                        {step.description}
                      </div>

                      {/* Question Grid inside this Milestone */}
                      <div className="space-y-2">
                        {stepQuestions.map((q) => {
                          const done = isQuestionCompleted(q.id);
                          const isLocked = q.isPro && !progress.isProUnlocked;

                          return (
                            <div
                              key={q.id}
                              onClick={() => handleOpenQuestion(q)}
                              className={`p-3.5 rounded-xl border transition flex items-center justify-between gap-3 cursor-pointer group ${
                                done 
                                  ? 'bg-emerald-500/[0.04] border-emerald-500/25 hover:border-emerald-500/40' 
                                  : isLocked
                                  ? 'bg-white/[0.01] border-white/5 opacity-80 hover:opacity-100 hover:border-white/15'
                                  : 'bg-white/[0.03] border-white/10 hover:border-[#635bff]/50 hover:bg-white/[0.06]'
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                                  done 
                                    ? 'bg-emerald-500/20 text-emerald-400' 
                                    : 'bg-white/[0.05] text-slate-400'
                                }`}>
                                  {done ? <Check className="w-3.5 h-3.5" /> : <Code className="w-3.5 h-3.5" />}
                                </div>

                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono font-bold text-slate-400">
                                      {q.id}
                                    </span>
                                    <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-white/10 text-slate-200">
                                      {q.company_name}
                                    </span>
                                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                      q.difficulty === 'easy' ? 'text-emerald-400 bg-emerald-500/10' :
                                      q.difficulty === 'medium' ? 'text-amber-400 bg-amber-500/10' :
                                      'text-rose-400 bg-rose-500/10'
                                    }`}>
                                      {q.difficulty}
                                    </span>
                                  </div>
                                  <p className="text-xs font-semibold text-white group-hover:text-indigo-200 transition truncate mt-0.5">
                                    {q.question}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {isLocked ? (
                                  <span className="px-2 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold flex items-center gap-1">
                                    <Lock className="w-3 h-3" />
                                    <span>Pro Pass</span>
                                  </span>
                                ) : (
                                  <button className="px-3 py-1 rounded-full bg-white/[0.06] group-hover:bg-[#635bff] group-hover:text-white text-slate-300 text-xs font-semibold transition flex items-center gap-1">
                                    <span>{done ? 'Review' : 'Solve'}</span>
                                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
                                  </button>
                                )}
                              </div>
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
