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
  emailCaptured?: boolean;
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
  topCities?: { name: string; avgScore: number; count: number }[];
  topIndustries?: { name: string; avgScore: number; count: number }[];
}

export function CookedMeter({ result, userCity, userAge, userIndustry, avatarUrl, emailCaptured = false }: CookedMeterProps) {
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

  // Get submission ID from localStorage (set after submission)
  useEffect(() => {
    const checkForId = () => {
      const id = localStorage.getItem('cooked_submission_id');
      if (id) setSubmissionId(id);
    };
    // Check immediately and after a delay (in case submission is still processing)
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
      
      if (res.ok) {
        setEmailStatus('success');
      } else {
        setEmailStatus('error');
      }
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
        // Stats failed to load, will show fallback UI
      }
    }
    fetchStats();
  }, [userCity, userIndustry, userAge, result.score]);

  // Calculate comparison values from real data
  const totalUsers = stats?.totalUsers || 0;
  const hasEnoughCityData = stats?.city !== null;
  const approxRank = stats?.percentile !== null && stats?.percentile !== undefined && totalUsers > 0
    ? Math.max(1, Math.round((1 - (stats.percentile || 0) / 100) * totalUsers))
    : null;
  
  // Use city avg if available, otherwise overall avg
  const cityAvg = stats?.city?.avgScore ?? stats?.overall?.avgScore ?? null;
  const industryAvg = stats?.industry?.avgScore ?? null;
  
  // Comparison context labels
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
    <div className={`w-full max-w-2xl mx-auto space-y-6 ${showContent ? 'animate-slide-up' : 'opacity-0'}`}>
      
      {/* === HERO SECTION === */}
      <div className="glass rounded-3xl p-8 text-center relative overflow-hidden">
        {/* Background glow */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background: `radial-gradient(ellipse at center, ${tier.color}30 0%, transparent 70%)`
          }}
        />

        {/* Share button */}
        <button
          onClick={handleShare}
          disabled={isGenerating}
          className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/60 hover:text-white text-xs font-medium transition-all disabled:opacity-50"
        >
          {isGenerating ? '...' : '🔗 Share'}
        </button>
        
        {/* Avatar with flames */}
        <div className="relative inline-block mb-6">
          {/* Flames behind - simplified on mobile */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
            {/* Single flame on mobile, animated flames on desktop */}
            <div className="sm:hidden text-3xl" style={{ opacity: 0.5 + flameIntensity * 0.5 }}>🔥</div>
            <div className="hidden sm:flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i} 
                  className="text-3xl animate-flame"
                  style={{ 
                    animationDelay: `${i * 0.1}s`,
                    opacity: 0.5 + flameIntensity * 0.5,
                  }}
                >
                  🔥
                </div>
              ))}
            </div>
          </div>
          
          {/* Avatar - "Becoming Uncanny" effect */}
          <div 
            className="relative w-32 h-32 rounded-2xl overflow-hidden border-4 transition-all duration-500"
            style={{ borderColor: tier.color, boxShadow: `0 0 40px ${tier.color}40` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={avatarUrl} 
              alt="You" 
              className="w-full h-full object-contain transition-all duration-700 bg-[#e8dcc8]"
              style={{
                filter: `
                  brightness(${1 - flameIntensity * 0.7}) 
                  contrast(${1 + flameIntensity * 0.6}) 
                  saturate(${1 - flameIntensity})
                  ${flameIntensity > 0.5 ? `blur(${(flameIntensity - 0.5) * 2}px)` : ''}
                `.trim(),
              }}
            />
            {/* Grain/noise overlay - starts earlier */}
            {flameIntensity > 0.15 && (
              <div 
                className="absolute inset-0 pointer-events-none mix-blend-overlay"
                style={{
                  opacity: Math.min(0.7, flameIntensity * 0.9),
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                }}
              />
            )}
            {/* Dark vignette overlay - more aggressive */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(circle, transparent 20%, rgba(0,0,0,${flameIntensity * 0.9}) 100%)`,
              }}
            />
            {/* Red/dark tint - starts earlier */}
            {flameIntensity > 0.4 && (
              <div 
                className="absolute inset-0 pointer-events-none mix-blend-multiply"
                style={{
                  backgroundColor: `rgba(80, 0, 0, ${(flameIntensity - 0.4) * 0.7})`,
                }}
              />
            )}
          </div>
        </div>

        {/* Main Score */}
        <div className="relative">
          <div className="text-white/50 text-lg mb-2">You Are</div>
          <div 
            className="text-8xl sm:text-9xl font-black leading-none"
            style={{ color: tier.color, textShadow: `0 0 60px ${tier.color}50` }}
          >
            {animatedScore}%
          </div>
          <div 
            className="text-3xl font-bold mt-2 uppercase tracking-widest"
            style={{ color: tier.color }}
          >
            {tier.emoji} {tier.name}
          </div>
          <div className="text-white/40 text-sm mt-3">
            — and here&apos;s why
          </div>
        </div>

        {/* Doneness Meter with Markers */}
        <div className="mt-8 px-4">
          <div className="relative">
            <div className="h-6 bg-white/5 rounded-full overflow-hidden relative">
              <div 
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{ 
                  width: `${animatedScore}%`,
                  background: `linear-gradient(90deg, #22d3ee 0%, #4ade80 20%, #facc15 40%, #fb923c 60%, #f87171 80%, #a1a1aa 100%)`
                }}
              />
              {/* City/Overall avg marker */}
              {cityAvg !== null && (
                <div 
                  className="absolute top-0 h-full w-0.5 bg-cyan-400"
                  style={{ left: `${cityAvg}%` }}
                />
              )}
              {/* Industry avg marker */}
              {industryAvg !== null && (
                <div 
                  className="absolute top-0 h-full w-0.5 bg-purple-400"
                  style={{ left: `${industryAvg}%` }}
                />
              )}
              {/* Top 10% marker (15 score = raw tier) */}
              <div 
                className="absolute top-0 h-full w-0.5 bg-green-400"
                style={{ left: '15%' }}
              />
              {/* Your position marker */}
              <div 
                className="absolute top-0 h-full w-1.5 bg-white rounded-full transition-all duration-1000 shadow-lg"
                style={{ left: `${animatedScore}%`, transform: 'translateX(-50%)' }}
              />
            </div>
            <div className="flex justify-between text-xs text-white/40 mt-2 px-1">
              <span>🥶 Raw</span>
              <span>🍳</span>
              <span>🥘</span>
              <span>🔥</span>
              <span>☠️</span>
              <span>💀 Charred</span>
            </div>
            {/* Legend below */}
            <div className="flex justify-center gap-4 mt-3 text-xs flex-wrap">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-white"></div>
                <span className="text-white/60">You</span>
              </div>
              {cityAvg !== null && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                  <span className="text-white/60">{cityCompareLabel} avg</span>
                </div>
              )}
              {industryAvg !== null && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                  <span className="text-white/60">Industry</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <span className="text-white/60">Top 10%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* === COMBINED: PERCENTILE + BREAKDOWN === */}
      <div className="glass rounded-3xl p-6">
        {/* Percentile line */}
        {stats?.percentile !== null && stats?.percentile !== undefined && (
          <div className="text-center mb-4">
            <span className="text-white/50 text-sm">Better than </span>
            <span className={`text-2xl font-black ${stats.percentile >= 50 ? 'text-green-400' : 'text-red-400'}`}>
              {stats.percentile}%
            </span>
            <span className="text-white/50 text-sm"> of {totalUsers.toLocaleString()} people</span>
          </div>
        )}

        {/* Compact comparison pills */}
        {totalUsers > 0 && (cityAvg !== null || industryAvg !== null || stats?.ageGroup) && (
          <div className="flex flex-wrap justify-center gap-2 mb-5">
            {cityAvg !== null && (
              <span className="px-3 py-1 rounded-full bg-white/5 text-xs text-white/60">
                📍 {cityCompareLabel}: <span className="text-cyan-400 font-semibold">{cityAvg}%</span>
                {result.score !== cityAvg && (
                  <span className={result.score < cityAvg ? ' text-green-400' : ' text-red-400'}>
                    {' '}{result.score < cityAvg ? `↑${cityAvg - result.score}pts` : `↓${result.score - cityAvg}pts`}
                  </span>
                )}
              </span>
            )}
            {industryAvg !== null && (
              <span className="px-3 py-1 rounded-full bg-white/5 text-xs text-white/60">
                💼 Industry: <span className="text-purple-400 font-semibold">{industryAvg}%</span>
                {result.score !== industryAvg && (
                  <span className={result.score < industryAvg ? ' text-green-400' : ' text-red-400'}>
                    {' '}{result.score < industryAvg ? `↑${industryAvg - result.score}pts` : `↓${result.score - industryAvg}pts`}
                  </span>
                )}
              </span>
            )}
            {stats?.ageGroup?.avgScore !== undefined && (
              <span className="px-3 py-1 rounded-full bg-white/5 text-xs text-white/60">
                🎂 Age avg: <span className="text-orange-400 font-semibold">{stats.ageGroup.avgScore}%</span>
              </span>
            )}
          </div>
        )}

        {/* Breakdown grid */}
        <div className="text-xs font-semibold text-white/30 uppercase tracking-widest text-center mb-3">Your Breakdown</div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 rounded-2xl p-4 text-center">
            <div className="text-2xl mb-1">💰</div>
            <div className="text-white/50 text-xs uppercase tracking-wide">Net Worth</div>
            <div className={`text-2xl font-bold ${result.metrics.netWorth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${Math.abs(result.metrics.netWorth).toLocaleString()}
              {result.metrics.netWorth < 0 && <span className="text-sm"> debt</span>}
            </div>
            {avgNetWorth !== null && (
              <div className="text-white/40 text-xs mt-1">{cityCompareLabel} avg: ${avgNetWorth.toLocaleString()}</div>
            )}
          </div>
          <div className="bg-white/5 rounded-2xl p-4 text-center">
            <div className="text-2xl mb-1">💳</div>
            <div className="text-white/50 text-xs uppercase tracking-wide">Debt-to-Income</div>
            <div className={`text-2xl font-bold ${result.metrics.dti <= 35 ? 'text-green-400' : result.metrics.dti <= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
              {result.metrics.dti}%
            </div>
            <div className="text-white/40 text-xs mt-1">Healthy: under 35%</div>
          </div>
          <div className="bg-white/5 rounded-2xl p-4 text-center">
            <div className="text-2xl mb-1">🏠</div>
            <div className="text-white/50 text-xs uppercase tracking-wide">Rent Burden</div>
            <div className={`text-2xl font-bold ${result.metrics.rentBurden <= 30 ? 'text-green-400' : result.metrics.rentBurden <= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
              {result.metrics.rentBurden}%
            </div>
            <div className="text-white/40 text-xs mt-1">Ideal: under 30%</div>
          </div>
          <div className="bg-white/5 rounded-2xl p-4 text-center">
            <div className="text-2xl mb-1">📈</div>
            <div className="text-white/50 text-xs uppercase tracking-wide">Est. Savings Rate</div>
            <div className={`text-2xl font-bold ${result.metrics.savingsRate >= 20 ? 'text-green-400' : result.metrics.savingsRate >= 10 ? 'text-yellow-400' : 'text-red-400'}`}>
              {result.metrics.savingsRate}%
            </div>
            <div className="text-white/40 text-xs mt-1">
              {result.metrics.savingsRate === 0 ? 'Over budget' : 'Target: 20%+'}
            </div>
          </div>
        </div>

        {/* Top issue inline */}
        {result.topIssues[0] && (
          <div className="mt-4 pt-4 border-t border-white/5 flex items-start gap-2">
            <span className="text-base flex-shrink-0">🔥</span>
            <p className="text-sm text-white/60">
              <span className="text-yellow-400 font-semibold">{result.topIssues[0].category}</span>
              {' '}— {result.topIssues[0].description}
            </p>
          </div>
        )}
      </div>

      {/* === EMAIL CAPTURE === (hidden if already captured at the gate) */}
      {!emailCaptured && <div className="glass rounded-2xl p-5 border border-orange-500/30">
        {emailStatus === 'success' ? (
          <div className="flex items-center gap-3">
            <div className="text-2xl">✅</div>
            <div>
              <div className="font-semibold text-white">You&apos;re on the list!</div>
              <div className="text-sm text-white/50">We&apos;ll notify you when personalized tips are ready.</div>
            </div>
          </div>
        ) : (
          <>
            <div className="font-semibold text-white mb-1">💡 Get tips to get uncooked</div>
            <div className="text-sm text-white/50 mb-3">We&apos;re building personalized recommendations. Drop your email.</div>
            <form onSubmit={handleEmailSubmit} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-orange-500 focus:outline-none"
                disabled={emailStatus === 'submitting' || !submissionId}
              />
              <button
                type="submit"
                disabled={emailStatus === 'submitting' || !email || !submissionId}
                className="h-12 px-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-xl transition-all disabled:opacity-50"
              >
                {emailStatus === 'submitting' ? '...' : 'Notify Me'}
              </button>
            </form>
            {emailStatus === 'error' && (
              <p className="text-red-400 text-sm mt-2">Something went wrong. Try again?</p>
            )}
          </>
        )}
      </div>}

      {/* === LEADERBOARD BUTTON === */}
      <a
        href="/leaderboard"
        className="block w-full h-14 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-lg rounded-2xl flex items-center justify-center transition-all"
      >
        🏆 View Leaderboard
      </a>

      {/* Spacer for sticky rank footer */}
      <div className="h-20"></div>

      {/* Hidden ShareCard */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', pointerEvents: 'none' }}>
        <ShareCard
          ref={shareCardRef}
          result={result}
          avatarUrl={avatarUrl}
          userCity={userCity}
          userAge={userAge}
        />
      </div>

      {/* Sticky Rank Footer */}
      {approxRank !== null && totalUsers > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a] to-transparent pt-4">
          <div className="container mx-auto px-4 pb-4 max-w-2xl">
            <a
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
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
