// Cost of living index (100 = US average)
export const COST_OF_LIVING_INDEX: Record<string, number> = {
  // Very High Cost
  'San Francisco, CA': 180,
  'New York, NY': 175,
  'San Jose, CA': 170,
  'Los Angeles, CA': 160,
  'Seattle, WA': 155,
  'Boston, MA': 150,
  'Washington, DC': 145,
  'San Diego, CA': 145,
  'Miami, FL': 135,
  'Denver, CO': 130,
  
  // High Cost
  'Chicago, IL': 110,
  'Austin, TX': 110,
  'Portland, OR': 115,
  'Philadelphia, PA': 105,
  'Minneapolis, MN': 105,
  'Atlanta, GA': 105,
  'Nashville, TN': 105,
  'Dallas, TX': 100,
  
  // Average
  'Houston, TX': 95,
  'Phoenix, AZ': 95,
  'Las Vegas, NV': 95,
  'Charlotte, NC': 95,
  'Tampa, FL': 95,
  'Orlando, FL': 95,
  'Salt Lake City, UT': 95,
  'Raleigh, NC': 95,
  
  // Below Average
  'Columbus, OH': 90,
  'Indianapolis, IN': 90,
  'San Antonio, TX': 85,
  'Kansas City, MO': 85,
  'Cleveland, OH': 85,
  'Pittsburgh, PA': 85,
  'Cincinnati, OH': 85,
  'Detroit, MI': 80,
  'Memphis, TN': 80,
  'Oklahoma City, OK': 80,
};

export const CITIES = Object.keys(COST_OF_LIVING_INDEX).sort();

export const CITY_OPTIONS = CITIES.map(city => ({
  value: city,
  label: city,
}));
