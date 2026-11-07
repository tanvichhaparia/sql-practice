import React, { useState } from 'react';
import { 
  Compass, 
  Database, 
  Layers, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Flame, 
  Building2, 
  ShieldCheck, 
  TrendingUp,
  Award,
  Terminal,
  Play,
  Zap,
  ChevronRight,
  Code2,
  Check,
  Copy,
  ExternalLink
} from 'lucide-react';
import { UserProgress } from '../types';
import { AuthUser } from '../services/auth';

interface HomeDashboardViewProps {
  progress: UserProgress;
  currentUser: AuthUser | null;
  onNavigate: (mode: 'roadmaps' | 'question-bank' | 'practice' | 'mock-oa' | 'cheat-sheets') => void;
  onSelectCompany: (companyCode: string) => void;
  onOpenUnlockModal: () => void;
}

const FEATURED_COMPANIES = [
  { code: 'TCS', name: 'TCS NQT', count: 32, tier: 'Free Tier', badge: 'Mass Hiring', color: 'from-blue-500/20 to-indigo-500/10' },
  { code: 'INF', name: 'Infosys DSE', count: 28, tier: 'Free Tier', badge: 'Specialist', color: 'from-cyan-500/20 to-blue-500/10' },
  { code: 'AMZ', name: 'Amazon', count: 30, tier: 'Pro Tier', badge: 'FAANG', color: 'from-amber-500/20 to-orange-500/10' },
  { code: 'GOOG', name: 'Google', count: 12, tier: 'Pro Tier', badge: 'Top Tier', color: 'from-red-500/20 to-amber-500/10' },
  { code: 'GS', name: 'Goldman Sachs', count: 25, tier: 'Pro Tier', badge: 'Fintech BFSI', color: 'from-blue-600/20 to-sky-500/10' },
  { code: 'FKT', name: 'Flipkart', count: 22, tier: 'Pro Tier', badge: 'E-Commerce', color: 'from-yellow-500/20 to-amber-500/10' },
  { code: 'SWG', name: 'Swiggy', count: 21, tier: 'Pro Tier', badge: 'Quick Commerce', color: 'from-orange-500/20 to-rose-500/10' },
  { code: 'DEL', name: 'Deloitte', count: 20, tier: 'Pro Tier', badge: 'Consulting', color: 'from-emerald-500/20 to-teal-500/10' },
];

const STRIPE_HERO_TABS = [
  {
    id: 'amazon',
    company: 'Amazon OA',
    badge: 'Window Ranking',
    query: `-- Amazon OA: Find 2nd highest spending customer per region
WITH RankedSpends AS (
  SELECT 
    region,
    customer_id,
    SUM(order_total) AS total_spend,
    DENSE_RANK() OVER (
      PARTITION BY region 
      ORDER BY SUM(order_total) DESC
    ) AS rnk
  FROM customer_orders
  GROUP BY region, customer_id
)
SELECT region, customer_id, total_spend
FROM RankedSpends
WHERE rnk = 2;`,
    output: [
      { region: 'North', customer_id: 'CUST-1042', total_spend: '₹48,250' },
      { region: 'South', customer_id: 'CUST-3891', total_spend: '₹39,120' },
      { region: 'West', customer_id: 'CUST-7210', total_spend: '₹34,800' },
    ],
    execTime: '0.9ms',
    status: 'All 4 Edge Cases Passed (Ties, Nulls, Single Rows)',
  },
  {
    id: 'goldman',
    company: 'Goldman Sachs',
    badge: 'BFSI Anomaly',
    query: `-- Goldman Sachs: Consecutive High-Value Outlier Detection
WITH TxnLags AS (
  SELECT 
    account_id,
    amount,
    created_at,
    LAG(amount, 1) OVER (PARTITION BY account_id ORDER BY created_at) AS prev_amt
  FROM bank_transactions
)
SELECT account_id, amount, prev_amt
FROM TxnLags
WHERE amount >= (prev_amt * 3.5) AND amount > 50000;`,
    output: [
      { account_id: 'AC-9921', amount: '₹1,85,000', prev_amt: '₹12,400' },
      { account_id: 'AC-4012', amount: '₹75,200', prev_amt: '₹8,900' },
    ],
    execTime: '1.2ms',
    status: 'Zero Division Guard & Null LAG Verified',
  },
  {
    id: 'swiggy',
    company: 'Swiggy / Flipkart',
    badge: 'Retention Cohort',
    query: `-- 30-Day Churn Recovery Rate per Delivery Hub
SELECT 
  hub_id,
  COUNT(DISTINCT user_id) AS active_users,
  ROUND(
    100.0 * COUNT(CASE WHEN is_churned = 0 THEN 1 END) / 
    NULLIF(COUNT(DISTINCT user_id), 0), 2
  ) AS retention_rate_pct
FROM delivery_cohorts
GROUP BY hub_id
HAVING COUNT(DISTINCT user_id) >= 50
ORDER BY retention_rate_pct DESC;`,
    output: [
      { hub_id: 'BLR-KOR', active_users: '3,842', retention_rate_pct: '84.6%' },
      { hub_id: 'DEL-NCR', active_users: '2,910', retention_rate_pct: '79.2%' },
      { hub_id: 'MUM-AND', active_users: '3,104', retention_rate_pct: '76.8%' },
    ],
    execTime: '0.8ms',
    status: 'Integer Truncation & Division by Zero Handled',
  },
];

export const HomeDashboardView: React.FC<HomeDashboardViewProps> = ({
  progress,
  currentUser,
  onNavigate,
  onSelectCompany,
  onOpenUnlockModal,
}) => {
  const [activeHeroTab, setActiveHeroTab] = useState(STRIPE_HERO_TABS[0]);
  const [isCopied, setIsCopied] = useState(false);
  const [hasRun, setHasRun] = useState(true);

  const solvedQueries = Object.keys(progress.companyBankProgress?.solvedQueries || {}).length;
  const answeredMcqs = Object.keys(progress.companyBankProgress?.mcqAnswers || {}).length;
  const masteredConcepts = Object.values(progress.companyBankProgress?.masteredConcepts || {}).filter(Boolean).length;
  const solvedOaProblems = Object.values(progress.problemStatus).filter((s) => s === 'passed_all_edge_cases').length;
  const totalCompleted = solvedQueries + answeredMcqs + masteredConcepts;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeHeroTab.query);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="relative overflow-hidden stripe-mesh-gradient min-h-[calc(100vh-3.5rem)] text-slate-100">
      {/* Stripe-style Ambient Blurred Color Blobs in Background */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#635bff]/15 rounded-full filter blur-[100px] pointer-events-none" />
      <div className="absolute top-40 right-10 w-96 h-96 bg-[#00d4ff]/10 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute top-[600px] left-10 w-96 h-96 bg-[#10b981]/10 rounded-full filter blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 space-y-20 relative z-10">
        
        {/* ========================================================= */}
        {/* HERO SECTION (Iconic Stripe 2-Column Mesh Hero) */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Hero Column: Typography & CTAs */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Stripe Announcement Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/10 hover:border-white/20 backdrop-blur-md text-xs font-medium text-slate-200 transition group cursor-pointer"
                 onClick={() => onNavigate('roadmaps')}>
              <span className="flex h-2 w-2 rounded-full bg-[#00d4ff] animate-pulse"></span>
              <span className="font-semibold text-white">2026 Placement Season</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300 group-hover:text-white transition flex items-center gap-1">
                534 Real Company Tracks Ready
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-[-0.03em] leading-[1.08] text-white">
              Placement-grade <br />
              <span className="stripe-accent-gradient">SQL assessment</span> <br />
              infrastructure.
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-300 max-w-xl font-normal leading-relaxed">
              {currentUser 
                ? `Welcome back, ${currentUser.name.split(' ')[0]}! Continue cracking real SQL OA queries.`
                : 'Master real SQL interview questions tested by Amazon, Google, Flipkart, Goldman Sachs, and TCS. Practice edge cases, window functions, and timed OA exam simulations.'}
            </p>

            {/* Stripe-style CTA Button Group */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onNavigate('roadmaps')}
                className="px-6 py-3.5 rounded-full stripe-btn-primary font-bold text-sm flex items-center gap-2 group shadow-xl shadow-[#635bff]/25"
              >
                <span>Start Guided Track</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition duration-200" />
              </button>

              <button
                onClick={() => onNavigate('question-bank')}
                className="px-6 py-3.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-white font-semibold text-sm border border-white/10 hover:border-white/20 backdrop-blur-md transition flex items-center gap-2"
              >
                <Database className="w-4 h-4 text-[#00d4ff]" />
                <span>Explore 534 Questions</span>
              </button>

              <button
                onClick={onOpenUnlockModal}
                className="px-4 py-2 rounded-full text-xs font-bold text-[#00d4ff] hover:text-white transition flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#00d4ff]" />
                <span>Pro Pass ₹199</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Student Trust Stats */}
            <div className="pt-6 border-t border-white/10 flex flex-wrap items-center gap-8 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Instant Test-Case Feedback</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00d4ff]" />
                <span>534 Company Problems</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#635bff]" />
                <span>₹199 Lifetime Access</span>
              </div>
            </div>
          </div>

          {/* Right Hero Column: Interactive Stripe Code Terminal */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl bg-[#0b1329]/95 border border-white/10 shadow-2xl overflow-hidden backdrop-blur-xl">
              
              {/* Window Controls Bar */}
              <div className="px-4 py-3 bg-[#080d1a] border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                  <span className="ml-2 font-mono text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-[#635bff]" />
                    <span>oa-simulator.sql</span>
                  </span>
                </div>

                <button
                  onClick={handleCopyCode}
                  className="text-slate-400 hover:text-white transition p-1 text-[11px] flex items-center gap-1 font-mono"
                  title="Copy SQL code"
                >
                  {isCopied ? (
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

              {/* Scenario Tabs (Stripe style) */}
              <div className="flex bg-[#080d1a]/60 border-b border-white/5 px-2 pt-1.5 gap-1 overflow-x-auto scrollbar-none">
                {STRIPE_HERO_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveHeroTab(tab);
                      setHasRun(true);
                    }}
                    className={`px-3 py-1.5 rounded-t-lg text-[11px] font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                      activeHeroTab.id === tab.id
                        ? 'bg-[#0b1329] text-white border-t-2 border-[#635bff]'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
                    }`}
                  >
                    <span>{tab.company}</span>
                    <span className="text-[9px] px-1 rounded bg-white/10 text-slate-300">
                      {tab.badge}
                    </span>
                  </button>
                ))}
              </div>

              {/* Code Editor Window */}
              <div className="p-4 bg-[#070b18]">
                <pre className="font-mono text-[11.5px] leading-relaxed text-indigo-200 overflow-x-auto max-h-56 scrollbar-thin">
                  <code>{activeHeroTab.query}</code>
                </pre>
              </div>

              {/* Live Output & Execution Result (Stripe Terminal Output) */}
              <div className="p-4 bg-[#080d1a] border-t border-white/10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-[11px] font-bold text-emerald-400 font-mono">
                      Query Result ({activeHeroTab.execTime})
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400/90 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Interactive SQL Sandbox
                  </span>
                </div>

                {/* Micro Table */}
                <div className="rounded-lg border border-white/5 overflow-hidden font-mono text-[11px]">
                  <table className="w-full text-left">
                    <thead className="bg-white/[0.03] text-slate-400 border-b border-white/5">
                      <tr>
                        {Object.keys(activeHeroTab.output[0]).map((col) => (
                          <th key={col} className="py-1 px-2.5 uppercase font-semibold text-[10px]">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-200 bg-[#070b18]/50">
                      {activeHeroTab.output.map((row, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.02]">
                          {Object.values(row).map((val, cIdx) => (
                            <td key={cIdx} className="py-1 px-2.5 text-slate-300">
                              {val}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 font-medium">
                  <span className="text-emerald-400/90 font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    {activeHeroTab.status}
                  </span>
                  <button
                    onClick={() => onNavigate('practice')}
                    className="text-[#00d4ff] hover:underline flex items-center gap-1"
                  >
                    Open in IDE →
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* ========================================================= */}
        {/* STRIPE COMPANY LOGO MARQUEE STRIP */}
        {/* ========================================================= */}
        <div className="pt-6 pb-2 border-y border-white/5">
          <p className="text-center text-xs font-semibold uppercase tracking-wider text-slate-500 mb-6">
            Real Interview Questions Filtered from Top Indian Technical Assessments
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 items-center justify-center">
            {FEATURED_COMPANIES.map((c) => (
              <button
                key={c.code}
                onClick={() => onSelectCompany(c.code)}
                className="group flex flex-col items-center justify-center p-3 rounded-xl hover:bg-white/[0.04] transition border border-transparent hover:border-white/10 text-center"
              >
                <span className="text-sm font-bold text-slate-300 group-hover:text-white transition">
                  {c.name}
                </span>
                <span className="text-[10px] font-medium text-slate-500 group-hover:text-[#00d4ff] mt-0.5">
                  {c.count} Questions
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ========================================================= */}
        {/* STRIPE METRIC HIGHLIGHTS STRIP */}
        {/* ========================================================= */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 sm:p-8 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-md">
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
              534<span className="text-[#635bff]">+</span>
            </div>
            <div className="text-xs font-semibold text-slate-300">Placement Questions</div>
            <p className="text-[11px] text-slate-500">Across 26 curated company tracks</p>
          </div>

          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
              26<span className="text-[#00d4ff]">+</span>
            </div>
            <div className="text-xs font-semibold text-slate-300">Top Tech Companies</div>
            <p className="text-[11px] text-slate-500">Amazon, Google, Goldman & Flipkart</p>
          </div>

          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
              9<span className="text-emerald-400"> Tracks</span>
            </div>
            <div className="text-xs font-semibold text-slate-300">Guided Roadmaps</div>
            <p className="text-[11px] text-slate-500">From basics to window functions</p>
          </div>

          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
              ₹199
            </div>
            <div className="text-xs font-semibold text-slate-300">Lifetime Student Pass</div>
            <p className="text-[11px] text-slate-500">One-time payment, zero subscriptions</p>
          </div>
        </div>

        {/* ========================================================= */}
        {/* STRIPE BENTO GRID (A Fully Integrated Platform) */}
        {/* ========================================================= */}
        <div className="space-y-8">
          <div className="max-w-2xl space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-[#635bff]">
              A Unified Preparation Platform
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Everything required to clear your dream technical assessment.
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              We eliminated boring static textbooks. Experience interactive sandboxes designed to replicate test conditions at TCS, Infosys, Amazon, Swiggy, and Goldman Sachs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Bento Card 1: Guided Roadmaps */}
            <div 
              onClick={() => onNavigate('roadmaps')}
              className="p-6 rounded-3xl stripe-card-gradient transition-all duration-300 cursor-pointer group flex flex-col justify-between hover:-translate-y-1"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#635bff]/15 border border-[#635bff]/30 text-[#635bff] flex items-center justify-center group-hover:scale-105 transition">
                  <Compass className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-[#635bff] uppercase tracking-wider">Structured Path</div>
                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition mt-1">
                    Placement Roadmaps
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Step-by-step tracks tailored for Service (TCS/Infy), Tier-1 Product (Amazon/Google), and Fintech BFSI roles.
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 mt-6 flex items-center justify-between text-xs font-semibold text-[#635bff]">
                <span>5 Dedicated Tracks</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition" />
              </div>
            </div>

            {/* Bento Card 2: Question Bank */}
            <div 
              onClick={() => onNavigate('question-bank')}
              className="p-6 rounded-3xl stripe-card-gradient transition-all duration-300 cursor-pointer group flex flex-col justify-between hover:-translate-y-1"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#00d4ff]/15 border border-[#00d4ff]/30 text-[#00d4ff] flex items-center justify-center group-hover:scale-105 transition">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-[#00d4ff] uppercase tracking-wider">Complete Catalog</div>
                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition mt-1">
                    534 Question Bank
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Search and filter by 26 companies, question formats (SQL Query, MCQs, Concepts), and difficulty tiers.
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 mt-6 flex items-center justify-between text-xs font-semibold text-[#00d4ff]">
                <span>236 Free • 298 Pro</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition" />
              </div>
            </div>

            {/* Bento Card 3: OA Simulator */}
            <div 
              onClick={() => onNavigate('practice')}
              className="p-6 rounded-3xl stripe-card-gradient transition-all duration-300 cursor-pointer group flex flex-col justify-between hover:-translate-y-1"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center group-hover:scale-105 transition">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">Hidden Edge Cases</div>
                  <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition mt-1">
                    OA Edge-Case Simulator
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    4-stage hidden test validator testing NULL records, tied ranks, empty tables, and boundary dates.
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 mt-6 flex items-center justify-between text-xs font-semibold text-purple-400">
                <span>{solvedOaProblems} / 12 Mastered</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition" />
              </div>
            </div>

            {/* Bento Card 4: Timed Mock OA */}
            <div 
              onClick={() => onNavigate('mock-oa')}
              className="p-6 rounded-3xl stripe-card-gradient transition-all duration-300 cursor-pointer group flex flex-col justify-between hover:-translate-y-1"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center group-hover:scale-105 transition">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Exam Simulator</div>
                  <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition mt-1">
                    45-Min Timed Mocks
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    3 timed assessments with countdown clock, auto-save drafts, and diagnostic performance reports.
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 mt-6 flex items-center justify-between text-xs font-semibold text-amber-400">
                <span>3 Full Mock OAs</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition" />
              </div>
            </div>

          </div>
        </div>

        {/* ========================================================= */}
        {/* STRIPE-STYLE PRICING SECTION */}
        {/* ========================================================= */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#0c1328] via-[#090e1f] to-[#0d1c38] border border-white/10 relative overflow-hidden shadow-2xl">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#635bff]/20 rounded-full filter blur-[90px] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl">
              <span className="px-3 py-1 rounded-full bg-[#635bff]/20 border border-[#635bff]/40 text-[#00d4ff] text-xs font-bold uppercase tracking-wider">
                Transparent Pricing
              </span>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                One-Time Lifetime Student Pass
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Unlock all 534 company OA questions (Amazon, Google, Goldman Sachs, Swiggy, Flipkart), 12 multi-stage OA edge cases, and 3 timed mocks with verified instant settlement via Razorpay or direct UPI.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>All 534 Company Solutions</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>No monthly subscriptions</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Instant UPI & Card Activation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Lifetime Access & Updates</span>
                </div>
              </div>
            </div>

            {/* Price Box */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[#080d1a]/90 border border-white/15 w-full lg:w-80 shrink-0 text-center space-y-4 shadow-xl">
              <div className="space-y-1">
                <div className="text-xs text-slate-400 uppercase font-semibold">Special Student Tier</div>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl sm:text-5xl font-black text-white font-mono">₹199</span>
                  <span className="text-xs text-slate-400 font-medium">/ lifetime</span>
                </div>
                <div className="text-[11px] text-emerald-400 font-semibold">
                  Zero recurring fees
                </div>
              </div>

              <button
                onClick={onOpenUnlockModal}
                className="w-full py-3.5 px-4 rounded-xl stripe-btn-primary font-bold text-xs tracking-wide uppercase transition shadow-lg shadow-[#635bff]/30"
              >
                Unlock Pro Pass Now
              </button>

              <div className="text-[10px] text-slate-400">
                Google Pay • PhonePe • Paytm • Cards • UPI
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
