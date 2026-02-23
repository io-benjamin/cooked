'use client';

import { useState, useEffect, useRef } from 'react';
import { CookedResult } from '@/types/calculator';
import { ShareCard } from './ShareCard';

interface CookedMeterProps {
  result: CookedResult;
  userCity: string;
  userAge: number;
  userIndustry: string;
  avatarUrl: string;
}

const TIERS = [
  { max: 15, name: 'Raw', emoji: '🥶', color: '#22d3ee' },
  { max: 30, name: 'Light Sizzle', emoji: '🍳', color: '#4ade80' },
  { max: 45, name: 'Simmering', emoji: '🥘', color: '#facc15' },
  { max: 60, name: 'Sautéed', emoji: '🔥', color: '#fb923c' },
  { max: 80, name: 'Well Done', emoji: '☠️', color: '#f87171' },
  { max: 100, name: 'Charred', emoji: '💀', color: '#a1a1aa' },
];

function getTier(score: number) {
  return TIERS.find(t => score <= t.max) || TIERS[TIERS.length - 1];
}

interface StatsData {
  overall: { avgScore: number; avgNetWorth: number; count: number } | null;
  city: { avgScore: number; avgNetWorth: number; count: number; name: string } | null;
  industry: { avgScore: number; count: number; name: string } | null;
  ageGroup: { avgScore: number; count: number; range: string } | null;
  percentile: number | null;
  totalUsers: number;
  minForComparison: number;
}

export function CookedMeter({ result, userCity, userAge, userIndustry, avatarUrl }: CookedMeterProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [email, setEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const shareCardRef = useRef<HTMLDivElement>(null);
  const tier = getTier(result.score);
  const flameIntensity = result.score / 100;

  // Get submission ID from localStorage
  useEffect(() => {
    const checkForId = () => {
      const id = localStorage.getItem('cooked_submission_id');
      if (id) setSubmissionId(id);
    };
    checkForId();
    const timer = setTimeout(checkForId, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@') || !submissionId) return;
    
    setEmailStatus('submitting');
    try {
      const res = await fetch(`/api/submissions/${submissionId}/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) setEmailStatus('success');
      else setEmailStatus('error');
    } catch {
      setEmailStatus('error');
    }
  };

  // Fetch real stats
  useEffect(() => {
    async function fetchStats() {
      try {
        const params = new URLSearchParams({
          city: userCity,
          industry: userIndustry,
          age: String(userAge),
          score: String(result.score),
        });
        const res = await fetch(`/api/stats?${params}`);
        const data = await res.json();
        setStats(data);
      } catch {
        // Stats failed to load
      }
    }
    fetchStats();
  }, [userCity, userIndustry, userAge, result.score]);

  const totalUsers = stats?.totalUsers || 0;
  const hasEnoughCityData = stats?.city !== null;
  const cityAvg = stats?.city?.avgScore ?? stats?.overall?.avgScore ?? null;
  const industryAvg = stats?.industry?.avgScore ?? null;
  const cityCompareLabel = hasEnoughCityData ? userCity : 'all users';
  const avgNetWorth = stats?.city?.avgNetWorth ?? stats?.overall?.avgNetWorth ?? null;

  useEffect(() => {
    setTimeout(() => setShowContent(true), 300);
    const duration = 2000;
    const steps = 60;
    const increment = result.score / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= result.score) {
        setAnimatedScore(result.score);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [result.score]);

  const generateImage = async (): Promise<Blob | null> => {
    if (!shareCardRef.current) return null;
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(shareCardRef.current, {
      backgroundColor: '#0a0a0a',
      scale: 2,
      logging: false,
      useCORS: true,
    });
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/png', 1.0);
    });
  };

  const handleShare = async () => {
    const comparisonText = hasEnoughCityData 
      ? `Compared to ${userCity} average: ${result.score < (cityAvg || 0) ? 'better' : 'worse'}`
      : `Out of ${totalUsers} submissions`;
    const text = `I'm ${result.score}% cooked 🔥\n\n${comparisonText}\n\nFind out how cooked you are: financiallycooked.com`;
    
    if (navigator.share && navigator.canShare) {
      setIsGenerating(true);
      try {
        const blob = await generateImage();
        if (blob) {
          const file = new File([blob], 'cooked.png', { type: 'image/png' });
          const shareData = { text, files: [file] };
          if (navigator.canShare(shareData)) {
            await navigator.share(shareData);
            return;
          }
        }
      } catch {
        // Fall back
      } finally {
        setIsGenerating(false);
      }
    }
    
    if (navigator.share) {
      try { await navigator.share({ text }); } catch { /* cancelled */ }
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className={`w-full max-w-2xl mx-auto space-y-4 ${showContent ? 'animate-slide-up' : 'opacity-0'}`}>
      
      {/* === HERO SECTION with Share Button === */}
      <div className="glass rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        {/* Background glow */}
        <div 
          className="absolute inset-0 opacity-40"
          style={{ background: `radial-gradient(ellipse at center, ${tier.color}30 0%, transparent 70%)` }}
        />
        
        {/* Share button - top right corner */}
        <button
          onClick={handleShare}
          disabled={isGenerating}
          className="absolute top-4 right-4 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all disabled:opacity-50"
          title="Share"
        >
          {isGenerating ? (
            <span className="animate-spin">⏳</span>
          ) : (
            <span className="text-xl">📤</span>
          )}
        </button>
        
        <div className="relative text-center">
          {/* Avatar with flames */}
          <div className="inline-block mb-4 relative">
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
              <div className="sm:hidden text-2xl" style={{ opacity: 0.5 + flameIntensity * 0.5 }}>🔥</div>
              <div className="hidden sm:flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="text-2xl animate-flame" style={{ animationDelay: `${i * 0.1}s`, opacity: 0.5 + flameIntensity * 0.5 }}>🔥</div>
                ))}
              </div>
            </div>
            
            <div 
              className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-4 transition-all"
              style={{ borderColor: tier.color, boxShadow: `0 0 30px ${tier.color}40` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={avatarUrl} 
                alt="You" 
                className="w-full h-full object-contain bg-[#e8dcc8]"
                style={{
                  filter: `brightness(${1 - flameIntensity * 0.7}) contrast(${1 + flameIntensity * 0.6}) saturate(${1 - flameIntensity}) ${flameIntensity > 0.5 ? `blur(${(flameIntensity - 0.5) * 2}px)` : ''}`.trim(),
                }}
              />
              {flameIntensity > 0.15 && (
                <div className="absolute inset-0 pointer-events-none mix-blend-overlay" style={{ opacity: Math.min(0.7, flameIntensity * 0.9), backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} />
              )}
              <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(circle, transparent 20%, rgba(0,0,0,${flameIntensity * 0.9}) 100%)` }} />
              {flameIntensity > 0.4 && <div className="absolute inset-0 pointer-events-none mix-blend-multiply" style={{ backgroundColor: `rgba(80, 0, 0, ${(flameIntensity - 0.4) * 0.7})` }} />}
            </div>
          </div>

          {/* Score */}
          <div 
            className="text-7xl sm:text-8xl font-black leading-none"
            style={{ color: tier.color, textShadow: `0 0 60px ${tier.color}50` }}
          >
            {animatedScore}%
          </div>
          <div className="text-2xl font-bold mt-1 uppercase tracking-widest" style={{ color: tier.color }}>
            {tier.emoji} {tier.name}
          </div>
          
          {/* Percentile - inline */}
          {stats?.percentile !== null && stats?.percentile !== undefined && (
            <div className="mt-3 text-white/60">
              Better than <span className={`font-bold ${stats.percentile >= 50 ? 'text-green-400' : 'text-red-400'}`}>{stats.percentile}%</span> of {totalUsers.toLocaleString()} people
            </div>
          )}
        </div>
      </div>

      {/* === COMBINED: Why You're Cooked + Comparisons === */}
      <div className="glass rounded-3xl p-5">
        <h3 className="text-lg font-bold text-white mb-4 text-center">
          Why You&apos;re {result.score}% Cooked
        </h3>
        
        {/* Breakdown grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <div className="text-lg mb-0.5">💰</div>
            <div className={`text-xl font-bold ${result.metrics.netWorth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${Math.abs(result.metrics.netWorth).toLocaleString()}
            </div>
            <div className="text-white/40 text-xs">Net Worth</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <div className="text-lg mb-0.5">💳</div>
            <div className={`text-xl font-bold ${result.metrics.dti <= 35 ? 'text-green-400' : result.metrics.dti <= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
              {result.metrics.dti}%
            </div>
            <div className="text-white/40 text-xs">Debt-to-Income</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <div className="text-lg mb-0.5">🏠</div>
            <div className={`text-xl font-bold ${result.metrics.rentBurden <= 30 ? 'text-green-400' : result.metrics.rentBurden <= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
              {result.metrics.rentBurden}%
            </div>
            <div className="text-white/40 text-xs">Rent Burden</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <div className="text-lg mb-0.5">📈</div>
            <div className={`text-xl font-bold ${result.metrics.savingsRate >= 20 ? 'text-green-400' : result.metrics.savingsRate >= 10 ? 'text-yellow-400' : 'text-red-400'}`}>
              {result.metrics.savingsRate}%
            </div>
            <div className="text-white/40 text-xs">Savings Rate</div>
          </div>
        </div>

        {/* Comparison row */}
        {totalUsers > 0 && (
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10">
            <div className="text-center">
              <div className="text-xs text-white/40">📍 {hasEnoughCityData ? userCity.split(',')[0] : 'Average'}</div>
              <div className="text-sm font-bold text-cyan-400">{cityAvg ?? '—'}%</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-white/40">💼 Industry</div>
              <div className="text-sm font-bold text-purple-400">{industryAvg ?? '—'}%</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-white/40">🎂 Age {userAge}±3</div>
              <div className="text-sm font-bold text-orange-400">{stats?.ageGroup?.avgScore ?? '—'}%</div>
            </div>
          </div>
        )}
        
        {avgNetWorth !== null && (
          <div className="text-center text-white/40 text-xs mt-3">
            {cityCompareLabel} avg net worth: ${avgNetWorth.toLocaleString()}
          </div>
        )}
      </div>

      {/* === TOP ISSUE === */}
      {result.topIssues[0] && (
        <div className="glass rounded-2xl p-4 border-l-4 border-l-yellow-500">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🔥</div>
            <div>
              <div className="font-semibold text-white">
                Top issue: <span className="text-yellow-400">{result.topIssues[0].category}</span>
              </div>
              <div className="text-sm text-white/50">{result.topIssues[0].description}</div>
            </div>
          </div>
        </div>
      )}

      {/* === EMAIL CAPTURE === */}
      <div className="glass rounded-2xl p-4">
        {emailStatus === 'success' ? (
          <div className="flex items-center gap-3">
            <span className="text-xl">✅</span>
            <div>
              <div className="font-semibold text-white">You&apos;re on the list!</div>
              <div className="text-sm text-white/50">We&apos;ll notify you when tips are ready.</div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xl">💡</span>
              <div className="font-semibold text-white">Want tips to get uncooked?</div>
            </div>
            <form onSubmit={handleEmailSubmit} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-orange-500 focus:outline-none text-sm"
                disabled={emailStatus === 'submitting' || !submissionId}
              />
              <button
                type="submit"
                disabled={emailStatus === 'submitting' || !email || !submissionId}
                className="h-11 px-5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-xl transition-all disabled:opacity-50 text-sm"
              >
                {emailStatus === 'submitting' ? '...' : 'Notify Me'}
              </button>
            </form>
            {emailStatus === 'error' && <p className="text-red-400 text-xs mt-2">Something went wrong. Try again?</p>}
          </div>
        )}
      </div>

      {/* === BOTTOM: Leaderboard Button === */}
      <a
        href="/leaderboard"
        className="block w-full h-14 bg-white/10 hover:bg-white/15 text-white font-bold text-lg rounded-2xl border border-white/10 transition-all flex items-center justify-center gap-2"
      >
        🏆 View Leaderboard
      </a>
      
      {/* Spacer for mobile */}
      <div className="h-4"></div>

      {/* Hidden ShareCard */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', pointerEvents: 'none' }}>
        <ShareCard ref={shareCardRef} result={result} avatarUrl={avatarUrl} userCity={userCity} userAge={userAge} />
      </div>
    </div>
  );
}
