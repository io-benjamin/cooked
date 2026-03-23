'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Analysis {
  summary: { oneLiner: string; biggestProblem: string };
  peerComparison: { vsCity: string; vsAgeGroup: string; vsIndustry: string; vsOverall: string };
  rootCauses: Array<{ issue: string; explanation: string; severity: 'critical' | 'high' | 'medium' | 'low' }>;
  actionPlan: { immediate: string; thirtyDays: string[]; ninetyDays: string[] };
  encouragement: string[];
  disclaimer: string;
}

interface Submission {
  id: string; score: number; tier: string; paid: boolean; ai_analysis: Analysis | null;
  age: number; city: string; industry: string; annual_income: number; monthly_rent: number;
  student_loans: number; credit_card_debt: number; car_loan: number; other_debt: number;
  emergency_savings: number; retirement_savings: number; investments: number;
  living_arrangement: string; dti: number; rent_burden: number; savings_rate: number; net_worth: number;
}

const TIERS: Record<string, { name: string; emoji: string; color: string }> = {
  'raw': { name: 'RAW', emoji: '🧊', color: '#22d3ee' },
  'light-sizzle': { name: 'LIGHT SIZZLE', emoji: '🍳', color: '#4ade80' },
  'simmering': { name: 'SIMMERING', emoji: '🥘', color: '#f59e0b' },
  'sauteed': { name: 'SAUTÉED', emoji: '🔥', color: '#f97316' },
  'well-done': { name: 'WELL DONE', emoji: '☠️', color: '#ef4444' },
  'charred': { name: 'CHARRED', emoji: '💀', color: '#991b1b' },
};

const SEVERITY = {
  critical: { color: '#ef4444', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  high: { color: '#f97316', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  medium: { color: '#f59e0b', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  low: { color: '#22c55e', bg: 'bg-green-500/10', border: 'border-green-500/30' },
};

// Circular Progress Ring
function ScoreRing({ score, color, size = 200 }: { score: number; color: string; size?: number }) {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background ring */}
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={strokeWidth} />
        {/* Progress ring */}
        <circle
          cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ filter: `drop-shadow(0 0 20px ${color}60)`, transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-black text-white">{score}</span>
        <span className="text-xs text-white/50 uppercase tracking-widest">Score</span>
      </div>
    </div>
  );
}

// Horizontal Bar
function HorizontalBar({ label, percent, amount, color }: { label: string; percent: number; amount: number; color: string }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-white/70">{label}</span>
        <span className="text-white font-medium">{percent}% <span className="text-white/40">${amount.toLocaleString()}</span></span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(percent, 100)}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

// Comparison Card
function ComparisonCard({ icon, label, text }: { icon: string; label: string; text: string }) {
  return (
    <div className="min-w-[280px] snap-center bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{icon}</span>
        <span className="text-xs font-bold uppercase tracking-widest text-white/40">{label}</span>
      </div>
      <p className="text-white/80 text-sm leading-relaxed">{text}</p>
    </div>
  );
}

// Issue Card
function IssueCard({ issue, explanation, severity }: { issue: string; explanation: string; severity: keyof typeof SEVERITY }) {
  const s = SEVERITY[severity];
  return (
    <div className={`${s.bg} ${s.border} border rounded-xl p-4`}>
      <div className="flex items-start gap-3">
        <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: s.color }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-white">{issue}</span>
            <span className="text-xs px-2 py-0.5 rounded-full uppercase font-bold" style={{ backgroundColor: `${s.color}20`, color: s.color }}>
              {severity}
            </span>
          </div>
          <p className="text-white/60 text-sm leading-relaxed">{explanation}</p>
        </div>
      </div>
    </div>
  );
}

// Timeline Item
function TimelineItem({ period, items, icon, highlight }: { period: string; items: string[]; icon: string; highlight?: boolean }) {
  return (
    <div className={`relative pl-8 pb-6 ${highlight ? '' : 'border-l border-white/10'}`}>
      <div className={`absolute left-0 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center text-sm ${highlight ? 'bg-orange-500' : 'bg-white/10'}`}>
        {icon}
      </div>
      <div className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">{period}</div>
      {items.map((item, i) => (
        <p key={i} className={`text-sm leading-relaxed ${highlight ? 'text-white font-medium' : 'text-white/70'} ${i > 0 ? 'mt-2' : ''}`}>
          {item}
        </p>
      ))}
    </div>
  );
}

export default function ReportPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const sessionId = searchParams.get('session_id');
  
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAndAnalyze() {
      try {
        const res = await fetch(`/api/submissions/${id}`);
        if (!res.ok) { setError('Report not found'); setLoading(false); return; }
        
        const data = await res.json();
        setSubmission(data);
        
        if (data.paid) { /* OK */ }
        else if (sessionId) {
          const verifyRes = await fetch(`/api/verify-payment?session_id=${sessionId}`);
          const verifyData = await verifyRes.json();
          if (!verifyData.paid) { setError('Payment required'); setLoading(false); return; }
          await fetch(`/api/submissions/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paid: true }) });
        } else { setError('Payment required'); setLoading(false); return; }
        
        if (data.ai_analysis) { setAnalysis(data.ai_analysis); setLoading(false); return; }
        
        setLoading(false);
        setAnalyzing(true);
        
        const analysisRes = await fetch('/api/analyze', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            age: data.age, city: data.city, industry: data.industry,
            annualIncome: data.annual_income, monthlyRent: data.monthly_rent,
            studentLoans: data.student_loans || 0, creditCardDebt: data.credit_card_debt || 0,
            carLoan: data.car_loan || 0, otherDebt: data.other_debt || 0,
            totalSavings: data.emergency_savings || 0, retirementSavings: data.retirement_savings || 0,
            investments: data.investments || 0, livingArrangement: data.living_arrangement || 'alone',
          }),
        });
        
        if (!analysisRes.ok) throw new Error('Analysis failed');
        const analysisData = await analysisRes.json();
        setAnalysis(analysisData.analysis);
        await fetch(`/api/submissions/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ aiAnalysis: analysisData.analysis }) });
        setAnalyzing(false);
      } catch { setError('Failed to load report'); setLoading(false); setAnalyzing(false); }
    }
    fetchAndAnalyze();
  }, [id, sessionId]);

  const tier = submission ? (TIERS[submission.tier] || TIERS['simmering']) : TIERS['simmering'];

  // Loading
  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center"><div className="text-5xl animate-pulse">📊</div><p className="text-white/50 mt-4">Loading...</p></div>
      </main>
    );
  }

  // Analyzing
  if (analyzing) {
    return (
      <main className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center max-w-sm px-6">
          <div className="mb-8"><ScoreRing score={submission?.score || 0} color={tier.color} size={160} /></div>
          <h1 className="text-2xl font-bold text-white mb-2">Analyzing your finances...</h1>
          <p className="text-white/50 text-sm">Comparing you to 1,000+ users and building your action plan.</p>
        </div>
      </main>
    );
  }

  // Payment required
  if (error === 'Payment required') {
    return (
      <main className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center space-y-6 max-w-sm px-6">
          <div className="text-6xl">🔒</div>
          <h1 className="text-2xl font-bold text-white">Payment Required</h1>
          <p className="text-white/50">Complete payment to unlock your full report.</p>
          <Link href="/" className="inline-block w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl font-bold text-center">
            Back to Quiz →
          </Link>
        </div>
      </main>
    );
  }

  // Error
  if (error || !submission || !analysis) {
    return (
      <main className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center space-y-4"><div className="text-5xl">😕</div><p className="text-white/70">{error || 'Something went wrong'}</p></div>
      </main>
    );
  }

  // Calculate spending breakdown
  const monthlyIncome = submission.annual_income / 12;
  const rentPercent = Math.round((submission.monthly_rent / monthlyIncome) * 100);
  const debtPayments = ((submission.credit_card_debt || 0) * 0.03) + (((submission.student_loans || 0) + (submission.car_loan || 0) + (submission.other_debt || 0)) * 0.02);
  const debtPercent = Math.round((debtPayments / monthlyIncome) * 100);
  const savingsAmount = monthlyIncome * (submission.savings_rate / 100);
  const savingsPercent = submission.savings_rate;

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Gradient orb */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none" 
        style={{ background: `radial-gradient(ellipse at center, ${tier.color}15 0%, transparent 70%)` }} />

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0a0f]/80 border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-2xl">🔥</Link>
          <span className="text-sm font-bold uppercase tracking-widest" style={{ color: tier.color }}>{tier.emoji} {tier.name}</span>
          <Link href={`/results/${submission.id}`} className="text-white/50 text-sm">Share</Link>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6 relative z-10">

        {/* Hero: Score Ring */}
        <section className="flex flex-col items-center text-center pt-4 pb-2">
          <ScoreRing score={submission.score} color={tier.color} />
          <p className="mt-6 text-white/60 text-sm leading-relaxed max-w-xs">{analysis.summary.oneLiner}</p>
        </section>

        {/* Top Issue */}
        <section className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-xl">🎯</div>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-1">Top Issue</div>
              <p className="text-white font-medium">{analysis.summary.biggestProblem}</p>
            </div>
          </div>
        </section>

        {/* Spending Breakdown */}
        <section className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">💸</span>
            <span className="text-xs font-bold uppercase tracking-widest text-white/40">Where Your Money Goes</span>
          </div>
          <HorizontalBar label="Rent" percent={rentPercent} amount={submission.monthly_rent} color="#ef4444" />
          <HorizontalBar label="Debt Payments" percent={debtPercent} amount={Math.round(debtPayments)} color="#f97316" />
          <HorizontalBar label="Savings" percent={savingsPercent} amount={Math.round(savingsAmount)} color="#22c55e" />
          <div className="pt-3 border-t border-white/10 flex justify-between text-sm">
            <span className="text-white/50">Monthly Income</span>
            <span className="font-bold text-white">${Math.round(monthlyIncome).toLocaleString()}</span>
          </div>
        </section>

        {/* Peer Comparisons - Horizontal Scroll */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <span className="text-xl">📊</span>
            <span className="text-xs font-bold uppercase tracking-widest text-white/40">How You Compare</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
            <ComparisonCard icon="🏙️" label="Your City" text={analysis.peerComparison.vsCity} />
            <ComparisonCard icon="👥" label="Age Group" text={analysis.peerComparison.vsAgeGroup} />
            <ComparisonCard icon="💼" label="Industry" text={analysis.peerComparison.vsIndustry} />
            <ComparisonCard icon="🌍" label="Overall" text={analysis.peerComparison.vsOverall} />
          </div>
        </section>

        {/* Issues */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <span className="text-xl">⚠️</span>
            <span className="text-xs font-bold uppercase tracking-widest text-white/40">What&apos;s Cooking You</span>
          </div>
          <div className="space-y-3">
            {analysis.rootCauses.map((cause, i) => (
              <IssueCard key={i} issue={cause.issue} explanation={cause.explanation} severity={cause.severity} />
            ))}
          </div>
        </section>

        {/* Action Plan Timeline */}
        <section className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xl">🎯</span>
            <span className="text-xs font-bold uppercase tracking-widest text-white/40">Action Plan</span>
          </div>
          <div className="ml-3">
            <TimelineItem period="Today" items={[analysis.actionPlan.immediate]} icon="⚡" highlight />
            <TimelineItem period="30 Days" items={analysis.actionPlan.thirtyDays} icon="📅" />
            <TimelineItem period="90 Days" items={analysis.actionPlan.ninetyDays} icon="🎯" />
          </div>
        </section>

        {/* What You're Doing Right */}
        <section className="bg-green-500/5 border border-green-500/20 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">💪</span>
            <span className="text-xs font-bold uppercase tracking-widest text-green-400">What You&apos;re Doing Right</span>
          </div>
          <ul className="space-y-3">
            {analysis.encouragement.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-green-400 mt-0.5">✓</span>
                <span className="text-white/80 text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Footer Actions */}
        <section className="flex gap-3 pt-2">
          <Link href={`/results/${submission.id}`} className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-center text-sm font-medium text-white/70 hover:bg-white/10 transition">
            🔗 Share
          </Link>
          <Link href="/leaderboard" className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-center text-sm font-medium text-white/70 hover:bg-white/10 transition">
            🏆 Leaderboard
          </Link>
        </section>

        {/* Disclaimer */}
        <p className="text-center text-white/30 text-xs py-4 italic">{analysis.disclaimer}</p>

      </div>
    </main>
  );
}
