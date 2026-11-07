import React from 'react';
import { ShieldCheck, Mail, FileText, RotateCcw, HelpCircle, Heart } from 'lucide-react';
import { PolicyTab } from './LegalComplianceModal';

interface FooterProps {
  onOpenPolicy: (tab: PolicyTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPolicy }) => {
  return (
    <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/70 text-slate-400 text-xs py-6 px-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Branding & Merchant entity */}
        <div className="flex flex-col items-center md:items-start gap-1">
          <div className="flex items-center gap-2">
            <span className="font-black text-slate-200 tracking-tight text-sm">
              SQLEdge <span className="text-emerald-400">OA</span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-[11px] text-slate-400">
              Operated by <strong>TANVI CHHAPARIA</strong>
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Interactive SQL OA placement platform for engineering students & freshers.
          </p>
        </div>

        {/* Center: Compliance Policy Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px]">
          <button
            onClick={() => onOpenPolicy('contact')}
            className="hover:text-emerald-400 transition flex items-center gap-1"
          >
            <Mail className="w-3 h-3 text-slate-500" />
            <span>Contact Us</span>
          </button>

          <span className="text-slate-700">•</span>

          <button
            onClick={() => onOpenPolicy('refund')}
            className="hover:text-emerald-400 transition flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3 text-slate-500" />
            <span>Refund & Cancellation</span>
          </button>

          <span className="text-slate-700">•</span>

          <button
            onClick={() => onOpenPolicy('terms')}
            className="hover:text-emerald-400 transition flex items-center gap-1"
          >
            <FileText className="w-3 h-3 text-slate-500" />
            <span>Terms of Service</span>
          </button>

          <span className="text-slate-700">•</span>

          <button
            onClick={() => onOpenPolicy('privacy')}
            className="hover:text-emerald-400 transition flex items-center gap-1"
          >
            <ShieldCheck className="w-3 h-3 text-slate-500" />
            <span>Privacy Policy</span>
          </button>

          <span className="text-slate-700">•</span>

          <button
            onClick={() => onOpenPolicy('pricing')}
            className="hover:text-emerald-400 transition flex items-center gap-1"
          >
            <HelpCircle className="w-3 h-3 text-slate-500" />
            <span>Pricing (₹199)</span>
          </button>
        </div>

        {/* Right: Security & Settlement badge */}
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-400/80" />
          <span>Secured by Razorpay • UPI & Card Settlement</span>
        </div>
      </div>
    </footer>
  );
};
