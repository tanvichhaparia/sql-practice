import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Clock, 
  Sparkles, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RotateCcw, 
  Award, 
  Layers, 
  ChevronRight,
  TrendingUp,
  FileCheck2,
  Check
} from 'lucide-react';
import { MockOA, Problem, UserProgress } from '../types';
import { mockOas } from '../data/mockOas';
import { getProblemById } from '../data/problems';
import { ProblemWorkspace } from './ProblemWorkspace';

interface TimedMockOaViewProps {
  progress: UserProgress;
  onSaveDraft: (problemId: string, code: string) => void;
  onRecordSuccess: (problemId: string, allPassed: boolean) => void;
  onRecordOaAttempt: (attempt: UserProgress['oaAttempts'][0]) => void;
  onOpenUnlockModal: () => void;
}

export const TimedMockOaView: React.FC<TimedMockOaViewProps> = ({
  progress,
  onSaveDraft,
  onRecordSuccess,
  onRecordOaAttempt,
  onOpenUnlockModal,
}) => {
  // Active Assessment State
  const [activeOa, setActiveOa] = useState<MockOA | null>(null);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(45 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [scorecardData, setScorecardData] = useState<{
    score: number;
    total: number;
    timeSpentSeconds: number;
    problemResults: Record<string, boolean>;
  } | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer countdown effect
  useEffect(() => {
    if (timerRunning && secondsRemaining > 0) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            handleFinishAssessment();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning, secondsRemaining]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartAssessment = (oa: MockOA) => {
    if (oa.isPro && !progress.isProUnlocked) {
      onOpenUnlockModal();
      return;
    }

    setActiveOa(oa);
    setCurrentProblemIndex(0);
    setSecondsRemaining(oa.durationMinutes * 60);
    setTimerRunning(true);
    setIsCompleted(false);
    setScorecardData(null);
  };

  const handleFinishAssessment = () => {
    if (!activeOa) return;
    setTimerRunning(false);

    // Compute score based on edge-case problem pass state
    const results: Record<string, boolean> = {};
    let passedCount = 0;

    activeOa.problemIds.forEach((probId) => {
      const status = progress.problemStatus[probId];
      const isPassed = status === 'passed_all_edge_cases';
      results[probId] = isPassed;
      if (isPassed) passedCount++;
    });

    const timeSpent = activeOa.durationMinutes * 60 - secondsRemaining;
    const finalScorecard = {
      score: passedCount,
      total: activeOa.problemIds.length,
      timeSpentSeconds: timeSpent,
      problemResults: results,
    };

    setScorecardData(finalScorecard);
    setIsCompleted(true);

    // Record attempt in user progress
    onRecordOaAttempt({
      oaId: activeOa.id,
      date: new Date().toISOString(),
      score: passedCount,
      total: activeOa.problemIds.length,
      timeSpentSeconds: timeSpent,
      problemResults: results,
    });

    if (passedCount >= 2) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  // If in active OA session -> Render Full-screen Assessment Environment
  if (activeOa && !isCompleted) {
    const currentProbId = activeOa.problemIds[currentProblemIndex];
    const activeProblem = getProblemById(currentProbId);
    const isUrgent = secondsRemaining < 5 * 60; // under 5 mins

    return (
      <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-[#080d1a] text-slate-100">
        {/* Top Assessment Header */}
        <div className="h-14 border-b border-white/10 bg-[#0b1329] px-4 sm:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/10 text-white">
              {activeOa.company}
            </span>
            <span className="font-extrabold text-white text-sm hidden sm:inline">
              {activeOa.title}
            </span>
          </div>

          {/* Question Nav Pills */}
          <div className="flex items-center gap-1.5">
            {activeOa.problemIds.map((probId, idx) => {
              const isSelected = idx === currentProblemIndex;
              const isPassed = progress.problemStatus[probId] === 'passed_all_edge_cases';

              return (
                <button
                  key={probId}
                  onClick={() => setCurrentProblemIndex(idx)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#635bff] text-white shadow-md shadow-[#635bff]/30'
                      : 'bg-white/[0.05] text-slate-400 hover:text-white hover:bg-white/[0.08]'
                  }`}
                >
                  <span>Q{idx + 1}</span>
                  {isPassed && <Check className="w-3 h-3 text-emerald-400" />}
                </button>
              );
            })}
          </div>

          {/* Timer & Finish button */}
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-mono font-bold ${
                isUrgent
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse'
                  : 'bg-white/[0.05] text-white border-white/10'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-[#00d4ff]" />
              <span>{formatTimer(secondsRemaining)} remaining</span>
            </div>

            <button
              onClick={() => {
                if (window.confirm('Submit assessment now and generate official OA scorecard?')) {
                  handleFinishAssessment();
                }
              }}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold stripe-btn-primary shadow-md shadow-[#635bff]/30"
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Submit OA</span>
            </button>
          </div>
        </div>

        {/* Problem Workspace for active question */}
        {activeProblem ? (
          <div className="flex-1 min-h-0">
            <ProblemWorkspace
              key={activeProblem.id}
              problem={activeProblem}
              progress={progress}
              onSaveDraft={onSaveDraft}
              onRecordSuccess={onRecordSuccess}
              isInMockOa={true}
            />
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400">Problem not found.</div>
        )}
      </div>
    );
  }

  // If Completed -> Show Final OA Scorecard
  if (isCompleted && scorecardData && activeOa) {
    const minsTaken = Math.floor(scorecardData.timeSpentSeconds / 60);
    const secsTaken = scorecardData.timeSpentSeconds % 60;
    const isPassing = scorecardData.score >= 2;

    return (
      <div className="max-w-4xl mx-auto px-4 py-10 animate-fade-in text-slate-100">
        <div className="bg-[#0b1329] border border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl">
          {/* Header Banner */}
          <div
            className={`p-8 text-center border-b ${
              isPassing
                ? 'bg-gradient-to-b from-emerald-950/40 to-[#0b1329] border-emerald-500/30'
                : 'bg-gradient-to-b from-amber-950/40 to-[#0b1329] border-amber-500/30'
            }`}
          >
            <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 bg-[#080d1a] border border-white/10 shadow-lg">
              <Award
                className={`w-8 h-8 ${
                  isPassing ? 'text-emerald-400' : 'text-amber-400'
                }`}
              />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {activeOa.title} Scorecard
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Assessment completed in {minsTaken}m {secsTaken}s
            </p>

            <div className="mt-6 flex items-center justify-center gap-6">
              <div className="bg-[#080d1a] border border-white/10 rounded-2xl px-8 py-4 text-center">
                <div
                  className={`text-4xl font-extrabold font-mono ${
                    isPassing ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {scorecardData.score} / {scorecardData.total}
                </div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                  Problems Mastered
                </div>
              </div>

              <div className="bg-[#080d1a] border border-white/10 rounded-2xl px-8 py-4 text-center">
                <div className="text-4xl font-extrabold font-mono text-white">
                  {Math.round((scorecardData.score / scorecardData.total) * 100)}%
                </div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                  Assessment Accuracy
                </div>
              </div>
            </div>
          </div>

          {/* Problem-by-problem breakdown */}
          <div className="p-6 sm:p-8 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Diagnostic Edge-Case Breakdown
            </h3>

            <div className="space-y-3">
              {activeOa.problemIds.map((probId, idx) => {
                const prob = getProblemById(probId);
                const passed = scorecardData.problemResults[probId];

                return (
                  <div
                    key={probId}
                    className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          passed
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        }`}
                      >
                        {passed ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-400" />
                        )}
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-white">
                          Question {idx + 1}: {prob?.title}
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                          {prob?.businessContext}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        passed
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {passed ? '4/4 Passed' : 'Failed Edge Cases'}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Pattern-level Feedback */}
            <div className="bg-[#080d1a] border border-white/10 rounded-2xl p-5 mt-6">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#00d4ff]" />
                Interviewer Feedback & Pattern Recommendations
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {scorecardData.score === 3
                  ? 'Outstanding performance. Your queries demonstrate thorough defense against NULL arithmetic traps, tie-breaking ordering bugs, and zero-division errors. You are ready for high-bar company rounds.'
                  : 'Good attempt. Several hidden edge cases failed on tie-breaking ordering or LEFT JOIN filtering conditions. Review the Pattern Cheat Sheets to strengthen Gaps & Islands and Window Function mechanics before retaking.'}
              </p>
            </div>

            {/* Actions */}
            <div className="pt-4 flex items-center justify-between">
              <button
                onClick={() => {
                  setActiveOa(null);
                  setIsCompleted(false);
                }}
                className="text-xs font-semibold px-4 py-2.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 transition"
              >
                Back to Mock OA Catalog
              </button>

              <button
                onClick={() => handleStartAssessment(activeOa)}
                className="flex items-center gap-1.5 text-xs font-bold px-5 py-2.5 rounded-full stripe-btn-primary shadow-md shadow-[#635bff]/30 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake Assessment</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default: Catalog of Mock OAs
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in text-slate-100">
      
      {/* Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-[#0c1328] via-[#090e1f] to-[#0c1630] border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-[#635bff]/15 rounded-full filter blur-[80px] pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-xs font-semibold text-[#00d4ff]">
            <Clock className="w-3.5 h-3.5 text-[#635bff]" />
            <span>45-Minute Company OA Simulator</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">Real Hiring Thresholds</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Timed Company <span className="stripe-accent-gradient">Online Assessments</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Simulate real 45-minute technical interview rounds. Solve 3 domain-specific business problems under countdown pressure with instant benchmark scorecards.
          </p>
        </div>
      </div>

      {/* Mock OA Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mockOas.map((oa) => {
          const isLocked = oa.isPro && !progress.isProUnlocked;
          const problems = oa.problemIds.map((id) => getProblemById(id)).filter(Boolean);

          return (
            <div
              key={oa.id}
              className={`rounded-3xl border flex flex-col justify-between overflow-hidden shadow-xl transition-all duration-200 hover:-translate-y-1 ${
                isLocked
                  ? 'bg-white/[0.02] border-white/10'
                  : 'bg-[#0b1329]/90 border-white/10 hover:border-[#635bff]/60 backdrop-blur-xl'
              }`}
            >
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/10 text-white">
                      {oa.company}
                    </span>
                    {oa.isPro && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#635bff]/20 text-[#00d4ff] border border-[#635bff]/30 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#00d4ff]" />
                        PRO
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-xs text-slate-400 font-mono">
                    <Clock className="w-3.5 h-3.5 text-[#00d4ff]" />
                    <span>{oa.durationMinutes} mins</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-extrabold text-white text-lg leading-snug">
                    {oa.title}
                  </h3>
                  <p className="text-xs text-[#00d4ff] font-semibold mt-1">
                    Target Role: {oa.role}
                  </p>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {oa.description}
                  </p>
                </div>

                {/* Problem checklist */}
                <div className="pt-3 border-t border-white/5 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Included Questions (3):
                  </span>
                  {problems.map((p, idx) => (
                    <div
                      key={p?.id}
                      className="flex items-center justify-between text-xs text-slate-300"
                    >
                      <span className="truncate max-w-[200px]">
                        {idx + 1}. {p?.title}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">
                        {p?.difficulty}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Start Button or Pro Lock */}
              <div className="p-4 bg-[#080d1a] border-t border-white/10">
                {isLocked ? (
                  <button
                    onClick={onOpenUnlockModal}
                    className="w-full py-2.5 rounded-full bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Unlock Test (₹199 Pass)</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleStartAssessment(oa)}
                    className="w-full py-2.5 rounded-full stripe-btn-primary font-bold text-xs flex items-center justify-center gap-2 transition shadow-md shadow-[#635bff]/25"
                  >
                    <span>Start 45-Min Test</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
