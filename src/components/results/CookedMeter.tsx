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
  city: { avgScore: number; avgNetWorth: number; count: number } | null;
  industry: { avgScore: number; count: number } | null;
  ageGroup: { avgScore: number; count: number; range: string } | null;
  totalUsers: number;
  minForComparison: number;
}

export function CookedMeter({ result, userCity, userAge, userIndustry, avatarUrl }: CookedMeterProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [stats, setStats] = useState<StatsData | null>(null);
  const shareCardRef = useRef<HTMLDivElement>(null);
  const tier = getTier(result.score);
  const flameIntensity = result.score / 100;

  // Fetch real stats
  useEffect(() => {
    async function fetchStats() {
      try {
        const params = new URLSearchParams({
          city: userCity,
          industry: userIndustry,
          age: String(userAge),
        });
        const res = await fetch(`/api/stats?${params}`);
        const data = await res.json();
        setStats(data);
      } catch {
        // Stats failed to load, will show fallback UI
      }
    }
    fetchStats();
  }, [userCity, userIndustry, userAge]);

  // Calculate comparison values from real data
  const totalUsers = stats?.totalUsers || 0;
  const hasEnoughCityData = stats?.city !== null;
  
  // Use city avg if available, otherwise overall avg
  const cityAvg = stats?.city?.avgScore ?? stats?.overall?.avgScore ?? null;
  const industryAvg = stats?.industry?.avgScore ?? null;
  const overallAvg = stats?.overall?.avgScore ?? null;
  
  // Calculate comparison average
  const comparisonAvg = cityAvg ?? overallAvg ?? 50;
  
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

      {/* === RANKING SECTION with Percentile Framing === */}
      <div className="glass rounded-3xl p-6">
        <div className="text-center mb-2">
          <div className="text-white/50 text-sm">
            Compared to {hasEnoughCityData ? userCity : 'all users'}
            {!hasEnoughCityData && totalUsers > 0 && (
              <span className="block text-white/30 text-xs mt-1">
                (not enough data in {userCity} yet)
              </span>
            )}
          </div>
          <div className="text-4xl font-black text-white">
            {totalUsers > 0 ? (
              <>
                {totalUsers.toLocaleString()} <span className="text-white/40 text-lg font-normal">submissions</span>
              </>
            ) : (
              <span className="text-white/40 text-lg font-normal">Loading...</span>
            )}
          </div>
        </div>
        {totalUsers > 0 && (
          <div className="border-t border-white/10 pt-4 mt-4 space-y-2">
            {comparisonAvg && (
              <div className={`text-center text-lg ${result.score < comparisonAvg ? 'text-green-400' : result.score > comparisonAvg ? 'text-red-400' : 'text-yellow-400'}`}>
                {result.score < comparisonAvg ? (
                  <>You&apos;re <span className="font-bold">{comparisonAvg - result.score} points better</span> than the {cityCompareLabel} average</>
                ) : result.score > comparisonAvg ? (
                  <>You&apos;re <span className="font-bold">{result.score - comparisonAvg} points worse</span> than the {cityCompareLabel} average</>
                ) : (
                  <>You&apos;re exactly at the {cityCompareLabel} average</>
                )}
              </div>
            )}
            {avgNetWorth !== null && (
              <div className="text-center text-white/50">
                {cityCompareLabel} avg net worth: <span className={avgNetWorth >= 0 ? 'text-green-400' : 'text-red-400'}>${avgNetWorth.toLocaleString()}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* === WHY YOU'RE COOKED - Breakdown Cards === */}
      <div className="glass rounded-3xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 text-center">
          Why You&apos;re {result.score}% Cooked
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {/* Net Worth */}
          <div className="bg-white/5 rounded-2xl p-4 text-center">
            <div className="text-2xl mb-1">💰</div>
            <div className="text-white/50 text-xs uppercase tracking-wide">Net Worth</div>
            <div className={`text-2xl font-bold ${result.metrics.netWorth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${Math.abs(result.metrics.netWorth).toLocaleString()}
              {result.metrics.netWorth < 0 && <span className="text-sm"> debt</span>}
            </div>
            {avgNetWorth !== null && (
              <div className="text-white/40 text-xs mt-1">
                {cityCompareLabel} avg: ${avgNetWorth.toLocaleString()}
              </div>
            )}
          </div>
          
          {/* Debt Ratio */}
          <div className="bg-white/5 rounded-2xl p-4 text-center">
            <div className="text-2xl mb-1">💳</div>
            <div className="text-white/50 text-xs uppercase tracking-wide">Debt-to-Income</div>
            <div className={`text-2xl font-bold ${result.metrics.dti <= 35 ? 'text-green-400' : result.metrics.dti <= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
              {result.metrics.dti}%
            </div>
            <div className="text-white/40 text-xs mt-1">
              Healthy: under 35%
            </div>
          </div>
          
          {/* Rent Burden */}
          <div className="bg-white/5 rounded-2xl p-4 text-center">
            <div className="text-2xl mb-1">🏠</div>
            <div className="text-white/50 text-xs uppercase tracking-wide">Rent Burden</div>
            <div className={`text-2xl font-bold ${result.metrics.rentBurden <= 30 ? 'text-green-400' : result.metrics.rentBurden <= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
              {result.metrics.rentBurden}%
            </div>
            <div className="text-white/40 text-xs mt-1">
              Ideal: under 30%
            </div>
          </div>
          
          {/* Savings Rate */}
          <div className="bg-white/5 rounded-2xl p-4 text-center">
            <div className="text-2xl mb-1">📈</div>
            <div className="text-white/50 text-xs uppercase tracking-wide">Savings Rate</div>
            <div className={`text-2xl font-bold ${result.metrics.savingsRate >= 20 ? 'text-green-400' : result.metrics.savingsRate >= 10 ? 'text-yellow-400' : 'text-red-400'}`}>
              {result.metrics.savingsRate}%
            </div>
            <div className="text-white/40 text-xs mt-1">
              Target: 20%+
            </div>
          </div>
        </div>
      </div>

      {/* === TOP ISSUE === */}
      {result.topIssues[0] && (
        <div className="glass rounded-2xl p-5 border-l-4 border-l-yellow-500">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🔥</div>
            <div>
              <div className="text-lg font-semibold text-white">
                What&apos;s cooking you most: <span className="text-yellow-400">{result.topIssues[0].category}</span>
              </div>
              <div className="text-sm text-white/50">{result.topIssues[0].description}</div>
            </div>
          </div>
        </div>
      )}

      {/* === ROAST === */}
      <div className="glass rounded-3xl p-6 text-center">
        <div className="text-4xl mb-3">{tier.emoji}</div>
        <p className="text-xl text-white/70 italic">&ldquo;{result.roast}&rdquo;</p>
      </div>

      {/* === SHARE BUTTON (Sticky on mobile) === */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#050505] via-[#050505] to-transparent sm:relative sm:p-0 sm:bg-none z-50">
        <div className="flex gap-3">
          <button
            onClick={handleShare}
            disabled={isGenerating}
            className="flex-1 h-14 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-lg rounded-2xl transition-all disabled:opacity-50 shadow-lg shadow-orange-500/25"
          >
            {isGenerating ? 'Generating...' : 'Share 🔥'}
          </button>
          <a
            href="/leaderboard"
            className="h-14 px-6 bg-white/10 hover:bg-white/20 text-white font-bold text-lg rounded-2xl border border-white/10 transition-all flex items-center justify-center"
          >
            🏆
          </a>
        </div>
      </div>
      
      {/* Spacer for sticky button on mobile */}
      <div className="h-20 sm:hidden"></div>

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
    </div>
  );
}
