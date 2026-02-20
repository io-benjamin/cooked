export const INDUSTRIES = [
  'Tech / Software',
  'Finance / Banking',
  'Healthcare / Medical',
  'Education',
  'Retail / Service',
  'Government',
  'Legal',
  'Marketing / Media',
  'Construction / Trades',
  'Food / Hospitality',
  'Real Estate',
  'Manufacturing',
  'Transportation / Logistics',
  'Freelance / Gig Work',
  'Consulting',
  'Non-Profit',
  'Student',
  'Unemployed / Between Jobs',
  'Other',
];

export const INDUSTRY_OPTIONS = INDUSTRIES.map(industry => ({
  value: industry,
  label: industry,
}));

export const EXPERIENCE_LEVELS = [
  { value: 'entry', label: 'Entry Level (0-2 years)' },
  { value: 'mid', label: 'Mid Level (3-7 years)' },
  { value: 'senior', label: 'Senior (8+ years)' },
  { value: 'manager', label: 'Manager / Director' },
  { value: 'executive', label: 'Executive / C-Suite' },
];

export const LIVING_ARRANGEMENTS = [
  { value: 'alone', label: 'Living alone' },
  { value: 'roommates', label: 'With roommates' },
  { value: 'partner', label: 'With partner/spouse' },
  { value: 'family', label: 'With family' },
];
