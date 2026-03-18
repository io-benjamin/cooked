/**
 * AI Financial Analysis Module
 * Uses local Ollama model with FINANCIAL_ADVISOR.md instructions
 */

import { UserInputs, FinancialMetrics, CookedResult } from '@/types/calculator';
import fs from 'fs';
import path from 'path';

// Load the system prompt from markdown file
const SYSTEM_PROMPT = fs.readFileSync(
  path.join(process.cwd(), 'prompts', 'FINANCIAL_ADVISOR.md'),
  'utf-8'
);

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
 * Call local Ollama model for analysis
 */
export async function analyzeWithLocalModel(
  input: AnalysisInput,
  model: string = 'llama3.1:8b'
): Promise<AIAnalysisResult> {
  const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
  
  const userPrompt = `Analyze this person's financial situation and provide your analysis in the exact JSON format specified in your instructions.

INPUT DATA:
${JSON.stringify(input, null, 2)}

Respond ONLY with valid JSON matching the structure in your instructions. No markdown, no explanation, just the JSON object.`;

  const response = await fetch(`${ollamaUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt: userPrompt,
      system: SYSTEM_PROMPT,
      stream: false,
      options: {
        temperature: 0.7,
        num_predict: 4096,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.statusText}`);
  }

  const data = await response.json();
  
  // Parse the JSON response
  try {
    // Clean up response - sometimes models wrap in markdown
    let jsonStr = data.response.trim();
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
    console.error('Failed to parse AI response:', data.response);
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
  
  return analyzeWithLocalModel(analysisInput);
}
