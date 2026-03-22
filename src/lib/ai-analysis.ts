/**
 * AI Financial Analysis Module
 * All comparison data comes from dynamic DB queries - no hardcoded values
 */

import { UserInputs, FinancialMetrics, CookedResult } from '@/types/calculator';
import { getAllPeerData } from './peer-queries';
import fs from 'fs';
import path from 'path';

// Load the system prompt
const getSystemPrompt = () => {
  try {
    return fs.readFileSync(
      path.join(process.cwd(), 'prompts', 'FINANCIAL_ADVISOR.md'),
      'utf-8'
    );
  } catch {
    return `You are a direct financial advisor. Analyze the user's data and compare to peer data from our database. Be specific with numbers. Output JSON.`;
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

/**
 * Main analysis function
 */
export async function getAIAnalysis(
  inputs: UserInputs,
  result: CookedResult
): Promise<AIAnalysisResult> {
  
  // Query DB for peer comparisons based on user's actual city/age/industry
  const peerData = await getAllPeerData(
    inputs.city,
    inputs.age,
    inputs.industry,
    result.score
  );
  
  // Build the input for AI
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
    peers: {
      // City peers - queried from DB where city = user's city
      city: peerData.city.count > 0 ? {
        city: peerData.city.city,
        count: peerData.city.count,
        avgScore: peerData.city.avgScore,
        avgIncome: peerData.city.avgIncome,
        avgRent: peerData.city.avgRent,
        avgNetWorth: peerData.city.avgNetWorth,
        avgRentBurden: peerData.city.avgRentBurden,
      } : null,
      
      // Age peers - queried from DB where age between user's age ±3
      ageGroup: peerData.ageGroup.count > 0 ? {
        range: peerData.ageGroup.ageRange,
        count: peerData.ageGroup.count,
        avgScore: peerData.ageGroup.avgScore,
        avgIncome: peerData.ageGroup.avgIncome,
        avgNetWorth: peerData.ageGroup.avgNetWorth,
        avgRentBurden: peerData.ageGroup.avgRentBurden,
      } : null,
      
      // Industry peers - queried from DB where industry matches
      industry: peerData.industry.count > 0 ? {
        industry: peerData.industry.industry,
        count: peerData.industry.count,
        avgScore: peerData.industry.avgScore,
        avgIncome: peerData.industry.avgIncome,
        avgNetWorth: peerData.industry.avgNetWorth,
      } : null,
      
      // Overall - all users in DB
      overall: peerData.overall.count > 0 ? {
        count: peerData.overall.count,
        avgScore: peerData.overall.avgScore,
        avgIncome: peerData.overall.avgIncome,
        avgNetWorth: peerData.overall.avgNetWorth,
      } : null,
      
      // User's ranking
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
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: getSystemPrompt() },
        { 
          role: 'user', 
          content: `Analyze this user's finances and compare to their peers from our database.

USER DATA:
${JSON.stringify(analysisInput.user, null, 2)}

PEER DATA FROM DATABASE:
${JSON.stringify(analysisInput.peers, null, 2)}

Note: Peer data is from real users who took this assessment. If a peer category is null, we don't have enough data for that comparison.

Return JSON with: summary, peerComparison, rootCauses, actionPlan, encouragement.`
        }
      ],
      temperature: 0.7,
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
