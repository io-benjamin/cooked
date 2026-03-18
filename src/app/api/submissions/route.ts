import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Get submission stats
export async function GET() {
  const supabase = createClient();
  
  // Get today's count in Eastern time
  const now = new Date();
  const easternDateStr = new Intl.DateTimeFormat('en-CA', { 
    timeZone: 'America/New_York', 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  }).format(now);
  
  // Create start and end of day in Eastern time
  const [year, month, day] = easternDateStr.split('-').map(Number);
  const startOfDayEastern = new Date(year, month - 1, day, 0, 0, 0, 0);
  const endOfDayEastern = new Date(year, month - 1, day, 23, 59, 59, 999);
  
  // Convert to UTC ISO strings for database query
  const startUTC = startOfDayEastern.toISOString();
  const endUTC = endOfDayEastern.toISOString();
  
  const { count: todayCount } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startUTC)
    .lt('created_at', endUTC);

  // Get total count
  const { count: totalCount } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true });

  return NextResponse.json({
    today: todayCount || 0,
    total: totalCount || 0,
  });
}

// Submit a new result with ALL input fields
export async function POST(request: Request) {
  const supabase = createClient();
  const body = await request.json();

  // Get current user (optional)
  const { data: { user } } = await supabase.auth.getUser();

  // Calculate totals
  const totalDebt = (body.studentLoans || 0) + 
                    (body.creditCardDebt || 0) + 
                    (body.carLoan || 0) + 
                    (body.otherDebt || 0);
  
  const totalSavings = (body.totalSavings || 0) + 
                       (body.retirementSavings || 0) + 
                       (body.investments || 0);

  // Full payload with all fields
  const fullPayload = {
    // User
    user_id: user?.id || null,
    
    // Demographics
    age: body.age,
    city: body.city,
    industry: body.industry,
    experience_level: body.experienceLevel || null,
    job_title: body.jobTitle || null,
    
    // Income
    annual_income: body.annualIncome || null,
    side_income: body.sideIncome || null,
    partner_income: body.partnerIncome || null,
    marital_status: body.maritalStatus || null,
    household_size: body.householdSize || null,
    
    // Housing
    monthly_rent: body.monthlyRent || null,
    living_arrangement: body.livingArrangement || null,
    home_value: body.homeValue || null,
    mortgage_balance: body.mortgageBalance || null,
    
    // Debt (individual + total)
    student_loans: body.studentLoans || 0,
    credit_card_debt: body.creditCardDebt || 0,
    car_loan: body.carLoan || 0,
    other_debt: body.otherDebt || 0,
    total_debt: totalDebt,
    
    // Savings (individual + total)
    emergency_savings: body.totalSavings || 0, // emergency/liquid savings
    retirement_savings: body.retirementSavings || 0,
    investments: body.investments || 0,
    total_savings: totalSavings,
    
    // Credit
    credit_score: body.creditScore || null,
    
    // Calculated metrics
    score: body.score,
    tier: body.tier,
    dti: body.dti,
    rent_burden: body.rentBurden,
    savings_rate: body.savingsRate,
    net_worth: body.netWorth,
    
    // Meta
    avatar_url: body.avatarUrl || null,
    email: body.email || null,
    is_public: body.isPublic ?? true,
  };

  // Try inserting with all fields
  let { data, error } = await supabase
    .from('submissions')
    .insert(fullPayload)
    .select()
    .single();

  // If new columns don't exist yet, fall back to base schema
  if (error?.code === '42703') {
    const basePayload = {
      user_id: user?.id || null,
      age: body.age,
      city: body.city,
      industry: body.industry,
      score: body.score,
      tier: body.tier,
      dti: body.dti,
      rent_burden: body.rentBurden,
      savings_rate: body.savingsRate,
      net_worth: body.netWorth,
      avatar_url: body.avatarUrl || null,
      email: body.email || null,
      is_public: body.isPublic ?? true,
    };
    
    ({ data, error } = await supabase
      .from('submissions')
      .insert(basePayload)
      .select()
      .single());
  }

  if (error) {
    console.error('Submission error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}

// Update email on an existing submission
export async function PATCH(request: Request) {
  const supabase = createClient();
  const body = await request.json();
  const { id, email, aiAnalysis } = body;

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  // Build update payload
  const updatePayload: Record<string, unknown> = {};
  
  if (email) {
    updatePayload.email = email;
  }
  
  // Allow saving AI analysis results
  if (aiAnalysis) {
    updatePayload.ai_analysis = aiAnalysis;
    updatePayload.analyzed_at = new Date().toISOString();
  }

  if (Object.keys(updatePayload).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  const { error } = await supabase
    .from('submissions')
    .update(updatePayload)
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
