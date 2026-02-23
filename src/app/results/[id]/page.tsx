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

export default function ResultsPage() {
  const params = useParams();
  const id = params.id as string;
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSubmission() {
      try {
        const res = await fetch(`/api/submissions/${id}`);
        if (!res.ok) {
          setError('Results not found');
          return;
        }
        const data = await res.json();
        setSubmission(data);
      } catch {
        setError('Failed to load results');
      } finally {
        setLoading(false);
      }
    }
    fetchSubmission();
  }, [id]);

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

  return (
    <main className="min-h-screen bg-[#050505] relative overflow-hidden">
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
        <div className="space-y-6">
          
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
                Submitted {submittedDate} • {submission.city}
              </div>
            </div>
          </div>

          {/* Breakdown */}
          <div className="glass rounded-3xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 text-center">Your Breakdown</h3>
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
                <div className="text-white/50 text-xs uppercase tracking-wide">Savings Rate</div>
                <div className={`text-2xl font-bold ${submission.savings_rate >= 20 ? 'text-green-400' : submission.savings_rate >= 10 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {submission.savings_rate}%
                </div>
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="glass rounded-2xl p-5 border-l-4 border-orange-500/50">
            <div className="flex items-start gap-3">
              <div className="text-2xl">💡</div>
              <div>
                <div className="font-semibold text-white">Personalized tips coming soon</div>
                <div className="text-sm text-white/50">
                  We&apos;re working on recommendations based on your specific situation. Check back later!
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Link
              href="/"
              className="flex-1 h-14 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-lg rounded-2xl flex items-center justify-center transition-all"
            >
              Retake Quiz 🔥
            </Link>
            <Link
              href="/leaderboard"
              className="h-14 px-6 bg-white/10 hover:bg-white/20 text-white font-bold text-lg rounded-2xl border border-white/10 flex items-center justify-center transition-all"
            >
              🏆
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
}
