import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const MIN_FOR_CITY_COMPARISON = 5;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');
  const industry = searchParams.get('industry');
  const age = searchParams.get('age');
  
  const supabase = createClient();
  
  // Get overall stats
  const { data: allSubmissions } = await supabase
    .from('submissions')
    .select('score, dti, rent_burden, savings_rate, net_worth, city, industry, age');
  
  if (!allSubmissions || allSubmissions.length === 0) {
    return NextResponse.json({
      overall: null,
      city: null,
      industry: null,
      ageGroup: null,
      totalUsers: 0,
    });
  }

  // Calculate overall averages
  const overall = calculateAverages(allSubmissions);
  
  // Calculate city averages (if enough data)
  let cityStats = null;
  if (city) {
    const citySubmissions = allSubmissions.filter(s => s.city === city);
    if (citySubmissions.length >= MIN_FOR_CITY_COMPARISON) {
      cityStats = {
        ...calculateAverages(citySubmissions),
        count: citySubmissions.length,
      };
    }
  }
  
  // Calculate industry averages (if enough data)
  let industryStats = null;
  if (industry) {
    const industrySubmissions = allSubmissions.filter(s => s.industry === industry);
    if (industrySubmissions.length >= MIN_FOR_CITY_COMPARISON) {
      industryStats = {
        ...calculateAverages(industrySubmissions),
        count: industrySubmissions.length,
      };
    }
  }
  
  // Calculate age group averages (±3 years, if enough data)
  let ageGroupStats = null;
  if (age) {
    const ageNum = parseInt(age);
    const ageSubmissions = allSubmissions.filter(s => 
      s.age >= ageNum - 3 && s.age <= ageNum + 3
    );
    if (ageSubmissions.length >= MIN_FOR_CITY_COMPARISON) {
      ageGroupStats = {
        ...calculateAverages(ageSubmissions),
        count: ageSubmissions.length,
        range: `${ageNum - 3}-${ageNum + 3}`,
      };
    }
  }

  return NextResponse.json({
    overall: {
      ...overall,
      count: allSubmissions.length,
    },
    city: cityStats,
    industry: industryStats,
    ageGroup: ageGroupStats,
    totalUsers: allSubmissions.length,
    minForComparison: MIN_FOR_CITY_COMPARISON,
  });
}

function calculateAverages(submissions: Array<{
  score: number;
  dti: number;
  rent_burden: number;
  savings_rate: number;
  net_worth: number;
}>) {
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
