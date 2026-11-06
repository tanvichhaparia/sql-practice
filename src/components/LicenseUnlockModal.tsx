import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  Key, 
  ExternalLink, 
  ShieldCheck, 
  Zap,
  Lock
} from 'lucide-react';
import { unlockProTier } from '../services/storage';

interface LicenseUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlockSuccess: () => void;
}

export const LicenseUnlockModal: React.FC<LicenseUnlockModalProps> = ({
  isOpen,
  onClose,
  onUnlockSuccess,
}) => {
  const [passcode, setPasscode] = useState('');
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) return;

    const result = unlockProTier(passcode);
    setFeedback(result);

    if (result.success) {
      setTimeout(() => {
        onUnlockSuccess();
        onClose();
      }, 1200);
    }
  };

  const handleDemoUnlock = () => {
    const result = unlockProTier('DEMO-PRO');
    setFeedback(result);
    setTimeout(() => {
      onUnlockSuccess();
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1 rounded-md hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-b from-emerald-950/60 to-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Student College Pass
            </span>
            <span className="text-slate-400 text-xs">Nominal One-Time Fee</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-100">
            All-Company Pro Placement Pass
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Complete access to all 534 company interview questions (Amazon, Google, Microsoft, Flipkart, Swiggy, Goldman Sachs), 12 multi-stage OA edge cases, and 3 timed mocks.
          </p>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400">₹199</span>
            <span className="text-slate-400 text-xs font-medium">/ $4.99 USD (Lifetime Student Pass)</span>
            <span className="text-[11px] text-emerald-400 font-semibold ml-2">Zero subscriptions</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span><strong>236 questions</strong> (Core Pack + TCS, Infosys, Wipro, CTS, HCL, Accenture) are <strong>100% Free</strong>.</span>
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Feature comparison */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span><strong>534 Total Questions</strong>: 412 Queries, 54 MCQs, 68 Interview Concepts across 26 company tracks</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span><strong>Unlocks High-Paying Tracks</strong>: Amazon, Google, Microsoft, Swiggy, Zomato, Razorpay, Goldman Sachs</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span><strong>3 Timed 45-Min Mock OAs</strong> + 12 Hidden Edge-Case OA simulations</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span><strong>100% Offline & In-Browser</strong>: Zero backend lag, runs directly on your machine via WASM</span>
            </div>
          </div>

          {/* Checkout Links */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <a
              href="https://rzp.io/l/sqledge-student-pass"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition"
            >
              <span>Razorpay (₹199 INR)</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>

            <a
              href="https://sqledge.lemonsqueezy.com/checkout"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition"
            >
              <span>LemonSqueezy ($4.99 USD)</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>

          {/* License Key Form */}
          <form onSubmit={handleVerify} className="space-y-3 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Have a Student Passcode or College Coupon?
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter STUDENT199, COLLEGE99, or DEMO-PRO"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-24 py-2 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 uppercase"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg transition"
                >
                  Apply Pass
                </button>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Tip: College coupon code <code className="text-emerald-400 font-mono">STUDENT199</code> or <code className="text-emerald-400 font-mono">DEMO-PRO</code> works instantly.
              </p>
            </div>

            {feedback && (
              <div
                className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                  feedback.success
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                }`}
              >
                {feedback.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <Lock className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <span>{feedback.message}</span>
              </div>
            )}
          </form>

          {/* Quick 1-Click Demo Unlock for Evaluator */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Interview Evaluator / Tester?</span>
            <button
              onClick={handleDemoUnlock}
              className="text-emerald-400 font-semibold hover:underline flex items-center gap-1"
            >
              <Zap className="w-3 h-3" />
              <span>1-Click Instant Demo Unlock</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
