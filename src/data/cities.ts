// Cost of living index (100 = US average)
export const COST_OF_LIVING_INDEX: Record<string, number> = {
  // Major metros - High cost
  'New York, NY': 175,
  'San Francisco, CA': 180,
  'Los Angeles, CA': 160,
  'San Jose, CA': 170,
  'Seattle, WA': 155,
  'Boston, MA': 150,
  'Washington, DC': 145,
  'San Diego, CA': 145,
  'Miami, FL': 135,
  'Denver, CO': 130,
  'Chicago, IL': 110,
  'Portland, OR': 115,
  
  // Major metros - Average cost
  'Austin, TX': 110,
  'Dallas, TX': 100,
  'Houston, TX': 95,
  'Atlanta, GA': 105,
  'Phoenix, AZ': 95,
  'Philadelphia, PA': 105,
  'Minneapolis, MN': 105,
  'Nashville, TN': 105,
  'Las Vegas, NV': 95,
  'Charlotte, NC': 95,
  'Tampa, FL': 95,
  'Orlando, FL': 95,
  'Raleigh, NC': 95,
  'Salt Lake City, UT': 95,
  
  // Mid-size cities
  'Sacramento, CA': 115,
  'Jacksonville, FL': 90,
  'San Antonio, TX': 85,
  'Columbus, OH': 90,
  'Indianapolis, IN': 90,
  'Fort Worth, TX': 90,
  'Milwaukee, WI': 90,
  'Albuquerque, NM': 88,
  'Tucson, AZ': 85,
  'Fresno, CA': 95,
  'Mesa, AZ': 90,
  'Omaha, NE': 88,
  'Colorado Springs, CO': 95,
  'Virginia Beach, VA': 95,
  'Bakersfield, CA': 90,
  
  // Smaller cities & towns
  'Kansas City, MO': 85,
  'Cleveland, OH': 85,
  'Pittsburgh, PA': 85,
  'Cincinnati, OH': 85,
  'St. Louis, MO': 85,
  'Detroit, MI': 80,
  'Memphis, TN': 80,
  'Oklahoma City, OK': 80,
  'Louisville, KY': 85,
  'Richmond, VA': 90,
  'New Orleans, LA': 90,
  'Buffalo, NY': 85,
  'Birmingham, AL': 80,
  'Rochester, NY': 85,
  'Hartford, CT': 100,
  'Boise, ID': 95,
  'Des Moines, IA': 85,
  'Little Rock, AR': 78,
  'Tulsa, OK': 80,
  'Spokane, WA': 90,
  'Knoxville, TN': 82,
  'El Paso, TX': 80,
  'Wichita, KS': 78,
  'Lexington, KY': 85,
  'Greensboro, NC': 85,
  'Akron, OH': 80,
  'Dayton, OH': 78,
  'Syracuse, NY': 85,
  'Shreveport, LA': 78,
  'Mobile, AL': 78,
  'Huntsville, AL': 85,
  'Augusta, GA': 80,
  'Grand Rapids, MI': 85,
  'Tacoma, WA': 105,
  'Modesto, CA': 95,
  'Fayetteville, AR': 82,
  'Worcester, MA': 110,
  'Chattanooga, TN': 82,
  'Fort Wayne, IN': 78,
  'Springfield, MO': 78,
  'Brownsville, TX': 75,
  'Laredo, TX': 78,
  'McAllen, TX': 75,
  
  // Rural / Small town (generic)
  'Small Town / Rural': 75,
  'Other': 90,
};

export const CITIES = Object.keys(COST_OF_LIVING_INDEX).sort((a, b) => {
  // Put "Other" and "Small Town" at the end
  if (a === 'Other' || a === 'Small Town / Rural') return 1;
  if (b === 'Other' || b === 'Small Town / Rural') return -1;
  return a.localeCompare(b);
});

export const CITY_OPTIONS = CITIES.map(city => ({
  value: city,
  label: city,
}));
