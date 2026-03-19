/**
 * AI Financial Analysis Module
 * Uses Groq API (fast, cheap, OpenAI-compatible)
 * 
 * Get your free API key at: https://console.groq.com
 */

import { UserInputs, FinancialMetrics, CookedResult } from '@/types/calculator';
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
    return `You are a direct, no-BS financial advisor. Analyze the user's financial data and provide structured JSON output with: summary, rootCauses, detectedHabits, peerComparison, actionPlan, targets, and encouragement. Be brutally honest but helpful. Use their actual numbers - specific dollar amounts and percentages. This is for entertainment purposes only, not real financial advice.`;
  }
};

interface AnalysisInput {
  demographics: {
    age: number;
    city: string;
    industry: string;
  };
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
 * Prepare user inputs for AI analysis
 */
export function prepareAnalysisInput(
  inputs: UserInputs,
  metrics: FinancialMetrics,
  score: number,
  tier: string
): AnalysisInput {
  const totalIncome = inputs.annualIncome + (inputs.partnerIncome || 0) + (inputs.sideIncome || 0);
  const monthlyIncome = totalIncome / 12;
  const totalDebt = inputs.studentLoans + inputs.creditCardDebt + inputs.carLoan + (inputs.otherDebt || 0);
  const totalSavings = inputs.totalSavings + inputs.retirementSavings + (inputs.investments || 0) + (inputs.crypto || 0) + (inputs.brokerage || 0);
  
  // Estimate monthly expenses for emergency fund calculation
  const estimatedMonthlyExpenses = inputs.monthlyRent + (monthlyIncome * 0.3);
  const emergencyMonths = inputs.totalSavings / estimatedMonthlyExpenses;

  return {
    demographics: {
      age: inputs.age,
      city: inputs.city,
      industry: inputs.industry,
    },
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
  result: CookedResult
): Promise<AIAnalysisResult> {
  const analysisInput = prepareAnalysisInput(
    inputs,
    result.metrics,
    result.score,
    result.tier
  );
  
  // Use Groq with llama-3.1-8b-instant (fast & cheap)
  // Alternative: 'llama-3.3-70b-versatile' for better quality
  return analyzeWithGroq(analysisInput, 'llama-3.1-8b-instant');
}
