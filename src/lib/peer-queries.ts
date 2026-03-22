/**
 * Dynamic peer comparison queries
 * No hardcoded values - just queries based on user input
 */

import { createClient } from '@/lib/supabase/server';

interface PeerStats {
  count: number;
  avgScore: number | null;
  avgRentBurden: number | null;
  avgDti: number | null;
  avgSavingsRate: number | null;
  avgNetWorth: number | null;
  avgIncome: number | null;
  avgRent: number | null;
}

/**
 * Query peers by city
 */
export async function queryByCity(city: string): Promise<PeerStats & { city: string }> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('submissions')
    .select('score, rent_burden, dti, savings_rate, net_worth, annual_income, monthly_rent')
    .eq('city', city)
    .eq('is_public', true);
  
  if (error || !data || data.length === 0) {
    return { city, count: 0, avgScore: null, avgRentBurden: null, avgDti: null, avgSavingsRate: null, avgNetWorth: null, avgIncome: null, avgRent: null };
  }
  
  return {
    city,
    count: data.length,
    avgScore: avg(data.map(d => d.score)),
    avgRentBurden: avg(data.map(d => d.rent_burden)),
    avgDti: avg(data.map(d => d.dti)),
    avgSavingsRate: avg(data.map(d => d.savings_rate)),
    avgNetWorth: avg(data.map(d => d.net_worth)),
    avgIncome: avg(data.filter(d => d.annual_income).map(d => d.annual_income!)),
    avgRent: avg(data.filter(d => d.monthly_rent).map(d => d.monthly_rent!)),
  };
}

/**
 * Query peers by age range (±3 years)
 */
export async function queryByAgeRange(age: number): Promise<PeerStats & { ageRange: string }> {
  const supabase = createClient();
  const minAge = age - 3;
  const maxAge = age + 3;
  
  const { data, error } = await supabase
    .from('submissions')
    .select('score, rent_burden, dti, savings_rate, net_worth, annual_income, monthly_rent')
    .gte('age', minAge)
    .lte('age', maxAge)
    .eq('is_public', true);
  
  if (error || !data || data.length === 0) {
    return { ageRange: `${minAge}-${maxAge}`, count: 0, avgScore: null, avgRentBurden: null, avgDti: null, avgSavingsRate: null, avgNetWorth: null, avgIncome: null, avgRent: null };
  }
  
  return {
    ageRange: `${minAge}-${maxAge}`,
    count: data.length,
    avgScore: avg(data.map(d => d.score)),
    avgRentBurden: avg(data.map(d => d.rent_burden)),
    avgDti: avg(data.map(d => d.dti)),
    avgSavingsRate: avg(data.map(d => d.savings_rate)),
    avgNetWorth: avg(data.map(d => d.net_worth)),
    avgIncome: avg(data.filter(d => d.annual_income).map(d => d.annual_income!)),
    avgRent: avg(data.filter(d => d.monthly_rent).map(d => d.monthly_rent!)),
  };
}

/**
 * Query peers by industry (fuzzy match)
 */
export async function queryByIndustry(industry: string): Promise<PeerStats & { industry: string }> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('submissions')
    .select('score, rent_burden, dti, savings_rate, net_worth, annual_income, monthly_rent')
    .ilike('industry', `%${industry}%`)
    .eq('is_public', true);
  
  if (error || !data || data.length === 0) {
    return { industry, count: 0, avgScore: null, avgRentBurden: null, avgDti: null, avgSavingsRate: null, avgNetWorth: null, avgIncome: null, avgRent: null };
  }
  
  return {
    industry,
    count: data.length,
    avgScore: avg(data.map(d => d.score)),
    avgRentBurden: avg(data.map(d => d.rent_burden)),
    avgDti: avg(data.map(d => d.dti)),
    avgSavingsRate: avg(data.map(d => d.savings_rate)),
    avgNetWorth: avg(data.map(d => d.net_worth)),
    avgIncome: avg(data.filter(d => d.annual_income).map(d => d.annual_income!)),
    avgRent: avg(data.filter(d => d.monthly_rent).map(d => d.monthly_rent!)),
  };
}

/**
 * Query all users for overall stats
 */
export async function queryOverall(): Promise<PeerStats> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('submissions')
    .select('score, rent_burden, dti, savings_rate, net_worth, annual_income, monthly_rent')
    .eq('is_public', true);
  
  if (error || !data || data.length === 0) {
    return { count: 0, avgScore: null, avgRentBurden: null, avgDti: null, avgSavingsRate: null, avgNetWorth: null, avgIncome: null, avgRent: null };
  }
  
  return {
    count: data.length,
    avgScore: avg(data.map(d => d.score)),
    avgRentBurden: avg(data.map(d => d.rent_burden)),
    avgDti: avg(data.map(d => d.dti)),
    avgSavingsRate: avg(data.map(d => d.savings_rate)),
    avgNetWorth: avg(data.map(d => d.net_worth)),
    avgIncome: avg(data.filter(d => d.annual_income).map(d => d.annual_income!)),
    avgRent: avg(data.filter(d => d.monthly_rent).map(d => d.monthly_rent!)),
  };
}

/**
 * Get user's percentile (lower score = less cooked = better)
 */
export async function queryPercentile(userScore: number): Promise<{ percentile: number; rank: number; total: number } | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('submissions')
    .select('score')
    .eq('is_public', true);
  
  if (error || !data || data.length === 0) return null;
  
  const betterThan = data.filter(d => d.score > userScore).length;
  const rank = data.filter(d => d.score <= userScore).length;
  
  return {
    percentile: Math.round((betterThan / data.length) * 100),
    rank,
    total: data.length,
  };
}

/**
 * Run all peer queries for a user
 */
export async function getAllPeerData(city: string, age: number, industry: string, score: number) {
  const [cityData, ageData, industryData, overallData, percentileData] = await Promise.all([
    queryByCity(city),
    queryByAgeRange(age),
    queryByIndustry(industry),
    queryOverall(),
    queryPercentile(score),
  ]);
  
  return {
    city: cityData,
    ageGroup: ageData,
    industry: industryData,
    overall: overallData,
    percentile: percentileData,
  };
}

// Helper
function avg(arr: number[]): number | null {
  if (arr.length === 0) return null;
  return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
}
