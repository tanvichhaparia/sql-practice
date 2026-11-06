import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { PracticeBankView } from './components/PracticeBankView';
import { ProblemWorkspace } from './components/ProblemWorkspace';
import { TimedMockOaView } from './components/TimedMockOaView';
import { PatternCheatSheetsView } from './components/PatternCheatSheetsView';
import { LicenseUnlockModal } from './components/LicenseUnlockModal';
import { BackupRestoreModal } from './components/BackupRestoreModal';
import { 
  loadUserProgress, 
  saveProblemDraft, 
  recordProblemSuccess, 
  toggleBookmark, 
  toggleDemoPro, 
  recordOaAttempt 
} from './services/storage';
import { allProblems, getProblemById } from './data/problems';
import { UserProgress } from './types';

export const App: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'practice' | 'mock-oa' | 'cheat-sheets'>('practice');
  const [activeProblemId, setActiveProblemId] = useState<string | null>(null);
  const [progress, setProgress] = useState<UserProgress>(loadUserProgress());

  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  // Sync progress changes
  const reloadProgress = () => {
    setProgress(loadUserProgress());
  };

  const handleSelectProblem = (problemId: string) => {
    const prob = getProblemById(problemId);
    if (!prob) return;

    if (prob.isPro && !progress.isProUnlocked) {
      setIsUnlockModalOpen(true);
      return;
    }

    setActiveProblemId(problemId);
    setActiveMode('practice');
  };

  const handleSaveDraft = (problemId: string, code: string) => {
    saveProblemDraft(problemId, code);
    setProgress(loadUserProgress());
  };

  const handleRecordSuccess = (problemId: string, allPassed: boolean) => {
    const updated = recordProblemSuccess(problemId, allPassed);
    setProgress(updated);
  };

  const handleToggleBookmark = (problemId: string) => {
    const updated = toggleBookmark(problemId);
    setProgress(updated);
  };

  const handleToggleDemoPro = () => {
    const updated = toggleDemoPro();
    setProgress(updated);
  };

  const handleRecordOaAttempt = (attempt: UserProgress['oaAttempts'][0]) => {
    const updated = recordOaAttempt(attempt);
    setProgress(updated);
  };

  const solvedAllCount = Object.values(progress.problemStatus).filter(
    (s) => s === 'passed_all_edge_cases'
  ).length;

  const currentProblem = activeProblemId ? getProblemById(activeProblemId) : null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500/20 selection:text-emerald-300">
      <Navbar
        activeMode={activeMode}
        setActiveMode={(mode) => {
          setActiveMode(mode);
          if (mode !== 'practice') {
            setActiveProblemId(null);
          }
        }}
        progress={progress}
        totalProblems={allProblems.length}
        solvedAllCount={solvedAllCount}
        onOpenUnlockModal={() => setIsUnlockModalOpen(true)}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        onToggleDemoPro={handleToggleDemoPro}
      />

      <main className="flex-1 min-h-0">
        {activeMode === 'practice' && (
          <>
            {currentProblem ? (
              <ProblemWorkspace
                problem={currentProblem}
                progress={progress}
                onSaveDraft={handleSaveDraft}
                onRecordSuccess={handleRecordSuccess}
                onBackToBank={() => setActiveProblemId(null)}
              />
            ) : (
              <PracticeBankView
                progress={progress}
                onSelectProblem={handleSelectProblem}
                onToggleBookmark={handleToggleBookmark}
                onOpenUnlockModal={() => setIsUnlockModalOpen(true)}
              />
            )}
          </>
        )}

        {activeMode === 'mock-oa' && (
          <TimedMockOaView
            progress={progress}
            onSaveDraft={handleSaveDraft}
            onRecordSuccess={handleRecordSuccess}
            onRecordOaAttempt={handleRecordOaAttempt}
            onOpenUnlockModal={() => setIsUnlockModalOpen(true)}
          />
        )}

        {activeMode === 'cheat-sheets' && (
          <PatternCheatSheetsView
            onSelectProblem={handleSelectProblem}
          />
        )}
      </main>

      {/* Modals */}
      <LicenseUnlockModal
        isOpen={isUnlockModalOpen}
        onClose={() => setIsUnlockModalOpen(false)}
        onUnlockSuccess={reloadProgress}
      />

      <BackupRestoreModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onRestoreSuccess={reloadProgress}
      />
    </div>
  );
};
