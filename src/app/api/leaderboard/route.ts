import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);
  
  const filter = searchParams.get('filter') || 'all';
  const value = searchParams.get('value') || '';
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : null;

  let query = supabase
    .from('submissions')
    .select('*')
    .eq('is_public', true)
    .order('score', { ascending: false });

  // Only apply limit if specified
  if (limit) {
    query = query.limit(limit);
  }

  // Apply filters
  if (filter === 'city' && value) {
    query = query.eq('city', value);
  } else if (filter === 'industry' && value) {
    query = query.eq('industry', value);
  } else if (filter === 'age' && value) {
    const [min, max] = value.split('-').map(n => parseInt(n) || 100);
    query = query.gte('age', min).lte('age', max);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data || []);
}
