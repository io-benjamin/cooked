import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const MIN_FOR_COMPARISON = 10;

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
  const ageMinParam = searchParams.get('ageMin');
  const ageMaxParam = searchParams.get('ageMax');
  const userScore = searchParams.get('score');
  
  const supabase = createClient();
  
  // Get total count of all submissions (including non-public)
  const { count: totalSubmissionsCount } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true });
  
  // Get all public submissions for calculations — batch to bypass the 1000-row Supabase default
  const allSubmissions: Submission[] = [];
  {
    const BATCH = 1000;
    let offset = 0;
    while (true) {
      const { data, error } = await supabase
        .from('submissions')
        .select('score, dti, rent_burden, savings_rate, net_worth, city, industry, age')
        .eq('is_public', true)
        .range(offset, offset + BATCH - 1);
      if (error || !data || data.length === 0) break;
      allSubmissions.push(...data);
      if (data.length < BATCH) break;
      offset += BATCH;
    }
  }
  
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

  // Determine if any filter is active (for dynamic MIN threshold)
  const hasActiveFilter = !!(city || industry || age || ageMinParam || ageMaxParam);
  const minThreshold = hasActiveFilter ? 5 : MIN_FOR_COMPARISON;

  // Build baseSubmissions from age/industry filters for topCities/topIndustries
  let baseSubmissions = allSubmissions;
  if (ageMinParam || ageMaxParam) {
    const min = ageMinParam ? parseInt(ageMinParam) : 0;
    const max = ageMaxParam ? parseInt(ageMaxParam) : 120;
    baseSubmissions = allSubmissions.filter(s => s.age >= min && s.age <= max);
  } else if (age) {
    const ageNum = parseInt(age);
    baseSubmissions = allSubmissions.filter(s => 
      s.age >= ageNum - 3 && s.age <= ageNum + 3
    );
  }

  // Get unique cities and industries from filtered set (if filter active)
  // But calculate their stats from ALL submissions
  const allCityGroups = groupBy(allSubmissions, 'city');
  const allIndustryGroups = groupBy(allSubmissions, 'industry');

  let topCities, topIndustries, bestCities;

  if (hasActiveFilter) {
    // When filter is active, show cities/industries from the filtered set, ranked by overall averages
    const filteredCities = new Set(baseSubmissions.map(s => s.city));
    const filteredIndustries = new Set(baseSubmissions.map(s => s.industry));

    topCities = Array.from(filteredCities)
      .map(cityName => {
        const citySubmissions = allCityGroups[cityName] || [];
        return {
          name: cityName,
          avgScore: citySubmissions.length > 0 ? Math.round(citySubmissions.reduce((sum, s) => sum + s.score, 0) / citySubmissions.length) : 0,
          count: citySubmissions.length,
        };
      })
      .filter(({count}) => count >= minThreshold)
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 5);

    topIndustries = Array.from(filteredIndustries)
      .map(industryName => {
        const industrySubmissions = allIndustryGroups[industryName] || [];
        return {
          name: industryName,
          avgScore: industrySubmissions.length > 0 ? Math.round(industrySubmissions.reduce((sum, s) => sum + s.score, 0) / industrySubmissions.length) : 0,
          count: industrySubmissions.length,
        };
      })
      .filter(({count}) => count >= minThreshold)
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 5);

    bestCities = Array.from(filteredCities)
      .map(cityName => {
        const citySubmissions = allCityGroups[cityName] || [];
        return {
          name: cityName,
          avgScore: citySubmissions.length > 0 ? Math.round(citySubmissions.reduce((sum, s) => sum + s.score, 0) / citySubmissions.length) : 0,
          count: citySubmissions.length,
        };
      })
      .filter(({count}) => count >= minThreshold)
      .sort((a, b) => a.avgScore - b.avgScore)
      .slice(0, 5);
  } else {
    // When no filter, use original logic: top from all submissions
    topCities = Object.entries(allCityGroups)
      .filter(([, subs]) => subs.length >= minThreshold)
      .map(([name, subs]) => ({
        name,
        avgScore: Math.round(subs.reduce((sum, s) => sum + s.score, 0) / subs.length),
        count: subs.length,
      }))
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 5);

    topIndustries = Object.entries(allIndustryGroups)
      .filter(([, subs]) => subs.length >= minThreshold)
      .map(([name, subs]) => ({
        name,
        avgScore: Math.round(subs.reduce((sum, s) => sum + s.score, 0) / subs.length),
        count: subs.length,
      }))
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 5);

    bestCities = Object.entries(allCityGroups)
      .filter(([, subs]) => subs.length >= minThreshold)
      .map(([name, subs]) => ({
        name,
        avgScore: Math.round(subs.reduce((sum, s) => sum + s.score, 0) / subs.length),
        count: subs.length,
      }))
      .sort((a, b) => a.avgScore - b.avgScore)
      .slice(0, 5);
  }

  // Calculate score distribution for histogram (from filtered set)
  const distribution = {
    raw: baseSubmissions.filter(s => s.score <= 20).length,
    lightSizzle: baseSubmissions.filter(s => s.score > 20 && s.score <= 40).length,
    simmering: baseSubmissions.filter(s => s.score > 40 && s.score <= 60).length,
    sauteed: baseSubmissions.filter(s => s.score > 60 && s.score <= 75).length,
    wellDone: baseSubmissions.filter(s => s.score > 75 && s.score <= 90).length,
    charred: baseSubmissions.filter(s => s.score > 90).length,
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
    totalSubmissions: totalSubmissionsCount || 0,
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
