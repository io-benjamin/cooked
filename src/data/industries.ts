export const INDUSTRIES = [
  // Service & Retail
  'Retail / Customer Service',
  'Food Service / Restaurant',
  'Hospitality / Hotel',
  
  // Healthcare
  'Healthcare / Nursing',
  'Medical / Dental',
  'Pharmacy',
  'Home Health / Caregiving',
  
  // Trades & Labor
  'Construction / Carpentry',
  'Electrician / Plumbing',
  'HVAC / Mechanical',
  'Automotive / Mechanic',
  'Manufacturing / Factory',
  'Warehouse / Logistics',
  'Landscaping / Groundskeeping',
  'Cleaning / Janitorial',
  
  // Transportation
  'Trucking / Delivery',
  'Rideshare / Taxi',
  'Public Transit',
  
  // Office & Admin
  'Administrative / Office',
  'Accounting / Bookkeeping',
  'Human Resources',
  'Customer Support / Call Center',
  
  // Professional
  'Tech / Software',
  'Finance / Banking',
  'Legal',
  'Real Estate',
  'Insurance',
  'Consulting',
  'Marketing / Advertising',
  
  // Education
  'Teaching / Education',
  'Childcare / Daycare',
  
  // Government & Public
  'Government / Public Sector',
  'Military / Veteran',
  'Law Enforcement / Security',
  'Firefighter / EMT',
  'Postal Service',
  
  // Creative & Media
  'Media / Entertainment',
  'Arts / Design',
  'Freelance / Gig Work',
  'Content Creator',
  
  // Agriculture & Outdoors
  'Agriculture / Farming',
  'Fishing / Forestry',
  
  // Other
  'Non-Profit',
  'Self-Employed / Small Business',
  'Student',
  'Stay-at-Home Parent',
  'Retired',
  'Unemployed / Looking for Work',
  'Disability / Unable to Work',
  'Other',
];

export const INDUSTRY_OPTIONS = INDUSTRIES.map(industry => ({
  value: industry,
  label: industry,
}));

export const EXPERIENCE_LEVELS = [
  { value: 'entry', label: 'Just starting out (0-2 years)' },
  { value: 'mid', label: 'Got some experience (3-7 years)' },
  { value: 'senior', label: 'Been at it a while (8+ years)' },
  { value: 'manager', label: 'Leading a team / Supervisor' },
  { value: 'executive', label: 'Running the show / Owner' },
];

export const LIVING_ARRANGEMENTS = [
  { value: 'alone', label: 'Living alone' },
  { value: 'roommates', label: 'With roommates' },
  { value: 'partner', label: 'With partner / spouse' },
  { value: 'family', label: 'With family / parents' },
  { value: 'kids', label: 'With kids' },
];
