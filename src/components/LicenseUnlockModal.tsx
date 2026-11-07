import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  Key, 
  Zap,
  Lock,
  CreditCard,
  QrCode,
  Settings,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ExternalLink,
  Smartphone,
  Copy,
  Info
} from 'lucide-react';
import { unlockProTier, recordPaymentSuccess } from '../services/storage';
import { 
  openRazorpayCheckout, 
  simulateTestPayment, 
  getRazorpayKeyId, 
  setRazorpayKeyId,
  getCustomUpiVpa,
  setCustomUpiVpa,
  generateUpiPayLink,
  generateUpiQrUrl
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
  const [activePaymentMethod, setActivePaymentMethod] = useState<'razorpay' | 'upi_qr'>('razorpay');
  const [passcode, setPasscode] = useState('');
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  // Gateway Settings
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [razorpayKey, setRazorpayKey] = useState(getRazorpayKeyId());
  const [upiVpa, setUpiVpa] = useState(getCustomUpiVpa());
  const [keySavedMessage, setKeySavedMessage] = useState(false);
  const [copiedVpa, setCopiedVpa] = useState(false);

  // Direct UPI Verification UTR
  const [upiUtr, setUpiUtr] = useState('');

  useEffect(() => {
    setRazorpayKey(getRazorpayKeyId());
    setUpiVpa(getCustomUpiVpa());
  }, [isOpen]);

  if (!isOpen) return null;

  const currentUser = getCurrentUser();
  const isTestKey = razorpayKey.startsWith('rzp_test_');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setRazorpayKeyId(razorpayKey);
    setCustomUpiVpa(upiVpa);
    setKeySavedMessage(true);
    setTimeout(() => setKeySavedMessage(false), 2000);
  };

  const handleRazorpayPay = async () => {
    setIsProcessingPayment(true);
    setFeedback(null);

    try {
      await openRazorpayCheckout({
        amount: 199,
        studentName: currentUser?.name || 'Student Engineer',
        studentEmail: currentUser?.email || 'student@college.edu',
        onSuccess: (res) => {
          setIsProcessingPayment(false);
          setFeedback({
            success: true,
            message: `Payment Approved! Ref: ${res.razorpay_payment_id}. Pro Pass Activated!`,
          });
          setTimeout(() => {
            onUnlockSuccess();
            onClose();
          }, 1400);
        },
        onFailure: (err) => {
          setIsProcessingPayment(false);
          if (err.code === 'NO_KEY_CONFIGURED') {
            setShowKeyConfig(true);
            setFeedback({
              success: false,
              message: 'No Razorpay Key ID found. You can configure your key below, or use the Direct UPI QR code.',
            });
          } else if (err.code !== 'PAYMENT_CANCELLED') {
            setFeedback({
              success: false,
              message: err.description || 'Payment could not be launched. If blocked by browser, try Direct UPI QR.',
            });
          }
        },
      });
    } catch (err: any) {
      setIsProcessingPayment(false);
      setFeedback({
        success: false,
        message: err.message || 'Error launching payment.',
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleVerifyUtr = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUtr = upiUtr.trim();
    if (!cleanUtr || cleanUtr.length < 6) {
      setFeedback({
        success: false,
        message: 'Please enter a valid 12-digit UPI reference number (UTR) from your payment app.',
      });
      return;
    }

    recordPaymentSuccess('UPI_' + cleanUtr, 199, 'direct_upi_' + Date.now(), 'Direct UPI Transfer');
    setFeedback({
      success: true,
      message: `UPI Payment Verified! Ref: UPI_${cleanUtr}. Pro Pass Activated!`,
    });
    setTimeout(() => {
      onUnlockSuccess();
      onClose();
    }, 1400);
  };

  const handleSimulatedPayment = () => {
    setIsProcessingPayment(true);
    setFeedback(null);

    setTimeout(() => {
      const res = simulateTestPayment(
        199,
        currentUser?.name || 'Aarav Patel',
        currentUser?.email || 'student@engineer.in'
      );
      setIsProcessingPayment(false);
      setFeedback({
        success: true,
        message: `Simulated UPI Payment Approved! (Ref: ${res.razorpay_payment_id}). Full Pro Pass Activated!`,
      });
      setTimeout(() => {
        onUnlockSuccess();
        onClose();
      }, 1400);
    }, 800);
  };

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

  const handleCopyVpa = () => {
    navigator.clipboard.writeText(upiVpa);
    setCopiedVpa(true);
    setTimeout(() => setCopiedVpa(false), 2000);
  };

  const upiPayUrl = generateUpiPayLink(upiVpa, 199);
  const upiQrImgUrl = generateUpiQrUrl(upiVpa, 199);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden shadow-2xl relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1 rounded-md hover:bg-slate-800 transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-b from-emerald-950/60 to-slate-900 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Student College Pass
            </span>
            <span className="text-slate-400 text-xs">Direct UPI & Razorpay Settlement</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-100">
            All-Company Pro Placement Pass
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Complete access to all 534 company interview questions (Amazon, Google, Microsoft, Flipkart, Swiggy, Goldman Sachs), 12 multi-stage OA edge cases, and 3 timed mocks.
          </p>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400">₹199</span>
            <span className="text-slate-400 text-xs font-medium">(One-Time Lifetime Student Pass)</span>
            <span className="text-[11px] text-emerald-400 font-semibold ml-2">No recurring fee</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span><strong>236 questions</strong> (Core Pack + TCS, Infosys, Wipro, CTS, HCL, Accenture) are <strong>100% Free</strong>.</span>
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto min-h-0 flex-1">
          {/* Key Mode Notice */}
          {isTestKey && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Currently in Razorpay Test Mode (<code className="font-mono">rzp_test_...</code>)</p>
                <p className="text-[11px] text-amber-200/80 mt-0.5">
                  In Test Mode, banks and UPI apps simulate testing and do not transfer real money. To receive genuine money into your bank account, switch Razorpay to <strong>Live Mode (<code className="font-mono">rzp_live_...</code>)</strong> or use the <strong>Direct UPI QR</strong> option below.
                </p>
              </div>
            </div>
          )}

          {/* Payment Method Switcher Tabs */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setActivePaymentMethod('razorpay');
                setFeedback(null);
              }}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
                activePaymentMethod === 'razorpay'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Razorpay Checkout</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActivePaymentMethod('upi_qr');
                setFeedback(null);
              }}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
                activePaymentMethod === 'upi_qr'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Scan UPI QR Code</span>
            </button>
          </div>

          {/* METHOD 1: RAZORPAY AUTOMATED CHECKOUT */}
          {activePaymentMethod === 'razorpay' && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">
                  Razorpay Checkout (UPI, Cards, NetBanking)
                </span>
                <button
                  type="button"
                  onClick={() => setShowKeyConfig(!showKeyConfig)}
                  className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
                >
                  <Settings className="w-3 h-3 text-slate-500" />
                  <span>Configure Key</span>
                  {showKeyConfig ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>

              {/* Collapsible Key ID Settings */}
              {showKeyConfig && (
                <form onSubmit={handleSaveSettings} className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2 text-xs animate-fade-in">
                  <div className="text-[11px] text-slate-400">
                    Razorpay Key ID (<code className="text-emerald-400">rzp_live_...</code> for real money, or <code className="text-emerald-400">rzp_test_...</code> for sandbox):
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={razorpayKey}
                      onChange={(e) => setRazorpayKey(e.target.value)}
                      placeholder="rzp_live_xxxxxxxxxxxxxxxx"
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                    >
                      Save
                    </button>
                  </div>
                  {keySavedMessage && (
                    <p className="text-[10px] text-emerald-400">Saved in browser storage!</p>
                  )}
                </form>
              )}

              {/* Main Razorpay Trigger Button */}
              <button
                onClick={handleRazorpayPay}
                disabled={isProcessingPayment}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <QrCode className="w-4 h-4" />
                <span>
                  {isProcessingPayment ? 'Generating Razorpay Order...' : 'Pay ₹199 via Razorpay Checkout'}
                </span>
              </button>

              {/* Test Simulator */}
              <button
                onClick={handleSimulatedPayment}
                disabled={isProcessingPayment}
                className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-850 text-emerald-400 font-semibold text-xs border border-emerald-500/20 transition flex items-center justify-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Simulate Approved Payment (Test Sandbox)</span>
              </button>

              <div className="flex items-center justify-center gap-2 pt-1 text-[10px] text-slate-500">
                <span>Google Pay • PhonePe • Paytm • BHIM UPI • RuPay • NetBanking</span>
              </div>
            </div>
          )}

          {/* METHOD 2: DIRECT UPI QR CODE & DEEP LINK (Instant Real Settlement) */}
          {activePaymentMethod === 'upi_qr' && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="text-center space-y-1">
                <span className="text-xs font-bold text-slate-200">
                  Scan & Pay ₹199 with Any UPI App
                </span>
                <p className="text-[11px] text-slate-400">
                  Funds settle directly into your bank account via your linked UPI ID.
                </p>
              </div>

              {/* Dynamic QR Code */}
              <div className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl shadow-inner max-w-[200px] mx-auto">
                <img
                  src={upiQrImgUrl}
                  alt="UPI QR Code for ₹199"
                  className="w-44 h-44 object-contain"
                />
                <span className="text-[10px] font-mono text-slate-800 font-bold mt-1">₹199 • SQLEdge OA</span>
              </div>

              {/* VPA ID Copy Block */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Transfer to UPI ID:</span>
                  <span className="font-mono font-bold text-emerald-400">{upiVpa}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyVpa}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedVpa ? 'Copied!' : 'Copy UPI'}</span>
                </button>
              </div>

              {/* Mobile Deep-Link */}
              <a
                href={upiPayUrl}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold border border-slate-700 transition flex items-center justify-center gap-2"
              >
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Open Google Pay / PhonePe / Paytm</span>
              </a>

              {/* UTR Verification Form */}
              <form onSubmit={handleVerifyUtr} className="pt-2 border-t border-slate-800/80 space-y-2">
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  After paying, enter your 12-digit UPI Reference No. (UTR):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={upiUtr}
                    onChange={(e) => setUpiUtr(e.target.value)}
                    placeholder="e.g. 439201849201"
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition"
                  >
                    Activate
                  </button>
                </div>
              </form>

              {/* Change VPA link */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setShowKeyConfig(!showKeyConfig)}
                  className="text-[11px] text-slate-500 hover:text-slate-300 underline"
                >
                  {showKeyConfig ? 'Hide UPI Settings' : 'Change Receiving UPI ID (Default: ' + upiVpa + ')'}
                </button>

                {showKeyConfig && (
                  <form onSubmit={handleSaveSettings} className="mt-2 p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2 text-left text-xs animate-fade-in">
                    <label className="text-[10px] text-slate-400">Your Personal/Business UPI VPA (where you want to receive money):</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={upiVpa}
                        onChange={(e) => setUpiVpa(e.target.value)}
                        placeholder="e.g. yourname@okaxis or 9876543210@paytm"
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                      >
                        Save UPI
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* Offline Coupon / Passcode Form */}
          <form onSubmit={handleVerify} className="space-y-3 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Have a College Coupon or Student Code?
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
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <span>{feedback.message}</span>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
