import { UserInputs, CookedResult, CookedTier, Issue, Recommendation, ScoreBreakdown, FinancialMetrics } from '@/types/calculator';
import { COST_OF_LIVING_INDEX } from '@/data/cities';

// Scoring weights
const WEIGHTS = {
  rent: 0.25,
  debt: 0.25,
  savings: 0.20,
  retirement: 0.15,
  credit: 0.10,
  creditCard: 0.05,
};

// Age-based retirement benchmarks (multiple of salary)
const RETIREMENT_BENCHMARKS: Record<number, number> = {
  25: 0.25,
  30: 0.5,
  35: 1.0,
  40: 2.0,
  45: 3.0,
  50: 4.0,
  55: 5.0,
  60: 6.0,
};

// Tier thresholds and info
const TIERS: { max: number; tier: CookedTier; emoji: string; label: string }[] = [
  { max: 20, tier: 'raw', emoji: '🥩', label: 'Raw' },
  { max: 40, tier: 'medium-rare', emoji: '🍖', label: 'Medium Rare' },
  { max: 60, tier: 'medium', emoji: '🥓', label: 'Medium' },
  { max: 75, tier: 'well-done', emoji: '🔥', label: 'Well Done' },
  { max: 90, tier: 'charcoal', emoji: '🖤', label: 'Charcoal' },
  { max: 100, tier: 'ash', emoji: '💀', label: 'Ash' },
];

export function calculateCookedScore(inputs: UserInputs): CookedResult {
  const totalIncome = inputs.annualIncome + (inputs.sideIncome || 0);
  const monthlyIncome = totalIncome / 12;
  const totalDebt = inputs.studentLoans + inputs.creditCardDebt + inputs.carLoan + (inputs.otherDebt || 0);
  const totalSavings = inputs.totalSavings + inputs.retirementSavings + (inputs.investments || 0);
  
  // Cost of living adjustment (for future use)
  const colIndex = COST_OF_LIVING_INDEX[inputs.city] || 100;
  void colIndex; // TODO: incorporate into scoring
  
  // Calculate individual scores (0-100, higher = more cooked)
  const breakdown = calculateBreakdown(inputs, totalIncome, monthlyIncome, totalDebt);
  
  // Calculate financial metrics for leaderboard
  const metrics: FinancialMetrics = {
    dti: Math.round((totalDebt / totalIncome) * 100),
    rentBurden: Math.round((inputs.monthlyRent / monthlyIncome) * 100),
    savingsRate: Math.round((totalSavings / totalIncome) * 100),
    netWorth: totalSavings - totalDebt,
  };
  
  // Apply age adjustment
  const ageMultiplier = getAgeMultiplier(inputs.age);
  
  // Calculate weighted score
  let score = 
    breakdown.rentScore * WEIGHTS.rent +
    breakdown.debtScore * WEIGHTS.debt +
    breakdown.savingsScore * WEIGHTS.savings +
    breakdown.retirementScore * WEIGHTS.retirement +
    breakdown.creditScore * WEIGHTS.credit;
  
  // Apply age adjustment (younger = more forgiving)
  score = score * ageMultiplier;
  
  // Clamp to 0-100
  score = Math.max(0, Math.min(100, Math.round(score)));
  
  // Determine tier
  const tierInfo = TIERS.find(t => score <= t.max) || TIERS[TIERS.length - 1];
  
  // Get top issues
  const topIssues = getTopIssues(inputs, breakdown, totalIncome, monthlyIncome, totalDebt);
  
  // Get roast
  const roast = generateRoast(inputs, breakdown, topIssues, tierInfo.tier);
  
  // Get recommendations
  const recommendations = generateRecommendations(topIssues);
  
  return {
    score,
    tier: tierInfo.tier,
    emoji: tierInfo.emoji,
    roast,
    breakdown,
    metrics,
    topIssues: topIssues.slice(0, 3),
    percentile: 50, // Will be calculated with real data
    recommendations,
  };
}

function calculateBreakdown(
  inputs: UserInputs,
  totalIncome: number,
  monthlyIncome: number,
  totalDebt: number
): ScoreBreakdown {
  // Rent score (0-100)
  const rentRatio = inputs.monthlyRent / monthlyIncome;
  let rentScore = 0;
  if (rentRatio > 0.5) rentScore = 100;
  else if (rentRatio > 0.4) rentScore = 80;
  else if (rentRatio > 0.3) rentScore = 50;
  else if (rentRatio > 0.25) rentScore = 30;
  else rentScore = 10;
  
  // Debt score (0-100)
  const debtRatio = totalDebt / totalIncome;
  let debtScore = 0;
  if (debtRatio > 2) debtScore = 100;
  else if (debtRatio > 1) debtScore = 80;
  else if (debtRatio > 0.5) debtScore = 50;
  else if (debtRatio > 0.25) debtScore = 30;
  else debtScore = 10;
  
  // Savings score (0-100) - based on emergency fund
  const monthsOfExpenses = inputs.totalSavings / (inputs.monthlyRent + 500); // rent + basic expenses
  let savingsScore = 0;
  if (monthsOfExpenses < 1) savingsScore = 100;
  else if (monthsOfExpenses < 3) savingsScore = 70;
  else if (monthsOfExpenses < 6) savingsScore = 40;
  else savingsScore = 10;
  
  // Retirement score (0-100) - based on age benchmarks
  const benchmark = getRetirementBenchmark(inputs.age);
  const retirementRatio = inputs.retirementSavings / totalIncome;
  let retirementScore = 0;
  if (retirementRatio < benchmark * 0.25) retirementScore = 100;
  else if (retirementRatio < benchmark * 0.5) retirementScore = 70;
  else if (retirementRatio < benchmark) retirementScore = 40;
  else retirementScore = 10;
  
  // Credit score (0-100)
  let creditScore = 50; // Default if not provided
  if (inputs.creditScore) {
    if (inputs.creditScore < 580) creditScore = 100;
    else if (inputs.creditScore < 650) creditScore = 70;
    else if (inputs.creditScore < 700) creditScore = 40;
    else if (inputs.creditScore < 750) creditScore = 20;
    else creditScore = 10;
  }
  
  // Bonus penalty for credit card debt (high interest)
  if (inputs.creditCardDebt > 5000) {
    debtScore = Math.min(100, debtScore + 20);
  }
  
  return {
    rentScore,
    debtScore,
    savingsScore,
    retirementScore,
    creditScore,
  };
}

function getAgeMultiplier(age: number): number {
  // Younger = more forgiving
  if (age < 25) return 0.7;
  if (age < 30) return 0.85;
  if (age < 35) return 1.0;
  if (age < 40) return 1.1;
  return 1.2;
}

function getRetirementBenchmark(age: number): number {
  const benchmarkAge = Math.floor(age / 5) * 5;
  return RETIREMENT_BENCHMARKS[benchmarkAge] || 0.25;
}

function getTopIssues(
  inputs: UserInputs,
  breakdown: ScoreBreakdown,
  totalIncome: number,
  monthlyIncome: number,
  totalDebt: number
): Issue[] {
  const issues: Issue[] = [];
  
  const rentRatio = inputs.monthlyRent / monthlyIncome;
  if (rentRatio > 0.3) {
    issues.push({
      category: 'Housing',
      description: `You're spending ${Math.round(rentRatio * 100)}% of income on rent`,
      severity: rentRatio > 0.5 ? 'critical' : rentRatio > 0.4 ? 'high' : 'medium',
    });
  }
  
  const monthsOfExpenses = inputs.totalSavings / (inputs.monthlyRent + 500);
  if (monthsOfExpenses < 3) {
    issues.push({
      category: 'Emergency Fund',
      description: monthsOfExpenses < 1 
        ? 'You have less than 1 month of expenses saved'
        : `Only ${monthsOfExpenses.toFixed(1)} months of expenses saved`,
      severity: monthsOfExpenses < 1 ? 'critical' : 'high',
    });
  }
  
  if (inputs.creditCardDebt > 0) {
    issues.push({
      category: 'Credit Card Debt',
      description: `$${inputs.creditCardDebt.toLocaleString()} in high-interest debt`,
      severity: inputs.creditCardDebt > 10000 ? 'critical' : inputs.creditCardDebt > 5000 ? 'high' : 'medium',
    });
  }
  
  const debtRatio = totalDebt / totalIncome;
  if (debtRatio > 0.5) {
    issues.push({
      category: 'Total Debt',
      description: `Debt is ${Math.round(debtRatio * 100)}% of your annual income`,
      severity: debtRatio > 1 ? 'critical' : 'high',
    });
  }
  
  if (inputs.creditScore && inputs.creditScore < 650) {
    issues.push({
      category: 'Credit Score',
      description: `Credit score of ${inputs.creditScore} is limiting your options`,
      severity: inputs.creditScore < 580 ? 'critical' : 'high',
    });
  }
  
  // Sort by severity
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  issues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
  
  return issues;
}

const ROASTS: Record<string, string[]> = {
  rent: [
    "Your landlord is eating good because of you.",
    "Half your check gone before you can blink.",
    "Working just to keep a roof over your head.",
    "Rent's due and so is everything else.",
  ],
  savings: [
    "Your emergency fund IS the emergency.",
    "One car problem away from chaos.",
    "That savings account looking real empty.",
    "Living paycheck to paycheck hits different.",
  ],
  creditCard: [
    "Credit card companies sending you thank you cards.",
    "That interest rate doing the heavy lifting.",
    "Minimum payments keeping you stuck.",
    "The debt cycle is real.",
  ],
  debt: [
    "The bills keep coming and they don't stop coming.",
    "Debt's got you in a headlock.",
    "You're working for yesterday's purchases.",
    "Digging out of this hole gonna take a minute.",
  ],
  general: [
    "It's rough out here.",
    "The struggle is very real.",
    "You're not alone — most people are cooked too.",
    "At least you're facing it head on.",
  ],
};

function generateRoast(
  inputs: UserInputs,
  breakdown: ScoreBreakdown,
  issues: Issue[],
  tier: CookedTier
): string {
  if (tier === 'raw') {
    return "You're doing suspiciously well. Are you sure you entered this correctly?";
  }
  
  if (tier === 'medium-rare') {
    return "Some financial pink inside, but you'll survive.";
  }
  
  if (issues.length === 0) {
    return "Average American. Not great, not terrible.";
  }
  
  const topIssue = issues[0];
  let roastCategory = 'general';
  
  if (topIssue.category === 'Housing') roastCategory = 'rent';
  else if (topIssue.category === 'Emergency Fund') roastCategory = 'savings';
  else if (topIssue.category === 'Credit Card Debt') roastCategory = 'creditCard';
  else if (topIssue.category === 'Total Debt') roastCategory = 'debt';
  
  const roasts = ROASTS[roastCategory];
  return roasts[Math.floor(Math.random() * roasts.length)];
}

function generateRecommendations(issues: Issue[]): Recommendation[] {
  const recommendations: Recommendation[] = [];
  
  for (const issue of issues) {
    if (issue.category === 'Housing') {
      recommendations.push({
        title: 'Lower Your Housing Costs',
        description: 'Look into roommates, moving somewhere cheaper, assistance programs, or negotiating rent when your lease is up.',
      });
    } else if (issue.category === 'Emergency Fund') {
      recommendations.push({
        title: 'Start a Small Emergency Fund',
        description: 'Even $500 helps. Set up auto-transfer of $25-50/paycheck to a separate savings account.',
        link: '#',
        linkText: 'Best savings accounts →',
      });
    } else if (issue.category === 'Credit Card Debt') {
      recommendations.push({
        title: 'Tackle That Credit Card Debt',
        description: 'Pay minimums on all cards, put any extra toward the highest interest one first. Look into balance transfer cards.',
      });
    } else if (issue.category === 'Credit Score') {
      recommendations.push({
        title: 'Work on Your Credit',
        description: 'Check your free credit report for errors. Pay bills on time. Keep credit card balances low.',
        link: '#',
        linkText: 'Free credit report →',
      });
    } else if (issue.category === 'Total Debt') {
      recommendations.push({
        title: 'Make a Debt Payoff Plan',
        description: 'List all debts with interest rates. Focus extra payments on highest rate first while paying minimums on others.',
      });
    }
  }
  
  return recommendations.slice(0, 3);
}

export function getTierInfo(tier: CookedTier) {
  return TIERS.find(t => t.tier === tier);
}

export function getTierLabel(tier: CookedTier): string {
  const info = getTierInfo(tier);
  return info?.label || tier;
}
