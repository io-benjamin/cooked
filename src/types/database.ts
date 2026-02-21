export interface Submission {
  id: string;
  created_at: string;
  user_id: string | null;
  age: number;
  city: string;
  industry: string;
  score: number;
  tier: string;
  dti: number;
  rent_burden: number;
  savings_rate: number;
  net_worth: number;
  is_public: boolean;
}

export interface DailyStats {
  date: string;
  count: number;
}
