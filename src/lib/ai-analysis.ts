/**
 * AI Financial Analysis Module
 * 
 * Data sources:
 * 1. Our user submissions database (primary)
 * 2. AI's training knowledge (fallback for missing data)
 */

import { UserInputs, FinancialMetrics, CookedResult } from '@/types/calculator';
import { getAllPeerData } from './peer-queries';
import fs from 'fs';
import path from 'path';

const MIN_USERS_FOR_COMPARISON = 5;

const getSystemPrompt = () => {
  try {
    return fs.readFileSync(
      path.join(process.cwd(), 'prompts', 'FINANCIAL_ADVISOR.md'),
      'utf-8'
    );
  } catch {
    return `You are a financial advisor. Compare user data to peer data. When peer data is missing, use your knowledge of real statistics (Census, BLS, etc). Be specific with numbers. Output JSON.`;
  }
};

export interface AIAnalysisResult {
  summary: {
    oneLiner: string;
    biggestProblem: string;
  };
  peerComparison: {
    vsCity: string;
    vsAgeGroup: string;
    vsIndustry: string;
    vsOverall: string;
  };
  rootCauses: Array<{
    issue: string;
    explanation: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
  }>;
  actionPlan: {
    immediate: string;
    thirtyDays: string[];
    ninetyDays: string[];
  };
  encouragement: string[];
}

export async function getAIAnalysis(
  inputs: UserInputs,
  result: CookedResult
): Promise<AIAnalysisResult> {
  
  // Query our database for peer comparisons
  const peerData = await getAllPeerData(
    inputs.city,
    inputs.age,
    inputs.industry,
    result.score
  );
  
  // Build input for AI
  const analysisInput = {
    user: {
      age: inputs.age,
      city: inputs.city,
      industry: inputs.industry,
      income: inputs.annualIncome,
      rent: inputs.monthlyRent,
      score: result.score,
      tier: result.tier,
      rentBurden: result.metrics.rentBurden,
      dti: result.metrics.dti,
      savingsRate: result.metrics.savingsRate,
      netWorth: result.metrics.netWorth,
      debt: {
        studentLoans: inputs.studentLoans,
        creditCard: inputs.creditCardDebt,
        carLoan: inputs.carLoan,
        total: inputs.studentLoans + inputs.creditCardDebt + inputs.carLoan + (inputs.otherDebt || 0),
      },
      savings: {
        emergency: inputs.totalSavings,
        retirement: inputs.retirementSavings,
        total: inputs.totalSavings + inputs.retirementSavings + (inputs.investments || 0),
      },
    },
    
    // Data from our submissions (null if insufficient)
    // Prefer medianNetWorth and medianIncome over averages (less skewed by outliers)
    ourData: {
      city: peerData.city.count >= MIN_USERS_FOR_COMPARISON ? {
        source: 'our users',
        count: peerData.city.count,
        avgScore: peerData.city.avgScore,
        medianIncome: peerData.city.medianIncome,
        avgRent: peerData.city.avgRent,
        medianNetWorth: peerData.city.medianNetWorth,
      } : null,
      
      ageGroup: peerData.ageGroup.count >= MIN_USERS_FOR_COMPARISON ? {
        source: 'our users',
        range: peerData.ageGroup.ageRange,
        count: peerData.ageGroup.count,
        avgScore: peerData.ageGroup.avgScore,
        medianIncome: peerData.ageGroup.medianIncome,
        medianNetWorth: peerData.ageGroup.medianNetWorth,
      } : null,
      
      industry: peerData.industry.count >= MIN_USERS_FOR_COMPARISON ? {
        source: 'our users',
        count: peerData.industry.count,
        avgScore: peerData.industry.avgScore,
        medianIncome: peerData.industry.medianIncome,
        medianNetWorth: peerData.industry.medianNetWorth,
      } : null,
      
      overall: peerData.overall.count > 0 ? {
        source: 'our users',
        count: peerData.overall.count,
        avgScore: peerData.overall.avgScore,
      } : null,
      
      percentile: peerData.percentile,
    },
  };

  // Call Groq
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY not set');
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: getSystemPrompt() },
        { 
          role: 'user', 
          content: `Analyze this user's finances.

USER DATA:
${JSON.stringify(analysisInput.user, null, 2)}

PEER DATA FROM OUR DATABASE:
${JSON.stringify(analysisInput.ourData, null, 2)}

INSTRUCTIONS:
- When ourData has values: use those real numbers and cite "Based on X users..."
- When ourData is null: use your knowledge of real statistics (Census, BLS, cost of living data) for their city/industry/age group. Cite the source (e.g., "According to Census data..." or "BLS reports...")
- Always be specific with dollar amounts and percentages
- Compare their actual numbers to benchmarks

Return JSON with: summary, peerComparison, rootCauses, actionPlan, encouragement.`
        }
      ],
      temperature: 0,
      max_tokens: 2048,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  if (!content) {
    throw new Error('No response from AI');
  }

  return JSON.parse(content.trim());
}
