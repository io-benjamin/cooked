'use client';

import { useState } from 'react';
import Link from 'next/link';

// Mock data for now - will be replaced with Supabase
const MOCK_DATA = [
  { id: 1, age: 24, city: 'New York, NY', industry: 'Food Service / Restaurant', score: 94, tier: 'ash', reason: '72% of income goes to a shoebox apartment' },
  { id: 2, age: 26, city: 'San Francisco, CA', industry: 'Tech / Software', score: 89, tier: 'charcoal', reason: '$180k salary but still has roommates' },
  { id: 3, age: 31, city: 'Los Angeles, CA', industry: 'Media / Entertainment', score: 87, tier: 'charcoal', reason: 'Owns more cameras than savings accounts' },
  { id: 4, age: 23, city: 'Miami, FL', industry: 'Hospitality / Hotel', score: 85, tier: 'charcoal', reason: 'Credit card debt from "networking events"' },
  { id: 5, age: 28, city: 'Austin, TX', industry: 'Retail / Customer Service', score: 82, tier: 'well-done', reason: 'Moved for tech jobs, works at Target' },
  { id: 6, age: 35, city: 'Chicago, IL', industry: 'Healthcare / Nursing', score: 78, tier: 'well-done', reason: 'Saves lives but not money' },
  { id: 7, age: 22, city: 'Denver, CO', industry: 'Student', score: 76, tier: 'well-done', reason: '$87k in loans for a philosophy degree' },
  { id: 8, age: 29, city: 'Seattle, WA', industry: 'Construction / Carpentry', score: 72, tier: 'well-done', reason: 'Builds houses, can\'t afford one' },
  { id: 9, age: 27, city: 'Phoenix, AZ', industry: 'Trucking / Delivery', score: 68, tier: 'medium', reason: 'Gas prices ate the emergency fund' },
  { id: 10, age: 33, city: 'Atlanta, GA', industry: 'Administrative / Office', score: 65, tier: 'medium', reason: 'Same salary since 2019' },
  { id: 11, age: 25, city: 'Houston, TX', industry: 'Warehouse / Logistics', score: 61, tier: 'medium', reason: 'Amazon Prime membership > retirement' },
  { id: 12, age: 30, city: 'Dallas, TX', industry: 'Automotive / Mechanic', score: 58, tier: 'medium', reason: 'Fixes cars, drives a beater' },
  { id: 13, age: 34, city: 'Philadelphia, PA', industry: 'Teaching / Education', score: 52, tier: 'medium', reason: 'Master\'s degree, Chipotle budget' },
  { id: 14, age: 28, city: 'San Antonio, TX', industry: 'Government / Public Sector', score: 45, tier: 'medium-rare', reason: 'Job security, no salary growth' },
  { id: 15, age: 32, city: 'Small Town / Rural', industry: 'Agriculture / Farming', score: 38, tier: 'medium-rare', reason: 'Owns land but it\'s all debt' },
  { id: 16, age: 40, city: 'Columbus, OH', industry: 'Manufacturing / Factory', score: 32, tier: 'medium-rare', reason: 'Union wages + low rent = surviving' },
  { id: 17, age: 36, city: 'Indianapolis, IN', industry: 'Electrician / Plumbing', score: 28, tier: 'medium-rare', reason: 'Trade school was the move' },
  { id: 18, age: 45, city: 'Kansas City, MO', industry: 'Self-Employed / Small Business', score: 22, tier: 'medium-rare', reason: 'Bet on themselves and won' },
  { id: 19, age: 38, city: 'Detroit, MI', industry: 'Finance / Banking', score: 18, tier: 'raw', reason: 'Knows all the loopholes' },
  { id: 20, age: 42, city: 'Pittsburgh, PA', industry: 'Consulting', score: 12, tier: 'raw', reason: '$400/hr to tell others they\'re cooked' },
];

const TIER_INFO: Record<string, { emoji: string; color: string }> = {
  'raw': { emoji: '🥩', color: 'text-green-400' },
  'medium-rare': { emoji: '🍖', color: 'text-lime-400' },
  'medium': { emoji: '🥓', color: 'text-yellow-400' },
  'well-done': { emoji: '🔥', color: 'text-orange-400' },
  'charcoal': { emoji: '🖤', color: 'text-red-400' },
  'ash': { emoji: '💀', color: 'text-gray-400' },
};

type FilterType = 'all' | 'city' | 'industry' | 'age';

export default function LeaderboardPage() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const [selectedAgeRange, setSelectedAgeRange] = useState<string>('');

  const cities = Array.from(new Set(MOCK_DATA.map(d => d.city))).sort();
  const industries = Array.from(new Set(MOCK_DATA.map(d => d.industry))).sort();
  const ageRanges = ['18-24', '25-30', '31-40', '40+'];

  const filteredData = MOCK_DATA.filter(entry => {
    if (filter === 'city' && selectedCity && entry.city !== selectedCity) return false;
    if (filter === 'industry' && selectedIndustry && entry.industry !== selectedIndustry) return false;
    if (filter === 'age' && selectedAgeRange) {
      const [min, max] = selectedAgeRange.split('-').map(n => parseInt(n) || 100);
      if (entry.age < min || entry.age > max) return false;
    }
    return true;
  }).sort((a, b) => b.score - a.score);

  const stats = {
    totalSubmissions: 14293,
    avgScore: 58,
    mostCookedCity: 'New York, NY',
    mostCookedIndustry: 'Food Service',
  };

  return (
    <main className="min-h-screen bg-[#050505] relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 grid-bg opacity-50" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-orange-500/10 via-red-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="relative z-50 border-b border-white/5">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 group cursor-pointer">
            <span className="text-3xl group-hover:animate-flame">🔥</span>
            <span className="font-black text-xl tracking-tight">
              am i <span className="gradient-text">cooked</span>?
            </span>
          </Link>
          <nav className="hidden sm:flex gap-6 text-sm text-white/50">
            <Link href="/leaderboard" className="text-white">leaderboard</Link>
            <Link href="/#" className="hover:text-white transition-colors">about</Link>
          </nav>
        </div>
      </header>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-black mb-4">
            🏆 The <span className="gradient-text">Cooked</span> Leaderboard
          </h1>
          <p className="text-white/50 text-lg">See how everyone else is doing (spoiler: also cooked)</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="glass rounded-2xl p-4 text-center">
            <div className="text-3xl font-black text-white">{stats.totalSubmissions.toLocaleString()}</div>
            <div className="text-sm text-white/50">Total Submissions</div>
          </div>
          <div className="glass rounded-2xl p-4 text-center">
            <div className="text-3xl font-black text-orange-400">{stats.avgScore}%</div>
            <div className="text-sm text-white/50">Average Score</div>
          </div>
          <div className="glass rounded-2xl p-4 text-center">
            <div className="text-xl font-bold text-white">{stats.mostCookedCity}</div>
            <div className="text-sm text-white/50">Most Cooked City</div>
          </div>
          <div className="glass rounded-2xl p-4 text-center">
            <div className="text-xl font-bold text-white">{stats.mostCookedIndustry}</div>
            <div className="text-sm text-white/50">Most Cooked Industry</div>
          </div>
        </div>

        {/* Filters */}
        <div className="glass rounded-2xl p-4 mb-6">
          <div className="flex flex-wrap gap-3 items-center">
            <span className="text-white/50 text-sm">Filter by:</span>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === 'all' ? 'bg-orange-500 text-white' : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('city')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === 'city' ? 'bg-orange-500 text-white' : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              City
            </button>
            <button
              onClick={() => setFilter('industry')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === 'industry' ? 'bg-orange-500 text-white' : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              Industry
            </button>
            <button
              onClick={() => setFilter('age')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === 'age' ? 'bg-orange-500 text-white' : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              Age
            </button>

            {filter === 'city' && (
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="px-4 py-2 rounded-xl text-sm bg-white/5 border border-white/10 text-white"
              >
                <option value="">All Cities</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            )}

            {filter === 'industry' && (
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="px-4 py-2 rounded-xl text-sm bg-white/5 border border-white/10 text-white"
              >
                <option value="">All Industries</option>
                {industries.map(ind => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            )}

            {filter === 'age' && (
              <select
                value={selectedAgeRange}
                onChange={(e) => setSelectedAgeRange(e.target.value)}
                className="px-4 py-2 rounded-xl text-sm bg-white/5 border border-white/10 text-white"
              >
                <option value="">All Ages</option>
                {ageRanges.map(range => (
                  <option key={range} value={range}>{range}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Leaderboard - Card Layout */}
        <div className="space-y-3">
          {filteredData.map((entry, index) => {
            const tierInfo = TIER_INFO[entry.tier];
            const isTop3 = index < 3;
            
            return (
              <div 
                key={entry.id}
                className={`glass rounded-2xl p-4 hover:bg-white/5 transition-colors ${
                  isTop3 ? 'border border-orange-500/30 bg-gradient-to-r from-orange-500/10 to-transparent' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Rank */}
                  <div className="flex-shrink-0 w-10 text-center">
                    {isTop3 ? (
                      <span className="text-3xl">{['🥇', '🥈', '🥉'][index]}</span>
                    ) : (
                      <span className="text-xl text-white/30 font-bold">{index + 1}</span>
                    )}
                  </div>
                  
                  {/* Main Content */}
                  <div className="flex-1 min-w-0">
                    {/* Score + Basic Info */}
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{tierInfo.emoji}</span>
                      <span className={`text-2xl font-black ${tierInfo.color}`}>{entry.score}%</span>
                      <span className="text-white/40">•</span>
                      <span className="text-white/60">{entry.age}yo</span>
                      <span className="text-white/40 hidden sm:inline">•</span>
                      <span className="text-white/60 hidden sm:inline truncate">{entry.city}</span>
                    </div>
                    
                    {/* Reason - The Star */}
                    <div className="text-white/80 text-sm sm:text-base mb-2">
                      &ldquo;{entry.reason}&rdquo;
                    </div>
                    
                    {/* Industry tag */}
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="px-2 py-1 rounded-lg bg-white/5 text-white/50">{entry.industry}</span>
                      <span className="px-2 py-1 rounded-lg bg-white/5 text-white/50 sm:hidden">{entry.city}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredData.length === 0 && (
            <div className="glass rounded-2xl p-8 text-center text-white/50">
              No results match your filters
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-white/50 mb-4">Think you can top the leaderboard?</p>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl font-bold text-lg hover:scale-105 transition-transform"
          >
            Check Your Score 🔥
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-white/30">
            <span>🔥 am i cooked? © 2026</span>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white/60 transition-colors">Privacy</a>
              <a href="#" className="hover:text-white/60 transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
