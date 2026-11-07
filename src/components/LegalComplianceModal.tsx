import React, { useState } from 'react';
import { X, ShieldCheck, FileText, RotateCcw, Mail, Building, MapPin, Phone, HelpCircle } from 'lucide-react';

export type PolicyTab = 'terms' | 'privacy' | 'refund' | 'contact' | 'pricing';

interface LegalComplianceModalProps {
  isOpen: boolean;
  initialTab?: PolicyTab;
  onClose: () => void;
}

export const LegalComplianceModal: React.FC<LegalComplianceModalProps> = ({
  isOpen,
  initialTab = 'terms',
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<PolicyTab>(initialTab);

  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base font-bold text-slate-100">
                Legal & Business Compliance Information
              </h2>
              <p className="text-xs text-slate-400">
                Merchant: <strong>TANVI CHHAPARIA</strong> (TANVI CHHAPARIA EDUTECH)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex overflow-x-auto border-b border-slate-800 bg-slate-950/50 px-4 py-2 gap-2 text-xs font-semibold scrollbar-none">
          <button
            onClick={() => setActiveTab('contact')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition ${
              activeTab === 'contact'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Contact Us</span>
          </button>

          <button
            onClick={() => setActiveTab('refund')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition ${
              activeTab === 'refund'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Refund & Cancellation</span>
          </button>

          <button
            onClick={() => setActiveTab('terms')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition ${
              activeTab === 'terms'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Terms & Conditions</span>
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition ${
              activeTab === 'privacy'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Privacy Policy</span>
          </button>

          <button
            onClick={() => setActiveTab('pricing')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition ${
              activeTab === 'pricing'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Pricing & Delivery</span>
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-300 leading-relaxed">
          {/* CONTACT US */}
          {activeTab === 'contact' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Building className="w-4 h-4 text-emerald-400" />
                Merchant & Contact Information
              </h3>
              <p>
                For customer support, order inquiries, payment confirmation, or assistance with your SQLEdge Pro Pass, please contact us using the details below:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <span className="text-[11px] text-slate-500 block uppercase font-bold">Legal Entity / Merchant</span>
                  <span className="font-semibold text-slate-200">TANVI CHHAPARIA</span>
                  <span className="text-[11px] text-emerald-400 block mt-0.5">Operating as TANVI CHHAPARIA EDUTECH</span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-500 block uppercase font-bold">Official Support Email</span>
                  <a href="mailto:tanvichhaparia@outlook.com" className="font-semibold text-emerald-400 hover:underline">
                    tanvichhaparia@outlook.com
                  </a>
                </div>

                <div className="sm:col-span-2">
                  <span className="text-[11px] text-slate-500 block uppercase font-bold flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    Operational Location & Jurisdiction
                  </span>
                  <p className="font-mono text-slate-300 mt-1">
                    Kolkata, West Bengal, India - 700010
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px]">
                <strong>Response Turnaround Time:</strong> We reply to all student support inquiries and billing queries within 24 to 48 business hours.
              </div>
            </div>
          )}

          {/* REFUND & CANCELLATION */}
          {activeTab === 'refund' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-emerald-400" />
                Cancellation & Refund Policy
              </h3>
              
              <div className="space-y-3">
                <p>
                  <strong>Digital Goods Delivery:</strong> SQLEdge Pro Pass is an online educational digital product. Upon successful payment of ₹199, access to all company question sets, practice solutions, and mock tests is activated immediately.
                </p>

                <h4 className="font-bold text-slate-200">1. Refund Eligibility</h4>
                <ul className="list-disc list-inside space-y-1 pl-2 text-slate-400">
                  <li>If your account is charged multiple times due to a payment gateway timeout or duplicate transaction, the duplicate amount will be refunded in full within 5-7 business days.</li>
                  <li>If you encounter a persistent technical issue that prevents access to the Pro features and our support team is unable to resolve it within 7 days, you are eligible for a full refund.</li>
                  <li>Since this is an instant digital educational license, refunds cannot be issued once the content has been substantially consumed or exported.</li>
                </ul>

                <h4 className="font-bold text-slate-200">2. How to Request a Refund</h4>
                <p>
                  To request a refund, please email our support team at <strong className="text-emerald-400">tanvichhaparia@outlook.com</strong> with your <strong>Razorpay Payment ID</strong> or <strong>UPI Reference Number (UTR)</strong> and the registered email address.
                </p>

                <h4 className="font-bold text-slate-200">3. Refund Processing Timelines</h4>
                <p>
                  Approved refunds are processed via the original payment method (Bank Account / UPI / Card) through Razorpay and typically reflect in your account within 5 to 7 business days as per standard banking processing windows.
                </p>
              </div>
            </div>
          )}

          {/* TERMS & CONDITIONS */}
          {activeTab === 'terms' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                Terms and Conditions
              </h3>

              <div className="space-y-3">
                <p>
                  Welcome to <strong>SQLEdge OA Practice</strong> (managed by <strong>TANVI CHHAPARIA</strong>). By accessing our website, creating an account, or purchasing a Pro Pass, you agree to comply with and be bound by the following terms:
                </p>

                <h4 className="font-bold text-slate-200">1. Intellectual Property & License</h4>
                <p>
                  All question patterns, test schemas, interactive SQL sandboxes, and instructional materials are the intellectual property of TANVI CHHAPARIA. The Pro Student Pass grants a single-user, non-transferable, perpetual license for individual learning and interview preparation.
                </p>

                <h4 className="font-bold text-slate-200">2. Prohibited Use</h4>
                <p>
                  Users may not redistribute, resell, scrape, copy in bulk, or publicly republish premium question banks or solution code without prior written consent.
                </p>

                <h4 className="font-bold text-slate-200">3. Service Availability</h4>
                <p>
                  While we strive for 99.9% uptime and local-first offline execution using in-browser SQLite WASM, periodic maintenance or updates may occur without prior notice.
                </p>

                <h4 className="font-bold text-slate-200">4. Governing Law & Jurisdiction</h4>
                <p>
                  These terms are governed by the laws of India. Any disputes arising shall be subject to the exclusive jurisdiction of the competent courts in Kolkata, West Bengal, India.
                </p>
              </div>
            </div>
          )}

          {/* PRIVACY POLICY */}
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Privacy Policy
              </h3>

              <div className="space-y-3">
                <p>
                  We value your trust and are committed to protecting your personal information.
                </p>

                <h4 className="font-bold text-slate-200">1. Information We Collect</h4>
                <p>
                  We collect your name, email address, password hash (salted and hashed for account authentication), and progress statistics (solved problems, bookmark states, draft SQL queries).
                </p>

                <h4 className="font-bold text-slate-200">2. Payment Security</h4>
                <p>
                  We <strong>never store or process your bank account numbers, credit/debit card numbers, CVVs, or UPI PINs</strong>. All financial transactions are processed securely through RBI-licensed payment aggregators (<strong>Razorpay Software Private Limited</strong>).
                </p>

                <h4 className="font-bold text-slate-200">3. Data Sharing</h4>
                <p>
                  We do not sell, rent, or lease student personal data to third parties. Data is used exclusively to track placement preparation and deliver software functionality.
                </p>
              </div>
            </div>
          )}

          {/* PRICING & DELIVERY */}
          {activeTab === 'pricing' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-400" />
                Pricing, Products & Delivery Policy
              </h3>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-200">SQLEdge All-Company Pro Pass</span>
                  <span className="font-black text-emerald-400 text-sm">₹199 INR</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  One-time lifetime student license. Unlocks complete question bank (534 problems across Google, Amazon, Microsoft, Swiggy, Flipkart, etc.), 12 complex OA edge cases, and 3 timed mock tests.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-200">Shipping & Delivery Terms:</h4>
                <p>
                  SQLEdge is a 100% digital web software service. No physical shipping is required. Delivery of service occurs <strong>instantaneously</strong> upon payment verification by Razorpay or automated UPI confirmation.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Compliant with Razorpay & RBI Payment Guidelines</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
