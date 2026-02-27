-- Migration: Add city cost of living table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS city_col (
  id SERIAL PRIMARY KEY,
  city TEXT UNIQUE NOT NULL,
  col_index INTEGER NOT NULL DEFAULT 100,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE city_col ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public read access" ON city_col
  FOR SELECT USING (true);

-- Seed with current data (updated values based on 2026 data)
INSERT INTO city_col (city, col_index) VALUES
  -- Major metros - High cost
  ('New York, NY', 175),
  ('San Francisco, CA', 170),
  ('Los Angeles, CA', 145),
  ('San Jose, CA', 165),
  ('Seattle, WA', 135),
  ('Boston, MA', 160),
  ('Washington, DC', 135),
  ('San Diego, CA', 150),
  ('Miami, FL', 160),
  ('Denver, CO', 115),
  ('Chicago, IL', 120),
  ('Portland, OR', 125),
  
  -- Major metros - Average/Above
  ('Austin, TX', 130),
  ('Dallas, TX', 105),
  ('Houston, TX', 110),
  ('Atlanta, GA', 115),
  ('Phoenix, AZ', 105),
  ('Philadelphia, PA', 120),
  ('Minneapolis, MN', 100),
  ('Nashville, TN', 120),
  ('Las Vegas, NV', 105),
  ('Charlotte, NC', 110),
  ('Tampa, FL', 115),
  ('Orlando, FL', 115),
  ('Raleigh, NC', 105),
  ('Salt Lake City, UT', 105),
  
  -- Mid-size cities
  ('Sacramento, CA', 125),
  ('Jacksonville, FL', 110),
  ('San Antonio, TX', 95),
  ('Columbus, OH', 95),
  ('Indianapolis, IN', 95),
  ('Fort Worth, TX', 100),
  ('Milwaukee, WI', 95),
  ('Albuquerque, NM', 90),
  ('Tucson, AZ', 90),
  ('Fresno, CA', 100),
  ('Mesa, AZ', 100),
  ('Omaha, NE', 90),
  ('Colorado Springs, CO', 105),
  ('Virginia Beach, VA', 110),
  ('Bakersfield, CA', 100),
  
  -- Smaller cities
  ('Kansas City, MO', 90),
  ('Cleveland, OH', 90),
  ('Pittsburgh, PA', 105),
  ('Cincinnati, OH', 90),
  ('St. Louis, MO', 90),
  ('Detroit, MI', 100),
  ('Memphis, TN', 85),
  ('Oklahoma City, OK', 85),
  ('Louisville, KY', 90),
  ('Richmond, VA', 100),
  ('New Orleans, LA', 105),
  ('Buffalo, NY', 100),
  ('Birmingham, AL', 85),
  ('Rochester, NY', 100),
  ('Hartford, CT', 110),
  ('Boise, ID', 105),
  ('Des Moines, IA', 90),
  ('Little Rock, AR', 82),
  ('Tulsa, OK', 85),
  ('Spokane, WA', 95),
  ('Knoxville, TN', 95),
  ('El Paso, TX', 85),
  ('Wichita, KS', 82),
  ('Lexington, KY', 90),
  ('Greensboro, NC', 90),
  ('Akron, OH', 85),
  ('Dayton, OH', 82),
  ('Syracuse, NY', 90),
  ('Shreveport, LA', 82),
  ('Mobile, AL', 82),
  ('Huntsville, AL', 95),
  ('Augusta, GA', 85),
  ('Grand Rapids, MI', 100),
  ('Tacoma, WA', 120),
  ('Modesto, CA', 105),
  ('Fayetteville, AR', 88),
  ('Worcester, MA', 115),
  ('Chattanooga, TN', 90),
  ('Fort Wayne, IN', 82),
  ('Springfield, MO', 82),
  ('Brownsville, TX', 78),
  ('Laredo, TX', 80),
  ('McAllen, TX', 78),
  
  -- Generic options
  ('Small Town / Rural', 75),
  ('Other', 95)
ON CONFLICT (city) DO UPDATE SET 
  col_index = EXCLUDED.col_index,
  updated_at = NOW();
