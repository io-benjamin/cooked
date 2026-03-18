export interface Submission {
  id: string;
  created_at: string;
  user_id: string | null;
  
  // Demographics
  age: number;
  city: string;
  industry: string;
  experience_level?: string; // 'entry' | 'mid' | 'senior' | 'manager' | 'executive'
  job_title?: string;
  
  // Income
  annual_income?: number;
  side_income?: number;
  partner_income?: number;
  marital_status?: string; // 'single' | 'married'
  household_size?: number;
  
  // Housing
  monthly_rent?: number;
  living_arrangement?: string; // 'alone' | 'roommates' | 'partner' | 'family' | 'kids'
  home_value?: number;
  mortgage_balance?: number;
  
  // Debt
  student_loans?: number;
  credit_card_debt?: number;
  car_loan?: number;
  other_debt?: number;
  total_debt?: number;
  
  // Savings
  emergency_savings?: number;
  retirement_savings?: number;
  investments?: number;
  total_savings?: number;
  
  // Credit
  credit_score?: number;
  
  // Calculated metrics
  score: number;
  tier: string;
  dti: number;
  rent_burden: number;
  savings_rate: number;
  net_worth: number;
  
  // AI Analysis
  ai_analysis?: AIAnalysisResult | null;
  analyzed_at?: string | null;
  
  // Meta
  avatar_url?: string;
  email?: string;
  is_public: boolean;
}

export interface DailyStats {
  date: string;
  count: number;
}

export interface PeerStats {
  age_group_avg_dti: number;
  age_group_avg_rent_burden: number;
  age_group_avg_savings_rate: number;
  city_avg_rent: number;
  city_avg_income: number;
  industry_avg_income: number;
  percentile_income: number;
  percentile_savings: number;
  percentile_debt: number;
}

// AI Analysis result structure (cached in database)
export interface AIAnalysisResult {
  summary: {
    oneLiner: string;
    cookLevel: string;
    biggestProblem: string;
  };
  rootCauses: Array<{
    issue: string;
    explanation: string;
    impact: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
  }>;
  detectedHabits: Array<{
    habit: string;
    evidence: string;
    consequence: string;
  }>;
  peerComparison: {
    vsAgeGroup: {
      rentBurden: string;
      savings: string;
      debt: string;
      summary: string;
    };
    vsCity: { summary: string };
    vsIndustry: { summary: string };
  };
  actionPlan: {
    immediate: {
      title: string;
      action: string;
      impact: string;
    };
    thirtyDays: Array<{
      priority: number;
      action: string;
      target: string;
      why: string;
    }>;
    ninetyDays: Array<{
      milestone: string;
      metrics: string;
    }>;
  };
  targets: {
    rentBurden: { current: number; target: number; action: string };
    emergencyFund: { current: number; target: number; monthlyContribution: string };
    debtPayoff: { current: number; priority: string; monthlyPayment: string };
  };
  encouragement: {
    doingRight: string[];
    quickWins: string[];
    motivation: string;
  };
}
