-- Run this in Supabase SQL Editor

-- Submissions table
CREATE TABLE submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  age INTEGER NOT NULL,
  city TEXT NOT NULL,
  industry TEXT NOT NULL,
  score INTEGER NOT NULL,
  tier TEXT NOT NULL,
  dti INTEGER NOT NULL,
  rent_burden INTEGER NOT NULL,
  savings_rate INTEGER NOT NULL,
  net_worth INTEGER NOT NULL,
  is_public BOOLEAN DEFAULT true
);

-- Index for leaderboard queries
CREATE INDEX idx_submissions_score ON submissions(score DESC);
CREATE INDEX idx_submissions_city ON submissions(city);
CREATE INDEX idx_submissions_industry ON submissions(industry);
CREATE INDEX idx_submissions_created ON submissions(created_at);
CREATE INDEX idx_submissions_public ON submissions(is_public) WHERE is_public = true;

-- Row Level Security
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can read public submissions
CREATE POLICY "Public submissions are viewable by everyone"
  ON submissions FOR SELECT
  USING (is_public = true);

-- Anyone can insert (anonymous or authenticated)
CREATE POLICY "Anyone can submit"
  ON submissions FOR INSERT
  WITH CHECK (true);

-- Users can update their own submissions
CREATE POLICY "Users can update own submissions"
  ON submissions FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own submissions
CREATE POLICY "Users can delete own submissions"
  ON submissions FOR DELETE
  USING (auth.uid() = user_id);

-- Function to get daily stats
CREATE OR REPLACE FUNCTION get_daily_stats()
RETURNS TABLE (date DATE, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT DATE(created_at) as date, COUNT(*) as count
  FROM submissions
  WHERE created_at >= NOW() - INTERVAL '30 days'
  GROUP BY DATE(created_at)
  ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql;
