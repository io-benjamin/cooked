/**
 * AI Analysis API Route
 * POST /api/analyze
 */

import { NextRequest, NextResponse } from 'next/server';
import { calculateCookedScore } from '@/lib/scoring';
import { getAIAnalysis } from '@/lib/ai-analysis';
import { UserInputs } from '@/types/calculator';

export async function POST(request: NextRequest) {
  try {
    const inputs: UserInputs = await request.json();
    
    if (!inputs.age || !inputs.city || !inputs.annualIncome || !inputs.monthlyRent) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const result = calculateCookedScore(inputs);
    const analysis = await getAIAnalysis(inputs, result);
    
    return NextResponse.json({
      score: result.score,
      tier: result.tier,
      metrics: result.metrics,
      analysis,
    });
    
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json({ error: 'Failed to analyze' }, { status: 500 });
  }
}
