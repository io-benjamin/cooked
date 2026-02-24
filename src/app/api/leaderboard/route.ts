import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const BATCH_SIZE = 1000;

export async function GET() {
  const supabase = createClient();

  // Supabase/PostgREST defaults to a max of 1000 rows per request.
  // Fetch in batches of 1000 until all records are retrieved.
  const allData: Record<string, unknown>[] = [];
  let offset = 0;

  while (true) {
    const { data, error } = await supabase
      .from('submissions')
      .select('id, created_at, age, city, industry, score, tier, dti, rent_burden, savings_rate, net_worth, avatar_url')
      .eq('is_public', true)
      .order('score', { ascending: false })
      .range(offset, offset + BATCH_SIZE - 1);

    if (error || !data || data.length === 0) break;

    allData.push(...data);

    // If we got fewer than BATCH_SIZE, we've reached the end
    if (data.length < BATCH_SIZE) break;

    offset += BATCH_SIZE;
  }

  return NextResponse.json(allData);
}
