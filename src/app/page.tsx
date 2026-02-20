'use client';

import { useState } from 'react';
import { CalculatorForm } from '@/components/calculator/CalculatorForm';
import { ResultsCard } from '@/components/results/ResultsCard';
import { calculateCookedScore } from '@/lib/scoring';
import { UserInputs, CookedResult } from '@/types/calculator';

export default function Home() {
  const [result, setResult] = useState<CookedResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (inputs: UserInputs) => {
    setIsLoading(true);
    
    // Simulate a brief delay for effect
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const calculatedResult = calculateCookedScore(inputs);
    setResult(calculatedResult);
    setIsLoading(false);
  };

  const handleReset = () => {
    setResult(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            <span className="font-bold text-xl">Am I Cooked?</span>
          </div>
          <nav className="hidden sm:flex gap-4 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Dashboard</a>
            <a href="#" className="hover:text-foreground transition-colors">About</a>
          </nav>
        </div>
      </header>

      {/* Hero / Main Content */}
      <div className="container mx-auto px-4 py-12">
        {!result ? (
          <div className="max-w-2xl mx-auto">
            {/* Hero Text */}
            <div className="text-center mb-12 space-y-4">
              <h1 className="text-4xl sm:text-5xl font-bold">
                Are you financially{' '}
                <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  cooked?
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg mx-auto">
                Find out where you stand compared to others your age, in your city, and in your industry.
              </p>
              <div className="flex justify-center gap-8 text-sm text-muted-foreground pt-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🔒</span>
                  <span>100% Anonymous</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">⚡</span>
                  <span>2 min quiz</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">📊</span>
                  <span>Real comparisons</span>
                </div>
              </div>
            </div>

            {/* Calculator Form */}
            <CalculatorForm onSubmit={handleSubmit} isLoading={isLoading} />

            {/* Social Proof */}
            <div className="text-center mt-12 space-y-2">
              <p className="text-sm text-muted-foreground">
                Join <span className="font-semibold text-foreground">12,847</span> people who discovered their cooked score
              </p>
              <div className="flex justify-center gap-1">
                {['🥩', '🍖', '🥓', '🔥', '🖤', '💀'].map((emoji, i) => (
                  <span key={i} className="text-2xl">{emoji}</span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <ResultsCard result={result} onReset={handleReset} />
        )}
      </div>

      {/* Footer */}
      <footer className="border-t mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>🔥</span>
              <span>Am I Cooked? © 2026</span>
            </div>
            <div className="flex gap-4">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
