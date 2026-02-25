'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CalculatorForm } from '@/components/calculator/CalculatorForm';
import { CookedMeter } from '@/components/results/CookedMeter';
import { AvatarPicker } from '@/components/avatar/AvatarPicker';
import { LiveCounter } from '@/components/LiveCounter';
import { calculateCookedScore } from '@/lib/scoring';
import { UserInputs, CookedResult } from '@/types/calculator';

type Step = 'home' | 'avatar' | 'calculator' | 'results';

export default function Home() {
  const [step, setStep] = useState<Step>('home');
  const [result, setResult] = useState<CookedResult | null>(null);
  const [userInputs, setUserInputs] = useState<UserInputs | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previousSubmission, setPreviousSubmission] = useState<{ id: string; score: number } | null>(null);
  // Check for existing submission on mount
  useEffect(() => {
    const id = localStorage.getItem('cooked_submission_id');
    const score = localStorage.getItem('cooked_submission_score');
    if (id && score) {
      setPreviousSubmission({ id, score: parseInt(score) });
    }
  }, []);

  const handleAvatarComplete = (url: string) => {
    setAvatarUrl(url);
    setStep('calculator');
  };


  const handleSubmit = async (inputs: UserInputs) => {
    setIsLoading(true);
    setUserInputs(inputs);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const calculatedResult = calculateCookedScore(inputs);
    setResult(calculatedResult);
    setIsLoading(false);
    setStep('results');
    // Submission to Supabase happens in handleEmailCapture once we have the email
  };

  // Called by CookedMeter blur overlay when user enters email — submits to Supabase with email included
  const handleEmailCapture = async (email: string) => {
    if (!userInputs || !result) return;
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age: userInputs.age,
          city: userInputs.city,
          industry: userInputs.industry,
          score: result.score,
          tier: result.tier,
          dti: result.metrics.dti,
          rentBurden: result.metrics.rentBurden,
          savingsRate: result.metrics.savingsRate,
          netWorth: result.metrics.netWorth,
          avatarUrl: avatarUrl,
          isPublic: true,
          email,
          homeValue: userInputs.homeValue || null,
          mortgageBalance: userInputs.mortgageBalance || null,
          householdSize: userInputs.householdSize || null,
          partnerIncome: userInputs.partnerIncome || null,
          maritalStatus: userInputs.maritalStatus || null,
        }),
      });
      const data = await res.json();
      if (data?.id) {
        localStorage.setItem('cooked_submission_id', data.id);
        localStorage.setItem('cooked_submission_score', String(result.score));
      }
    } catch {
      // Silently fail
    }
  };

  const handleReset = () => {
    setResult(null);
    setUserInputs(null);
    setAvatarUrl(null);
    setStep('home');
  };

  return (
    <main className="min-h-screen bg-[#050505] relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 grid-bg opacity-50" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-orange-500/10 via-red-500/5 to-transparent blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-orange-500/10 to-transparent blur-3xl pointer-events-none hidden sm:block" />
      <div className="fixed bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-tl from-red-500/10 to-transparent blur-3xl pointer-events-none hidden sm:block" />

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
          <nav className="flex gap-4 sm:gap-6 text-sm text-white/50">
            <Link href="/leaderboard" className="hover:text-white transition-colors">
              <span className="sm:hidden">🏆</span>
              <span className="hidden sm:inline">leaderboard</span>
            </Link>
            <Link href="/about" className="hover:text-white transition-colors">
              <span className="sm:hidden">ℹ️</span>
              <span className="hidden sm:inline">about</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {step === 'home' && (
          <div className="min-h-[80vh] flex flex-col items-center justify-center text-center">
            <div className="space-y-8 max-w-3xl mx-auto">
              {/* Returning visitor banner */}
              {previousSubmission && (
                <Link
                  href={`/results/${previousSubmission.id}`}
                  className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-2xl hover:border-orange-500/50 transition-all group"
                >
                  <span className="text-2xl">🔥</span>
                  <span className="text-white/80">
                    You&apos;re <span className="font-bold text-orange-400">{previousSubmission.score}% cooked</span>
                  </span>
                  <span className="text-white/50 group-hover:text-white/80 transition-colors">
                    View results →
                  </span>
                </Link>
              )}

              <div className="space-y-4">
                <LiveCounter />
                <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight">
                  are you financially
                  <br />
                  <span className="gradient-text">cooked?</span>
                </h1>
                <p className="text-xl sm:text-2xl text-white/50 max-w-xl mx-auto leading-relaxed">
                  Create your character. Enter your stats. Watch yourself get roasted.
                </p>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setStep('avatar')}
                  className="group relative px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 animate-pulse-glow"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Create Your Character 🧑‍🍳
                    <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </button>
              </div>

              <div className="flex flex-wrap justify-center gap-6 pt-8 text-sm text-white/40">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🎨</span>
                  <span>Custom Avatar</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">🔥</span>
                  <span>Watch it burn</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">📊</span>
                  <span>Real comparisons</span>
                </div>
              </div>

              <div className="pt-12">
                <p className="text-sm text-white/30 mb-4">The heat scale</p>
                <div className="flex justify-center gap-2 sm:gap-4">
                  {[
                    { emoji: '🥶', label: 'Raw', color: 'from-cyan-500/20 to-cyan-500/5' },
                    { emoji: '🍳', label: 'Sizzle', color: 'from-green-500/20 to-green-500/5' },
                    { emoji: '🥘', label: 'Simmer', color: 'from-yellow-500/20 to-yellow-500/5' },
                    { emoji: '🔥', label: 'Sautéed', color: 'from-orange-500/20 to-orange-500/5' },
                    { emoji: '☠️', label: 'Well Done', color: 'from-red-500/20 to-red-500/5' },
                    { emoji: '💀', label: 'Charred', color: 'from-gray-500/20 to-gray-500/5' },
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
        )}

        {step === 'avatar' && (
          <div className="py-8 animate-slide-up">
            <AvatarPicker onComplete={handleAvatarComplete} />
          </div>
        )}

        {step === 'calculator' && (
          <div className="py-8 animate-slide-up">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Now for the hard part</h2>
              <p className="text-white/50">Answer honestly. We won&apos;t judge... much. 🔥</p>
            </div>
            <CalculatorForm onSubmit={handleSubmit} isLoading={isLoading} />
          </div>
        )}

        {step === 'results' && result && avatarUrl && (
          <div className="space-y-6 animate-slide-up">
            <CookedMeter
              result={result}
              userCity={userInputs?.city || 'Unknown'}
              userAge={userInputs?.age || 25}
              userIndustry={userInputs?.industry?.split(' / ')[0] || 'Unknown'}
              avatarUrl={avatarUrl}
              emailCaptured={false}
              onEmailCapture={handleEmailCapture}
            />

            <div className="max-w-2xl mx-auto">
              <button
                onClick={handleReset}
                className="w-full h-12 bg-white/5 border border-white/10 hover:bg-white/10 text-white/60 hover:text-white font-semibold rounded-2xl transition-all"
              >
                Cook Someone Else
              </button>
            </div>
          </div>
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
              <Link href="/privacy" className="hover:text-white/60 transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white/60 transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
