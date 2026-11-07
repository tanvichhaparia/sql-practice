import React from 'react';
import { ShieldCheck, Mail, FileText, RotateCcw, HelpCircle, Heart } from 'lucide-react';
import { PolicyTab } from './LegalComplianceModal';

interface FooterProps {
  onOpenPolicy: (tab: PolicyTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPolicy }) => {
  return (
    <footer className="mt-auto border-t border-white/10 bg-[#060a14]/90 backdrop-blur-xl text-slate-400 text-xs py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Branding & Merchant entity */}
        <div className="flex flex-col items-center md:items-start gap-1">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white tracking-tight text-sm">
              SQLEdge <span className="stripe-accent-gradient font-black">OA</span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-[11px] text-slate-300">
              Operated by <strong>TANVI CHHAPARIA</strong>
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Interactive SQL OA placement platform for engineering students & freshers.
          </p>
        </div>

        {/* Center: Compliance Policy Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px]">
          <button
            onClick={() => onOpenPolicy('contact')}
            className="hover:text-white transition flex items-center gap-1"
          >
            <Mail className="w-3 h-3 text-slate-500" />
            <span>Contact Us</span>
          </button>

          <span className="text-slate-700">•</span>

          <button
            onClick={() => onOpenPolicy('refund')}
            className="hover:text-white transition flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3 text-slate-500" />
            <span>Refund & Cancellation</span>
          </button>

          <span className="text-slate-700">•</span>

          <button
            onClick={() => onOpenPolicy('terms')}
            className="hover:text-white transition flex items-center gap-1"
          >
            <FileText className="w-3 h-3 text-slate-500" />
            <span>Terms of Service</span>
          </button>

          <span className="text-slate-700">•</span>

          <button
            onClick={() => onOpenPolicy('privacy')}
            className="hover:text-white transition flex items-center gap-1"
          >
            <ShieldCheck className="w-3 h-3 text-slate-500" />
            <span>Privacy Policy</span>
          </button>

          <span className="text-slate-700">•</span>

          <button
            onClick={() => onOpenPolicy('pricing')}
            className="hover:text-[#00d4ff] transition flex items-center gap-1 font-semibold"
          >
            <HelpCircle className="w-3 h-3 text-slate-500" />
            <span>Pricing (₹199)</span>
          </button>
        </div>

        {/* Right: Security & Settlement badge */}
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <ShieldCheck className="w-4 h-4 text-[#00d4ff]" />
          <span>Secured by Razorpay • Instant Settlement</span>
        </div>
      </div>
    </footer>
  );
};
