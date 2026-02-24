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
      avatar_url: body.avatarUrl || null,
      email: body.email || null,
      is_public: body.isPublic ?? true,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}
