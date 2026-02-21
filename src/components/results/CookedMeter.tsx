'use client';

import { useState, useEffect } from 'react';
import { CookedResult } from '@/types/calculator';
import { AvatarPreview, AvatarConfig } from '@/components/avatar/AvatarBuilder';

interface CookedMeterProps {
  result: CookedResult;
  userCity: string;
  userAge: number;
  userIndustry: string;
  avatar: AvatarConfig;
}

const TIERS = [
  { max: 15, name: 'Raw', emoji: '🥶', color: '#22d3ee', description: 'Financially frozen solid' },
  { max: 30, name: 'Light Sizzle', emoji: '🍳', color: '#4ade80', description: 'Just warming up' },
  { max: 45, name: 'Simmering', emoji: '🥘', color: '#facc15', description: 'Things are heating up' },
  { max: 60, name: 'Sautéed', emoji: '🔥', color: '#fb923c', description: 'Getting crispy' },
  { max: 80, name: 'Well Done', emoji: '☠️', color: '#f87171', description: 'Overcooked' },
  { max: 100, name: 'Charred', emoji: '💀', color: '#a1a1aa', description: 'Beyond saving' },
];

function getTier(score: number) {
  return TIERS.find(t => score <= t.max) || TIERS[TIERS.length - 1];
}

export function CookedMeter({ result, userCity, userAge, userIndustry, avatar }: CookedMeterProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const tier = getTier(result.score);
  
  // Flame intensity based on score (0-1)
  const flameIntensity = result.score / 100;
  const flameCount = Math.ceil(flameIntensity * 8) + 2;

  useEffect(() => {
    setTimeout(() => setShowContent(true), 300);
    
    // Animate score
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

  return (
    <div className={`w-full max-w-2xl mx-auto ${showContent ? 'animate-slide-up' : 'opacity-0'}`}>
      {/* Main Kitchen Scene */}
      <div className="relative glass rounded-3xl overflow-hidden" style={{ minHeight: '500px' }}>
        {/* Background gradient based on tier */}
        <div 
          className="absolute inset-0 opacity-30 transition-all duration-1000"
          style={{ 
            background: `radial-gradient(ellipse at bottom, ${tier.color}40 0%, transparent 70%)` 
          }}
        />

        {/* Stove/Grill Base */}
        <div className="absolute bottom-0 left-0 right-0 h-32">
          {/* Grill grates */}
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-64 h-4">
            <div className="flex justify-between">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="w-1 h-4 bg-gray-600 rounded-full" />
              ))}
            </div>
          </div>
          
          {/* Stove surface */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-80 h-16 bg-gradient-to-t from-gray-800 to-gray-700 rounded-t-xl border-t-4 border-gray-600">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs text-gray-500 font-mono tracking-widest">
              FINANCIAL GRILL 3000
            </div>
          </div>
        </div>

        {/* Flames Container */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-64 h-32 flex items-end justify-center">
          {[...Array(flameCount)].map((_, i) => {
            const delay = i * 0.1;
            const height = 40 + Math.random() * 60 * flameIntensity;
            const left = 20 + (i * (220 / flameCount));
            
            return (
              <div
                key={i}
                className="absolute bottom-0 flame"
                style={{
                  left: `${left}px`,
                  width: '30px',
                  height: `${height}px`,
                  animationDelay: `${delay}s`,
                  opacity: 0.6 + flameIntensity * 0.4,
                }}
              >
                <svg viewBox="0 0 30 80" className="w-full h-full">
                  <defs>
                    <linearGradient id={`flame-${i}`} x1="0%" y1="100%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#f97316" />
                      <stop offset="50%" stopColor="#fbbf24" />
                      <stop offset="100%" stopColor="#fef3c7" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M15 0 C20 20, 30 40, 25 60 C22 70, 18 75, 15 80 C12 75, 8 70, 5 60 C0 40, 10 20, 15 0"
                    fill={`url(#flame-${i})`}
                    className="animate-flicker"
                    style={{ animationDelay: `${delay}s` }}
                  />
                </svg>
              </div>
            );
          })}
        </div>

        {/* Character/Avatar */}
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 text-center">
          <div 
            className="relative transition-transform duration-1000"
            style={{ 
              transform: `scale(${1 + flameIntensity * 0.15})`,
            }}
          >
            <AvatarPreview 
              config={avatar} 
              size={140} 
              burnLevel={animatedScore} 
            />
          </div>
        </div>

        {/* Score Display - Top */}
        <div className="relative pt-8 text-center">
          <div className="text-6xl mb-2">{tier.emoji}</div>
          <div 
            className="text-7xl font-black transition-colors duration-500"
            style={{ color: tier.color }}
          >
            {animatedScore}%
          </div>
          <div className="text-2xl font-bold text-white mt-2">{tier.name}</div>
          <div className="text-white/50 mt-1">{tier.description}</div>
        </div>

        {/* Location Context */}
        <div className="relative px-8 pt-6 pb-32 text-center">
          <div 
            className="text-xl font-semibold mb-4"
            style={{ color: tier.color }}
          >
            You are {animatedScore}% cooked in {userCity}
          </div>
        </div>
      </div>

      {/* Comparison Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
        <ComparisonCard
          label={`vs ${userAge}-year-olds`}
          percentile={result.percentile}
          color={tier.color}
        />
        <ComparisonCard
          label={`vs ${userCity.split(',')[0]}`}
          percentile={result.cityPercentile || result.percentile}
          color={tier.color}
        />
        <ComparisonCard
          label={`vs ${userIndustry}`}
          percentile={result.industryPercentile || result.percentile}
          color={tier.color}
        />
      </div>

      {/* Flame intensity indicator */}
      <div className="glass rounded-2xl p-4 mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-white/50">Heat Level</span>
          <span className="text-sm font-bold" style={{ color: tier.color }}>{tier.name}</span>
        </div>
        <div className="h-4 bg-white/5 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-1000 relative overflow-hidden"
            style={{ 
              width: `${animatedScore}%`,
              background: `linear-gradient(90deg, #22d3ee 0%, #4ade80 20%, #facc15 40%, #fb923c 60%, #f87171 80%, #a1a1aa 100%)`
            }}
          >
            <div className="absolute inset-0 animate-shimmer" />
          </div>
        </div>
        <div className="flex justify-between text-xs text-white/30 mt-1">
          <span>🥶 Raw</span>
          <span>💀 Charred</span>
        </div>
      </div>
    </div>
  );
}

function ComparisonCard({ label, percentile, color }: { label: string; percentile: number; color: string }) {
  const isGood = percentile < 50;
  
  return (
    <div className="glass rounded-2xl p-4 text-center">
      <div 
        className="text-3xl font-black"
        style={{ color: isGood ? '#4ade80' : color }}
      >
        {isGood ? 'Top' : 'Bottom'} {isGood ? percentile : 100 - percentile}%
      </div>
      <div className="text-xs text-white/50 mt-1">{label}</div>
    </div>
  );
}
