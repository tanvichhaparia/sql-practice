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
    <header className="h-16 border-b border-white/10 bg-[#080d1a]/80 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 select-none">
      {/* Brand logo & title */}
      <div className="flex items-center gap-4 lg:gap-8">
        <button
          onClick={() => setActiveMode('home')}
          className="flex items-center gap-2.5 text-left group"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#635bff] to-[#00d4ff] p-0.5 shadow-md shadow-[#635bff]/30 group-hover:shadow-[#635bff]/50 transition">
            <div className="w-full h-full bg-[#080d1a] rounded-[10px] flex items-center justify-center">
              <Database className="w-4 h-4 text-[#00d4ff]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-white tracking-tight text-base group-hover:text-indigo-200 transition">
                SQLEdge<span className="stripe-accent-gradient font-black ml-0.5">OA</span>
              </span>
              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#635bff]/15 text-[#00d4ff] border border-[#635bff]/30">
                WASM
              </span>
            </div>
          </div>
        </button>

        {/* Structured Mode Navigation Tabs (Stripe Pill Bar) */}
        <nav className="hidden md:flex items-center gap-1 bg-white/[0.03] p-1 rounded-full border border-white/10 backdrop-blur-md">
          <button
            onClick={() => setActiveMode('home')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
              activeMode === 'home'
                ? 'bg-white/15 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>

          <button
            onClick={() => setActiveMode('roadmaps')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
              activeMode === 'roadmaps'
                ? 'bg-white/15 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Roadmaps</span>
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#635bff]/25 text-indigo-300">
              5 Tracks
            </span>
          </button>

          <button
            onClick={() => setActiveMode('question-bank')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
              activeMode === 'question-bank'
                ? 'bg-white/15 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Question Bank</span>
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#00d4ff]/20 text-[#00d4ff]">
              534
            </span>
          </button>

          <button
            onClick={() => setActiveMode('practice')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
              activeMode === 'practice'
                ? 'bg-white/15 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>OA Simulator</span>
          </button>

          <button
            onClick={() => setActiveMode('mock-oa')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
              activeMode === 'mock-oa'
                ? 'bg-white/15 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Mock OAs</span>
          </button>

          <button
            onClick={() => setActiveMode('cheat-sheets')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
              activeMode === 'cheat-sheets'
                ? 'bg-white/15 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Cheat Sheets</span>
          </button>
        </nav>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Streak Indicator */}
        <div 
          className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-xs text-amber-300"
          title={`Active Streak: ${progress.streak.count} day(s)`}
        >
          <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="font-bold">{progress.streak.count}</span>
          <span className="text-[10px] text-amber-400 hidden sm:inline">d</span>
        </div>

        {/* Pro / Free Tier Badge */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleDemoPro}
            title="Click to toggle between Free & Pro Demo view instantly"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition border ${
              progress.isProUnlocked
                ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-white/[0.05] text-slate-300 border-white/10 hover:border-white/20'
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
            <span className="text-[9px] opacity-70 ml-0.5">(Demo)</span>
          </button>

          {!progress.isProUnlocked && (
            <button
              onClick={onOpenUnlockModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold stripe-btn-primary transition shadow-md shadow-[#635bff]/30"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pro Pass (₹199)</span>
              <span className="sm:hidden">Pro</span>
            </button>
          )}
        </div>

        {/* User Auth Profile Pill or Login Button */}
        {currentUser ? (
          <div className="flex items-center gap-1.5 pl-2 border-l border-white/10">
            <div 
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-xs"
              title={`Logged in as ${currentUser.name} (${currentUser.email}) - ${currentUser.college}`}
            >
              <div className="w-5 h-5 rounded-full bg-[#635bff]/25 border border-[#635bff]/40 text-[#00d4ff] flex items-center justify-center font-bold text-[10px]">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <span className="font-semibold text-slate-200 max-w-[80px] sm:max-w-[110px] truncate">
                {currentUser.name.split(' ')[0]}
              </span>
            </div>
            <button
              onClick={onLogout}
              title="Sign Out"
              className="p-1.5 rounded-full text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition border ${
              activeMode === 'auth'
                ? 'bg-white text-slate-950 font-bold border-white'
                : 'bg-white/[0.05] hover:bg-white/[0.1] text-white border-white/10'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign In</span>
            <span className="sm:hidden">Login</span>
          </button>
        )}

        {/* Backup / Restore Progress */}
        <button
          onClick={onOpenBackupModal}
          title="Backup or Restore Progress JSON"
          className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
