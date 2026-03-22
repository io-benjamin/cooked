/**
 * Real market data for AI analysis
 * Sources: BLS, HUD Fair Market Rents, Census ACS, industry reports
 * Last updated: March 2026
 */

// National benchmarks
export const NATIONAL_BENCHMARKS = {
  medianHouseholdIncome: 77540, // Census 2024
  medianRent1BR: 1450,
  medianRent2BR: 1750,
  avgSavingsRate: 4.6, // BEA personal savings rate
  avgDebtToIncome: 36,
  avg401kBalance: {
    under25: 7100,
    '25-34': 37500,
    '35-44': 91300,
    '45-54': 168700,
    '55-64': 244700,
  },
  avgNetWorthByAge: {
    under25: 9000,
    '25-34': 39000,
    '35-44': 135000,
    '45-54': 247000,
    '55-64': 364000,
  },
  rentBurdenedThreshold: 30, // HUD definition
  severelyRentBurdenedThreshold: 50,
};

// Real city data - median incomes, rents, etc.
export const CITY_MARKET_DATA: Record<string, {
  medianIncome: number;
  medianRent1BR: number;
  medianRent2BR: number;
  medianHomePrice: number;
  unemploymentRate: number;
  rentBurdenedPercent: number; // % of renters paying >30%
  topEmployers: string[];
  growingIndustries: string[];
  source: string;
}> = {
  'New York, NY': {
    medianIncome: 74694,
    medianRent1BR: 3500,
    medianRent2BR: 4200,
    medianHomePrice: 785000,
    unemploymentRate: 5.1,
    rentBurdenedPercent: 52,
    topEmployers: ['NYC Health + Hospitals', 'JPMorgan Chase', 'Citi', 'NYC DOE'],
    growingIndustries: ['Tech', 'Healthcare', 'Finance', 'Media'],
    source: 'Census ACS 2024, StreetEasy, BLS',
  },
  'San Francisco, CA': {
    medianIncome: 136689,
    medianRent1BR: 3100,
    medianRent2BR: 4200,
    medianHomePrice: 1250000,
    unemploymentRate: 4.2,
    rentBurdenedPercent: 38,
    topEmployers: ['Salesforce', 'UCSF', 'Wells Fargo', 'Google'],
    growingIndustries: ['AI/ML', 'Biotech', 'Fintech', 'Climate Tech'],
    source: 'Census ACS 2024, Zillow, BLS',
  },
  'Los Angeles, CA': {
    medianIncome: 69778,
    medianRent1BR: 2200,
    medianRent2BR: 2900,
    medianHomePrice: 950000,
    unemploymentRate: 5.4,
    rentBurdenedPercent: 54,
    topEmployers: ['Kaiser Permanente', 'UCLA', 'Cedars-Sinai', 'Disney'],
    growingIndustries: ['Entertainment', 'Tech', 'Healthcare', 'Aerospace'],
    source: 'Census ACS 2024, Zillow, BLS',
  },
  'Austin, TX': {
    medianIncome: 83875,
    medianRent1BR: 1650,
    medianRent2BR: 2100,
    medianHomePrice: 550000,
    unemploymentRate: 3.4,
    rentBurdenedPercent: 42,
    topEmployers: ['Dell', 'Apple', 'Tesla', 'UT Austin', 'Samsung'],
    growingIndustries: ['Tech', 'Semiconductors', 'Clean Energy', 'Healthcare'],
    source: 'Census ACS 2024, Zillow, BLS',
  },
  'Seattle, WA': {
    medianIncome: 110781,
    medianRent1BR: 2100,
    medianRent2BR: 2700,
    medianHomePrice: 850000,
    unemploymentRate: 3.8,
    rentBurdenedPercent: 40,
    topEmployers: ['Amazon', 'Microsoft', 'Boeing', 'UW Medicine'],
    growingIndustries: ['Cloud/AI', 'Aerospace', 'Healthcare', 'Gaming'],
    source: 'Census ACS 2024, Zillow, BLS',
  },
  'Denver, CO': {
    medianIncome: 85853,
    medianRent1BR: 1750,
    medianRent2BR: 2200,
    medianHomePrice: 580000,
    unemploymentRate: 3.5,
    rentBurdenedPercent: 44,
    topEmployers: ['UCHealth', 'Lockheed Martin', 'DaVita', 'Comcast'],
    growingIndustries: ['Aerospace', 'Tech', 'Cannabis', 'Outdoor Recreation'],
    source: 'Census ACS 2024, Zillow, BLS',
  },
  'Miami, FL': {
    medianIncome: 51347,
    medianRent1BR: 2400,
    medianRent2BR: 3100,
    medianHomePrice: 600000,
    unemploymentRate: 3.2,
    rentBurdenedPercent: 58,
    topEmployers: ['Baptist Health', 'U of Miami', 'Royal Caribbean', 'Carnival'],
    growingIndustries: ['Finance', 'Tech', 'Tourism', 'Real Estate'],
    source: 'Census ACS 2024, Zillow, BLS',
  },
  'Chicago, IL': {
    medianIncome: 65781,
    medianRent1BR: 1700,
    medianRent2BR: 2100,
    medianHomePrice: 350000,
    unemploymentRate: 4.8,
    rentBurdenedPercent: 46,
    topEmployers: ['Advocate Aurora', 'Northwestern Medicine', 'United', 'Walgreens'],
    growingIndustries: ['Healthcare', 'Finance', 'Manufacturing', 'Tech'],
    source: 'Census ACS 2024, Zillow, BLS',
  },
  'Dallas, TX': {
    medianIncome: 61999,
    medianRent1BR: 1450,
    medianRent2BR: 1850,
    medianHomePrice: 400000,
    unemploymentRate: 3.8,
    rentBurdenedPercent: 44,
    topEmployers: ['AT&T', 'Texas Health Resources', 'Southwest Airlines', 'CBRE'],
    growingIndustries: ['Tech', 'Finance', 'Healthcare', 'Logistics'],
    source: 'Census ACS 2024, Zillow, BLS',
  },
  'Atlanta, GA': {
    medianIncome: 69164,
    medianRent1BR: 1650,
    medianRent2BR: 2000,
    medianHomePrice: 420000,
    unemploymentRate: 3.9,
    rentBurdenedPercent: 48,
    topEmployers: ['Delta', 'Home Depot', 'UPS', 'Coca-Cola', 'Emory'],
    growingIndustries: ['Film/TV', 'Tech', 'Logistics', 'Healthcare'],
    source: 'Census ACS 2024, Zillow, BLS',
  },
  'Phoenix, AZ': {
    medianIncome: 65691,
    medianRent1BR: 1400,
    medianRent2BR: 1700,
    medianHomePrice: 450000,
    unemploymentRate: 3.6,
    rentBurdenedPercent: 46,
    topEmployers: ['Banner Health', 'Walmart', 'Intel', 'Honeywell'],
    growingIndustries: ['Semiconductors', 'Healthcare', 'Finance', 'Tech'],
    source: 'Census ACS 2024, Zillow, BLS',
  },
  'Nashville, TN': {
    medianIncome: 65883,
    medianRent1BR: 1700,
    medianRent2BR: 2000,
    medianHomePrice: 470000,
    unemploymentRate: 3.1,
    rentBurdenedPercent: 44,
    topEmployers: ['HCA Healthcare', 'Vanderbilt', 'Nissan', 'Amazon'],
    growingIndustries: ['Healthcare', 'Music/Entertainment', 'Tech', 'Tourism'],
    source: 'Census ACS 2024, Zillow, BLS',
  },
  'Boston, MA': {
    medianIncome: 81744,
    medianRent1BR: 2800,
    medianRent2BR: 3400,
    medianHomePrice: 800000,
    unemploymentRate: 3.9,
    rentBurdenedPercent: 46,
    topEmployers: ['Mass General Brigham', 'Harvard', 'MIT', 'State Street'],
    growingIndustries: ['Biotech', 'Healthcare', 'Education', 'Tech'],
    source: 'Census ACS 2024, Zillow, BLS',
  },
  'Washington, DC': {
    medianIncome: 93547,
    medianRent1BR: 2300,
    medianRent2BR: 2900,
    medianHomePrice: 650000,
    unemploymentRate: 4.2,
    rentBurdenedPercent: 42,
    topEmployers: ['Federal Government', 'MedStar', 'Marriott', 'Lockheed'],
    growingIndustries: ['Government', 'Consulting', 'Tech', 'Nonprofit'],
    source: 'Census ACS 2024, Zillow, BLS',
  },
  'Richmond, VA': {
    medianIncome: 53284,
    medianRent1BR: 1350,
    medianRent2BR: 1600,
    medianHomePrice: 350000,
    unemploymentRate: 3.5,
    rentBurdenedPercent: 45,
    topEmployers: ['VCU Health', 'Capital One', 'Altria', 'CarMax'],
    growingIndustries: ['Finance', 'Healthcare', 'Manufacturing', 'Tech'],
    source: 'Census ACS 2024, Zillow, BLS',
  },
  'Charlotte, NC': {
    medianIncome: 69349,
    medianRent1BR: 1500,
    medianRent2BR: 1800,
    medianHomePrice: 420000,
    unemploymentRate: 3.6,
    rentBurdenedPercent: 43,
    topEmployers: ['Bank of America', 'Atrium Health', 'Wells Fargo', 'Duke Energy'],
    growingIndustries: ['Finance', 'Healthcare', 'Tech', 'Energy'],
    source: 'Census ACS 2024, Zillow, BLS',
  },
  'Raleigh, NC': {
    medianIncome: 78226,
    medianRent1BR: 1450,
    medianRent2BR: 1750,
    medianHomePrice: 450000,
    unemploymentRate: 3.2,
    rentBurdenedPercent: 40,
    topEmployers: ['WakeMed', 'NC State', 'Cisco', 'Red Hat/IBM'],
    growingIndustries: ['Tech', 'Biotech', 'Education', 'Healthcare'],
    source: 'Census ACS 2024, Zillow, BLS',
  },
};

// Industry salary benchmarks (national medians)
export const INDUSTRY_BENCHMARKS: Record<string, {
  medianSalary: number;
  entryLevelSalary: number;
  seniorSalary: number;
  avgRaise: number;
  unemploymentRate: number;
  growthOutlook: 'declining' | 'stable' | 'growing' | 'booming';
  hotSkills: string[];
  source: string;
}> = {
  'Tech / Software': {
    medianSalary: 124200,
    entryLevelSalary: 75000,
    seniorSalary: 185000,
    avgRaise: 4.5,
    unemploymentRate: 2.8,
    growthOutlook: 'booming',
    hotSkills: ['AI/ML', 'Cloud', 'Cybersecurity', 'Full-stack'],
    source: 'BLS, Levels.fyi, Glassdoor 2024',
  },
  'Healthcare / Medical': {
    medianSalary: 76310,
    entryLevelSalary: 45000,
    seniorSalary: 150000,
    avgRaise: 3.2,
    unemploymentRate: 1.9,
    growthOutlook: 'booming',
    hotSkills: ['Nursing', 'Telehealth', 'Mental Health', 'Data Analytics'],
    source: 'BLS OES 2024',
  },
  'Finance / Banking': {
    medianSalary: 95000,
    entryLevelSalary: 60000,
    seniorSalary: 180000,
    avgRaise: 4.0,
    unemploymentRate: 2.4,
    growthOutlook: 'stable',
    hotSkills: ['Risk Management', 'Fintech', 'Compliance', 'Quant'],
    source: 'BLS, Wall Street Oasis 2024',
  },
  'Marketing / Advertising': {
    medianSalary: 68350,
    entryLevelSalary: 45000,
    seniorSalary: 140000,
    avgRaise: 3.5,
    unemploymentRate: 3.8,
    growthOutlook: 'stable',
    hotSkills: ['Digital Marketing', 'Analytics', 'Content', 'SEO/SEM'],
    source: 'BLS OES 2024',
  },
  'Education / Teaching': {
    medianSalary: 61690,
    entryLevelSalary: 42000,
    seniorSalary: 85000,
    avgRaise: 2.1,
    unemploymentRate: 2.2,
    growthOutlook: 'stable',
    hotSkills: ['EdTech', 'Special Ed', 'STEM', 'ESL'],
    source: 'BLS OES 2024',
  },
  'Engineering': {
    medianSalary: 97970,
    entryLevelSalary: 70000,
    seniorSalary: 155000,
    avgRaise: 3.8,
    unemploymentRate: 2.5,
    growthOutlook: 'growing',
    hotSkills: ['Electrical', 'Mechanical', 'Civil', 'Aerospace'],
    source: 'BLS OES 2024',
  },
  'Legal': {
    medianSalary: 135740,
    entryLevelSalary: 75000,
    seniorSalary: 250000,
    avgRaise: 3.5,
    unemploymentRate: 1.8,
    growthOutlook: 'stable',
    hotSkills: ['Corporate', 'IP', 'Compliance', 'Tech Law'],
    source: 'BLS, NALP 2024',
  },
  'Retail / Customer Service': {
    medianSalary: 36220,
    entryLevelSalary: 28000,
    seniorSalary: 65000,
    avgRaise: 2.5,
    unemploymentRate: 4.5,
    growthOutlook: 'declining',
    hotSkills: ['E-commerce', 'Customer Experience', 'Management'],
    source: 'BLS OES 2024',
  },
  'Manufacturing / Production': {
    medianSalary: 46350,
    entryLevelSalary: 32000,
    seniorSalary: 75000,
    avgRaise: 2.8,
    unemploymentRate: 3.2,
    growthOutlook: 'stable',
    hotSkills: ['Automation', 'Quality Control', 'Supply Chain'],
    source: 'BLS OES 2024',
  },
  'Government / Public Sector': {
    medianSalary: 62560,
    entryLevelSalary: 45000,
    seniorSalary: 120000,
    avgRaise: 2.5,
    unemploymentRate: 1.5,
    growthOutlook: 'stable',
    hotSkills: ['Policy', 'Data Analysis', 'Cybersecurity', 'Program Management'],
    source: 'BLS, OPM 2024',
  },
  'Construction / Trades': {
    medianSalary: 51390,
    entryLevelSalary: 35000,
    seniorSalary: 90000,
    avgRaise: 3.5,
    unemploymentRate: 4.1,
    growthOutlook: 'growing',
    hotSkills: ['Electrical', 'HVAC', 'Plumbing', 'Project Management'],
    source: 'BLS OES 2024',
  },
  'Real Estate': {
    medianSalary: 56620,
    entryLevelSalary: 35000,
    seniorSalary: 150000,
    avgRaise: 3.0,
    unemploymentRate: 3.8,
    growthOutlook: 'stable',
    hotSkills: ['Commercial', 'Investment', 'Property Management'],
    source: 'BLS OES 2024',
  },
  'Hospitality / Food Service': {
    medianSalary: 32920,
    entryLevelSalary: 25000,
    seniorSalary: 65000,
    avgRaise: 2.5,
    unemploymentRate: 5.2,
    growthOutlook: 'stable',
    hotSkills: ['Management', 'Events', 'Culinary'],
    source: 'BLS OES 2024',
  },
  'Media / Entertainment': {
    medianSalary: 55670,
    entryLevelSalary: 38000,
    seniorSalary: 120000,
    avgRaise: 3.0,
    unemploymentRate: 4.2,
    growthOutlook: 'stable',
    hotSkills: ['Video', 'Streaming', 'Social Media', 'Gaming'],
    source: 'BLS OES 2024',
  },
  'Consulting': {
    medianSalary: 99000,
    entryLevelSalary: 70000,
    seniorSalary: 200000,
    avgRaise: 5.0,
    unemploymentRate: 2.1,
    growthOutlook: 'growing',
    hotSkills: ['Strategy', 'Digital Transformation', 'Data', 'Change Management'],
    source: 'Glassdoor, Management Consulted 2024',
  },
};

// Map common industry names to our benchmarks
export function normalizeIndustry(industry: string): string | null {
  const lower = industry.toLowerCase();
  
  if (lower.includes('tech') || lower.includes('software') || lower.includes('it ') || lower.includes('computer')) {
    return 'Tech / Software';
  }
  if (lower.includes('health') || lower.includes('medical') || lower.includes('nurs') || lower.includes('doctor')) {
    return 'Healthcare / Medical';
  }
  if (lower.includes('financ') || lower.includes('bank') || lower.includes('invest') || lower.includes('account')) {
    return 'Finance / Banking';
  }
  if (lower.includes('market') || lower.includes('advertis') || lower.includes('pr ') || lower.includes('communications')) {
    return 'Marketing / Advertising';
  }
  if (lower.includes('educ') || lower.includes('teach') || lower.includes('professor') || lower.includes('school')) {
    return 'Education / Teaching';
  }
  if (lower.includes('engineer') && !lower.includes('software')) {
    return 'Engineering';
  }
  if (lower.includes('legal') || lower.includes('law') || lower.includes('attorney')) {
    return 'Legal';
  }
  if (lower.includes('retail') || lower.includes('customer service') || lower.includes('sales')) {
    return 'Retail / Customer Service';
  }
  if (lower.includes('manufactur') || lower.includes('production') || lower.includes('factory')) {
    return 'Manufacturing / Production';
  }
  if (lower.includes('government') || lower.includes('public sector') || lower.includes('federal') || lower.includes('state')) {
    return 'Government / Public Sector';
  }
  if (lower.includes('construct') || lower.includes('trade') || lower.includes('plumb') || lower.includes('electric')) {
    return 'Construction / Trades';
  }
  if (lower.includes('real estate') || lower.includes('property')) {
    return 'Real Estate';
  }
  if (lower.includes('hospitality') || lower.includes('restaurant') || lower.includes('hotel') || lower.includes('food')) {
    return 'Hospitality / Food Service';
  }
  if (lower.includes('media') || lower.includes('entertainment') || lower.includes('film') || lower.includes('music')) {
    return 'Media / Entertainment';
  }
  if (lower.includes('consult')) {
    return 'Consulting';
  }
  
  return null;
}
