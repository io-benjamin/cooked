import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Get submission stats
export async function GET() {
  const supabase = createClient();
  
  // Get today's count
  const today = new Date().toISOString().split('T')[0];
  const { count: todayCount } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', `${today}T00:00:00`)
    .lt('created_at', `${today}T23:59:59`);

  // Get total count
  const { count: totalCount } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true });

  return NextResponse.json({
    today: todayCount || 0,
    total: totalCount || 0,
  });
}

// Submit a new result
export async function POST(request: Request) {
  const supabase = createClient();
  const body = await request.json();
  
  // Get current user (optional)
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('submissions')
    .insert({
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
      is_public: body.isPublic ?? true,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}
