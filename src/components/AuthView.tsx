import React, { useState } from 'react';
import { 
  Database, 
  Lock, 
  Mail, 
  User, 
  GraduationCap, 
  Briefcase, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff,
  KeyRound
} from 'lucide-react';
import { loginUser, signupUser, AuthUser } from '../services/auth';

interface AuthViewProps {
  onAuthSuccess: (user: AuthUser) => void;
  onContinueAsGuest: () => void;
  initialMode?: 'login' | 'signup';
}

export const AuthView: React.FC<AuthViewProps> = ({
  onAuthSuccess,
  onContinueAsGuest,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [college, setCollege] = useState('');
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        if (password !== confirmPassword) {
          setErrorMsg('Passwords do not match. Please re-enter.');
          setIsLoading(false);
          return;
        }

        const res = await signupUser(name, email, password, college, targetRole);
        if (!res.success || !res.user) {
          setErrorMsg(res.message || 'Signup failed. Please try again.');
          setIsLoading(false);
          return;
        }

        setSuccessMsg('Account created successfully with SHA-256 encrypted credentials! Redirecting to home...');
        setTimeout(() => {
          onAuthSuccess(res.user!);
        }, 1000);
      } else {
        const res = await loginUser(email, password);
        if (!res.success || !res.user) {
          setErrorMsg(res.message || 'Login failed. Please check your credentials.');
          setIsLoading(false);
          return;
        }

        setSuccessMsg('Login successful! Redirecting to home...');
        setTimeout(() => {
          onAuthSuccess(res.user!);
        }, 800);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail('candidate@engineer.in');
    setPassword('Student@2026');
    setName('Aarav Patel');
    setCollege('IIT Bombay');
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-4 bg-slate-950 text-slate-100 selection:bg-emerald-500/20 selection:text-emerald-300">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-fade-in relative">
        {/* Header graphic */}
        <div className="p-6 bg-gradient-to-b from-emerald-950/60 to-slate-900 border-b border-slate-800 text-center relative">
          <div className="inline-flex w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-xl shadow-emerald-500/20 mb-3">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Database className="w-6 h-6 text-emerald-400" />
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
            {mode === 'login' ? 'Welcome Back, Engineer' : 'Create Student Account'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            {mode === 'login'
              ? 'Log in to track your 534+ company SQL OA solutions, streaks & test history.'
              : 'Join fellow Indian engineering students preparing for top campus placements.'}
          </p>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 mt-5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-1.5 rounded-lg transition ${
                mode === 'login'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-1.5 rounded-lg transition ${
                mode === 'signup'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                      College / University
                    </label>
                    <div className="relative">
                      <GraduationCap className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={college}
                        onChange={(e) => setCollege(e.target.value)}
                        placeholder="e.g. NIT Trichy"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Target Role
                    </label>
                    <div className="relative">
                      <Briefcase className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <select
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="Software Engineer">Software Engineer</option>
                        <option value="Data Analyst">Data Analyst</option>
                        <option value="Data Engineer">Data Engineer</option>
                        <option value="Backend Developer">Backend Developer</option>
                        <option value="Consultant">Consultant</option>
                      </select>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. candidate@college.edu"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-10 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            {/* Security Callout for Hashing */}
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Passwords are cryptographically hashed using <strong className="text-emerald-400 font-mono">SHA-256</strong> before saving.
              </span>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Success Message */}
            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isLoading ? 'Processing...' : mode === 'login' ? 'Log In to SQLEdge' : 'Create Free Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Fill & Guest Options */}
          <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <button
              type="button"
              onClick={handleDemoFill}
              className="text-emerald-400 hover:underline flex items-center gap-1 font-medium text-[11px]"
            >
              <Sparkles className="w-3 h-3" />
              <span>Fill Sample Credentials</span>
            </button>

            <button
              type="button"
              onClick={onContinueAsGuest}
              className="text-slate-400 hover:text-slate-200 hover:underline text-[11px]"
            >
              Continue as Guest →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
