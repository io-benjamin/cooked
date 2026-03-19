'use client';

import { useState } from 'react';

interface PremiumPaywallProps {
  score: number;
  tier: string;
  onUnlock?: () => void;
}

export function PremiumPaywall({ score, tier, onUnlock }: PremiumPaywallProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleUnlock = async () => {
    setIsLoading(true);
    // TODO: Integrate Stripe checkout
    // For now, just simulate
    setTimeout(() => {
      setIsLoading(false);
      onUnlock?.();
    }, 1000);
  };

  return (
    <div className="relative mt-6">
      {/* Blurred preview of what they'd get */}
      <div className="relative">
        {/* Fake AI Analysis Preview - Blurred */}
        <div className="space-y-4 filter blur-sm pointer-events-none select-none">
          {/* Root Cause Card */}
          <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🔍</span>
              <h3 className="font-bold text-white">Why You're {tier}</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center text-xs">1</span>
                <div>
                  <p className="text-white font-medium">Your rent is eating 42% of your income</p>
                  <p className="text-white/50 text-sm">That's $600/month more than recommended for your area...</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center text-xs">2</span>
                <div>
                  <p className="text-white font-medium">Credit card debt is costing you $180/month</p>
                  <p className="text-white/50 text-sm">At 24% APR, you're paying $2,160/year in interest alone...</p>
                </div>
              </div>
            </div>
          </div>

          {/* Habit Detection Card */}
          <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🧠</span>
              <h3 className="font-bold text-white">Detected Habits</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-yellow-400">⚠️</span>
                <span className="text-white/70">Lifestyle creep detected — income up, savings flat</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-red-400">🚨</span>
                <span className="text-white/70">You're adding to debt each month</span>
              </div>
            </div>
          </div>

          {/* Action Plan Card */}
          <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">📋</span>
              <h3 className="font-bold text-white">Your 90-Day Recovery Plan</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-green-500/20 flex items-center justify-center text-xs text-green-400">✓</span>
                <span className="text-white/70 text-sm">Week 1: Cut $400 from non-essentials</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-white/10 flex items-center justify-center text-xs text-white/50">2</span>
                <span className="text-white/70 text-sm">Month 1: Build $1,000 emergency fund</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-white/10 flex items-center justify-center text-xs text-white/50">3</span>
                <span className="text-white/70 text-sm">Month 2-3: Pay off $3,000 credit card debt</span>
              </div>
            </div>
          </div>
        </div>

        {/* Overlay CTA */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-transparent via-black/60 to-black/90">
          <div className="text-center px-6 py-8 max-w-sm">
            <div className="text-4xl mb-3">🔓</div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Unlock Your Full Analysis
            </h3>
            <p className="text-white/60 text-sm mb-6">
              Find out exactly <span className="text-orange-400 font-semibold">why</span> you're cooked, 
              what habits are hurting you, and get a personalized plan to fix it.
            </p>
            
            {/* What's included */}
            <div className="text-left bg-white/5 rounded-xl p-4 mb-6 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-400">✓</span>
                <span className="text-white/80">Root cause analysis — what's actually killing you</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-400">✓</span>
                <span className="text-white/80">Habit detection — patterns AI found in your data</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-400">✓</span>
                <span className="text-white/80">Peer comparison — how you stack up by age, city, industry</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-400">✓</span>
                <span className="text-white/80">90-day action plan — specific steps with dollar amounts</span>
              </div>
            </div>

            <button
              onClick={handleUnlock}
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-lg rounded-xl transition-all disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>Processing...</span>
              ) : (
                <>
                  <span>Get My Analysis</span>
                  <span className="text-white/80">— $5</span>
                </>
              )}
            </button>
            
            <p className="text-white/30 text-xs mt-3">
              One-time payment • Instant access • No subscription
            </p>
            <p className="text-white/20 text-xs mt-2">
              For entertainment only. Not financial advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
