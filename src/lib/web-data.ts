/**
 * Fetch real-world data from web when our DB lacks data
 * Uses web search to find actual statistics
 */

const BRAVE_API_KEY = process.env.BRAVE_API_KEY;

interface WebDataResult {
  source: string;
  data: Record<string, unknown>;
}

/**
 * Search for real city statistics when we don't have enough user data
 */
export async function searchCityData(city: string): Promise<WebDataResult | null> {
  if (!BRAVE_API_KEY) {
    console.warn('BRAVE_API_KEY not set, skipping web search');
    return null;
  }

  try {
    const query = `${city} median household income rent cost of living 2024`;
    const response = await fetch(
      `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5`,
      {
        headers: {
          'Accept': 'application/json',
          'X-Subscription-Token': BRAVE_API_KEY,
        },
      }
    );

    if (!response.ok) return null;

    const results = await response.json();
    const snippets = results.web?.results?.map((r: { title: string; description: string; url: string }) => 
      `${r.title}: ${r.description}`
    ).join('\n') || '';

    return {
      source: 'web search',
      data: {
        query,
        snippets,
        note: 'Real-time data from web search. Extract specific numbers from snippets.',
      },
    };
  } catch (error) {
    console.error('Web search failed:', error);
    return null;
  }
}

/**
 * Search for industry salary data when we don't have enough user data
 */
export async function searchIndustryData(industry: string): Promise<WebDataResult | null> {
  if (!BRAVE_API_KEY) return null;

  try {
    const query = `${industry} median salary average income 2024 BLS`;
    const response = await fetch(
      `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5`,
      {
        headers: {
          'Accept': 'application/json',
          'X-Subscription-Token': BRAVE_API_KEY,
        },
      }
    );

    if (!response.ok) return null;

    const results = await response.json();
    const snippets = results.web?.results?.map((r: { title: string; description: string }) => 
      `${r.title}: ${r.description}`
    ).join('\n') || '';

    return {
      source: 'web search (BLS/industry data)',
      data: {
        query,
        snippets,
        note: 'Real-time industry salary data. Extract specific numbers from snippets.',
      },
    };
  } catch (error) {
    console.error('Web search failed:', error);
    return null;
  }
}

/**
 * Search for age group financial benchmarks
 */
export async function searchAgeGroupData(age: number): Promise<WebDataResult | null> {
  if (!BRAVE_API_KEY) return null;

  try {
    const ageGroup = age < 25 ? 'under 25' : 
                     age < 35 ? '25-34' :
                     age < 45 ? '35-44' :
                     age < 55 ? '45-54' : '55-64';
    
    const query = `average net worth savings ${ageGroup} year olds 2024 Federal Reserve`;
    const response = await fetch(
      `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5`,
      {
        headers: {
          'Accept': 'application/json',
          'X-Subscription-Token': BRAVE_API_KEY,
        },
      }
    );

    if (!response.ok) return null;

    const results = await response.json();
    const snippets = results.web?.results?.map((r: { title: string; description: string }) => 
      `${r.title}: ${r.description}`
    ).join('\n') || '';

    return {
      source: 'web search (Federal Reserve/financial data)',
      data: {
        ageGroup,
        query,
        snippets,
        note: 'Real-time age group financial data. Extract specific numbers from snippets.',
      },
    };
  } catch (error) {
    console.error('Web search failed:', error);
    return null;
  }
}
