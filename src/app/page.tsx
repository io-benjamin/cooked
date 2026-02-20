'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CalculatorForm } from '@/components/calculator/CalculatorForm';
import { ResultsCard } from '@/components/results/ResultsCard';
import { calculateCookedScore } from '@/lib/scoring';
import { UserInputs, CookedResult } from '@/types/calculator';

export default function Home() {
  const [result, setResult] = useState<CookedResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);

  const handleSubmit = async (inputs: UserInputs) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    const calculatedResult = calculateCookedScore(inputs);
    setResult(calculatedResult);
    setIsLoading(false);
  };

  const handleReset = () => {
    setResult(null);
    setShowCalculator(false);
  };

  return (
    <main className="min-h-screen bg-[#050505] relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 grid-bg opacity-50" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-orange-500/10 via-red-500/5 to-transparent blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-orange-500/10 to-transparent blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-tl from-red-500/10 to-transparent blur-3xl pointer-events-none" />
      
      {/* Floating emojis */}
      <div className="fixed top-20 left-[10%] text-4xl animate-float opacity-20" style={{ animationDelay: '0s' }}>🔥</div>
      <div className="fixed top-40 right-[15%] text-3xl animate-float opacity-20" style={{ animationDelay: '1s' }}>💀</div>
      <div className="fixed bottom-40 left-[20%] text-3xl animate-float opacity-20" style={{ animationDelay: '2s' }}>🥩</div>
      <div className="fixed bottom-60 right-[10%] text-4xl animate-float opacity-20" style={{ animationDelay: '0.5s' }}>🖤</div>

      {/* Header */}
      <header className="relative z-50 border-b border-white/5">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => handleReset()}>
            <span className="text-3xl group-hover:animate-flame">🔥</span>
            <span className="font-black text-xl tracking-tight">
              am i <span className="gradient-text">cooked</span>?
            </span>
          </div>
          <nav className="hidden sm:flex gap-6 text-sm text-white/50">
            <Link href="/leaderboard" className="hover:text-white transition-colors">leaderboard</Link>
            <a href="#" className="hover:text-white transition-colors">about</a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {!result ? (
          !showCalculator ? (
            /* Hero Section */
            <div className="min-h-[80vh] flex flex-col items-center justify-center text-center">
              <div className="space-y-8 max-w-3xl mx-auto">
                {/* Main headline */}
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-white/70">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                    </span>
                    14,293 people checked today
                  </div>
                  
                  <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight">
                    are you financially
                    <br />
                    <span className="gradient-text">cooked?</span>
                  </h1>
                  
                  <p className="text-xl sm:text-2xl text-white/50 max-w-xl mx-auto leading-relaxed">
                    Find out where you stand compared to others your age, in your city, and in your field.
                  </p>
                </div>

                {/* CTA Button */}
                <div className="pt-4">
                  <button
                    onClick={() => setShowCalculator(true)}
                    className="group relative px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 animate-pulse-glow"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Find Out Now
                      <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  </button>
                </div>

                {/* Trust badges */}
                <div className="flex flex-wrap justify-center gap-6 pt-8 text-sm text-white/40">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🔒</span>
                    <span>100% Anonymous</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">⚡</span>
                    <span>2 minute quiz</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📊</span>
                    <span>Real comparisons</span>
                  </div>
                </div>

                {/* Tier preview */}
                <div className="pt-12">
                  <p className="text-sm text-white/30 mb-4">The cooked-ness scale</p>
                  <div className="flex justify-center gap-2 sm:gap-4">
                    {[
                      { emoji: '🥩', label: 'Raw', color: 'from-green-500/20 to-green-500/5' },
                      { emoji: '🍖', label: 'Medium Rare', color: 'from-lime-500/20 to-lime-500/5' },
                      { emoji: '🥓', label: 'Medium', color: 'from-yellow-500/20 to-yellow-500/5' },
                      { emoji: '🔥', label: 'Well Done', color: 'from-orange-500/20 to-orange-500/5' },
                      { emoji: '🖤', label: 'Charcoal', color: 'from-red-500/20 to-red-500/5' },
                      { emoji: '💀', label: 'Ash', color: 'from-gray-500/20 to-gray-500/5' },
                    ].map((tier, i) => (
                      <div 
                        key={i}
                        className={`flex flex-col items-center gap-1 p-3 rounded-xl bg-gradient-to-b ${tier.color} border border-white/5 hover:border-white/10 transition-all hover:scale-110 cursor-default`}
                      >
                        <span className="text-2xl sm:text-3xl">{tier.emoji}</span>
                        <span className="text-[10px] sm:text-xs text-white/50 hidden sm:block">{tier.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Calculator */
            <div className="py-8 animate-slide-up">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">Let's see how cooked you are</h2>
                <p className="text-white/50">Answer honestly. We won't judge... much. 🔥</p>
              </div>
              <CalculatorForm onSubmit={handleSubmit} isLoading={isLoading} />
            </div>
          )
        ) : (
          <ResultsCard result={result} onReset={handleReset} />
        )}
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-white/30">
            <div className="flex items-center gap-2">
              <span>🔥</span>
              <span>am i cooked? © 2026</span>
            </div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white/60 transition-colors">Privacy</a>
              <a href="#" className="hover:text-white/60 transition-colors">Terms</a>
              <a href="#" className="hover:text-white/60 transition-colors">Twitter</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
