import { createClient } from '@/lib/supabase/server';

// Cache COL data in memory (refreshes per request in serverless, but avoids multiple DB calls per request)
let colCache: Record<string, number> | null = null;
let cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Fallback values if Supabase fails
const FALLBACK_COL: Record<string, number> = {
  'New York, NY': 175,
  'San Francisco, CA': 170,
  'Los Angeles, CA': 145,
  'Other': 95,
};

export async function getCityColIndex(city: string): Promise<number> {
  const colData = await getAllColData();
  return colData[city] ?? 100; // Default to 100 (US average) if city not found
}

export async function getAllColData(): Promise<Record<string, number>> {
  const now = Date.now();
  
  // Return cached data if still valid
  if (colCache && (now - cacheTime) < CACHE_TTL) {
    return colCache;
  }
  
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('city_col')
      .select('city, col_index');
    
    if (error) {
      console.error('Error fetching COL data:', error);
      return FALLBACK_COL;
    }
    
    if (!data || data.length === 0) {
      return FALLBACK_COL;
    }
    
    // Convert to Record
    const colMap: Record<string, number> = {};
    for (const row of data) {
      colMap[row.city] = row.col_index;
    }
    
    // Update cache
    colCache = colMap;
    cacheTime = now;
    
    return colMap;
  } catch (err) {
    console.error('Error fetching COL data:', err);
    return FALLBACK_COL;
  }
}
