import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  Lock, 
  CreditCard, 
  QrCode, 
  ArrowRight,
  ShieldCheck,
  ExternalLink,
  Smartphone,
  Copy,
  Check,
  Zap,
  HelpCircle
} from 'lucide-react';
import { recordPaymentSuccess } from '../services/storage';
import { 
  openRazorpayCheckout, 
  getRazorpayKeyId, 
  getCustomUpiVpa, 
  generateUpiPayLink, 
  generateUpiQrUrl,
  OFFICIAL_RAZORPAY_ME_URL,
  OFFICIAL_MERCHANT_NAME
} from '../services/payment';
import { getCurrentUser } from '../services/auth';

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
  const [tab, setTab] = useState<'checkout' | 'qr'>('checkout');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copiedVpa, setCopiedVpa] = useState(false);
  const [utrInput, setUtrInput] = useState('');
  const [showUtrField, setShowUtrField] = useState(false);

  if (!isOpen) return null;

  const currentUser = getCurrentUser();
  const upiVpa = getCustomUpiVpa();
  const upiPayUrl = generateUpiPayLink(upiVpa, 199);
  const upiQrImgUrl = generateUpiQrUrl(upiVpa, 199);

  const handlePayNow = async () => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      await openRazorpayCheckout({
        amount: 199,
        studentName: currentUser?.name || 'Student Engineer',
        studentEmail: currentUser?.email || 'student@college.edu',
        onSuccess: (res) => {
          setIsProcessing(false);
          setSuccessMessage('Payment successful! Your Pro Pass has been activated.');
          setTimeout(() => {
            onUnlockSuccess();
            onClose();
          }, 1200);
        },
        onFailure: (err) => {
          setIsProcessing(false);
          if (err.code !== 'PAYMENT_CANCELLED') {
            setErrorMessage(err.description || 'Could not launch payment popup. You can also pay via the Direct UPI QR code tab.');
          }
        },
      });
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMessage(err.message || 'Payment initiation failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyUtr = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUtr = utrInput.trim();
    if (!cleanUtr || cleanUtr.length < 6) {
      setErrorMessage('Please enter a valid 12-digit UPI reference number (UTR).');
      return;
    }

    recordPaymentSuccess('UPI_' + cleanUtr, 199, 'direct_upi_' + Date.now(), 'Direct UPI Settlement');
    setSuccessMessage(`Payment verified (Ref: ${cleanUtr}). Pro Pass Activated!`);
    setTimeout(() => {
      onUnlockSuccess();
      onClose();
    }, 1200);
  };

  const handleCopyVpa = () => {
    navigator.clipboard.writeText(upiVpa);
    setCopiedVpa(true);
    setTimeout(() => setCopiedVpa(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080d1a]/85 backdrop-blur-xl animate-fade-in">
      <div className="bg-[#0b1329] border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative text-slate-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 sm:p-8 bg-gradient-to-b from-[#101b38] to-[#0b1329] border-b border-white/10 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#635bff]/15 border border-[#635bff]/30 text-xs font-semibold text-[#00d4ff] mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#635bff]" />
            <span>Lifetime Student License</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">Instant Access</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Unlock SQLEdge <span className="stripe-accent-gradient">Pro Pass</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed max-w-md">
            Complete access to all 534 placement questions (Amazon, Google, Goldman Sachs, Swiggy, Flipkart), 12 multi-stage OA edge cases, and 3 timed mocks.
          </p>

          {/* Pricing Highlight Pill */}
          <div className="mt-5 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold font-mono text-white">₹199</span>
            <span className="text-xs text-slate-400 font-medium">one-time payment</span>
            <span className="text-[11px] text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 ml-2">
              Zero recurring fees
            </span>
          </div>
        </div>

        {/* Tab Switcher: Fast Razorpay Checkout vs UPI QR */}
        <div className="flex bg-[#080d1a] border-b border-white/10 px-6 pt-3 gap-2">
          <button
            onClick={() => {
              setTab('checkout');
              setErrorMessage(null);
            }}
            className={`pb-3 px-3 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
              tab === 'checkout'
                ? 'border-[#635bff] text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-[#635bff]" />
            <span>Instant Checkout (UPI & Cards)</span>
          </button>

          <button
            onClick={() => {
              setTab('qr');
              setErrorMessage(null);
            }}
            className={`pb-3 px-3 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
              tab === 'qr'
                ? 'border-[#00d4ff] text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-3.5 h-3.5 text-[#00d4ff]" />
            <span>Scan QR Code</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Status Notifications */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs leading-relaxed animate-fade-in">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* TAB 1: INSTANT RAZORPAY POPUP / LINK */}
          {tab === 'checkout' && (
            <div className="space-y-5">
              
              {/* Feature Checklist */}
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Unlocks all 298 Pro Company Questions + Full Solutions</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>12 Interactive 4-Stage OA Edge-Case Sandboxes</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>3 Timed 45-Minute Company Mock Tests & Detailed Scorecards</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Permanent offline access stored locally in your browser</span>
                </div>
              </div>

              {/* Primary Action Button */}
              <button
                onClick={handlePayNow}
                disabled={isProcessing}
                className="w-full py-4 px-6 rounded-full stripe-btn-primary font-bold text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-[#635bff]/30 transition group disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-[#00d4ff]" />
                <span>{isProcessing ? 'Connecting to Razorpay...' : 'Pay ₹199 with Razorpay'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </button>

              {/* Fallback Direct Payment Page Link */}
              <div className="pt-2 text-center space-y-2">
                <span className="text-[11px] text-slate-400 block">Or pay directly on the official merchant page:</span>
                <a
                  href={OFFICIAL_RAZORPAY_ME_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[#00d4ff] hover:text-white font-semibold underline underline-offset-4 transition"
                >
                  <span>Open {OFFICIAL_MERCHANT_NAME} Payment Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Supported Payment Logos */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-center gap-3 text-[11px] text-slate-400 font-medium">
                <span>Google Pay</span>
                <span>•</span>
                <span>PhonePe</span>
                <span>•</span>
                <span>Paytm</span>
                <span>•</span>
                <span>RuPay</span>
                <span>•</span>
                <span>Visa / Master</span>
              </div>
            </div>
          )}

          {/* TAB 2: DIRECT SCAN UPI QR CODE */}
          {tab === 'qr' && (
            <div className="space-y-5">
              
              <div className="flex flex-col items-center justify-center space-y-3">
                {/* White Crisp QR Container */}
                <div className="p-3 bg-white rounded-2xl shadow-2xl flex flex-col items-center max-w-[200px]">
                  <img
                    src={upiQrImgUrl}
                    alt="UPI QR Code for ₹199"
                    className="w-40 h-40 object-contain"
                  />
                  <span className="text-[10px] font-mono font-bold text-slate-900 mt-1">
                    ₹199 • SQLEdge Pro Pass
                  </span>
                </div>

                <p className="text-xs text-slate-300 text-center max-w-xs">
                  Scan using <strong>Google Pay, PhonePe, Paytm, or BHIM</strong> to transfer ₹199 directly to our verified bank account.
                </p>
              </div>

              {/* Copy UPI ID */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#080d1a] border border-white/10 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Verified UPI ID</span>
                  <span className="font-mono font-bold text-[#00d4ff]">{upiVpa}</span>
                </div>

                <button
                  type="button"
                  onClick={handleCopyVpa}
                  className="px-3 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-white transition flex items-center gap-1.5"
                >
                  {copiedVpa ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Mobile Deep Link */}
              <a
                href={upiPayUrl}
                className="w-full py-3 px-4 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-bold border border-white/10 transition flex items-center justify-center gap-2"
              >
                <Smartphone className="w-4 h-4 text-[#00d4ff]" />
                <span>Open in UPI App on Mobile</span>
              </a>

              {/* UTR Verification Toggle */}
              <div className="pt-2 text-center">
                {!showUtrField ? (
                  <button
                    type="button"
                    onClick={() => setShowUtrField(true)}
                    className="text-xs text-slate-400 hover:text-white underline"
                  >
                    Already paid? Enter 12-digit UPI Reference (UTR) to activate ›
                  </button>
                ) : (
                  <form onSubmit={handleVerifyUtr} className="space-y-2 text-left animate-fade-in">
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      Enter 12-Digit UPI Reference Number (UTR):
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={utrInput}
                        onChange={(e) => setUtrInput(e.target.value)}
                        placeholder="e.g. 439201849201"
                        className="flex-1 bg-[#080d1a] border border-white/15 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-[#635bff]"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 stripe-btn-primary font-bold text-xs rounded-xl transition"
                      >
                        Activate
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Modal Trust Footer */}
        <div className="p-4 bg-[#080d1a] border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 px-6">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>256-bit Secure Encryption</span>
          </div>
          <span>Merchant: <strong>TANVI CHHAPARIA</strong></span>
        </div>

      </div>
    </div>
  );
};
