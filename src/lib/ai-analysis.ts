/**
 * AI Financial Analysis Module
 * 
 * Data sources (in order of preference):
 * 1. Our user submissions database
 * 2. Real-time web search for actual statistics (fallback)
 */

import { UserInputs, FinancialMetrics, CookedResult } from '@/types/calculator';
import { getAllPeerData } from './peer-queries';
import { searchCityData, searchIndustryData, searchAgeGroupData } from './web-data';
import fs from 'fs';
import path from 'path';

const MIN_USERS_FOR_COMPARISON = 5; // Minimum users needed before we trust our data

const getSystemPrompt = () => {
  try {
    return fs.readFileSync(
      path.join(process.cwd(), 'prompts', 'FINANCIAL_ADVISOR.md'),
      'utf-8'
    );
  } catch {
    return `You are a financial advisor. Compare user data to peer data and web data. Be specific with numbers. Output JSON.`;
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
  
  // 1. Query our database first
  const peerData = await getAllPeerData(
    inputs.city,
    inputs.age,
    inputs.industry,
    result.score
  );
  
  // 2. For any category with insufficient data, search the web
  const webData: Record<string, unknown> = {};
  
  // City data fallback
  if (peerData.city.count < MIN_USERS_FOR_COMPARISON) {
    const cityWebData = await searchCityData(inputs.city);
    if (cityWebData) {
      webData.city = cityWebData;
    }
  }
  
  // Industry data fallback
  if (peerData.industry.count < MIN_USERS_FOR_COMPARISON) {
    const industryWebData = await searchIndustryData(inputs.industry);
    if (industryWebData) {
      webData.industry = industryWebData;
    }
  }
  
  // Age group data fallback
  if (peerData.ageGroup.count < MIN_USERS_FOR_COMPARISON) {
    const ageWebData = await searchAgeGroupData(inputs.age);
    if (ageWebData) {
      webData.ageGroup = ageWebData;
    }
  }
  
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
    
    // Data from our user submissions
    ourData: {
      city: peerData.city.count >= MIN_USERS_FOR_COMPARISON ? {
        source: 'our users',
        city: peerData.city.city,
        count: peerData.city.count,
        avgScore: peerData.city.avgScore,
        avgIncome: peerData.city.avgIncome,
        avgRent: peerData.city.avgRent,
        avgNetWorth: peerData.city.avgNetWorth,
        avgRentBurden: peerData.city.avgRentBurden,
      } : null,
      
      ageGroup: peerData.ageGroup.count >= MIN_USERS_FOR_COMPARISON ? {
        source: 'our users',
        range: peerData.ageGroup.ageRange,
        count: peerData.ageGroup.count,
        avgScore: peerData.ageGroup.avgScore,
        avgIncome: peerData.ageGroup.avgIncome,
        avgNetWorth: peerData.ageGroup.avgNetWorth,
      } : null,
      
      industry: peerData.industry.count >= MIN_USERS_FOR_COMPARISON ? {
        source: 'our users',
        industry: peerData.industry.industry,
        count: peerData.industry.count,
        avgScore: peerData.industry.avgScore,
        avgIncome: peerData.industry.avgIncome,
        avgNetWorth: peerData.industry.avgNetWorth,
      } : null,
      
      overall: peerData.overall.count > 0 ? {
        source: 'our users',
        count: peerData.overall.count,
        avgScore: peerData.overall.avgScore,
        avgIncome: peerData.overall.avgIncome,
        avgNetWorth: peerData.overall.avgNetWorth,
      } : null,
      
      percentile: peerData.percentile,
    },
    
    // Fallback data from web search (when our data is insufficient)
    webData: Object.keys(webData).length > 0 ? webData : null,
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
          content: `Analyze this user's finances.

USER DATA:
${JSON.stringify(analysisInput.user, null, 2)}

DATA FROM OUR USERS (real submissions):
${JSON.stringify(analysisInput.ourData, null, 2)}

${analysisInput.webData ? `FALLBACK WEB DATA (for categories where we lack user data):
${JSON.stringify(analysisInput.webData, null, 2)}

When using web data, extract specific numbers from the snippets and cite the source.` : 'We have sufficient user data for all comparisons.'}

Return JSON with: summary, peerComparison, rootCauses, actionPlan, encouragement.
For peerComparison, prefer our user data. Use web data only when our data is null.`
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
