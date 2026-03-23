'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { IncomeBreakdown } from '@/components/charts/IncomeBreakdown';

interface Analysis {
  summary: {
    oneLiner: string;
    biggestProblem: string;
  };
  peerComparison: {
    vsCity: string;
    vsAgeGroup: string;
    vsIndustry: string;
    vsOverall: string;
  };
  rootCauses: Array<{
    issue: string;
    explanation: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
  }>;
  actionPlan: {
    immediate: string;
    thirtyDays: string[];
    ninetyDays: string[];
  };
  encouragement: string[];
  disclaimer: string;
}

interface Submission {
  id: string;
  score: number;
  tier: string;
  paid: boolean;
  ai_analysis: Analysis | null;
  age: number;
  city: string;
  industry: string;
  annual_income: number;
  monthly_rent: number;
  student_loans: number;
  credit_card_debt: number;
  car_loan: number;
  other_debt: number;
  emergency_savings: number;
  retirement_savings: number;
  investments: number;
  living_arrangement: string;
  dti: number;
  rent_burden: number;
  savings_rate: number;
  net_worth: number;
}

const TIER_INFO: Record<string, { name: string; emoji: string; color: string }> = {
  'raw': { name: 'RAW', emoji: '🧊', color: '#22d3ee' },
  'light-sizzle': { name: 'LIGHT SIZZLE', emoji: '🍳', color: '#4ade80' },
  'simmering': { name: 'SIMMERING', emoji: '🥘', color: '#facc15' },
  'sauteed': { name: 'SAUTÉED', emoji: '🔥', color: '#fb923c' },
  'well-done': { name: 'WELL DONE', emoji: '☠️', color: '#f87171' },
  'charred': { name: 'CHARRED', emoji: '💀', color: '#991b1b' },
};

const SEVERITY_CONFIG = {
  critical: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', badge: 'bg-red-500/20 text-red-400' },
  high: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', badge: 'bg-orange-500/20 text-orange-400' },
  medium: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', badge: 'bg-yellow-500/20 text-yellow-400' },
  low: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', badge: 'bg-green-500/20 text-green-400' },
};

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
        if (!res.ok) {
          setError('Report not found');
          setLoading(false);
          return;
        }
        
        const data = await res.json();
        setSubmission(data);
        
        // Check if already paid
        if (data.paid) {
          // Already verified paid, continue
        } else if (sessionId) {
          // Verify the Stripe session is actually paid
          const verifyRes = await fetch(`/api/verify-payment?session_id=${sessionId}`);
          const verifyData = await verifyRes.json();
          
          if (!verifyData.paid) {
            setError('Payment required');
            setLoading(false);
            return;
          }
          
          // Mark as paid in our database
          await fetch(`/api/submissions/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paid: true }),
          });
        } else {
          setError('Payment required');
          setLoading(false);
          return;
        }
        
        // If we already have analysis cached, use it
        if (data.ai_analysis) {
          setAnalysis(data.ai_analysis);
          setLoading(false);
          return;
        }
        
        // Otherwise, run the analysis
        setLoading(false);
        setAnalyzing(true);
        
        const analysisRes = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            age: data.age,
            city: data.city,
            industry: data.industry,
            annualIncome: data.annual_income,
            monthlyRent: data.monthly_rent,
            studentLoans: data.student_loans || 0,
            creditCardDebt: data.credit_card_debt || 0,
            carLoan: data.car_loan || 0,
            otherDebt: data.other_debt || 0,
            totalSavings: data.emergency_savings || 0,
            retirementSavings: data.retirement_savings || 0,
            investments: data.investments || 0,
            livingArrangement: data.living_arrangement || 'alone',
          }),
        });
        
        if (!analysisRes.ok) throw new Error('Analysis failed');
        
        const analysisData = await analysisRes.json();
        setAnalysis(analysisData.analysis);
        
        // Cache the analysis
        await fetch(`/api/submissions/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ aiAnalysis: analysisData.analysis }),
        });
        
        setAnalyzing(false);
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load report');
        setLoading(false);
        setAnalyzing(false);
      }
    }
    
    fetchAndAnalyze();
  }, [id, sessionId]);

  const tier = submission ? (TIER_INFO[submission.tier] || TIER_INFO['simmering']) : TIER_INFO['simmering'];

  // Loading state
  if (loading) {
    return (
      <main className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl animate-pulse">📊</div>
          <p className="text-white/50 mt-4">Loading your report...</p>
        </div>
      </main>
    );
  }

  // Analyzing state
  if (analyzing) {
    return (
      <main className="min-h-screen bg-[#050505] flex items-center justify-center relative overflow-hidden">
        <div className="fixed inset-0 grid-bg opacity-30" />
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] blur-3xl pointer-events-none"
          style={{ background: `radial-gradient(ellipse at center, ${tier.color}20 0%, transparent 70%)` }} />
        
        <div className="relative text-center max-w-md px-6">
          <div className="text-6xl mb-6 animate-bounce">🔥</div>
          <h1 className="text-3xl font-black text-white mb-3">Crunching the numbers...</h1>
          <p className="text-white/50 leading-relaxed">
            Comparing your finances to {'>'}1,000 users and generating your personalized action plan.
          </p>
          <div className="mt-8 flex justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-full animate-bounce"
                style={{ 
                  backgroundColor: tier.color,
                  animationDelay: `${i * 0.15}s`,
                  animationDuration: '0.8s'
                }}
              />
            ))}
          </div>
        </div>
      </main>
    );
  }

  // Payment required
  if (error === 'Payment required') {
    return (
      <main className="min-h-screen bg-[#050505] flex items-center justify-center relative overflow-hidden">
        <div className="fixed inset-0 grid-bg opacity-30" />
        <div className="text-center space-y-6 max-w-md px-6 relative">
          <div className="text-6xl">🔒</div>
          <h1 className="text-3xl font-black text-white">Payment Required</h1>
          <p className="text-white/50 leading-relaxed">
            Complete payment to unlock your full AI-powered financial analysis and personalized action plan.
          </p>
          <Link
            href="/"
            className="inline-block px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl font-bold text-lg hover:scale-105 transition-transform"
          >
            Back to Quiz →
          </Link>
        </div>
      </main>
    );
  }

  // Error state
  if (error || !submission || !analysis) {
    return (
      <main className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-5xl">😕</div>
          <p className="text-white/70 text-lg">{error || 'Something went wrong'}</p>
          <Link href="/" className="inline-block px-6 py-3 bg-white/10 rounded-xl font-semibold hover:bg-white/20 transition">
            Go Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 grid-bg opacity-30" />
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] blur-3xl pointer-events-none"
        style={{ background: `radial-gradient(ellipse at center, ${tier.color}15 0%, transparent 70%)` }}
      />

      {/* Header */}
      <header className="relative z-50 border-b border-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="text-3xl group-hover:animate-pulse">🔥</span>
            <span className="font-black text-xl tracking-tight">
              am i <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">cooked</span>?
            </span>
          </Link>
          <div className="px-3 py-1 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 text-sm font-medium text-orange-400">
            Full Report
          </div>
        </div>
      </header>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6">

          {/* Hero Section */}
          <section className="glass rounded-3xl p-8 text-center relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-30"
              style={{ background: `radial-gradient(ellipse at center, ${tier.color}30 0%, transparent 70%)` }}
            />
            
            <div className="relative">
              <div className="text-white/40 text-sm mb-3 uppercase tracking-widest">Your Score</div>
              <div
                className="text-8xl font-black leading-none mb-2"
                style={{ color: tier.color, textShadow: `0 0 60px ${tier.color}50` }}
              >
                {submission.score}
              </div>
              <div className="flex items-center justify-center gap-2 mb-6" style={{ color: tier.color }}>
                <span className="text-2xl">{tier.emoji}</span>
                <span className="font-black text-xl uppercase tracking-wider">{tier.name}</span>
              </div>
              
              <div className="max-w-md mx-auto">
                <p className="text-white/70 text-lg leading-relaxed">{analysis.summary.oneLiner}</p>
              </div>
            </div>
          </section>

          {/* Main Problem */}
          <section className="glass rounded-2xl p-6 border-l-4" style={{ borderLeftColor: tier.color }}>
            <div className="flex items-start gap-4">
              <div className="text-3xl">🎯</div>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-white/40 mb-1">Your #1 Issue</div>
                <p className="text-white font-semibold text-lg">{analysis.summary.biggestProblem}</p>
              </div>
            </div>
          </section>

          {/* Income Breakdown Chart */}
          <IncomeBreakdown
            monthlyIncome={submission.annual_income / 12}
            monthlyRent={submission.monthly_rent}
            monthlyDebtPayments={
              // Estimate monthly debt payments (assuming ~5% of total debt per month for credit cards, 1.5% for loans)
              ((submission.credit_card_debt || 0) * 0.03) + 
              (((submission.student_loans || 0) + (submission.car_loan || 0) + (submission.other_debt || 0)) * 0.02)
            }
            monthlySavings={(submission.annual_income / 12) * (submission.savings_rate / 100)}
          />

          {/* Peer Comparison */}
          <section className="space-y-4">
            <h2 className="text-xl font-black flex items-center gap-3">
              <span className="text-2xl">📊</span>
              <span>How You Compare</span>
            </h2>
            
            <div className="grid gap-3">
              {[
                { label: 'Your City', value: analysis.peerComparison.vsCity, icon: '🏙️' },
                { label: 'Your Age Group', value: analysis.peerComparison.vsAgeGroup, icon: '👥' },
                { label: 'Your Industry', value: analysis.peerComparison.vsIndustry, icon: '💼' },
                { label: 'Overall', value: analysis.peerComparison.vsOverall, icon: '🌍' },
              ].map((item, i) => (
                <div key={i} className="glass rounded-2xl p-5 hover:bg-white/5 transition-colors">
                  <div className="flex items-start gap-4">
                    <span className="text-2xl">{item.icon}</span>
                    <div className="flex-1">
                      <div className="text-xs font-bold uppercase tracking-widest text-white/40 mb-1">{item.label}</div>
                      <p className="text-white/80 leading-relaxed">{item.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Root Causes */}
          <section className="space-y-4">
            <h2 className="text-xl font-black flex items-center gap-3">
              <span className="text-2xl">🔍</span>
              <span>What&apos;s Cooking You</span>
            </h2>
            
            <div className="space-y-3">
              {analysis.rootCauses.map((cause, i) => {
                const severity = SEVERITY_CONFIG[cause.severity];
                return (
                  <div
                    key={i}
                    className={`rounded-2xl p-5 border ${severity.bg} ${severity.border}`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <span className={`font-bold text-lg ${severity.text}`}>{cause.issue}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${severity.badge}`}>
                        {cause.severity}
                      </span>
                    </div>
                    <p className="text-white/70 leading-relaxed">{cause.explanation}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Action Plan */}
          <section className="space-y-4">
            <h2 className="text-xl font-black flex items-center gap-3">
              <span className="text-2xl">🎯</span>
              <span>Your Action Plan</span>
            </h2>
            
            <div className="space-y-4">
              {/* Immediate */}
              <div className="glass rounded-2xl p-5 border-2 border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-red-500/5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">⚡</span>
                  <span className="text-xs font-black uppercase tracking-widest text-orange-400">Do Today</span>
                </div>
                <p className="text-white font-medium text-lg">{analysis.actionPlan.immediate}</p>
              </div>
              
              {/* 30 Days */}
              <div className="glass rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">📅</span>
                  <span className="text-xs font-black uppercase tracking-widest text-white/40">Next 30 Days</span>
                </div>
                <ul className="space-y-3">
                  {analysis.actionPlan.thirtyDays.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-white/60 flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-white/80">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* 90 Days */}
              <div className="glass rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">🎯</span>
                  <span className="text-xs font-black uppercase tracking-widest text-white/40">90-Day Goals</span>
                </div>
                <ul className="space-y-3">
                  {analysis.actionPlan.ninetyDays.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-green-400">✓</span>
                      <span className="text-white/80">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Encouragement */}
          <section className="glass rounded-2xl p-6 border border-green-500/20 bg-gradient-to-br from-green-500/5 to-emerald-500/5">
            <h2 className="text-xl font-black flex items-center gap-3 mb-4">
              <span className="text-2xl">💪</span>
              <span className="text-green-400">What You&apos;re Doing Right</span>
            </h2>
            <ul className="space-y-3">
              {analysis.encouragement.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-green-400/90">
                  <span className="mt-1">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Share Button */}
          <section className="flex gap-3">
            <Link
              href={`/results/${submission.id}`}
              className="flex-1 glass rounded-2xl p-4 text-center hover:bg-white/5 transition-colors"
            >
              <span className="text-white/70">🔗 Share Results</span>
            </Link>
            <Link
              href="/leaderboard"
              className="flex-1 glass rounded-2xl p-4 text-center hover:bg-white/5 transition-colors"
            >
              <span className="text-white/70">🏆 Leaderboard</span>
            </Link>
          </section>

          {/* Disclaimer */}
          <section className="text-center py-6 border-t border-white/5">
            <p className="text-white/30 text-sm italic">{analysis.disclaimer}</p>
          </section>

        </div>
      </div>
    </main>
  );
}
