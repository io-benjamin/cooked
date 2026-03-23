'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Submission {
  id: string;
  created_at: string;
  age: number;
  city: string;
  industry: string;
  score: number;
  tier: string;
  dti: number;
  rent_burden: number;
  savings_rate: number;
  net_worth: number;
  avatar_url: string | null;
  email: string | null;
}

const TIER_INFO: Record<string, { name: string; emoji: string; color: string; bgColor: string }> = {
  'raw': { name: 'RAW', emoji: '🥶', color: '#22d3ee', bgColor: '#164e63' },
  'light-sizzle': { name: 'LIGHT SIZZLE', emoji: '🍳', color: '#4ade80', bgColor: '#166534' },
  'simmering': { name: 'SIMMERING', emoji: '🥘', color: '#facc15', bgColor: '#854d0e' },
  'sauteed': { name: 'SAUTÉED', emoji: '🔥', color: '#fb923c', bgColor: '#9a3412' },
  'well-done': { name: 'WELL DONE', emoji: '☠️', color: '#f87171', bgColor: '#991b1b' },
  'charred': { name: 'CHARRED', emoji: '💀', color: '#a1a1aa', bgColor: '#3f3f46' },
  // Legacy tiers
  'medium-rare': { name: 'LIGHT SIZZLE', emoji: '🍳', color: '#4ade80', bgColor: '#166534' },
  'medium': { name: 'SIMMERING', emoji: '🥘', color: '#facc15', bgColor: '#854d0e' },
  'charcoal': { name: 'WELL DONE', emoji: '☠️', color: '#f87171', bgColor: '#991b1b' },
  'ash': { name: 'CHARRED', emoji: '💀', color: '#a1a1aa', bgColor: '#3f3f46' },
};

function getTopIssue(s: Submission): { emoji: string; title: string; description: string } | null {
  const candidates = [
    {
      score: s.net_worth < 0 ? 100 + Math.min(Math.abs(s.net_worth) / 1000, 50) : 0,
      emoji: '💰',
      title: 'Negative Net Worth',
      description: `You're $${Math.abs(s.net_worth).toLocaleString()} in the hole. Start by attacking your highest-interest debt — even an extra $50/month compounds fast.`,
    },
    {
      score: s.rent_burden > 30 ? (s.rent_burden - 30) * 3 : 0,
      emoji: '🏠',
      title: 'Housing Costs Too High',
      description: `${s.rent_burden}% of income on rent is a lot. Aim for 30% or less — a roommate, lease renegotiation, or income boost can all help.`,
    },
    {
      score: s.dti > 36 ? (s.dti - 36) * 2.5 : 0,
      emoji: '💳',
      title: 'High Debt-to-Income',
      description: `${s.dti}% DTI is above healthy levels. Lenders flag anything over 43%. Hit your highest-rate debt first — the avalanche method saves the most money.`,
    },
    {
      // Only flag savings rate if it's actually available (non-zero or they're genuinely broke)
      score: s.savings_rate < 10 && (s.savings_rate > 0 || s.net_worth < 0) ? (10 - s.savings_rate) * 4 : 0,
      emoji: '📈',
      title: 'Low Savings Rate',
      description: `Saving ${s.savings_rate}% won't build a real safety net. Aim for at least 20% — set up an automatic transfer the day you get paid so you never see it.`,
    },
  ];

  const top = candidates.sort((a, b) => b.score - a.score)[0];
  return top.score > 0 ? top : null;
}

export default function ResultsPage() {
  const params = useParams();
  const id = params.id as string;
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [hasEmail, setHasEmail] = useState(false);
  const [percentile, setPercentile] = useState<number | null>(null);
  const [totalUsers, setTotalUsers] = useState<number>(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/submissions/${id}`);
        if (!res.ok) {
          setError('Results not found');
          return;
        }
        const data = await res.json();
        setSubmission(data);
        if (data.email) setHasEmail(true);

        // Fetch percentile in parallel
        const statsRes = await fetch(`/api/stats?score=${data.score}`);
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          if (statsData.percentile !== null && statsData.percentile !== undefined) {
            setPercentile(statsData.percentile);
          }
          if (statsData.totalUsers) {
            setTotalUsers(statsData.totalUsers);
          }
        }
      } catch {
        setError('Failed to load results');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setEmailStatus('submitting');
    try {
      const res = await fetch(`/api/submissions/${id}/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setEmailStatus('success');
        setHasEmail(true);
      } else {
        setEmailStatus('error');
      }
    } catch {
      setEmailStatus('error');
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl animate-pulse">🔥</div>
          <p className="text-white/50 mt-4">Loading your results...</p>
        </div>
      </main>
    );
  }

  if (error || !submission) {
    return (
      <main className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-4xl">😕</div>
          <p className="text-white/70">{error || 'Results not found'}</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl font-semibold hover:scale-105 transition-transform"
          >
            Take the quiz →
          </Link>
        </div>
      </main>
    );
  }

  const tier = TIER_INFO[submission.tier] || TIER_INFO['simmering'];
  const submittedDate = new Date(submission.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const topIssue = getTopIssue(submission);
  const approxRank = percentile !== null && totalUsers > 0
    ? Math.max(1, Math.round((1 - percentile / 100) * totalUsers))
    : null;

  return (
    <main className="min-h-screen bg-[#050505] relative overflow-hidden pb-24">
      {/* Background effects */}
      <div className="fixed inset-0 grid-bg opacity-50" />
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] blur-3xl pointer-events-none"
        style={{ background: `radial-gradient(ellipse at center, ${tier.color}15 0%, transparent 70%)` }}
      />

      {/* Header */}
      <header className="relative z-50 border-b border-white/5">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="text-3xl group-hover:animate-pulse">🔥</span>
            <span className="font-black text-xl tracking-tight">
              am i <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">cooked</span>?
            </span>
          </Link>
          <nav className="flex gap-4 sm:gap-6 text-sm text-white/50">
            <Link href="/leaderboard" className="hover:text-white transition-colors">leaderboard</Link>
            <Link href="/about" className="hover:text-white transition-colors">about</Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-5">

          {/* Hero Card */}
          <div className="glass rounded-3xl p-8 text-center relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-30"
              style={{ background: `radial-gradient(ellipse at center, ${tier.color}30 0%, transparent 70%)` }}
            />

            <div className="relative">
              {/* Avatar */}
              {submission.avatar_url && (
                <div className="mb-6 flex justify-center">
                  <div
                    className="w-24 h-24 rounded-2xl overflow-hidden border-4"
                    style={{ borderColor: tier.color, boxShadow: `0 0 40px ${tier.color}40` }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={submission.avatar_url}
                      alt=""
                      className="w-full h-full object-cover bg-[#e8dcc8]"
                    />
                  </div>
                </div>
              )}

              <div className="text-white/40 text-sm mb-2">Your Results</div>

              {/* Score */}
              <div
                className="text-8xl font-black leading-none"
                style={{ color: tier.color, textShadow: `0 0 60px ${tier.color}50` }}
              >
                {submission.score}%
              </div>

              {/* Tier */}
              <div
                className="text-2xl font-bold mt-2 uppercase tracking-widest"
                style={{ color: tier.color }}
              >
                {tier.emoji} {tier.name}
              </div>

              <div className="text-white/30 text-sm mt-4">
                Submitted {submittedDate} · {submission.city}
              </div>
            </div>
          </div>

          {/* Combined: Percentile + Breakdown */}
          <div className="glass rounded-3xl p-6">
            {/* Percentile banner */}
            {percentile !== null && (
              <div className="text-center mb-5 py-3 rounded-2xl bg-white/5">
                <span className="text-white/60 text-sm">You&apos;re less cooked than </span>
                <span className="font-black text-lg" style={{ color: tier.color }}>{percentile}%</span>
                <span className="text-white/60 text-sm"> of people</span>
              </div>
            )}

            <h3 className="text-sm font-semibold text-white/40 uppercase tracking-widest mb-3 text-center">Your Breakdown</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-2xl p-4 text-center">
                <div className="text-2xl mb-1">💰</div>
                <div className="text-white/50 text-xs uppercase tracking-wide">Net Worth</div>
                <div className={`text-2xl font-bold ${submission.net_worth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${Math.abs(submission.net_worth).toLocaleString()}
                  {submission.net_worth < 0 && <span className="text-sm"> debt</span>}
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-4 text-center">
                <div className="text-2xl mb-1">💳</div>
                <div className="text-white/50 text-xs uppercase tracking-wide">Debt-to-Income</div>
                <div className={`text-2xl font-bold ${submission.dti <= 35 ? 'text-green-400' : submission.dti <= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {submission.dti}%
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-4 text-center">
                <div className="text-2xl mb-1">🏠</div>
                <div className="text-white/50 text-xs uppercase tracking-wide">Rent Burden</div>
                <div className={`text-2xl font-bold ${submission.rent_burden <= 30 ? 'text-green-400' : submission.rent_burden <= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {submission.rent_burden}%
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-4 text-center">
                <div className="text-2xl mb-1">📈</div>
                <div className="text-white/50 text-xs uppercase tracking-wide">Est. Savings Rate</div>
                {submission.savings_rate === 0 && submission.net_worth >= 0 ? (
                  <div className="text-2xl font-bold text-white/30">—</div>
                ) : (
                  <div className={`text-2xl font-bold ${submission.savings_rate >= 20 ? 'text-green-400' : submission.savings_rate >= 10 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {submission.savings_rate}%
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Top Issue */}
          {topIssue && (
            <div className="glass rounded-2xl p-5 border-l-4 border-orange-500/60">
              <div className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-3">Your #1 Issue</div>
              <div className="flex items-start gap-3">
                <div className="text-2xl flex-shrink-0">{topIssue.emoji}</div>
                <div>
                  <div className="font-bold text-white">{topIssue.title}</div>
                  <div className="text-sm text-white/60 mt-1 leading-relaxed">{topIssue.description}</div>
                </div>
              </div>
            </div>
          )}

          {/* Email Capture */}
          <div className="glass rounded-2xl p-5 border-l-4 border-white/10">
            {hasEmail || emailStatus === 'success' ? (
              <div className="flex items-start gap-3">
                <div className="text-2xl">✅</div>
                <div>
                  <div className="font-semibold text-white">You&apos;re on the list!</div>
                  <div className="text-sm text-white/50">
                    We&apos;ll email you when personalized tips are ready for your situation.
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-start gap-3 mb-4">
                  <div className="text-2xl">💡</div>
                  <div>
                    <div className="font-semibold text-white">Get personalized tips</div>
                    <div className="text-sm text-white/50">
                      We&apos;re building recommendations based on your specific situation. Drop your email to get notified.
                    </div>
                  </div>
                </div>
                <form onSubmit={handleEmailSubmit} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-orange-500 focus:outline-none"
                    disabled={emailStatus === 'submitting'}
                  />
                  <button
                    type="submit"
                    disabled={emailStatus === 'submitting' || !email}
                    className="h-12 px-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-xl transition-all disabled:opacity-50"
                  >
                    {emailStatus === 'submitting' ? '...' : 'Notify Me'}
                  </button>
                </form>
                {emailStatus === 'error' && (
                  <p className="text-red-400 text-sm mt-2">Something went wrong. Try again?</p>
                )}
              </div>
            )}
          </div>

          {/* Full Report CTA */}
          <div className="glass rounded-2xl p-6 text-center border border-orange-500/30 bg-gradient-to-b from-orange-500/10 to-transparent">
            <div className="text-3xl mb-3">🔥</div>
            <h3 className="text-xl font-bold text-white mb-2">Want the full breakdown?</h3>
            <p className="text-white/50 text-sm mb-4">
              Get AI-powered analysis comparing you to {totalUsers.toLocaleString()}+ users, personalized action plan, and specific advice for your situation.
            </p>
            <button
              onClick={async () => {
                if (!submission?.id) return;
                const res = await fetch('/api/checkout', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ submissionId: submission.id }),
                });
                const data = await res.json();
                if (data.url) window.location.href = data.url;
              }}
              className="w-full h-14 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-lg rounded-2xl transition-all"
            >
              Get Full Report — $5
            </button>
            <p className="text-white/30 text-xs mt-3">One-time payment • Instant access</p>
          </div>

          {/* Leaderboard Button */}
          <Link
            href="/leaderboard"
            className="block w-full h-14 bg-white/5 hover:bg-white/10 text-white font-bold text-lg rounded-2xl flex items-center justify-center transition-all border border-white/10"
          >
            🏆 View Leaderboard
          </Link>

        </div>
      </div>

      {/* Sticky Rank Footer */}
      {approxRank !== null && totalUsers > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a] to-transparent pt-4">
          <div className="container mx-auto px-4 pb-4 max-w-2xl">
            <Link
              href="/leaderboard"
              className="w-full glass rounded-2xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors border border-white/10"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">📍</span>
                <div>
                  <div className="text-xs text-white/40">Your Rank</div>
                  <div className="font-bold text-white">
                    #{approxRank} <span className="text-white/40 text-sm font-normal">of {totalUsers}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-white/40">See full leaderboard</span>
                <span className="text-white/40">→</span>
              </div>
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
