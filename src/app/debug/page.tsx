'use client';

import { useState } from 'react';
import { CookedMeter } from '@/components/results/CookedMeter';
import { CookedResult } from '@/types/calculator';
import Link from 'next/link';

const MOCK_RESULTS: Record<string, CookedResult> = {
  raw: {
    score: 12,
    tier: 'raw',
    emoji: '🥶',
    roast: "You're doing suspiciously well. Are you sure you entered this correctly?",
    breakdown: { rentScore: 10, debtScore: 10, savingsScore: 10, retirementScore: 20, creditScore: 10 },
    metrics: { dti: 5, rentBurden: 18, savingsRate: 45, netWorth: 85000 },
    topIssues: [],
    percentile: 92,
    recommendations: [],
  },
  lightSizzle: {
    score: 28,
    tier: 'medium-rare',
    emoji: '🍳',
    roast: "Some financial pink inside, but you'll survive.",
    breakdown: { rentScore: 30, debtScore: 25, savingsScore: 30, retirementScore: 35, creditScore: 20 },
    metrics: { dti: 22, rentBurden: 28, savingsRate: 18, netWorth: 15000 },
    topIssues: [{ category: 'Savings', description: 'Could use more emergency fund', severity: 'medium' as const }],
    percentile: 68,
    recommendations: [],
  },
  simmering: {
    score: 48,
    tier: 'medium',
    emoji: '🥘',
    roast: "Average American. Not great, not terrible.",
    breakdown: { rentScore: 50, debtScore: 45, savingsScore: 50, retirementScore: 55, creditScore: 40 },
    metrics: { dti: 45, rentBurden: 35, savingsRate: 8, netWorth: -5000 },
    topIssues: [{ category: 'Emergency Fund', description: 'Only 2 months of expenses saved', severity: 'high' as const }],
    percentile: 45,
    recommendations: [],
  },
  sauteed: {
    score: 65,
    tier: 'well-done',
    emoji: '🔥',
    roast: "The bills keep coming and they don't stop coming.",
    breakdown: { rentScore: 70, debtScore: 65, savingsScore: 70, retirementScore: 60, creditScore: 50 },
    metrics: { dti: 75, rentBurden: 42, savingsRate: 3, netWorth: -28000 },
    topIssues: [{ category: 'Housing', description: "You're spending 42% of income on rent", severity: 'high' as const }],
    percentile: 28,
    recommendations: [],
  },
  wellDone: {
    score: 78,
    tier: 'charcoal',
    emoji: '☠️',
    roast: "Credit card companies sending you thank you cards.",
    breakdown: { rentScore: 80, debtScore: 85, savingsScore: 80, retirementScore: 70, creditScore: 70 },
    metrics: { dti: 120, rentBurden: 48, savingsRate: 0, netWorth: -65000 },
    topIssues: [{ category: 'Credit Card Debt', description: '$18,000 in high-interest debt', severity: 'critical' as const }],
    percentile: 15,
    recommendations: [],
  },
  charred: {
    score: 91,
    tier: 'ash',
    emoji: '💀',
    roast: "Your emergency fund IS the emergency.",
    breakdown: { rentScore: 100, debtScore: 95, savingsScore: 100, retirementScore: 85, creditScore: 80 },
    metrics: { dti: 180, rentBurden: 55, savingsRate: -5, netWorth: -120000 },
    topIssues: [{ category: 'Total Debt', description: 'Debt is 180% of your annual income', severity: 'critical' as const }],
    percentile: 5,
    recommendations: [],
  },
};

export default function DebugPage() {
  const [selectedTier, setSelectedTier] = useState<string>('simmering');
  const result = MOCK_RESULTS[selectedTier];

  return (
    <main className="min-h-screen bg-[#050505] relative overflow-hidden">
      <div className="fixed inset-0 grid-bg opacity-50" />
      
      {/* Debug Controls */}
      <div className="relative z-50 bg-yellow-500/10 border-b border-yellow-500/30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-yellow-500 font-bold">🛠️ DEBUG MODE</span>
            <div className="flex gap-2">
              {Object.keys(MOCK_RESULTS).map((tier) => (
                <button
                  key={tier}
                  onClick={() => setSelectedTier(tier)}
                  className={`px-3 py-1 rounded-lg text-sm transition-all ${
                    selectedTier === tier 
                      ? 'bg-yellow-500 text-black font-bold' 
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
            <Link href="/" className="text-white/50 hover:text-white text-sm ml-auto">
              ← Back to app
            </Link>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="relative z-50 border-b border-white/5">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔥</span>
            <span className="font-black text-xl tracking-tight">
              am i <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">cooked</span>?
            </span>
          </div>
        </div>
      </header>

      {/* Results */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        <CookedMeter
          result={result}
          userCity="Richmond, VA"
          userAge={25}
          userIndustry="Tech / Software"
          avatarUrl="https://api.dicebear.com/9.x/notionists/svg?seed=Debug&backgroundColor=ffdfbf&radius=20&size=200"
        />
      </div>
    </main>
  );
}
