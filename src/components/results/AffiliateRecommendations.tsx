'use client';

import { CookedResult } from '@/types/calculator';

interface AffiliateRecommendationsProps {
  result: CookedResult;
}

// Affiliate links - replace with your actual affiliate URLs
const AFFILIATES = {
  // For people who are cooked (need help)
  cooked: [
    {
      name: 'Rocket Money',
      description: 'Cancel subscriptions you forgot about & lower your bills',
      tagline: 'Found users $200/month on average',
      url: 'https://rocketmoney.com', // Add ?ref=YOUR_ID
      icon: '🚀',
      color: 'from-green-500 to-emerald-600',
    },
    {
      name: 'YNAB',
      description: 'The budgeting app that actually works',
      tagline: '34-day free trial',
      url: 'https://ynab.com', // Add affiliate link
      icon: '📊',
      color: 'from-blue-500 to-cyan-600',
    },
    {
      name: 'SoFi',
      description: 'Refinance high-interest debt at lower rates',
      tagline: 'Check your rate in 2 min',
      url: 'https://sofi.com', // Add affiliate link
      icon: '💳',
      color: 'from-purple-500 to-violet-600',
    },
  ],
  // For people doing well (can grow wealth)
  notCooked: [
    {
      name: 'Robinhood',
      description: 'Start investing with as little as $1',
      tagline: 'Get a free stock when you sign up',
      url: 'https://robinhood.com', // Add affiliate link
      icon: '📈',
      color: 'from-green-500 to-emerald-600',
    },
    {
      name: 'Wealthfront',
      description: 'Automated investing with high-yield cash',
      tagline: '4.5% APY on cash',
      url: 'https://wealthfront.com', // Add affiliate link  
      icon: '💰',
      color: 'from-purple-500 to-violet-600',
    },
    {
      name: 'Chase Sapphire',
      description: 'Best travel rewards credit card',
      tagline: '60k bonus points offer',
      url: 'https://chase.com', // Add affiliate link
      icon: '✈️',
      color: 'from-blue-500 to-indigo-600',
    },
  ],
  // Universal recommendations
  universal: [
    {
      name: 'NerdWallet',
      description: 'Compare credit cards, loans & more',
      tagline: 'Free tools & calculators',
      url: 'https://nerdwallet.com', // Add affiliate link
      icon: '🤓',
      color: 'from-cyan-500 to-blue-600',
    },
  ],
};

export function AffiliateRecommendations({ result }: AffiliateRecommendationsProps) {
  const isCooked = result.score >= 45; // Simmering or above
  const recommendations = isCooked ? AFFILIATES.cooked : AFFILIATES.notCooked;
  
  // Pick top issue to personalize
  const topIssue = result.topIssues[0]?.category?.toLowerCase() || '';
  
  // Customize headline based on score
  const headline = isCooked 
    ? "Tools to get un-cooked 🧯" 
    : "Level up your finances 📈";
  
  const subheadline = isCooked
    ? "These helped others in your situation"
    : "You're doing well — here's how to do better";

  const handleClick = (affiliateName: string, url: string) => {
    // Track click (you can add analytics here)
    console.log(`Affiliate click: ${affiliateName}`);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="glass rounded-3xl p-6 mt-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-white mb-1">{headline}</h3>
        <p className="text-white/50 text-sm">{subheadline}</p>
      </div>

      <div className="space-y-3">
        {recommendations.map((affiliate, index) => (
          <button
            key={affiliate.name}
            onClick={() => handleClick(affiliate.name, affiliate.url)}
            className={`w-full p-4 rounded-2xl bg-gradient-to-r ${affiliate.color} hover:scale-[1.02] active:scale-[0.98] transition-all text-left flex items-center gap-4 group`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="text-3xl flex-shrink-0">{affiliate.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-white flex items-center gap-2">
                {affiliate.name}
                <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
              <div className="text-white/90 text-sm">{affiliate.description}</div>
              <div className="text-white/70 text-xs mt-1">{affiliate.tagline}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Specific recommendation based on top issue */}
      {topIssue.includes('debt') && isCooked && (
        <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <div className="flex items-start gap-3">
            <span className="text-xl">💡</span>
            <div>
              <p className="text-sm text-white/80">
                <span className="text-red-400 font-semibold">High debt detected.</span> Consider checking rates on SoFi — refinancing could save you hundreds per month.
              </p>
            </div>
          </div>
        </div>
      )}

      {topIssue.includes('rent') && isCooked && (
        <div className="mt-4 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
          <div className="flex items-start gap-3">
            <span className="text-xl">💡</span>
            <div>
              <p className="text-sm text-white/80">
                <span className="text-yellow-400 font-semibold">High rent burden.</span> Rocket Money can help you find subscriptions and bills to cut.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-white/30 text-xs text-center mt-4">
        We may earn a commission if you sign up through these links. This helps keep the site free.
      </p>
    </div>
  );
}
