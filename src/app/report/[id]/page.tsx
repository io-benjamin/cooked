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
  critical: { color: '#ef4444', bg: 'bg-red-500/10', border: 'border-red-500/30', dot: 'bg-red-500' },
  high: { color: '#f97316', bg: 'bg-orange-500/10', border: 'border-orange-500/30', dot: 'bg-orange-500' },
  medium: { color: '#f59e0b', bg: 'bg-amber-500/10', border: 'border-amber-500/30', dot: 'bg-amber-500' },
  low: { color: '#22c55e', bg: 'bg-green-500/10', border: 'border-green-500/30', dot: 'bg-green-500' },
};

// Dashboard Card wrapper
function Card({ children, className = '', span = 1 }: { children: React.ReactNode; className?: string; span?: 1 | 2 | 3 }) {
  const spanClass = span === 3 ? 'md:col-span-3' : span === 2 ? 'md:col-span-2' : '';
  return (
    <div className={`bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-5 ${spanClass} ${className}`}>
      {children}
    </div>
  );
}

// Score Ring
function ScoreRing({ score, color, size = 140 }: { score: number; color: string; size?: number }) {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
        <circle
          cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ filter: `drop-shadow(0 0 15px ${color}50)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-black text-white">{score}</span>
      </div>
    </div>
  );
}

// Stat widget
function StatWidget({ label, value, subtext, color, icon }: { label: string; value: string; subtext?: string; color?: string; icon: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl">{icon}</div>
      <div>
        <div className="text-xs text-white/40 uppercase tracking-wider">{label}</div>
        <div className="text-xl font-bold" style={{ color: color || 'white' }}>{value}</div>
        {subtext && <div className="text-xs text-white/40">{subtext}</div>}
      </div>
    </div>
  );
}

// Progress Bar
function ProgressBar({ label, percent, color }: { label: string; percent: number; color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-white/60">{label}</span>
        <span className="text-white font-medium">{percent}%</span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${Math.min(percent, 100)}%`, backgroundColor: color }} />
      </div>
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
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());

  const toggleCard = (index: number) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(index)) newExpanded.delete(index);
    else newExpanded.add(index);
    setExpandedCards(newExpanded);
  };

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
      <main className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="text-center"><div className="text-5xl animate-pulse">📊</div><p className="text-white/50 mt-4">Loading...</p></div>
      </main>
    );
  }

  // Analyzing
  if (analyzing) {
    return (
      <main className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="text-center max-w-sm px-6">
          <ScoreRing score={submission?.score || 0} color={tier.color} />
          <h1 className="text-xl font-bold text-white mt-6 mb-2">Analyzing...</h1>
          <p className="text-white/50 text-sm">Crunching numbers against 1,000+ users</p>
        </div>
      </main>
    );
  }

  // Payment required
  if (error === 'Payment required') {
    return (
      <main className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="text-center space-y-6 max-w-sm px-6">
          <div className="text-6xl">🔒</div>
          <h1 className="text-2xl font-bold text-white">Payment Required</h1>
          <Link href="/" className="inline-block w-full py-4 bg-orange-500 rounded-xl font-bold">Back to Quiz →</Link>
        </div>
      </main>
    );
  }

  // Error
  if (error || !submission || !analysis) {
    return (
      <main className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="text-center"><div className="text-5xl">😕</div><p className="text-white/70 mt-4">{error || 'Something went wrong'}</p></div>
      </main>
    );
  }

  // Calculate values
  const monthlyIncome = submission.annual_income / 12;
  const rentPercent = Math.round((submission.monthly_rent / monthlyIncome) * 100);
  const debtPayments = ((submission.credit_card_debt || 0) * 0.03) + (((submission.student_loans || 0) + (submission.car_loan || 0) + (submission.other_debt || 0)) * 0.02);
  const debtPercent = Math.round((debtPayments / monthlyIncome) * 100);

  const comparisons = [
    { icon: '🏙️', label: 'City', text: analysis.peerComparison.vsCity },
    { icon: '👥', label: 'Age', text: analysis.peerComparison.vsAgeGroup },
    { icon: '💼', label: 'Industry', text: analysis.peerComparison.vsIndustry },
    { icon: '🌍', label: 'Overall', text: analysis.peerComparison.vsOverall },
  ];

  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      {/* Subtle gradient */}
      <div className="fixed inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at top, ${tier.color}08 0%, transparent 50%)` }} />

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#09090b]/90 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">🔥 cooked</Link>
          <span className="text-sm font-bold px-3 py-1 rounded-full" style={{ backgroundColor: `${tier.color}20`, color: tier.color }}>
            {tier.emoji} {tier.name}
          </span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Score Card - spans 1 col */}
          <Card className="flex flex-col items-center justify-center py-8">
            <ScoreRing score={submission.score} color={tier.color} size={160} />
            <p className="mt-4 text-white/50 text-sm text-center max-w-[200px]">Cooked Score</p>
          </Card>

          {/* Summary Card - spans 2 cols */}
          <Card span={2} className="flex flex-col justify-center">
            <div className="text-xs text-white/40 uppercase tracking-wider mb-2">Summary</div>
            <p className="text-lg text-white/90 leading-relaxed mb-4">{analysis.summary.oneLiner}</p>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <span className="text-xl">🎯</span>
              <div>
                <div className="text-xs text-orange-400 uppercase tracking-wider">Top Issue</div>
                <p className="text-white font-medium">{analysis.summary.biggestProblem}</p>
              </div>
            </div>
          </Card>

          {/* Money Stats - 3 small cards */}
          <Card>
            <StatWidget icon="💰" label="Monthly Income" value={`$${Math.round(monthlyIncome).toLocaleString()}`} />
          </Card>
          <Card>
            <StatWidget icon="🏠" label="Rent Burden" value={`${rentPercent}%`} color={rentPercent > 30 ? '#ef4444' : '#4ade80'} subtext={`$${submission.monthly_rent.toLocaleString()}/mo`} />
          </Card>
          <Card>
            <StatWidget icon="📈" label="Savings Rate" value={`${submission.savings_rate}%`} color={submission.savings_rate >= 20 ? '#4ade80' : submission.savings_rate >= 10 ? '#f59e0b' : '#ef4444'} />
          </Card>

          {/* Spending Breakdown - spans 2 cols */}
          <Card span={2}>
            <div className="text-xs text-white/40 uppercase tracking-wider mb-4">💸 Spending Breakdown</div>
            <div className="space-y-4">
              <ProgressBar label="Rent" percent={rentPercent} color="#ef4444" />
              <ProgressBar label="Debt Payments" percent={debtPercent} color="#f97316" />
              <ProgressBar label="Savings" percent={submission.savings_rate} color="#22c55e" />
            </div>
          </Card>

          {/* Net Worth */}
          <Card>
            <StatWidget 
              icon="💎" 
              label="Net Worth" 
              value={`${submission.net_worth < 0 ? '-' : ''}$${Math.abs(submission.net_worth).toLocaleString()}`}
              color={submission.net_worth >= 0 ? '#4ade80' : '#ef4444'}
            />
          </Card>

          {/* Comparisons - each is a card */}
          {comparisons.map((comp, i) => (
            <Card key={i} className="cursor-pointer hover:bg-white/[0.05] transition-colors" onClick={() => toggleCard(i)}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{comp.icon}</span>
                <span className="text-xs text-white/40 uppercase tracking-wider">{comp.label}</span>
              </div>
              <p className={`text-sm text-white/70 leading-relaxed ${expandedCards.has(i) ? '' : 'line-clamp-3'}`}>
                {comp.text}
              </p>
              {!expandedCards.has(i) && comp.text.length > 120 && (
                <div className="text-xs text-white/30 mt-2">tap to expand</div>
              )}
            </Card>
          ))}

          {/* Issues - spans full width */}
          <Card span={3}>
            <div className="text-xs text-white/40 uppercase tracking-wider mb-4">⚠️ What&apos;s Cooking You</div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {analysis.rootCauses.map((cause, i) => {
                const s = SEVERITY[cause.severity];
                return (
                  <div key={i} className={`${s.bg} ${s.border} border rounded-xl p-4`}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-2 h-2 rounded-full ${s.dot}`} />
                      <span className="font-semibold text-white text-sm">{cause.issue}</span>
                    </div>
                    <p className="text-white/60 text-xs leading-relaxed">{cause.explanation}</p>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Action Plan - spans 2 cols */}
          <Card span={2}>
            <div className="text-xs text-white/40 uppercase tracking-wider mb-4">🎯 Action Plan</div>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                <div className="text-xs text-orange-400 uppercase tracking-wider mb-1">⚡ Today</div>
                <p className="text-white font-medium">{analysis.actionPlan.immediate}</p>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-white/5">
                  <div className="text-xs text-white/40 uppercase tracking-wider mb-2">📅 30 Days</div>
                  <ul className="space-y-2">
                    {analysis.actionPlan.thirtyDays.map((item, i) => (
                      <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                        <span className="text-white/30">{i + 1}.</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 rounded-xl bg-white/5">
                  <div className="text-xs text-white/40 uppercase tracking-wider mb-2">🎯 90 Days</div>
                  <ul className="space-y-2">
                    {analysis.actionPlan.ninetyDays.map((item, i) => (
                      <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                        <span className="text-green-400">✓</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          {/* Doing Right */}
          <Card className="bg-green-500/5 border-green-500/20">
            <div className="text-xs text-green-400 uppercase tracking-wider mb-3">💪 Doing Right</div>
            <ul className="space-y-2">
              {analysis.encouragement.map((item, i) => (
                <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                  <span className="text-green-400">✓</span> {item}
                </li>
              ))}
            </ul>
          </Card>

        </div>

        {/* Footer */}
        <div className="mt-8 flex gap-3 max-w-md mx-auto">
          <Link href={`/results/${submission.id}`} className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-center text-sm font-medium hover:bg-white/10 transition">
            🔗 Share
          </Link>
          <Link href="/leaderboard" className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-center text-sm font-medium hover:bg-white/10 transition">
            🏆 Leaderboard
          </Link>
        </div>

        <p className="text-center text-white/30 text-xs py-6 italic">{analysis.disclaimer}</p>
      </div>
    </main>
  );
}
