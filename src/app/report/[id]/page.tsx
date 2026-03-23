'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';

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
  // Include all the input fields for AI analysis
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

const SEVERITY_COLORS = {
  critical: 'bg-red-500/20 border-red-500/50 text-red-400',
  high: 'bg-orange-500/20 border-orange-500/50 text-orange-400',
  medium: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400',
  low: 'bg-green-500/20 border-green-500/50 text-green-400',
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
        // Fetch the submission
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
        
        if (!analysisRes.ok) {
          throw new Error('Analysis failed');
        }
        
        const analysisData = await analysisRes.json();
        setAnalysis(analysisData.analysis);
        
        // Cache the analysis in Supabase
        await fetch('/api/submissions', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id,
            aiAnalysis: analysisData.analysis,
          }),
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
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#030305] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl animate-pulse">📊</div>
          <p className="text-white/50 mt-4">Loading your report...</p>
        </div>
      </main>
    );
  }

  if (analyzing) {
    return (
      <main className="min-h-screen bg-[#030305] flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="text-5xl mb-4">🔥</div>
          <h1 className="text-2xl font-bold text-white mb-2">Analyzing your finances...</h1>
          <p className="text-white/50">
            Our AI is comparing your data to real users and generating personalized insights. This takes about 10 seconds.
          </p>
          <div className="mt-6 flex justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-white/50 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (error === 'Payment required') {
    return (
      <main className="min-h-screen bg-[#030305] flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md px-6">
          <div className="text-5xl">🔒</div>
          <h1 className="text-2xl font-bold text-white">Payment Required</h1>
          <p className="text-white/50">
            Complete payment to unlock your full AI-powered financial analysis.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl font-semibold hover:opacity-90 transition"
          >
            Back to Quiz
          </Link>
        </div>
      </main>
    );
  }

  if (error || !submission) {
    return (
      <main className="min-h-screen bg-[#030305] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-4xl">😕</div>
          <p className="text-white/70">{error || 'Report not found'}</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-white/10 rounded-xl font-semibold hover:bg-white/20 transition"
          >
            Go Home
          </Link>
        </div>
      </main>
    );
  }

  if (!analysis) {
    return (
      <main className="min-h-screen bg-[#030305] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-4xl">⚠️</div>
          <p className="text-white/70">Analysis failed to load</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-white/10 rounded-xl font-semibold hover:bg-white/20 transition"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#030305] text-white">
      {/* Header */}
      <header className="border-b border-white/5">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            <span className="font-bold">am i cooked?</span>
          </Link>
          <div className="text-sm text-white/50">Full Report</div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Summary */}
        <section className="mb-8">
          <div className="text-center mb-6">
            <div className="text-6xl font-black mb-2">{submission.score}</div>
            <div className="text-white/50 uppercase tracking-wider text-sm">{submission.tier}</div>
          </div>
          
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <p className="text-lg text-white/90 mb-4">{analysis.summary.oneLiner}</p>
            <div className="flex items-center gap-2 text-red-400">
              <span>🎯</span>
              <span className="font-medium">Main Issue:</span>
              <span>{analysis.summary.biggestProblem}</span>
            </div>
          </div>
        </section>

        {/* Peer Comparison */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>📊</span> How You Compare
          </h2>
          <div className="space-y-3">
            {[
              { label: 'Your City', value: analysis.peerComparison.vsCity },
              { label: 'Your Age Group', value: analysis.peerComparison.vsAgeGroup },
              { label: 'Your Industry', value: analysis.peerComparison.vsIndustry },
              { label: 'Overall', value: analysis.peerComparison.vsOverall },
            ].map((item, i) => (
              <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="text-xs text-white/40 uppercase tracking-wider mb-1">{item.label}</div>
                <p className="text-white/80">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Root Causes */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>🔍</span> What's Cooking You
          </h2>
          <div className="space-y-3">
            {analysis.rootCauses.map((cause, i) => (
              <div
                key={i}
                className={`rounded-xl p-4 border ${SEVERITY_COLORS[cause.severity]}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">{cause.issue}</span>
                  <span className="text-xs uppercase tracking-wider opacity-70">{cause.severity}</span>
                </div>
                <p className="text-sm opacity-80">{cause.explanation}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Action Plan */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>🎯</span> Your Action Plan
          </h2>
          
          <div className="space-y-4">
            {/* Immediate */}
            <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-xl p-4 border border-red-500/30">
              <div className="text-xs text-red-400 uppercase tracking-wider mb-1">Do Today</div>
              <p className="text-white">{analysis.actionPlan.immediate}</p>
            </div>
            
            {/* 30 Days */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-xs text-white/40 uppercase tracking-wider mb-2">Next 30 Days</div>
              <ul className="space-y-2">
                {analysis.actionPlan.thirtyDays.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-white/30">→</span>
                    <span className="text-white/80">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* 90 Days */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-xs text-white/40 uppercase tracking-wider mb-2">90 Day Goals</div>
              <ul className="space-y-2">
                {analysis.actionPlan.ninetyDays.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-white/30">→</span>
                    <span className="text-white/80">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Encouragement */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>💪</span> What You're Doing Right
          </h2>
          <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/30">
            <ul className="space-y-2">
              {analysis.encouragement.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-green-400">
                  <span>✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="text-center text-white/30 text-sm py-8 border-t border-white/5">
          <p>{analysis.disclaimer}</p>
        </section>
      </div>
    </main>
  );
}
