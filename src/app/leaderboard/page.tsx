'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Submission {
  id: string;
  created_at: string;
  age: number;
  city: string;
  industry: string;
  score: number;
  tier: string;
  dti: number;
  rent_burden: number;
  savings_rate: number;
  net_worth: number;
  avatar_url: string | null;
}

const TIER_INFO: Record<string, { emoji: string; color: string }> = {
  'raw': { emoji: '🥶', color: 'text-cyan-400' },
  'light-sizzle': { emoji: '🍳', color: 'text-green-400' },
  'simmering': { emoji: '🥘', color: 'text-yellow-400' },
  'sauteed': { emoji: '🔥', color: 'text-orange-400' },
  'well-done': { emoji: '☠️', color: 'text-red-400' },
  'charred': { emoji: '💀', color: 'text-gray-400' },
  'medium-rare': { emoji: '🍳', color: 'text-green-400' },
  'medium': { emoji: '🥘', color: 'text-yellow-400' },
  'charcoal': { emoji: '☠️', color: 'text-red-400' },
  'ash': { emoji: '💀', color: 'text-gray-400' },
};

type FilterType = 'all' | 'city' | 'industry' | 'age';
const PAGE_SIZE = 25;

export default function LeaderboardPage() {
  const [allData, setAllData] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const [selectedAgeRange, setSelectedAgeRange] = useState<string>('');
  const [page, setPage] = useState(1);
  const [userSubmission, setUserSubmission] = useState<{ id: string; rank: number; score: number } | null>(null);

  // Check for user's submission on mount
  useEffect(() => {
    const savedId = localStorage.getItem('cooked_submission_id');
    if (savedId) {
      const savedScore = localStorage.getItem('cooked_submission_score');
      setUserSubmission({ 
        id: savedId, 
        rank: 0, // Will be calculated after data loads
        score: savedScore ? parseInt(savedScore) : 0 
      });
    }
  }, []);

  // Fetch all data once
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/leaderboard');
        const json = await res.json();
        const sorted = Array.isArray(json) ? json : [];
        setAllData(sorted);
        
        // Find user's rank
        const savedId = localStorage.getItem('cooked_submission_id');
        if (savedId) {
          const userIndex = sorted.findIndex((s: Submission) => s.id === savedId);
          if (userIndex !== -1) {
            setUserSubmission(prev => prev ? { ...prev, rank: userIndex + 1 } : null);
          }
        }
      } catch (e) {
        console.error('Failed to fetch leaderboard:', e);
        setAllData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter data
  const filteredData = allData.filter(entry => {
    if (filter === 'city' && selectedCity && entry.city !== selectedCity) return false;
    if (filter === 'industry' && selectedIndustry && entry.industry !== selectedIndustry) return false;
    if (filter === 'age' && selectedAgeRange) {
      const [min, max] = selectedAgeRange.split('-').map(n => parseInt(n));
      if (entry.age < min || entry.age > max) return false;
    }
    return true;
  });

  // Paginate
  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
  const paginatedData = filteredData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page when filter changes
  useEffect(() => {
    setPage(1);
  }, [filter, selectedCity, selectedIndustry, selectedAgeRange]);

  const cities = Array.from(new Set(allData.map(d => d.city))).sort();
  const industries = Array.from(new Set(allData.map(d => d.industry))).sort();
  const ageRanges = ['18-24', '25-30', '31-40', '41-100'];

  // Calculate stats from filtered data
  const stats = {
    totalSubmissions: filteredData.length,
    avgScore: filteredData.length > 0 ? Math.round(filteredData.reduce((sum, d) => sum + d.score, 0) / filteredData.length) : 0,
    mostCookedCity: allData.length > 0 ? allData[0]?.city || '-' : '-',
    mostCookedIndustry: allData.length > 0 ? allData[0]?.industry || '-' : '-',
  };

  const scrollToUser = () => {
    if (!userSubmission || userSubmission.rank === 0) return;
    const userPage = Math.ceil(userSubmission.rank / PAGE_SIZE);
    setPage(userPage);
  };

  return (
    <main className="min-h-screen bg-[#050505] relative overflow-hidden pb-24">
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
            <Link href="/about" className="hover:text-white transition-colors">about</Link>
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
          <div className="glass rounded-2xl p-4 text-center flex flex-col justify-center min-h-[100px]">
            <div className="text-3xl font-black text-white">{stats.totalSubmissions.toLocaleString()}</div>
            <div className="text-sm text-white/50">Total Submissions</div>
          </div>
          <div className="glass rounded-2xl p-4 text-center flex flex-col justify-center min-h-[100px]">
            <div className="text-3xl font-black text-orange-400">{stats.avgScore}%</div>
            <div className="text-sm text-white/50">Average Score</div>
          </div>
          <div className="glass rounded-2xl p-4 text-center flex flex-col justify-center min-h-[100px]">
            <div className="text-lg font-bold text-white truncate">{stats.mostCookedCity || '—'}</div>
            <div className="text-sm text-white/50">Most Cooked City</div>
          </div>
          <div className="glass rounded-2xl p-4 text-center flex flex-col justify-center min-h-[100px]">
            <div className="text-lg font-bold text-white truncate">{stats.mostCookedIndustry || '—'}</div>
            <div className="text-sm text-white/50">Most Cooked Industry</div>
          </div>
        </div>

        {/* Filters */}
        <div className="glass rounded-2xl p-4 mb-6">
          <div className="flex flex-wrap gap-3 items-center">
            <span className="text-white/50 text-sm">Filter by:</span>
            <button
              onClick={() => { setFilter('all'); setSelectedCity(''); setSelectedIndustry(''); setSelectedAgeRange(''); }}
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

        {/* Leaderboard */}
        {loading ? (
          <div className="glass rounded-2xl p-12 text-center">
            <div className="text-4xl mb-4 animate-pulse">🔥</div>
            <div className="text-white/50">Loading submissions...</div>
          </div>
        ) : paginatedData.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <div className="text-4xl mb-4">🍳</div>
            <div className="text-white/70 text-xl mb-2">No submissions yet!</div>
            <div className="text-white/50">Be the first to get cooked</div>
            <Link 
              href="/"
              className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl font-bold hover:scale-105 transition-transform"
            >
              Take the Quiz 🔥
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {paginatedData.map((entry, index) => {
              const tierInfo = TIER_INFO[entry.tier] || TIER_INFO['simmering'];
              const globalRank = (page - 1) * PAGE_SIZE + index + 1;
              const isTop3 = globalRank <= 3;
              const isCurrentUser = userSubmission?.id === entry.id;
              
              return (
                <div 
                  key={entry.id}
                  className={`glass rounded-2xl p-4 hover:bg-white/5 transition-colors ${
                    isTop3 ? 'border border-orange-500/30 bg-gradient-to-r from-orange-500/10 to-transparent' : ''
                  } ${isCurrentUser ? 'ring-2 ring-cyan-500' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    {/* Rank */}
                    <div className="flex-shrink-0 w-10 text-center">
                      {isTop3 ? (
                        <span className="text-3xl">{['🥇', '🥈', '🥉'][globalRank - 1]}</span>
                      ) : (
                        <span className="text-xl text-white/30 font-bold">{globalRank}</span>
                      )}
                    </div>
                    
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {entry.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                          src={entry.avatar_url} 
                          alt="" 
                          className={`w-14 h-14 rounded-xl object-cover border-2 ${tierInfo.color.replace('text-', 'border-')}`}
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center text-2xl">
                          {tierInfo.emoji}
                        </div>
                      )}
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className={`text-2xl font-black ${tierInfo.color}`}>{entry.score}%</span>
                        {isCurrentUser && <span className="px-2 py-0.5 text-xs bg-cyan-500/20 text-cyan-400 rounded-full">You</span>}
                        <span className="text-white/40">•</span>
                        <span className="text-white/60 text-sm">{entry.age}yo</span>
                        <span className="text-white/40">•</span>
                        <span className="text-white/60 text-sm truncate">{entry.city}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                        <div className={`px-3 py-2 rounded-lg ${entry.dti > 40 ? 'bg-red-500/20 text-red-400' : entry.dti > 25 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                          <div className="text-lg font-bold">{entry.dti}%</div>
                          <div className="text-[10px] opacity-70">Debt-to-Income</div>
                        </div>
                        <div className={`px-3 py-2 rounded-lg ${entry.rent_burden > 40 ? 'bg-red-500/20 text-red-400' : entry.rent_burden > 30 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                          <div className="text-lg font-bold">{entry.rent_burden}%</div>
                          <div className="text-[10px] opacity-70">Rent Burden</div>
                        </div>
                        <div className={`px-3 py-2 rounded-lg ${entry.savings_rate < 5 ? 'bg-red-500/20 text-red-400' : entry.savings_rate < 15 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                          <div className="text-lg font-bold">{entry.savings_rate}%</div>
                          <div className="text-[10px] opacity-70">Savings Rate</div>
                        </div>
                        <div className={`px-3 py-2 rounded-lg ${entry.net_worth < 0 ? 'bg-red-500/20 text-red-400' : entry.net_worth < 50000 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                          <div className="text-lg font-bold">{entry.net_worth < 0 ? '-' : ''}${Math.abs(entry.net_worth) >= 1000 ? `${Math.round(Math.abs(entry.net_worth) / 1000)}k` : Math.abs(entry.net_worth)}</div>
                          <div className="text-[10px] opacity-70">Net Worth</div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="px-2 py-1 rounded-lg bg-white/5 text-white/50">{entry.industry}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              ← Prev
            </button>
            <span className="text-white/50">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Next →
            </button>
          </div>
        )}

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

      {/* Sticky User Rank Footer */}
      {userSubmission && userSubmission.rank > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a] to-transparent pt-4">
          <div className="container mx-auto px-4 pb-4">
            <button
              onClick={scrollToUser}
              className="w-full glass rounded-2xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors border border-cyan-500/30"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">📍</span>
                <div className="text-left">
                  <div className="text-sm text-white/50">Your Ranking</div>
                  <div className="text-xl font-bold text-white">
                    #{userSubmission.rank} <span className="text-white/40 text-sm font-normal">of {allData.length}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-orange-400 font-bold">{userSubmission.score}% cooked</span>
                <span className="text-white/50">→</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-white/30">
            <span>🔥 am i cooked? © 2026</span>
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
