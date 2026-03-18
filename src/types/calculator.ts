export interface UserInputs {
  // Section 1: Basics
  age: number;
  city: string;
  industry: string;
  jobTitle?: string;
  experienceLevel: 'entry' | 'mid' | 'senior' | 'manager' | 'executive';
  
  // Section 2: Income
  annualIncome: number;
  sideIncome?: number;
  maritalStatus?: 'single' | 'married';  // Triggers partner income prompt
  partnerIncome?: number;                // Shown when married
  householdSize?: number;                // Number of people in household

  // Section 3: Housing
  monthlyRent: number;
  livingArrangement: 'alone' | 'roommates' | 'partner' | 'family' | 'kids';
  homeValue?: number;        // Market value of home (if owned)
  mortgageBalance?: number;  // Remaining mortgage owed
  
  // Section 4: Debt
  studentLoans: number;
  creditCardDebt: number;
  carLoan: number;
  otherDebt?: number;
  
  // Section 5: Savings
  totalSavings: number;
  retirementSavings: number;
  investments?: number;
  crypto?: number;        // Crypto holdings (BTC, ETH, etc.)
  brokerage?: number;     // Brokerage/stock accounts
  
  // Section 6: Credit
  creditScore?: number;
}

export interface CookedResult {
  score: number;
  tier: CookedTier;
  emoji: string;
  roast: string;
  breakdown: ScoreBreakdown;
  metrics: FinancialMetrics;
  topIssues: Issue[];
  percentile: number;
  cityPercentile?: number;
  industryPercentile?: number;
  ageGroupPercentile?: number;
  recommendations: Recommendation[];
}

export interface FinancialMetrics {
  dti: number; // Debt to income ratio (percentage)
  rentBurden: number; // Rent to income ratio (percentage)
  savingsRate: number; // Savings / income (percentage)
  netWorth: number; // Total savings - total debt
}

export type CookedTier = 'raw' | 'medium-rare' | 'medium' | 'well-done' | 'charcoal' | 'ash';

export interface ScoreBreakdown {
  rentScore: number;
  debtScore: number;
  savingsScore: number;
  retirementScore: number;
  creditScore: number;
}

export interface Issue {
  category: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface Recommendation {
  title: string;
  description: string;
  link?: string;
  linkText?: string;
}

export interface AnonymousSubmission {
  id?: string;
  createdAt: Date;
  age: number;
  city: string;
  industry: string;
  experienceLevel: string;
  score: number;
  tier: string;
  rentToIncomeRatio: number;
  debtToIncomeRatio: number;
  emergencyMonths: number;
}
