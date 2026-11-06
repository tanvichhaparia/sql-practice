import React from 'react';
import { 
  Database, 
  Flame, 
  Clock, 
  BookOpen, 
  CheckCircle2, 
  Sparkles, 
  Unlock, 
  Lock, 
  Download, 
  Layers,
  User,
  LogOut,
  LogIn,
  Compass,
  Home
} from 'lucide-react';
import { UserProgress } from '../types';
import { AuthUser } from '../services/auth';

interface NavbarProps {
  activeMode: 'home' | 'roadmaps' | 'question-bank' | 'practice' | 'mock-oa' | 'cheat-sheets' | 'auth';
  setActiveMode: (mode: 'home' | 'roadmaps' | 'question-bank' | 'practice' | 'mock-oa' | 'cheat-sheets' | 'auth') => void;
  progress: UserProgress;
  totalProblems: number;
  solvedAllCount: number;
  currentUser: AuthUser | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenUnlockModal: () => void;
  onOpenBackupModal: () => void;
  onToggleDemoPro: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeMode,
  setActiveMode,
  progress,
  totalProblems,
  solvedAllCount,
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenUnlockModal,
  onOpenBackupModal,
  onToggleDemoPro,
}) => {
  return (
    <header className="h-14 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-40 select-none">
      {/* Brand logo & title */}
      <div className="flex items-center gap-4 lg:gap-6">
        <button
          onClick={() => setActiveMode('home')}
          className="flex items-center gap-2 text-left group"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition">
            <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center">
              <Database className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-100 tracking-tight text-base group-hover:text-emerald-400 transition">
                SQLEdge<span className="text-emerald-400 font-extrabold ml-0.5">OA</span>
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                WASM
              </span>
            </div>
          </div>
        </button>

        {/* Structured Mode Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveMode('home')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeMode === 'home'
                ? 'bg-slate-800 text-emerald-400 shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>

          <button
            onClick={() => setActiveMode('roadmaps')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeMode === 'roadmaps'
                ? 'bg-slate-800 text-emerald-400 shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Roadmaps</span>
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300">
              5 Tracks
            </span>
          </button>

          <button
            onClick={() => setActiveMode('question-bank')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeMode === 'question-bank'
                ? 'bg-slate-800 text-emerald-400 shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Question Bank</span>
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-300">
              534
            </span>
          </button>

          <button
            onClick={() => setActiveMode('practice')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeMode === 'practice'
                ? 'bg-slate-800 text-emerald-400 shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>OA Simulator</span>
          </button>

          <button
            onClick={() => setActiveMode('mock-oa')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeMode === 'mock-oa'
                ? 'bg-slate-800 text-emerald-400 shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Mock OAs</span>
          </button>

          <button
            onClick={() => setActiveMode('cheat-sheets')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeMode === 'cheat-sheets'
                ? 'bg-slate-800 text-emerald-400 shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Cheat Sheets</span>
          </button>
        </nav>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Streak Indicator */}
        <div 
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400"
          title={`Active Streak: ${progress.streak.count} day(s)`}
        >
          <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="font-bold">{progress.streak.count}</span>
          <span className="text-[10px] text-amber-500 hidden sm:inline">d</span>
        </div>

        {/* Pro / Free Tier Badge */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleDemoPro}
            title="Click to toggle between Free & Pro Demo view instantly"
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold transition border ${
              progress.isProUnlocked
                ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-slate-800/70 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            {progress.isProUnlocked ? (
              <>
                <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span>Pro Unlocked</span>
              </>
            ) : (
              <>
                <Lock className="w-3 h-3 text-slate-400" />
                <span>Free Tier</span>
              </>
            )}
            <span className="text-[9px] opacity-70 ml-0.5">(Demo Switch)</span>
          </button>

          {!progress.isProUnlocked && (
            <button
              onClick={onOpenUnlockModal}
              className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-sm shadow-emerald-500/30 hover:shadow-emerald-500/50"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Student Pass (₹199)</span>
              <span className="sm:hidden">Pro</span>
            </button>
          )}
        </div>

        {/* User Auth Profile Pill or Login Button */}
        {currentUser ? (
          <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-800">
            <div 
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/80 text-xs"
              title={`Logged in as ${currentUser.name} (${currentUser.email}) - ${currentUser.college}`}
            >
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center font-bold text-[10px]">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <span className="font-semibold text-slate-200 max-w-[80px] sm:max-w-[110px] truncate">
                {currentUser.name.split(' ')[0]}
              </span>
            </div>
            <button
              onClick={onLogout}
              title="Sign Out"
              className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition border ${
              activeMode === 'auth'
                ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                : 'bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Login / Signup</span>
            <span className="sm:hidden">Login</span>
          </button>
        )}

        {/* Backup / Restore Progress */}
        <button
          onClick={onOpenBackupModal}
          title="Backup or Restore Progress JSON"
          className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
