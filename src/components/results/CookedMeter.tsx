'use client';

import { useState, useEffect } from 'react';
import { CookedResult } from '@/types/calculator';

interface CookedMeterProps {
  result: CookedResult;
  submissionId: string;
  userCity: string;
  userAge: number;
  userIndustry: string;
  avatarUrl: string;
  emailCaptured?: boolean;
  onEmailCapture?: (email: string) => Promise<void> | void;
}

// Tier configuration with dynamic colors
const TIERS = [
  { max: 15, name: 'Raw', emoji: '🧊', color: '#06B6D4', colorLight: '#22D3EE', colorDark: '#0891B2' },
  { max: 30, name: 'Light Sizzle', emoji: '🍳', color: '#22C55E', colorLight: '#4ADE80', colorDark: '#16A34A' },
  { max: 45, name: 'Simmering', emoji: '🥘', color: '#EAB308', colorLight: '#FACC15', colorDark: '#CA8A04' },
  { max: 60, name: 'Sautéed', emoji: '🔥', color: '#F97316', colorLight: '#FB923C', colorDark: '#EA580C' },
  { max: 80, name: 'Well Done', emoji: '☠️', color: '#EF4444', colorLight: '#F87171', colorDark: '#DC2626' },
  { max: 100, name: 'Charred', emoji: '💀', color: '#991B1B', colorLight: '#B91C1C', colorDark: '#7F1D1D' },
];

function getTier(score: number) {
  return TIERS.find(t => score <= t.max) || TIERS[TIERS.length - 1];
}

function getTopIssue(result: CookedResult): { title: string; detail: string } {
  const { metrics } = result;
  
  if (metrics.rentBurden > 30) {
    const overBy = Math.round(metrics.rentBurden - 30);
    return {
      title: `${Math.round(metrics.rentBurden)}% of income goes to rent`,
      detail: `That's ${overBy}% over the recommended maximum.`
    };
  }
  
  if (metrics.dti > 35) {
    return {
      title: `Debt-to-income ratio is ${Math.round(metrics.dti)}%`,
      detail: `Should be under 35% for financial health.`
    };
  }
  
  if (metrics.savingsRate < 10) {
    return {
      title: `Only saving ${Math.round(metrics.savingsRate)}% of income`,
      detail: `Aim for at least 20% to build wealth.`
    };
  }
  
  if (metrics.netWorth < 0) {
    return {
      title: `Net worth is negative`,
      detail: `Debt exceeds assets — focus on paying down debt.`
    };
  }
  
  return {
    title: `Multiple factors affecting your score`,
    detail: `Get the full report for a detailed breakdown.`
  };
}

export function CookedMeter({ result, submissionId }: CookedMeterProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const tier = getTier(result.score);
  const topIssue = getTopIssue(result);
  
  const handleCheckout = async () => {
    if (!submissionId) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId }),
      });
      
      const data = await res.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Trigger animations
    setTimeout(() => setShowContent(true), 100);
    
    // Animate score counting up
    const duration = 1500;
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
    <div className="relative w-full max-w-lg mx-auto">
      
      {/* Floating particles */}
      {[10, 30, 50, 70, 90].map((left, i) => (
        <div 
          key={i}
          className="fixed w-1 h-1 rounded-full animate-particle pointer-events-none"
          style={{ 
            left: `${left}%`, 
            animationDelay: `${i * 1.5}s`,
            background: tier.color,
            opacity: 0.3,
          }}
        />
      ))}
      
      {/* Light beam effect */}
      <div 
        className="fixed top-1/3 left-1/2 w-[200%] h-[300px] -translate-x-1/2 -translate-y-1/2 animate-light-pulse pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, ${tier.color}15 0%, ${tier.color}05 30%, transparent 70%)`
        }}
      />
      
      <div className={`text-center transition-opacity duration-500 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
        
{/* Score with Ring */}
        <div className="relative inline-block mb-10">
          {/* Glow behind score */}
          <div 
            className="absolute inset-[-40px] rounded-full animate-glow-pulse blur-[40px]"
            style={{ background: `radial-gradient(circle, ${tier.color}40 0%, transparent 70%)` }}
          />
          
          {/* Progress Ring Container */}
          <div className="relative w-[240px] h-[240px] sm:w-[280px] sm:h-[280px]">
            {/* SVG Ring */}
            <svg 
              className="w-full h-full -rotate-90"
              viewBox="0 0 280 280"
            >
              <defs>
                <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={tier.color} />
                  <stop offset="100%" stopColor={tier.colorLight} />
                </linearGradient>
              </defs>
              {/* Background ring */}
              <circle
                cx="140"
                cy="140"
                r="120"
                fill="none"
                stroke="rgba(255,255,255,0.04)"
                strokeWidth="12"
              />
              {/* Progress ring */}
              <circle
                cx="140"
                cy="140"
                r="120"
                fill="none"
                stroke="url(#ringGradient)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 120}
                strokeDashoffset={2 * Math.PI * 120 * (1 - animatedScore / 100)}
                style={{
                  filter: `drop-shadow(0 0 12px ${tier.color}80)`,
                  transition: 'stroke-dashoffset 0.1s ease-out',
                }}
              />
            </svg>
            
            {/* Score + Tier in center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div 
                className="font-display font-black leading-none tracking-tight"
                style={{ 
                  fontSize: 'clamp(56px, 14vw, 72px)',
                  background: 'linear-gradient(180deg, #fff 0%, rgba(255,255,255,0.6) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {animatedScore}
              </div>
              {/* Tier inside ring */}
              <div 
                className="flex items-center gap-1.5 mt-2"
                style={{ color: tier.colorLight }}
              >
                <span className="text-lg">{tier.emoji}</span>
                <span className="font-display font-bold text-sm uppercase tracking-wider">
                  {tier.name}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Issue Card */}
        <div 
          className={`rounded-2xl p-6 mb-8 text-left relative overflow-hidden ${showContent ? 'animate-reveal-up' : ''}`}
          style={{ 
            animationDelay: '0.3s',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {/* Top glow line */}
          <div 
            className="absolute top-0 left-[20%] right-[20%] h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${tier.color}80, transparent)` }}
          />
          
          <div className="flex items-center gap-3 mb-3">
            <div 
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: tier.color }}
            />
            <span className="text-xs uppercase tracking-widest text-white/40">Primary Issue</span>
          </div>
          <h2 className="font-display text-xl font-bold mb-2 text-white">
            {topIssue.title}
          </h2>
          <p className="text-white/40 text-sm">
            {topIssue.detail}
          </p>
        </div>
        
        {/* CTA Button */}
        <div className={showContent ? 'animate-reveal-up' : ''} style={{ animationDelay: '0.5s' }}>
          <button 
            onClick={handleCheckout}
            disabled={loading || !submissionId}
            className="w-full py-5 rounded-2xl font-display font-bold text-lg text-white relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-wait"
            style={{ 
              background: tier.color,
              boxShadow: `0 10px 40px ${tier.color}40`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = `0 20px 50px ${tier.color}60`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = `0 10px 40px ${tier.color}40`;
            }}
          >
            {/* Button shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative z-10">
              {loading ? 'Loading...' : 'Get Full Report — $5'}
            </span>
          </button>
          <p className="mt-4 text-white/25 text-xs">
            AI-powered analysis • Personalized action plan
          </p>
        </div>
        
      </div>
    </div>
  );
}
