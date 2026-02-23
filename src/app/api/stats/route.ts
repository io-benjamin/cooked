import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const MIN_FOR_COMPARISON = 5;

interface Submission {
  score: number;
  dti: number;
  rent_burden: number;
  savings_rate: number;
  net_worth: number;
  city: string;
  industry: string;
  age: number;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');
  const industry = searchParams.get('industry');
  const age = searchParams.get('age');
  const userScore = searchParams.get('score');
  
  const supabase = createClient();
  
  // Get all submissions
  const { data: allSubmissions } = await supabase
    .from('submissions')
    .select('score, dti, rent_burden, savings_rate, net_worth, city, industry, age');
  
  if (!allSubmissions || allSubmissions.length === 0) {
    return NextResponse.json({
      overall: null,
      city: null,
      industry: null,
      ageGroup: null,
      percentile: null,
      totalUsers: 0,
      topCities: [],
      topIndustries: [],
    });
  }

  // Calculate overall averages
  const overall = calculateAverages(allSubmissions);
  
  // Calculate user's percentile (lower score = better = higher percentile)
  let percentile = null;
  if (userScore) {
    const score = parseInt(userScore);
    const betterThanCount = allSubmissions.filter(s => s.score > score).length;
    percentile = Math.round((betterThanCount / allSubmissions.length) * 100);
  }
  
  // Calculate city stats (if enough data)
  let cityStats = null;
  if (city) {
    const citySubmissions = allSubmissions.filter(s => s.city === city);
    if (citySubmissions.length >= MIN_FOR_COMPARISON) {
      cityStats = {
        ...calculateAverages(citySubmissions),
        count: citySubmissions.length,
        name: city,
      };
    }
  }
  
  // Calculate industry stats (if enough data)
  let industryStats = null;
  if (industry) {
    const industrySubmissions = allSubmissions.filter(s => s.industry === industry);
    if (industrySubmissions.length >= MIN_FOR_COMPARISON) {
      industryStats = {
        ...calculateAverages(industrySubmissions),
        count: industrySubmissions.length,
        name: industry,
      };
    }
  }
  
  // Calculate age group stats (±3 years)
  let ageGroupStats = null;
  if (age) {
    const ageNum = parseInt(age);
    const ageSubmissions = allSubmissions.filter(s => 
      s.age >= ageNum - 3 && s.age <= ageNum + 3
    );
    if (ageSubmissions.length >= MIN_FOR_COMPARISON) {
      ageGroupStats = {
        ...calculateAverages(ageSubmissions),
        count: ageSubmissions.length,
        range: `${ageNum - 3}-${ageNum + 3}`,
      };
    }
  }

  // Calculate top cities by average score (most cooked)
  const cityGroups = groupBy(allSubmissions, 'city');
  const topCities = Object.entries(cityGroups)
    .filter(([, subs]) => subs.length >= MIN_FOR_COMPARISON)
    .map(([name, subs]) => ({
      name,
      avgScore: Math.round(subs.reduce((sum, s) => sum + s.score, 0) / subs.length),
      count: subs.length,
    }))
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 5);

  // Calculate top industries by average score (most cooked)
  const industryGroups = groupBy(allSubmissions, 'industry');
  const topIndustries = Object.entries(industryGroups)
    .filter(([, subs]) => subs.length >= MIN_FOR_COMPARISON)
    .map(([name, subs]) => ({
      name,
      avgScore: Math.round(subs.reduce((sum, s) => sum + s.score, 0) / subs.length),
      count: subs.length,
    }))
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 5);

  // Calculate least cooked (best) cities
  const bestCities = Object.entries(cityGroups)
    .filter(([, subs]) => subs.length >= MIN_FOR_COMPARISON)
    .map(([name, subs]) => ({
      name,
      avgScore: Math.round(subs.reduce((sum, s) => sum + s.score, 0) / subs.length),
      count: subs.length,
    }))
    .sort((a, b) => a.avgScore - b.avgScore)
    .slice(0, 5);

  // Calculate score distribution for histogram
  const distribution = {
    raw: allSubmissions.filter(s => s.score <= 20).length,
    lightSizzle: allSubmissions.filter(s => s.score > 20 && s.score <= 40).length,
    simmering: allSubmissions.filter(s => s.score > 40 && s.score <= 60).length,
    sauteed: allSubmissions.filter(s => s.score > 60 && s.score <= 75).length,
    wellDone: allSubmissions.filter(s => s.score > 75 && s.score <= 90).length,
    charred: allSubmissions.filter(s => s.score > 90).length,
  };

  return NextResponse.json({
    overall: {
      ...overall,
      count: allSubmissions.length,
    },
    city: cityStats,
    industry: industryStats,
    ageGroup: ageGroupStats,
    percentile,
    totalUsers: allSubmissions.length,
    topCities,
    bestCities,
    topIndustries,
    distribution,
    minForComparison: MIN_FOR_COMPARISON,
  });
}

function calculateAverages(submissions: Submission[]) {
  const count = submissions.length;
  if (count === 0) return null;
  
  return {
    avgScore: Math.round(submissions.reduce((sum, s) => sum + s.score, 0) / count),
    avgDti: Math.round(submissions.reduce((sum, s) => sum + s.dti, 0) / count),
    avgRentBurden: Math.round(submissions.reduce((sum, s) => sum + s.rent_burden, 0) / count),
    avgSavingsRate: Math.round(submissions.reduce((sum, s) => sum + s.savings_rate, 0) / count),
    avgNetWorth: Math.round(submissions.reduce((sum, s) => sum + s.net_worth, 0) / count),
  };
}

function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    const k = String(item[key]);
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}
