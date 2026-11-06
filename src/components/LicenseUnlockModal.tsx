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
              Pro License
            </span>
            <span className="text-slate-400 text-xs">Self-Serve Instant Unlock</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-100">
            Unlock 90-Day Full OA Pass
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Complete access to all 12 multi-stage company problems and all 3 timed 45-minute company assessments.
          </p>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-100">₹399</span>
            <span className="text-slate-400 text-xs font-medium">/ $12 USD (One-Time)</span>
            <span className="text-[11px] text-emerald-400 font-semibold ml-2">No recurring subscription</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Feature comparison */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Full 12 Advanced Problems across Fintech, Quick Commerce, AdTech & Fraud</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>3 Realistic 45-Minute Timed Mock OAs (Flipkart, Razorpay, Swiggy)</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>4-Stage Hidden Edge-Case Grader with Actionable Failure Diagnostics</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>100% In-Browser & Offline Capable — Zero lag, Zero backend downtime</span>
            </div>
          </div>

          {/* Checkout Links */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <a
              href="https://rzp.io/l/sqledge-oa-pass"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition"
            >
              <span>Razorpay (₹399 INR)</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>

            <a
              href="https://sqledge.lemonsqueezy.com/checkout"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition"
            >
              <span>LemonSqueezy ($12 USD)</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>

          {/* License Key Form */}
          <form onSubmit={handleVerify} className="space-y-3 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Have a Passcode / License Key?
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter passcode (e.g. SQLPRO-2026-ABCD or DEMO-PRO)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-24 py-2 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 uppercase"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg transition"
                >
                  Verify Key
                </button>
              </div>
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
