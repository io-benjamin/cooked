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
  
  // Section 3: Housing
  monthlyRent: number;
  livingArrangement: 'alone' | 'roommates' | 'partner' | 'family' | 'kids';
  
  // Section 4: Debt
  studentLoans: number;
  creditCardDebt: number;
  carLoan: number;
  otherDebt?: number;
  
  // Section 5: Savings
  totalSavings: number;
  retirementSavings: number;
  investments?: number;
  
  // Section 6: Credit
  creditScore?: number;
}

export interface CookedResult {
  score: number;
  tier: CookedTier;
  emoji: string;
  roast: string;
  breakdown: ScoreBreakdown;
  topIssues: Issue[];
  percentile: number;
  cityPercentile?: number;
  industryPercentile?: number;
  ageGroupPercentile?: number;
  recommendations: Recommendation[];
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
