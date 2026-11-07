import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HomeDashboardView } from './components/HomeDashboardView';
import { RoadmapsView } from './components/RoadmapsView';
import { CompanyQuestionBankView } from './components/CompanyQuestionBankView';
import { PracticeBankView } from './components/PracticeBankView';
import { ProblemWorkspace } from './components/ProblemWorkspace';
import { TimedMockOaView } from './components/TimedMockOaView';
import { PatternCheatSheetsView } from './components/PatternCheatSheetsView';
import { AuthView } from './components/AuthView';
import { LicenseUnlockModal } from './components/LicenseUnlockModal';
import { BackupRestoreModal } from './components/BackupRestoreModal';
import { Footer } from './components/Footer';
import { LegalComplianceModal, PolicyTab } from './components/LegalComplianceModal';
import { 
  loadUserProgress, 
  saveProblemDraft, 
  recordProblemSuccess, 
  toggleBookmark, 
  toggleDemoPro, 
  recordOaAttempt 
} from './services/storage';
import { getCurrentUser, logoutUser, AuthUser } from './services/auth';
import { allProblems, getProblemById } from './data/problems';
import { UserProgress } from './types';

export const App: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'home' | 'roadmaps' | 'question-bank' | 'practice' | 'mock-oa' | 'cheat-sheets' | 'auth'>('home');
  const [activeProblemId, setActiveProblemId] = useState<string | null>(null);
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>('ALL');
  const [progress, setProgress] = useState<UserProgress>(loadUserProgress());
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(getCurrentUser());

  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [policyModal, setPolicyModal] = useState<{ isOpen: boolean; tab: PolicyTab }>({
    isOpen: false,
    tab: 'terms',
  });

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

  const handleAuthSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    // Redirects to home page on login/signup completion
    setActiveMode('home');
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
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
        currentUser={currentUser}
        onOpenAuth={() => setActiveMode('auth')}
        onLogout={handleLogout}
        onOpenUnlockModal={() => setIsUnlockModalOpen(true)}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        onToggleDemoPro={handleToggleDemoPro}
      />

      <main className="flex-1 min-h-0">
        {/* Home Overview Dashboard */}
        {activeMode === 'home' && (
          <HomeDashboardView
            progress={progress}
            currentUser={currentUser}
            onNavigate={(mode) => setActiveMode(mode)}
            onSelectCompany={(code) => {
              setSelectedCompanyFilter(code);
              setActiveMode('question-bank');
            }}
            onOpenUnlockModal={() => setIsUnlockModalOpen(true)}
          />
        )}

        {/* Structured Placement Roadmaps */}
        {activeMode === 'roadmaps' && (
          <RoadmapsView
            progress={progress}
            onProgressUpdate={reloadProgress}
            onOpenUnlockModal={() => setIsUnlockModalOpen(true)}
          />
        )}

        {/* 500+ Company Question Bank (Clean, Filterable Catalog) */}
        {activeMode === 'question-bank' && (
          <CompanyQuestionBankView
            progress={progress}
            preselectedCompany={selectedCompanyFilter}
            onProgressUpdate={reloadProgress}
            onOpenUnlockModal={() => setIsUnlockModalOpen(true)}
          />
        )}

        {/* Real OA Edge-Case Simulator */}
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

        {/* 45-Minute Timed Mock Tests */}
        {activeMode === 'mock-oa' && (
          <TimedMockOaView
            progress={progress}
            onSaveDraft={handleSaveDraft}
            onRecordSuccess={handleRecordSuccess}
            onRecordOaAttempt={handleRecordOaAttempt}
            onOpenUnlockModal={() => setIsUnlockModalOpen(true)}
          />
        )}

        {/* Pattern Cheat Sheets */}
        {activeMode === 'cheat-sheets' && (
          <PatternCheatSheetsView
            onSelectProblem={handleSelectProblem}
          />
        )}

        {/* Login / Signup / Password Reset Page */}
        {activeMode === 'auth' && (
          <AuthView
            onAuthSuccess={handleAuthSuccess}
            onContinueAsGuest={() => setActiveMode('home')}
          />
        )}
      </main>

      {/* Compliance & Policy Footer */}
      <Footer onOpenPolicy={(tab) => setPolicyModal({ isOpen: true, tab })} />

      {/* Legal & Policy Compliance Modal */}
      <LegalComplianceModal
        isOpen={policyModal.isOpen}
        initialTab={policyModal.tab}
        onClose={() => setPolicyModal(prev => ({ ...prev, isOpen: false }))}
      />

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
