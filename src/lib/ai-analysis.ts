/**
 * AI Financial Analysis Module
 * Uses Groq API (fast, cheap, OpenAI-compatible)
 * All comparison data comes from our actual user submissions
 */

import { UserInputs, FinancialMetrics, CookedResult } from '@/types/calculator';
import { COST_OF_LIVING_INDEX } from '@/data/cities';
import fs from 'fs';
import path from 'path';

// Load the system prompt from markdown file
const getSystemPrompt = () => {
  try {
    return fs.readFileSync(
      path.join(process.cwd(), 'prompts', 'FINANCIAL_ADVISOR.md'),
      'utf-8'
    );
  } catch {
    // Fallback for edge runtime or if file not found
    return `You are a direct, no-BS financial advisor. Analyze the user's financial data and provide structured JSON output. Be brutally honest but helpful. Use their actual numbers and compare to peer data. This is for entertainment purposes only.`;
  }
};

// Aggregated stats from our database
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
    raw: number;
    lightSizzle: number;
    simmering: number;
    sauteed: number;
    wellDone: number;
    charred: number;
  };
}

interface CityStats extends AggregatedStats {
  name: string;
}

interface AgeGroupStats extends AggregatedStats {
  range: string;
}

interface IndustryStats extends AggregatedStats {
  name: string;
}

interface TopCity {
  name: string;
  count: number;
  avgScore: number;
  avgIncome: number | null;
  avgRent: number | null;
}

interface TopIndustry {
  name: string;
  count: number;
  avgScore: number;
  avgIncome: number | null;
}

interface AgeGroupBreakdown {
  label: string;
  min: number;
  max: number;
  count: number;
  stats: {
    avgScore: number;
    avgNetWorth: number;
    avgIncome: number | null;
  } | null;
}

// All peer data from our submissions database
interface PeerData {
  totalUsers: number;
  overall: AggregatedStats | null;
  city: CityStats | null;
  ageGroup: AgeGroupStats | null;
  industry: IndustryStats | null;
  percentile: number | null;
  rank: number | null;
  topCities: TopCity[];
  topIndustries: TopIndustry[];
  ageGroupBreakdown: AgeGroupBreakdown[];
}

interface AnalysisInput {
  demographics: {
    age: number;
    city: string;
    industry: string;
  };
  cityContext: {
    costOfLivingIndex: number;
    isHighCOL: boolean;
    isLowCOL: boolean;
  };
  peerData: PeerData;
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
    vsCity: {
      summary: string;
      details: string[];
    };
    vsAgeGroup: {
      summary: string;
      details: string[];
    };
    vsIndustry: {
      summary: string;
      details: string[];
    };
    vsOverall: {
      percentile: number;
      rank: number;
      totalUsers: number;
      summary: string;
    };
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
 * Fetch aggregated peer data from our submissions database
 */
async function fetchPeerData(
  city: string,
  industry: string,
  age: number,
  score: number,
  baseUrl?: string
): Promise<PeerData> {
  try {
    const url = new URL('/api/aggregations', baseUrl || 'http://localhost:3000');
    url.searchParams.set('city', city);
    url.searchParams.set('industry', industry);
    url.searchParams.set('age', String(age));
    url.searchParams.set('score', String(score));
    
    const res = await fetch(url.toString());
    if (!res.ok) {
      console.error('Failed to fetch peer data:', res.status);
      return getEmptyPeerData();
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error fetching peer data:', error);
    return getEmptyPeerData();
  }
}

function getEmptyPeerData(): PeerData {
  return {
    totalUsers: 0,
    overall: null,
    city: null,
    ageGroup: null,
    industry: null,
    percentile: null,
    rank: null,
    topCities: [],
    topIndustries: [],
    ageGroupBreakdown: [],
  };
}

/**
 * Prepare user inputs for AI analysis
 */
async function prepareAnalysisInput(
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

  // Get city cost of living context
  const colIndex = COST_OF_LIVING_INDEX[inputs.city] || 100;

  // Fetch real peer data from our database
  const peerData = await fetchPeerData(inputs.city, inputs.industry, inputs.age, score, baseUrl);

  return {
    demographics: {
      age: inputs.age,
      city: inputs.city,
      industry: inputs.industry,
    },
    cityContext: {
      costOfLivingIndex: colIndex,
      isHighCOL: colIndex >= 130,
      isLowCOL: colIndex <= 85,
    },
    peerData,
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

IMPORTANT: All peer comparison data in "peerData" comes from REAL users who have taken this assessment. Use these actual numbers, not generic statistics.

Respond ONLY with valid JSON matching the structure in your instructions. No markdown code blocks, just raw JSON.`;

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
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Groq API error:', errorData);
    throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  if (!content) {
    throw new Error('No content in Groq response');
  }

  try {
    let jsonStr = content.trim();
    if (jsonStr.startsWith('```json')) jsonStr = jsonStr.slice(7);
    if (jsonStr.startsWith('```')) jsonStr = jsonStr.slice(3);
    if (jsonStr.endsWith('```')) jsonStr = jsonStr.slice(0, -3);
    
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
  
  return analyzeWithGroq(analysisInput, 'llama-3.1-8b-instant');
}
