/**
 * Aggregations API - Dynamic stats from our submissions
 * All data comes from real user submissions, nothing hardcoded
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const MIN_FOR_STATS = 5; // Minimum submissions to show stats

interface Submission {
  score: number;
  dti: number;
  rent_burden: number;
  savings_rate: number;
  net_worth: number;
  annual_income: number | null;
  monthly_rent: number | null;
  total_savings: number | null;
  total_debt: number | null;
  retirement_savings: number | null;
  city: string;
  industry: string;
  age: number;
}

interface AggregatedStats {
  count: number;
  avgScore: number;
  avgRentBurden: number;
  avgDti: number;
  avgSavingsRate: number;
  avgNetWorth: number;
  medianNetWorth: number;
  avgIncome: number | null;
  medianIncome: number | null;
  avgRent: number | null;
  avgSavings: number | null;
  avgDebt: number | null;
  avgRetirement: number | null;
  scoreDistribution: {
    raw: number;        // 0-15
    lightSizzle: number; // 16-30
    simmering: number;   // 31-45
    sauteed: number;     // 46-60
    wellDone: number;    // 61-80
    charred: number;     // 81-100
  };
}

function median(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function calculateStats(submissions: Submission[]): AggregatedStats | null {
  if (submissions.length < MIN_FOR_STATS) return null;
  
  const count = submissions.length;
  
  // Filter out nulls for optional fields
  const incomes = submissions.map(s => s.annual_income).filter((v): v is number => v !== null && v > 0);
  const rents = submissions.map(s => s.monthly_rent).filter((v): v is number => v !== null && v > 0);
  const savings = submissions.map(s => s.total_savings).filter((v): v is number => v !== null);
  const debts = submissions.map(s => s.total_debt).filter((v): v is number => v !== null);
  const retirements = submissions.map(s => s.retirement_savings).filter((v): v is number => v !== null);
  const netWorths = submissions.map(s => s.net_worth);
  
  return {
    count,
    avgScore: Math.round(submissions.reduce((sum, s) => sum + s.score, 0) / count),
    avgRentBurden: Math.round(submissions.reduce((sum, s) => sum + s.rent_burden, 0) / count),
    avgDti: Math.round(submissions.reduce((sum, s) => sum + s.dti, 0) / count),
    avgSavingsRate: Math.round(submissions.reduce((sum, s) => sum + s.savings_rate, 0) / count),
    avgNetWorth: Math.round(submissions.reduce((sum, s) => sum + s.net_worth, 0) / count),
    medianNetWorth: Math.round(median(netWorths)),
    avgIncome: incomes.length >= MIN_FOR_STATS ? Math.round(incomes.reduce((a, b) => a + b, 0) / incomes.length) : null,
    medianIncome: incomes.length >= MIN_FOR_STATS ? Math.round(median(incomes)) : null,
    avgRent: rents.length >= MIN_FOR_STATS ? Math.round(rents.reduce((a, b) => a + b, 0) / rents.length) : null,
    avgSavings: savings.length >= MIN_FOR_STATS ? Math.round(savings.reduce((a, b) => a + b, 0) / savings.length) : null,
    avgDebt: debts.length >= MIN_FOR_STATS ? Math.round(debts.reduce((a, b) => a + b, 0) / debts.length) : null,
    avgRetirement: retirements.length >= MIN_FOR_STATS ? Math.round(retirements.reduce((a, b) => a + b, 0) / retirements.length) : null,
    scoreDistribution: {
      raw: submissions.filter(s => s.score <= 15).length,
      lightSizzle: submissions.filter(s => s.score > 15 && s.score <= 30).length,
      simmering: submissions.filter(s => s.score > 30 && s.score <= 45).length,
      sauteed: submissions.filter(s => s.score > 45 && s.score <= 60).length,
      wellDone: submissions.filter(s => s.score > 60 && s.score <= 80).length,
      charred: submissions.filter(s => s.score > 80).length,
    },
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');
  const industry = searchParams.get('industry');
  const age = searchParams.get('age') ? parseInt(searchParams.get('age')!) : null;
  const userScore = searchParams.get('score') ? parseInt(searchParams.get('score')!) : null;
  
  const supabase = createClient();
  
  // Fetch all public submissions with extended fields
  const allSubmissions: Submission[] = [];
  const BATCH = 1000;
  let offset = 0;
  
  while (true) {
    const { data, error } = await supabase
      .from('submissions')
      .select(`
        score, dti, rent_burden, savings_rate, net_worth,
        annual_income, monthly_rent, total_savings, total_debt, retirement_savings,
        city, industry, age
      `)
      .eq('is_public', true)
      .range(offset, offset + BATCH - 1);
    
    if (error || !data || data.length === 0) break;
    allSubmissions.push(...data);
    if (data.length < BATCH) break;
    offset += BATCH;
  }
  
  if (allSubmissions.length === 0) {
    return NextResponse.json({
      overall: null,
      city: null,
      ageGroup: null,
      industry: null,
      percentile: null,
      topCities: [],
      topIndustries: [],
      ageGroupBreakdown: [],
    });
  }
  
  // Overall stats
  const overall = calculateStats(allSubmissions);
  
  // City stats
  let cityStats: (AggregatedStats & { name: string }) | null = null;
  if (city) {
    const citySubmissions = allSubmissions.filter(s => s.city === city);
    const stats = calculateStats(citySubmissions);
    if (stats) {
      cityStats = { ...stats, name: city };
    }
  }
  
  // Age group stats (±3 years)
  let ageGroupStats: (AggregatedStats & { range: string }) | null = null;
  if (age) {
    const ageSubmissions = allSubmissions.filter(s => s.age >= age - 3 && s.age <= age + 3);
    const stats = calculateStats(ageSubmissions);
    if (stats) {
      ageGroupStats = { ...stats, range: `${age - 3}-${age + 3}` };
    }
  }
  
  // Industry stats
  let industryStats: (AggregatedStats & { name: string }) | null = null;
  if (industry) {
    // Match industry loosely (contains match)
    const industryLower = industry.toLowerCase();
    const industrySubmissions = allSubmissions.filter(s => 
      s.industry.toLowerCase().includes(industryLower) ||
      industryLower.includes(s.industry.toLowerCase())
    );
    const stats = calculateStats(industrySubmissions);
    if (stats) {
      industryStats = { ...stats, name: industry };
    }
  }
  
  // Percentile (lower score = better = higher percentile)
  let percentile: number | null = null;
  let rank: number | null = null;
  if (userScore !== null) {
    const betterThan = allSubmissions.filter(s => s.score > userScore).length;
    percentile = Math.round((betterThan / allSubmissions.length) * 100);
    rank = allSubmissions.filter(s => s.score <= userScore).length;
  }
  
  // Top cities by submission count and average score
  const cityGroups: Record<string, Submission[]> = {};
  allSubmissions.forEach(s => {
    if (!cityGroups[s.city]) cityGroups[s.city] = [];
    cityGroups[s.city].push(s);
  });
  
  const topCities = Object.entries(cityGroups)
    .filter(([, subs]) => subs.length >= MIN_FOR_STATS)
    .map(([name, subs]) => ({
      name,
      count: subs.length,
      avgScore: Math.round(subs.reduce((sum, s) => sum + s.score, 0) / subs.length),
      avgIncome: subs.filter(s => s.annual_income).length >= MIN_FOR_STATS
        ? Math.round(subs.filter(s => s.annual_income).reduce((sum, s) => sum + (s.annual_income || 0), 0) / subs.filter(s => s.annual_income).length)
        : null,
      avgRent: subs.filter(s => s.monthly_rent).length >= MIN_FOR_STATS
        ? Math.round(subs.filter(s => s.monthly_rent).reduce((sum, s) => sum + (s.monthly_rent || 0), 0) / subs.filter(s => s.monthly_rent).length)
        : null,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  // Top industries
  const industryGroups: Record<string, Submission[]> = {};
  allSubmissions.forEach(s => {
    if (!industryGroups[s.industry]) industryGroups[s.industry] = [];
    industryGroups[s.industry].push(s);
  });
  
  const topIndustries = Object.entries(industryGroups)
    .filter(([, subs]) => subs.length >= MIN_FOR_STATS)
    .map(([name, subs]) => ({
      name,
      count: subs.length,
      avgScore: Math.round(subs.reduce((sum, s) => sum + s.score, 0) / subs.length),
      avgIncome: subs.filter(s => s.annual_income).length >= MIN_FOR_STATS
        ? Math.round(subs.filter(s => s.annual_income).reduce((sum, s) => sum + (s.annual_income || 0), 0) / subs.filter(s => s.annual_income).length)
        : null,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  // Age group breakdown
  const ageGroups = [
    { label: 'Under 25', min: 0, max: 24 },
    { label: '25-34', min: 25, max: 34 },
    { label: '35-44', min: 35, max: 44 },
    { label: '45-54', min: 45, max: 54 },
    { label: '55+', min: 55, max: 120 },
  ];
  
  const ageGroupBreakdown = ageGroups.map(group => {
    const subs = allSubmissions.filter(s => s.age >= group.min && s.age <= group.max);
    if (subs.length < MIN_FOR_STATS) return { ...group, count: subs.length, stats: null };
    return {
      ...group,
      count: subs.length,
      stats: {
        avgScore: Math.round(subs.reduce((sum, s) => sum + s.score, 0) / subs.length),
        avgNetWorth: Math.round(subs.reduce((sum, s) => sum + s.net_worth, 0) / subs.length),
        avgIncome: subs.filter(s => s.annual_income).length >= MIN_FOR_STATS
          ? Math.round(subs.filter(s => s.annual_income).reduce((sum, s) => sum + (s.annual_income || 0), 0) / subs.filter(s => s.annual_income).length)
          : null,
      },
    };
  });
  
  return NextResponse.json({
    totalUsers: allSubmissions.length,
    overall,
    city: cityStats,
    ageGroup: ageGroupStats,
    industry: industryStats,
    percentile,
    rank,
    topCities,
    topIndustries,
    ageGroupBreakdown,
  });
}
