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
  KeyRound,
  ArrowLeft,
  Send
} from 'lucide-react';
import { loginUser, signupUser, resetPassword, findUserByEmail, AuthUser } from '../services/auth';

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
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>(initialMode);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [college, setCollege] = useState('');
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Password reset specific fields
  const [otpCode, setOtpCode] = useState('');
  const [sentOtp, setSentOtp] = useState<string | null>(null);
  const [otpFeedback, setOtpFeedback] = useState<string | null>(null);

  // Status
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSendOtp = () => {
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter your registered email address first.');
      return;
    }
    const user = findUserByEmail(email);
    if (!user) {
      setErrorMsg('No registered account was found with this email. Please check spelling or create an account.');
      return;
    }

    // Generate simulated 6-digit student OTP
    const mockCode = Math.floor(100000 + Math.random() * 900000).toString();
    setSentOtp(mockCode);
    setOtpCode(mockCode); // Auto-fill for convenience
    setErrorMsg(null);
    setOtpFeedback(`6-digit verification code sent to ${email} (Demo Code: ${mockCode})`);
  };

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
      } else if (mode === 'reset') {
        // Password reset flow
        if (sentOtp && otpCode.trim() !== sentOtp) {
          setErrorMsg('Invalid verification OTP code. Please enter the code sent to your email.');
          setIsLoading(false);
          return;
        }

        if (password !== confirmPassword) {
          setErrorMsg('New passwords do not match. Please re-enter.');
          setIsLoading(false);
          return;
        }

        const res = await resetPassword(email, password);
        if (!res.success) {
          setErrorMsg(res.message);
          setIsLoading(false);
          return;
        }

        setSuccessMsg('Password has been successfully updated with SHA-256 encryption! You can now log in.');
        setTimeout(() => {
          setMode('login');
          setPassword('');
          setConfirmPassword('');
          setOtpCode('');
          setSentOtp(null);
          setOtpFeedback(null);
          setSuccessMsg('Password reset complete. Please log in with your new password.');
        }, 1500);
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
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-4 stripe-mesh-gradient text-slate-100 selection:bg-[#635bff]/30 selection:text-indigo-200">
      <div className="w-full max-w-md bg-[#0b1329] border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-fade-in relative backdrop-blur-xl">
        {/* Header graphic */}
        <div className="p-8 bg-gradient-to-b from-[#101b38] to-[#0b1329] border-b border-white/10 text-center relative">
          <div className="inline-flex w-12 h-12 rounded-xl bg-gradient-to-tr from-[#635bff] to-[#00d4ff] p-0.5 shadow-xl shadow-[#635bff]/30 mb-3">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Database className="w-6 h-6 text-[#00d4ff]" />
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
            {mode === 'login' 
              ? 'Welcome Back, Engineer' 
              : mode === 'signup' 
              ? 'Create Student Account'
              : 'Reset Your Password'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            {mode === 'login'
              ? 'Log in to track your 534+ company SQL OA solutions, streaks & test history.'
              : mode === 'signup'
              ? 'Join fellow Indian engineering students preparing for top campus placements.'
              : 'Enter your registered email and choose a new password. It will be re-hashed with SHA-256.'}
          </p>

          {/* Mode Switcher Tabs (Only shown when not in reset mode) */}
          {mode !== 'reset' ? (
            <div className="flex bg-white/[0.04] p-1 rounded-full border border-white/10 mt-5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-1.5 rounded-lg transition ${
                  mode === 'login'
                    ? 'bg-white/15 text-white shadow-md font-bold rounded-full'
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
                    ? 'bg-white/15 text-white shadow-md font-bold rounded-full'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Create Account
              </button>
            </div>
          ) : (
            <div className="mt-4 flex items-center justify-center">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="text-xs text-emerald-400 hover:underline flex items-center gap-1.5 font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Login</span>
              </button>
            </div>
          )}
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
                {mode === 'reset' ? 'Registered Email Address' : 'Email Address'}
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

            {/* Reset Mode: OTP Verification Step */}
            {mode === 'reset' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    6-Digit Verification Code
                  </label>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    <span>{sentOtp ? 'Resend OTP' : 'Send OTP'}</span>
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="Enter 6-digit OTP code"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 tracking-wider"
                  />
                </div>
                {otpFeedback && (
                  <p className="text-[11px] text-emerald-400 mt-1.5 flex items-center gap-1 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>{otpFeedback}</span>
                  </p>
                )}
              </div>
            )}

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  {mode === 'reset' ? 'New Password' : 'Password'}
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('reset');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                      setOtpFeedback(null);
                    }}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'reset' ? 'Enter new password (min. 6 chars)' : 'Minimum 6 characters'}
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

            {(mode === 'signup' || mode === 'reset') && (
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  {mode === 'reset' ? 'Confirm New Password' : 'Confirm Password'}
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
              <span>
                {isLoading 
                  ? 'Processing...' 
                  : mode === 'login' 
                  ? 'Log In to SQLEdge' 
                  : mode === 'signup' 
                  ? 'Create Free Account' 
                  : 'Update Password (SHA-256)'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Fill & Guest Options */}
          <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            {mode === 'login' && (
              <button
                type="button"
                onClick={handleDemoFill}
                className="text-emerald-400 hover:underline flex items-center gap-1 font-medium text-[11px]"
              >
                <Sparkles className="w-3 h-3" />
                <span>Fill Sample Credentials</span>
              </button>
            )}

            {mode === 'reset' && (
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-slate-400 hover:text-slate-200 hover:underline text-[11px] flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Back to Login</span>
              </button>
            )}

            <button
              type="button"
              onClick={onContinueAsGuest}
              className="text-slate-400 hover:text-slate-200 hover:underline text-[11px] ml-auto"
            >
              Continue as Guest →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
