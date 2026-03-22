/**
 * AI Financial Analysis Module
 * Uses Groq API (fast, cheap, OpenAI-compatible)
 * 
 * Get your free API key at: https://console.groq.com
 */

import { UserInputs, FinancialMetrics, CookedResult } from '@/types/calculator';
import { COST_OF_LIVING_INDEX } from '@/data/cities';
import fs from 'fs';
import path from 'path';

// City-specific data for richer analysis
const CITY_CONTEXT: Record<string, { 
  avgRent1BR: number; 
  avgSalary: number; 
  tips: string[];
  rentTrend: 'rising' | 'stable' | 'falling';
}> = {
  'New York, NY': { 
    avgRent1BR: 3500, 
    avgSalary: 85000, 
    rentTrend: 'rising',
    tips: ['Consider outer boroughs like Astoria or Washington Heights', 'Roommates are the norm here, not the exception', 'Your income needs to be 40x monthly rent for most landlords']
  },
  'San Francisco, CA': { 
    avgRent1BR: 3200, 
    avgSalary: 95000, 
    rentTrend: 'stable',
    tips: ['Oakland and East Bay offer 30-40% rent savings', 'Tech salaries here should be 20-30% higher than national average', 'Look into rent-controlled units']
  },
  'Los Angeles, CA': { 
    avgRent1BR: 2500, 
    avgSalary: 65000, 
    rentTrend: 'rising',
    tips: ['Living near work saves huge on gas/time', 'The Valley is cheaper than Westside', 'Car costs add $500-800/month here']
  },
  'Austin, TX': { 
    avgRent1BR: 1800, 
    avgSalary: 70000, 
    rentTrend: 'rising',
    tips: ['No state income tax = 5-10% effective raise', 'North Austin/Round Rock cheaper than downtown', 'Tech salaries competitive but COL rising fast']
  },
  'Miami, FL': { 
    avgRent1BR: 2200, 
    avgSalary: 55000, 
    rentTrend: 'rising',
    tips: ['No state income tax', 'Rent has spiked 30%+ since 2020', 'Consider Hialeah or Kendall for savings']
  },
  'Denver, CO': { 
    avgRent1BR: 1900, 
    avgSalary: 65000, 
    rentTrend: 'stable',
    tips: ['Aurora and Lakewood offer better value', 'Rent burden common issue here', 'Tech and healthcare pay well']
  },
  'Seattle, WA': { 
    avgRent1BR: 2200, 
    avgSalary: 85000, 
    rentTrend: 'stable',
    tips: ['No state income tax', 'South Seattle and Renton more affordable', 'Tech dominates - negotiate hard']
  },
  'Chicago, IL': { 
    avgRent1BR: 1800, 
    avgSalary: 60000, 
    rentTrend: 'stable',
    tips: ['Neighborhood choice matters hugely for rent', 'South and West sides much cheaper', 'Good transit means you can skip a car']
  },
  'Dallas, TX': { 
    avgRent1BR: 1500, 
    avgSalary: 60000, 
    rentTrend: 'rising',
    tips: ['No state income tax', 'Suburbs like Plano/Irving have good value', 'You need a car here']
  },
  'Atlanta, GA': { 
    avgRent1BR: 1700, 
    avgSalary: 58000, 
    rentTrend: 'rising',
    tips: ['OTP (Outside the Perimeter) is significantly cheaper', 'Traffic is brutal - live near work', 'Tech scene growing fast']
  },
  'Phoenix, AZ': { 
    avgRent1BR: 1400, 
    avgSalary: 55000, 
    rentTrend: 'rising',
    tips: ['Summer utilities can add $200-300/month', 'Tempe and Mesa offer good alternatives', 'One of the faster growing metros']
  },
  'Nashville, TN': { 
    avgRent1BR: 1700, 
    avgSalary: 55000, 
    rentTrend: 'rising',
    tips: ['No state income tax', 'East Nashville and suburbs growing', 'Healthcare is a major employer']
  },
};

// Load the system prompt from markdown file
const getSystemPrompt = () => {
  try {
    return fs.readFileSync(
      path.join(process.cwd(), 'prompts', 'FINANCIAL_ADVISOR.md'),
      'utf-8'
    );
  } catch {
    // Fallback for edge runtime or if file not found
    return `You are a direct, no-BS financial advisor. Analyze the user's financial data and provide structured JSON output with: summary, rootCauses, detectedHabits, peerComparison, actionPlan, targets, and encouragement. Be brutally honest but helpful. Use their actual numbers - specific dollar amounts and percentages. This is for entertainment purposes only, not real financial advice.`;
  }
};

// Peer comparison data from our actual user submissions
interface PeerData {
  city: {
    avgScore: number;
    avgRentBurden: number;
    avgDti: number;
    avgSavingsRate: number;
    avgNetWorth: number;
    count: number;
  } | null;
  ageGroup: {
    avgScore: number;
    avgRentBurden: number;
    avgDti: number;
    avgSavingsRate: number;
    avgNetWorth: number;
    count: number;
    range: string;
  } | null;
  industry: {
    avgScore: number;
    avgRentBurden: number;
    avgDti: number;
    avgSavingsRate: number;
    avgNetWorth: number;
    count: number;
  } | null;
  overall: {
    avgScore: number;
    avgRentBurden: number;
    avgDti: number;
    avgSavingsRate: number;
    avgNetWorth: number;
    count: number;
  } | null;
  percentile: number | null;
  totalUsers: number;
}

interface AnalysisInput {
  demographics: {
    age: number;
    city: string;
    industry: string;
  };
  cityContext: {
    costOfLivingIndex: number;
    avgRent1BR: number | null;
    avgSalary: number | null;
    rentTrend: string | null;
    localTips: string[];
    isHighCOL: boolean;
    isLowCOL: boolean;
  };
  peerComparison: PeerData;
  income: {
    annual: number;
    monthly: number;
    side: number;
    partner: number;
    total: number;
  };
  housing: {
    monthlyRent: number;
    livingArrangement: string;
  };
  debt: {
    studentLoans: number;
    creditCard: number;
    carLoan: number;
    other: number;
    total: number;
  };
  savings: {
    emergency: number;
    retirement: number;
    investments: number;
    crypto: number;
    brokerage: number;
    total: number;
  };
  creditScore?: number;
  calculatedMetrics: FinancialMetrics & {
    score: number;
    tier: string;
    emergencyMonths: number;
  };
}

export interface AIAnalysisResult {
  summary: {
    oneLiner: string;
    cookLevel: string;
    biggestProblem: string;
  };
  rootCauses: Array<{
    issue: string;
    explanation: string;
    impact: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
  }>;
  detectedHabits: Array<{
    habit: string;
    evidence: string;
    consequence: string;
  }>;
  peerComparison: {
    vsAgeGroup: {
      rentBurden: string;
      savings: string;
      debt: string;
      summary: string;
    };
    vsCity: { summary: string };
    vsIndustry: { summary: string };
  };
  actionPlan: {
    immediate: {
      title: string;
      action: string;
      impact: string;
    };
    thirtyDays: Array<{
      priority: number;
      action: string;
      target: string;
      why: string;
    }>;
    ninetyDays: Array<{
      milestone: string;
      metrics: string;
    }>;
  };
  targets: {
    rentBurden: { current: number; target: number; action: string };
    emergencyFund: { current: number; target: number; monthlyContribution: string };
    debtPayoff: { current: number; priority: string; monthlyPayment: string };
  };
  encouragement: {
    doingRight: string[];
    quickWins: string[];
    motivation: string;
  };
}

/**
 * Fetch real peer comparison data from our submissions database
 */
export async function fetchPeerData(
  city: string,
  industry: string,
  age: number,
  score: number,
  baseUrl?: string
): Promise<PeerData> {
  try {
    const url = new URL('/api/stats', baseUrl || 'http://localhost:3000');
    url.searchParams.set('city', city);
    url.searchParams.set('industry', industry);
    url.searchParams.set('age', String(age));
    url.searchParams.set('score', String(score));
    
    const res = await fetch(url.toString());
    if (!res.ok) {
      console.error('Failed to fetch peer data:', res.status);
      return { city: null, ageGroup: null, industry: null, overall: null, percentile: null, totalUsers: 0 };
    }
    
    const data = await res.json();
    
    return {
      city: data.city ? {
        avgScore: data.city.avgScore,
        avgRentBurden: data.city.avgRentBurden,
        avgDti: data.city.avgDti,
        avgSavingsRate: data.city.avgSavingsRate,
        avgNetWorth: data.city.avgNetWorth,
        count: data.city.count,
      } : null,
      ageGroup: data.ageGroup ? {
        avgScore: data.ageGroup.avgScore,
        avgRentBurden: data.ageGroup.avgRentBurden,
        avgDti: data.ageGroup.avgDti,
        avgSavingsRate: data.ageGroup.avgSavingsRate,
        avgNetWorth: data.ageGroup.avgNetWorth,
        count: data.ageGroup.count,
        range: data.ageGroup.range,
      } : null,
      industry: data.industry ? {
        avgScore: data.industry.avgScore,
        avgRentBurden: data.industry.avgRentBurden,
        avgDti: data.industry.avgDti,
        avgSavingsRate: data.industry.avgSavingsRate,
        avgNetWorth: data.industry.avgNetWorth,
        count: data.industry.count,
      } : null,
      overall: data.overall ? {
        avgScore: data.overall.avgScore,
        avgRentBurden: data.overall.avgRentBurden,
        avgDti: data.overall.avgDti,
        avgSavingsRate: data.overall.avgSavingsRate,
        avgNetWorth: data.overall.avgNetWorth,
        count: data.overall.count,
      } : null,
      percentile: data.percentile,
      totalUsers: data.totalUsers || 0,
    };
  } catch (error) {
    console.error('Error fetching peer data:', error);
    return { city: null, ageGroup: null, industry: null, overall: null, percentile: null, totalUsers: 0 };
  }
}

/**
 * Prepare user inputs for AI analysis
 */
export async function prepareAnalysisInput(
  inputs: UserInputs,
  metrics: FinancialMetrics,
  score: number,
  tier: string,
  baseUrl?: string
): Promise<AnalysisInput> {
  const totalIncome = inputs.annualIncome + (inputs.partnerIncome || 0) + (inputs.sideIncome || 0);
  const monthlyIncome = totalIncome / 12;
  const totalDebt = inputs.studentLoans + inputs.creditCardDebt + inputs.carLoan + (inputs.otherDebt || 0);
  const totalSavings = inputs.totalSavings + inputs.retirementSavings + (inputs.investments || 0) + (inputs.crypto || 0) + (inputs.brokerage || 0);
  
  // Estimate monthly expenses for emergency fund calculation
  const estimatedMonthlyExpenses = inputs.monthlyRent + (monthlyIncome * 0.3);
  const emergencyMonths = inputs.totalSavings / estimatedMonthlyExpenses;

  // Get city-specific context
  const colIndex = COST_OF_LIVING_INDEX[inputs.city] || 100;
  const cityData = CITY_CONTEXT[inputs.city];

  // Fetch real peer comparison data from our database
  const peerData = await fetchPeerData(inputs.city, inputs.industry, inputs.age, score, baseUrl);

  return {
    demographics: {
      age: inputs.age,
      city: inputs.city,
      industry: inputs.industry,
    },
    cityContext: {
      costOfLivingIndex: colIndex,
      avgRent1BR: cityData?.avgRent1BR || null,
      avgSalary: cityData?.avgSalary || null,
      rentTrend: cityData?.rentTrend || null,
      localTips: cityData?.tips || [],
      isHighCOL: colIndex >= 130,
      isLowCOL: colIndex <= 85,
    },
    peerComparison: peerData,
    income: {
      annual: inputs.annualIncome,
      monthly: Math.round(monthlyIncome),
      side: inputs.sideIncome || 0,
      partner: inputs.partnerIncome || 0,
      total: totalIncome,
    },
    housing: {
      monthlyRent: inputs.monthlyRent,
      livingArrangement: inputs.livingArrangement,
    },
    debt: {
      studentLoans: inputs.studentLoans,
      creditCard: inputs.creditCardDebt,
      carLoan: inputs.carLoan,
      other: inputs.otherDebt || 0,
      total: totalDebt,
    },
    savings: {
      emergency: inputs.totalSavings,
      retirement: inputs.retirementSavings,
      investments: inputs.investments || 0,
      crypto: inputs.crypto || 0,
      brokerage: inputs.brokerage || 0,
      total: totalSavings,
    },
    creditScore: inputs.creditScore,
    calculatedMetrics: {
      ...metrics,
      score,
      tier,
      emergencyMonths: Math.round(emergencyMonths * 10) / 10,
    },
  };
}

/**
 * Call Groq API for analysis
 * Uses llama-3.1-8b-instant (fast) or llama-3.3-70b-versatile (better quality)
 */
export async function analyzeWithGroq(
  input: AnalysisInput,
  model: string = 'llama-3.1-8b-instant'
): Promise<AIAnalysisResult> {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not set. Get your free key at https://console.groq.com');
  }

  const systemPrompt = getSystemPrompt();
  
  const userPrompt = `Analyze this person's financial situation and provide your analysis in the exact JSON format specified in your instructions.

INPUT DATA:
${JSON.stringify(input, null, 2)}

Respond ONLY with valid JSON matching the structure in your instructions. No markdown code blocks, no explanation, just the raw JSON object starting with { and ending with }.`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 4096,
      response_format: { type: 'json_object' }, // Force JSON output
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Groq API error:', errorData);
    throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  // Extract the content from the response
  const content = data.choices?.[0]?.message?.content;
  
  if (!content) {
    throw new Error('No content in Groq response');
  }

  // Parse the JSON response
  try {
    // Clean up response - sometimes models wrap in markdown despite instructions
    let jsonStr = content.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.slice(7);
    }
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.slice(3);
    }
    if (jsonStr.endsWith('```')) {
      jsonStr = jsonStr.slice(0, -3);
    }
    
    return JSON.parse(jsonStr.trim());
  } catch (e) {
    console.error('Failed to parse AI response:', content);
    throw new Error('Failed to parse AI analysis response');
  }
}

/**
 * Main analysis function
 */
export async function getAIAnalysis(
  inputs: UserInputs,
  result: CookedResult,
  baseUrl?: string
): Promise<AIAnalysisResult> {
  const analysisInput = await prepareAnalysisInput(
    inputs,
    result.metrics,
    result.score,
    result.tier,
    baseUrl
  );
  
  // Use Groq with llama-3.1-8b-instant (fast & cheap)
  // Alternative: 'llama-3.3-70b-versatile' for better quality
  return analyzeWithGroq(analysisInput, 'llama-3.1-8b-instant');
}
