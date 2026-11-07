import React, { useState, useRef, useEffect } from 'react';
import { 
  Database, 
  Flame, 
  Clock, 
  BookOpen, 
  Sparkles, 
  Unlock, 
  Lock, 
  Download, 
  Layers, 
  User, 
  LogOut, 
  LogIn, 
  Compass, 
  ChevronDown, 
  Menu, 
  X,
  Code2,
  FileText,
  ShieldCheck,
  Home,
  Check
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
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const catalogDropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (catalogDropdownRef.current && !catalogDropdownRef.current.contains(event.target as Node)) {
        setIsCatalogOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectMode = (mode: 'home' | 'roadmaps' | 'question-bank' | 'practice' | 'mock-oa' | 'cheat-sheets' | 'auth') => {
    setActiveMode(mode);
    setIsCatalogOpen(false);
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  const isCatalogActive = activeMode === 'question-bank' || activeMode === 'practice' || activeMode === 'cheat-sheets';

  return (
    <header className="h-16 border-b border-white/10 bg-[#080d1a]/90 backdrop-blur-xl px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-40 select-none">
      
      {/* ========================================================= */}
      {/* LEFT: Clean Brand Logo (NO WASM BADGE) */}
      {/* ========================================================= */}
      <div className="flex items-center gap-6 lg:gap-10">
        <button
          onClick={() => handleSelectMode('home')}
          className="flex items-center gap-2.5 text-left group focus:outline-none"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#635bff] to-[#00d4ff] p-0.5 shadow-md shadow-[#635bff]/30 group-hover:shadow-[#635bff]/50 transition">
            <div className="w-full h-full bg-[#080d1a] rounded-[10px] flex items-center justify-center">
              <Database className="w-4 h-4 text-[#00d4ff]" />
            </div>
          </div>
          <span className="font-extrabold text-white tracking-tight text-lg group-hover:text-indigo-200 transition">
            SQLEdge <span className="stripe-accent-gradient font-black">OA</span>
          </span>
        </button>

        {/* ========================================================= */}
        {/* CENTER: Clean Desktop Dropdown Navigation */}
        {/* ========================================================= */}
        <nav className="hidden md:flex items-center gap-1">
          
          {/* 1. Home */}
          <button
            onClick={() => handleSelectMode('home')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
              activeMode === 'home'
                ? 'bg-white/15 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            Home
          </button>

          {/* 2. Practice & Questions (DROPDOWN) */}
          <div className="relative" ref={catalogDropdownRef}>
            <button
              onClick={() => setIsCatalogOpen(!isCatalogOpen)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1.5 ${
                isCatalogActive || isCatalogOpen
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <span>Practice & Catalog</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                isCatalogOpen ? 'rotate-180 text-white' : ''
              }`} />
            </button>

            {/* Dropdown Menu Card */}
            {isCatalogOpen && (
              <div className="absolute top-full left-0 mt-2 w-80 rounded-2xl bg-[#0b1329] border border-white/15 shadow-2xl p-2 space-y-1 backdrop-blur-2xl animate-fade-in z-50">
                
                {/* Item 1: Question Bank */}
                <button
                  onClick={() => handleSelectMode('question-bank')}
                  className={`w-full p-2.5 rounded-xl text-left transition flex items-start gap-3 ${
                    activeMode === 'question-bank'
                      ? 'bg-white/10 text-white'
                      : 'hover:bg-white/[0.05] text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-[#00d4ff]/15 text-[#00d4ff] shrink-0 mt-0.5">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">534 Question Bank</span>
                      <span className="text-[9px] px-1.5 rounded-full bg-[#00d4ff]/20 text-[#00d4ff] font-bold">
                        26 Companies
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      Filter by Amazon, Google, Goldman Sachs, Swiggy, TCS and Infosys.
                    </p>
                  </div>
                </button>

                {/* Item 2: OA Edge-Case Simulator */}
                <button
                  onClick={() => handleSelectMode('practice')}
                  className={`w-full p-2.5 rounded-xl text-left transition flex items-start gap-3 ${
                    activeMode === 'practice'
                      ? 'bg-white/10 text-white'
                      : 'hover:bg-white/[0.05] text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-[#635bff]/20 text-indigo-300 shrink-0 mt-0.5">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">OA Edge-Case Simulator</span>
                      <span className="text-[9px] px-1.5 rounded-full bg-purple-500/20 text-purple-300 font-bold">
                        12 OAs
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      4-stage multi-test sandbox testing NULLs, ties, and edge cases.
                    </p>
                  </div>
                </button>

                {/* Item 3: Cheat Sheets */}
                <button
                  onClick={() => handleSelectMode('cheat-sheets')}
                  className={`w-full p-2.5 rounded-xl text-left transition flex items-start gap-3 ${
                    activeMode === 'cheat-sheets'
                      ? 'bg-white/10 text-white'
                      : 'hover:bg-white/[0.05] text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400 shrink-0 mt-0.5">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">Pattern Cheat Sheets</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      5 canonical templates tested in 90% of technical assessments.
                    </p>
                  </div>
                </button>

              </div>
            )}
          </div>

          {/* 3. Roadmaps */}
          <button
            onClick={() => handleSelectMode('roadmaps')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1.5 ${
              activeMode === 'roadmaps'
                ? 'bg-white/15 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-[#00d4ff]" />
            <span>Roadmaps</span>
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#635bff]/25 text-indigo-300">
              5 Tracks
            </span>
          </button>

          {/* 4. Timed Mock OAs */}
          <button
            onClick={() => handleSelectMode('mock-oa')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1.5 ${
              activeMode === 'mock-oa'
                ? 'bg-white/15 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Timed Mocks</span>
          </button>

        </nav>
      </div>

      {/* ========================================================= */}
      {/* RIGHT: Unified Action Bar (Clean, Uncluttered) */}
      {/* ========================================================= */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        
        {/* Streak Indicator */}
        <div 
          className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-xs text-amber-300"
          title={`Active Learning Streak: ${progress.streak.count} day(s)`}
        >
          <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="font-bold">{progress.streak.count}</span>
          <span className="text-[10px] text-amber-400 hidden sm:inline">d</span>
        </div>

        {/* Primary CTA: Pro Pass (₹199) or Pro Active Badge */}
        {!progress.isProUnlocked ? (
          <button
            onClick={onOpenUnlockModal}
            className="px-4 py-1.5 rounded-full text-xs font-bold stripe-btn-primary flex items-center gap-1.5 shadow-md shadow-[#635bff]/30"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#00d4ff]" />
            <span>Pro Pass ₹199</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <Check className="w-3 h-3 text-emerald-400" />
            <span>Pro Active</span>
          </div>
        )}

        {/* User Account / More Menu Dropdown */}
        <div className="relative" ref={userMenuRef}>
          {currentUser ? (
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 pl-2 border-l border-white/10 hover:opacity-90 transition focus:outline-none"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#635bff] to-[#00d4ff] p-0.5 shadow-sm">
                <div className="w-full h-full bg-[#080d1a] rounded-full flex items-center justify-center font-bold text-xs text-white">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
            </button>
          ) : (
            <div className="flex items-center gap-2 pl-2 border-l border-white/10">
              <button
                onClick={onOpenAuth}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/[0.08] hover:bg-white/[0.15] text-white border border-white/10 transition flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>

              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition"
                title="More Options"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* User Settings Dropdown Card */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#0b1329] border border-white/15 shadow-2xl p-2 space-y-1 backdrop-blur-2xl animate-fade-in z-50 text-xs">
              {currentUser && (
                <div className="p-3 border-b border-white/10">
                  <div className="font-bold text-white truncate">{currentUser.name}</div>
                  <div className="text-[11px] text-slate-400 truncate">{currentUser.email}</div>
                  {currentUser.college && (
                    <div className="text-[10px] text-[#00d4ff] mt-0.5 truncate">{currentUser.college}</div>
                  )}
                </div>
              )}

              {/* Demo Pro View Switcher (Moved cleanly inside settings!) */}
              <button
                onClick={() => {
                  onToggleDemoPro();
                  setIsUserMenuOpen(false);
                }}
                className="w-full p-2.5 rounded-xl text-left hover:bg-white/[0.05] text-slate-300 hover:text-white transition flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Demo Pro Toggle</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
                  {progress.isProUnlocked ? 'ON' : 'OFF'}
                </span>
              </button>

              {/* Backup & Restore */}
              <button
                onClick={() => {
                  onOpenBackupModal();
                  setIsUserMenuOpen(false);
                }}
                className="w-full p-2.5 rounded-xl text-left hover:bg-white/[0.05] text-slate-300 hover:text-white transition flex items-center gap-2"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>Backup / Restore Data</span>
              </button>

              {/* Sign Out (if logged in) */}
              {currentUser && (
                <button
                  onClick={() => {
                    onLogout();
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full p-2.5 rounded-xl text-left hover:bg-rose-500/10 text-rose-400 transition flex items-center gap-2 border-t border-white/5 mt-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
          aria-label="Toggle Navigation Menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

      </div>

      {/* ========================================================= */}
      {/* MOBILE DRAWER MENU */}
      {/* ========================================================= */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-16 bg-[#080d1a] border-b border-white/10 p-5 space-y-4 shadow-2xl backdrop-blur-2xl animate-fade-in z-50 max-h-[85vh] overflow-y-auto">
          <div className="space-y-1">
            <button
              onClick={() => handleSelectMode('home')}
              className={`w-full p-3 rounded-xl text-left font-semibold text-sm transition flex items-center gap-3 ${
                activeMode === 'home' ? 'bg-[#635bff] text-white' : 'text-slate-300 hover:bg-white/[0.05]'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home Dashboard</span>
            </button>

            <button
              onClick={() => handleSelectMode('question-bank')}
              className={`w-full p-3 rounded-xl text-left font-semibold text-sm transition flex items-center justify-between ${
                activeMode === 'question-bank' ? 'bg-[#635bff] text-white' : 'text-slate-300 hover:bg-white/[0.05]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Database className="w-4 h-4 text-[#00d4ff]" />
                <span>534 Company Question Bank</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white font-mono">534</span>
            </button>

            <button
              onClick={() => handleSelectMode('roadmaps')}
              className={`w-full p-3 rounded-xl text-left font-semibold text-sm transition flex items-center justify-between ${
                activeMode === 'roadmaps' ? 'bg-[#635bff] text-white' : 'text-slate-300 hover:bg-white/[0.05]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Compass className="w-4 h-4 text-emerald-400" />
                <span>Placement Roadmaps</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white font-mono">5 Tracks</span>
            </button>

            <button
              onClick={() => handleSelectMode('practice')}
              className={`w-full p-3 rounded-xl text-left font-semibold text-sm transition flex items-center gap-3 ${
                activeMode === 'practice' ? 'bg-[#635bff] text-white' : 'text-slate-300 hover:bg-white/[0.05]'
              }`}
            >
              <Layers className="w-4 h-4 text-purple-400" />
              <span>OA Edge-Case Simulator (12 Real OAs)</span>
            </button>

            <button
              onClick={() => handleSelectMode('mock-oa')}
              className={`w-full p-3 rounded-xl text-left font-semibold text-sm transition flex items-center gap-3 ${
                activeMode === 'mock-oa' ? 'bg-[#635bff] text-white' : 'text-slate-300 hover:bg-white/[0.05]'
              }`}
            >
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Timed Mock OAs (45 Mins)</span>
            </button>

            <button
              onClick={() => handleSelectMode('cheat-sheets')}
              className={`w-full p-3 rounded-xl text-left font-semibold text-sm transition flex items-center gap-3 ${
                activeMode === 'cheat-sheets' ? 'bg-[#635bff] text-white' : 'text-slate-300 hover:bg-white/[0.05]'
              }`}
            >
              <BookOpen className="w-4 h-4 text-[#00d4ff]" />
              <span>Pattern Cheat Sheets</span>
            </button>
          </div>

          <div className="pt-4 border-t border-white/10 space-y-2">
            {!progress.isProUnlocked && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenUnlockModal();
                }}
                className="w-full py-3 rounded-xl stripe-btn-primary font-bold text-sm flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Unlock All-Company Pro Pass (₹199)</span>
              </button>
            )}

            {!currentUser ? (
              <button
                onClick={() => handleSelectMode('auth')}
                className="w-full py-2.5 rounded-xl bg-white/[0.08] text-white font-semibold text-sm flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Login / Create Account</span>
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-white/[0.04] flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-xs">{currentUser.name}</div>
                  <div className="text-[11px] text-slate-400">{currentUser.email}</div>
                </div>
                <button
                  onClick={() => {
                    onLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg text-xs"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </header>
  );
};
