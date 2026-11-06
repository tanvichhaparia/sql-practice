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
  FileCheck2
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
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning, secondsRemaining]);

  const handleStartAssessment = (oa: MockOA) => {
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

    const timeSpentSeconds = activeOa.durationMinutes * 60 - secondsRemaining;
    const problemResults: Record<string, boolean> = {};
    let score = 0;

    activeOa.problemIds.forEach((pid) => {
      const isPassed = progress.problemStatus[pid] === 'passed_all_edge_cases';
      problemResults[pid] = isPassed;
      if (isPassed) score++;
    });

    const result = {
      score,
      total: activeOa.problemIds.length,
      timeSpentSeconds,
      problemResults,
    };

    setScorecardData(result);
    setIsCompleted(true);

    onRecordOaAttempt({
      oaId: activeOa.id,
      date: new Date().toISOString(),
      timeSpentSeconds,
      score,
      total: activeOa.problemIds.length,
      problemResults,
    });

    if (score === activeOa.problemIds.length) {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
      });
    }
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // If inside an active assessment session
  if (activeOa && !isCompleted) {
    const activeProblemId = activeOa.problemIds[currentProblemIndex];
    const activeProblem = getProblemById(activeProblemId);

    const isUrgent = secondsRemaining < 300; // Under 5 mins

    return (
      <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-slate-950 overflow-hidden">
        {/* Mock OA Assessment Header */}
        <div className="h-12 border-b border-slate-800 bg-slate-900 px-4 flex items-center justify-between shrink-0 shadow-md">
          {/* Company Title */}
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-sm text-slate-100 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              {activeOa.company} OA Simulation
            </span>

            {/* Question Tabs */}
            <div className="flex items-center gap-1 ml-4 bg-slate-950 p-1 rounded-lg border border-slate-800">
              {activeOa.problemIds.map((pid, idx) => {
                const status = progress.problemStatus[pid];
                const isCurrent = currentProblemIndex === idx;

                return (
                  <button
                    key={pid}
                    onClick={() => setCurrentProblemIndex(idx)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition ${
                      isCurrent
                        ? 'bg-emerald-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <span>Q{idx + 1}</span>
                    {status === 'passed_all_edge_cases' && (
                      <CheckCircle2
                        className={`w-3.5 h-3.5 ${
                          isCurrent ? 'text-slate-950' : 'text-emerald-400'
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Timer and Submit OA */}
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-md border text-xs font-mono font-bold ${
                isUrgent
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse'
                  : 'bg-slate-950 text-slate-200 border-slate-800'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTimer(secondsRemaining)} remaining</span>
            </div>

            <button
              onClick={() => {
                if (window.confirm('Submit assessment now and generate official OA scorecard?')) {
                  handleFinishAssessment();
                }
              }}
              className="flex items-center gap-1 px-3 py-1 rounded-md text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-sm shadow-emerald-500/20"
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
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          {/* Header Banner */}
          <div
            className={`p-8 text-center border-b ${
              isPassing
                ? 'bg-gradient-to-b from-emerald-950/60 to-slate-900 border-emerald-500/30'
                : 'bg-gradient-to-b from-amber-950/60 to-slate-900 border-amber-500/30'
            }`}
          >
            <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 bg-slate-950 border border-slate-800 shadow-lg">
              <Award
                className={`w-8 h-8 ${
                  isPassing ? 'text-emerald-400' : 'text-amber-400'
                }`}
              />
            </div>
            <h2 className="text-2xl font-black text-slate-100">
              {activeOa.title} Scorecard
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Assessment completed in {minsTaken}m {secsTaken}s
            </p>

            <div className="mt-6 flex items-center justify-center gap-6">
              <div className="bg-slate-950 border border-slate-800 rounded-xl px-6 py-3 text-center">
                <div
                  className={`text-3xl font-black ${
                    isPassing ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {scorecardData.score} / {scorecardData.total}
                </div>
                <div className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">
                  Problems Passed (4/4)
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl px-6 py-3 text-center">
                <div className="text-3xl font-black text-slate-200">
                  {Math.round((scorecardData.score / scorecardData.total) * 100)}%
                </div>
                <div className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">
                  OA Benchmark Score
                </div>
              </div>
            </div>
          </div>

          {/* Question Breakdown List */}
          <div className="p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Question-by-Question Breakdown
            </h3>

            <div className="space-y-3">
              {activeOa.problemIds.map((pid, idx) => {
                const prob = getProblemById(pid);
                const passed = scorecardData.problemResults[pid];

                return (
                  <div
                    key={pid}
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800"
                  >
                    <div className="flex items-center gap-3">
                      {passed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 font-bold">Q{idx + 1}</span>
                          <h4 className="font-bold text-sm text-slate-200">
                            {prob?.title}
                          </h4>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {prob?.domain} • {prob?.patterns.join(', ')}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
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
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mt-6">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Interviewer Feedback & Pattern Recommendations
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
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
                className="text-xs font-semibold px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
              >
                Back to Mock OA Catalog
              </button>

              <button
                onClick={() => handleStartAssessment(activeOa)}
                className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition"
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      {/* Banner */}
      <div className="mb-6 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              45-Minute Company OA Simulator
            </span>
            <span className="text-slate-400 text-xs">• Real Hiring Thresholds</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Timed Company Online Assessments (OAs)
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Simulate real 45-minute company interview rounds. Solve 3 domain-specific business problems
            under realistic countdown pressure with final benchmark scorecards.
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
              className={`rounded-2xl border flex flex-col justify-between overflow-hidden shadow-lg transition duration-200 ${
                isLocked
                  ? 'bg-slate-900/40 border-slate-800/60 opacity-90'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-800 text-emerald-400">
                      {oa.company}
                    </span>
                    {oa.isPro && (
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        PRO
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-xs text-slate-400 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{oa.durationMinutes} mins</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-extrabold text-slate-100 text-lg leading-snug">
                    {oa.title}
                  </h3>
                  <p className="text-xs text-emerald-400/90 font-medium mt-0.5">
                    Target Role: {oa.role}
                  </p>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {oa.description}
                  </p>
                </div>

                {/* Problem checklist */}
                <div className="pt-2 border-t border-slate-800/80 space-y-2">
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
                      <span className="text-[10px] text-slate-500 font-medium">
                        {p?.difficulty}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Start Button or Pro Lock */}
              <div className="p-4 bg-slate-950/70 border-t border-slate-800">
                {isLocked ? (
                  <button
                    onClick={onOpenUnlockModal}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold border border-emerald-500/20 transition"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Unlock Pro Assessment</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleStartAssessment(oa)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 transition"
                  >
                    <span>Start 45-Min Assessment</span>
                    <ArrowRight className="w-4 h-4" />
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
