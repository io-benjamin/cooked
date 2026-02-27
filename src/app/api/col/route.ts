import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { COST_OF_LIVING_INDEX } from '@/data/cities';

export async function GET() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('city_col')
      .select('city, col_index');
    
    if (error || !data || data.length === 0) {
      // Fall back to hardcoded values if Supabase table doesn't exist yet
      return NextResponse.json(COST_OF_LIVING_INDEX);
    }
    
    // Convert to Record
    const colMap: Record<string, number> = {};
    for (const row of data) {
      colMap[row.city] = row.col_index;
    }
    
    return NextResponse.json(colMap);
  } catch {
    // Fall back to hardcoded values
    return NextResponse.json(COST_OF_LIVING_INDEX);
  }
}
