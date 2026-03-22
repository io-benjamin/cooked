'use client';

import { useState, useEffect } from 'react';
import { CookedResult } from '@/types/calculator';

interface CookedMeterProps {
  result: CookedResult;
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

export function CookedMeter({ result }: CookedMeterProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [showContent, setShowContent] = useState(false);
  
  const tier = getTier(result.score);
  const topIssue = getTopIssue(result);

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
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      
      {/* Background */}
      <div className="fixed inset-0 bg-[#030305]" />
      
      {/* Floating particles */}
      {[10, 20, 40, 60, 80, 90].map((left, i) => (
        <div 
          key={i}
          className="fixed w-1 h-1 rounded-full animate-particle"
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
          background: `radial-gradient(ellipse at center, ${tier.color}20 0%, ${tier.color}08 30%, transparent 70%)`
        }}
      />
      
      {/* Header */}
      <header className="relative z-50 px-6 py-5">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <a href="/" className="font-display font-bold text-white/40 hover:text-white transition-colors">
            am i cooked?
          </a>
          <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/50 hover:text-white hover:bg-white/10 transition-all">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Save results
          </button>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        <div className={`max-w-lg w-full text-center transition-opacity duration-500 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
          
          {/* Score */}
          <div className="relative inline-block mb-6">
            {/* Glow behind score */}
            <div 
              className="absolute inset-[-40px] rounded-full animate-glow-pulse blur-[40px]"
              style={{ background: `radial-gradient(circle, ${tier.color}40 0%, transparent 70%)` }}
            />
            <div 
              className="relative font-display font-black leading-[0.85] tracking-tight"
              style={{ 
                fontSize: 'clamp(120px, 30vw, 200px)',
                background: 'linear-gradient(180deg, #fff 0%, rgba(255,255,255,0.6) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {animatedScore}
            </div>
          </div>
          
          {/* Tier Badge */}
          <div 
            className={`inline-flex items-center gap-3 px-6 py-3 rounded-full mb-12 relative overflow-hidden ${showContent ? 'animate-reveal-up' : ''}`}
            style={{ 
              animationDelay: '0.3s',
              background: `linear-gradient(135deg, ${tier.color}30 0%, ${tier.color}10 100%)`,
              border: `1px solid ${tier.color}50`,
            }}
          >
            {/* Shimmer effect */}
            <div 
              className="absolute inset-0 animate-shimmer"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }}
            />
            <span className="text-2xl relative z-10">{tier.emoji}</span>
            <span 
              className="font-display font-bold text-lg uppercase tracking-wider relative z-10"
              style={{ color: tier.colorLight }}
            >
              {tier.name}
            </span>
          </div>
          
          {/* Issue Card */}
          <div 
            className={`rounded-2xl p-6 mb-8 text-left relative overflow-hidden ${showContent ? 'animate-reveal-up' : ''}`}
            style={{ 
              animationDelay: '0.5s',
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
          <div className={showContent ? 'animate-reveal-up' : ''} style={{ animationDelay: '0.7s' }}>
            <button 
              className="w-full py-5 rounded-2xl font-display font-bold text-lg text-white relative overflow-hidden group transition-all duration-300 hover:-translate-y-1"
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
              <span className="relative z-10">Get Full Report — $5</span>
            </button>
            <p className="mt-4 text-white/25 text-xs">
              AI-powered analysis • Personalized action plan
            </p>
          </div>
          
        </div>
      </main>
      
      {/* Footer */}
      <footer className="relative z-10 py-4">
        <p className="text-center text-[10px] text-white/15">For entertainment purposes only. Not financial advice.</p>
      </footer>
      
    </div>
  );
}
