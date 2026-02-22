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

export function CookedMeter({ result, userCity, userAge, userIndustry, avatarUrl }: CookedMeterProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);
  const tier = getTier(result.score);
  const flameIntensity = result.score / 100;

  // Mock data for rankings (will come from Supabase later)
  const totalUsers = 9120;
  const userRank = Math.floor(totalUsers * (result.percentile / 100));
  const aheadOf = 100 - result.percentile;
  const savingsGap = (Math.random() * 3 + 0.5).toFixed(1); // Mock

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

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const blob = await generateImage();
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cooked-${result.score}percent.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    const text = `I'm ${result.score}% cooked 🔥\n\nRanked #${userRank.toLocaleString()} in ${userCity}\n\nFind out how cooked you are: amicooked.com`;
    
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
          {/* Flames behind */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
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
          
          {/* Avatar - "Becoming Uncanny" effect */}
          <div 
            className="relative w-32 h-32 rounded-2xl overflow-hidden border-4 transition-all duration-500"
            style={{ borderColor: tier.color, boxShadow: `0 0 40px ${tier.color}40` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={avatarUrl} 
              alt="You" 
              className="w-full h-full object-cover transition-all duration-700"
              style={{
                filter: `
                  brightness(${1 - flameIntensity * 0.5}) 
                  contrast(${1 + flameIntensity * 0.4}) 
                  saturate(${1 - flameIntensity * 0.9})
                  ${flameIntensity > 0.6 ? `blur(${(flameIntensity - 0.6) * 1.5}px)` : ''}
                `.trim(),
              }}
            />
            {/* Grain/noise overlay - increases with score */}
            {flameIntensity > 0.3 && (
              <div 
                className="absolute inset-0 pointer-events-none mix-blend-overlay"
                style={{
                  opacity: Math.min(0.6, (flameIntensity - 0.3) * 0.8),
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                }}
              />
            )}
            {/* Dark vignette overlay - increases with score */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(circle, transparent 30%, rgba(0,0,0,${flameIntensity * 0.7}) 100%)`,
              }}
            />
            {/* Red tint for high scores */}
            {flameIntensity > 0.7 && (
              <div 
                className="absolute inset-0 pointer-events-none mix-blend-multiply"
                style={{
                  backgroundColor: `rgba(139, 0, 0, ${(flameIntensity - 0.7) * 0.5})`,
                }}
              />
            )}
            {/* Expression */}
            <div className="absolute bottom-1 right-1 text-2xl">
              {result.score > 80 ? '💀' : result.score > 60 ? '😵' : result.score > 40 ? '😰' : result.score > 20 ? '😅' : '😎'}
            </div>
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
        </div>

        {/* Doneness Meter */}
        <div className="mt-8 px-4">
          <div className="h-6 bg-white/5 rounded-full overflow-hidden relative">
            <div 
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{ 
                width: `${animatedScore}%`,
                background: `linear-gradient(90deg, #22d3ee 0%, #4ade80 20%, #facc15 40%, #fb923c 60%, #f87171 80%, #a1a1aa 100%)`
              }}
            />
            {/* Marker */}
            <div 
              className="absolute top-0 h-full w-1 bg-white transition-all duration-1000"
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
        </div>
      </div>

      {/* === RANKING SECTION === */}
      <div className="glass rounded-3xl p-6">
        <div className="text-center mb-4">
          <div className="text-white/50 text-sm">Your Ranking</div>
          <div className="text-4xl font-black text-white">
            #{userRank.toLocaleString()} <span className="text-white/40 text-lg font-normal">of {totalUsers.toLocaleString()}</span>
          </div>
          <div className="text-white/50 text-sm mt-1">
            in {userCity} (Age {userAge})
          </div>
        </div>
      </div>

      {/* === COMPARISON INSIGHTS === */}
      <div className="space-y-3">
        {/* Age comparison */}
        <div className={`glass rounded-2xl p-5 border-l-4 ${aheadOf >= 50 ? 'border-l-green-500' : 'border-l-red-500'}`}>
          <div className="flex items-center gap-3">
            <div className="text-3xl">{aheadOf >= 50 ? '📈' : '📉'}</div>
            <div>
              <div className="text-lg font-semibold text-white">
                You&apos;re {aheadOf >= 50 ? 'ahead of' : 'behind'} <span style={{ color: aheadOf >= 50 ? '#4ade80' : '#f87171' }}>{aheadOf >= 50 ? aheadOf : 100 - aheadOf}%</span> of people your age
              </div>
              <div className="text-sm text-white/50">Compared to other {userAge}-year-olds nationwide</div>
            </div>
          </div>
        </div>

        {/* Industry comparison */}
        <div className="glass rounded-2xl p-5 border-l-4 border-l-orange-500">
          <div className="flex items-center gap-3">
            <div className="text-3xl">💼</div>
            <div>
              <div className="text-lg font-semibold text-white">
                You&apos;re behind {userIndustry}s in your city by <span className="text-orange-400">{savingsGap} years</span> of savings
              </div>
              <div className="text-sm text-white/50">Based on average emergency fund runway</div>
            </div>
          </div>
        </div>

        {/* Top issue */}
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
      </div>

      {/* === ROAST === */}
      <div className="glass rounded-3xl p-6 text-center">
        <div className="text-4xl mb-3">{tier.emoji}</div>
        <p className="text-xl text-white/70 italic">&ldquo;{result.roast}&rdquo;</p>
      </div>

      {/* === SHARE BUTTONS === */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleShare}
          disabled={isGenerating}
          className="flex-1 h-14 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-lg rounded-2xl transition-all disabled:opacity-50"
        >
          {isGenerating ? 'Generating...' : 'Share Results 🔥'}
        </button>
        <button
          onClick={handleDownload}
          disabled={isGenerating}
          className="flex-1 h-14 bg-white/10 hover:bg-white/20 text-white font-bold text-lg rounded-2xl border border-white/10 transition-all disabled:opacity-50"
        >
          {isGenerating ? '...' : 'Download Card 📸'}
        </button>
      </div>

      {/* Hidden ShareCard */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', pointerEvents: 'none' }}>
        <ShareCard 
          ref={shareCardRef} 
          result={result} 
          avatarUrl={avatarUrl} 
          userCity={userCity}
          userAge={userAge}
          userRank={userRank}
          totalUsers={totalUsers}
        />
      </div>
    </div>
  );
}
