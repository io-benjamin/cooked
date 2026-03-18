-- Migration: Add raw input fields to submissions table
-- This allows AI analysis and better peer comparisons

-- ============================================
-- INCOME FIELDS
-- ============================================
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS annual_income INTEGER;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS side_income INTEGER DEFAULT 0;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS partner_income INTEGER DEFAULT 0;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS experience_level TEXT; -- 'entry', 'mid', 'senior', 'manager', 'executive'
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS job_title TEXT;

-- ============================================
-- HOUSING FIELDS
-- ============================================
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS monthly_rent INTEGER;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS living_arrangement TEXT; -- 'alone', 'roommates', 'partner', 'family', 'kids'
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS home_value INTEGER; -- if they own
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS mortgage_balance INTEGER; -- remaining mortgage

-- ============================================
-- DEBT FIELDS
-- ============================================
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS student_loans INTEGER DEFAULT 0;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS credit_card_debt INTEGER DEFAULT 0;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS car_loan INTEGER DEFAULT 0;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS other_debt INTEGER DEFAULT 0;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS total_debt INTEGER; -- computed total

-- ============================================
-- SAVINGS FIELDS
-- ============================================
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS emergency_savings INTEGER DEFAULT 0;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS retirement_savings INTEGER DEFAULT 0;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS investments INTEGER DEFAULT 0;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS crypto INTEGER DEFAULT 0; -- crypto holdings
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS brokerage INTEGER DEFAULT 0; -- brokerage/stock accounts
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS total_savings INTEGER; -- computed total

-- ============================================
-- OTHER FIELDS
-- ============================================
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS credit_score INTEGER;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS household_size INTEGER DEFAULT 1;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS marital_status TEXT; -- 'single', 'married'

-- ============================================
-- AI ANALYSIS FIELDS (for caching analysis results)
-- ============================================
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS ai_analysis JSONB; -- store full AI response
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS analyzed_at TIMESTAMPTZ; -- when AI analysis was run

-- ============================================
-- INDEXES for common queries
-- ============================================
CREATE INDEX IF NOT EXISTS idx_submissions_income ON submissions(annual_income);
CREATE INDEX IF NOT EXISTS idx_submissions_age_income ON submissions(age, annual_income);
CREATE INDEX IF NOT EXISTS idx_submissions_city_income ON submissions(city, annual_income);
CREATE INDEX IF NOT EXISTS idx_submissions_industry_income ON submissions(industry, annual_income);

-- ============================================
-- HELPER FUNCTION: Get peer comparison data
-- ============================================
CREATE OR REPLACE FUNCTION get_peer_stats(
  p_age INTEGER,
  p_city TEXT,
  p_industry TEXT,
  p_income INTEGER
)
RETURNS TABLE (
  age_group_avg_dti NUMERIC,
  age_group_avg_rent_burden NUMERIC,
  age_group_avg_savings_rate NUMERIC,
  city_avg_rent INTEGER,
  city_avg_income INTEGER,
  industry_avg_income INTEGER,
  percentile_income NUMERIC,
  percentile_savings NUMERIC,
  percentile_debt NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH age_peers AS (
    SELECT * FROM submissions 
    WHERE age BETWEEN p_age - 3 AND p_age + 3
    AND is_public = true
  ),
  city_peers AS (
    SELECT * FROM submissions 
    WHERE city = p_city
    AND is_public = true
  ),
  industry_peers AS (
    SELECT * FROM submissions 
    WHERE industry = p_industry
    AND is_public = true
  )
  SELECT 
    -- Age group averages
    (SELECT AVG(dti)::NUMERIC FROM age_peers) as age_group_avg_dti,
    (SELECT AVG(rent_burden)::NUMERIC FROM age_peers) as age_group_avg_rent_burden,
    (SELECT AVG(savings_rate)::NUMERIC FROM age_peers) as age_group_avg_savings_rate,
    
    -- City averages
    (SELECT AVG(monthly_rent)::INTEGER FROM city_peers) as city_avg_rent,
    (SELECT AVG(annual_income)::INTEGER FROM city_peers) as city_avg_income,
    
    -- Industry average
    (SELECT AVG(annual_income)::INTEGER FROM industry_peers) as industry_avg_income,
    
    -- Percentiles (what % of people have less income/savings/debt)
    (SELECT (COUNT(*) FILTER (WHERE annual_income < p_income) * 100.0 / NULLIF(COUNT(*), 0))::NUMERIC 
     FROM submissions WHERE is_public = true) as percentile_income,
    (SELECT (COUNT(*) FILTER (WHERE total_savings < (SELECT total_savings FROM submissions WHERE annual_income = p_income LIMIT 1)) * 100.0 / NULLIF(COUNT(*), 0))::NUMERIC 
     FROM submissions WHERE is_public = true) as percentile_savings,
    (SELECT (COUNT(*) FILTER (WHERE total_debt > (SELECT total_debt FROM submissions WHERE annual_income = p_income LIMIT 1)) * 100.0 / NULLIF(COUNT(*), 0))::NUMERIC 
     FROM submissions WHERE is_public = true) as percentile_debt;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMMENT: Document the table
-- ============================================
COMMENT ON TABLE submissions IS 'User financial data submissions for Am I Cooked analysis';
COMMENT ON COLUMN submissions.ai_analysis IS 'Cached AI analysis response (JSON) to avoid re-running';
COMMENT ON COLUMN submissions.analyzed_at IS 'Timestamp of last AI analysis run';
