export type WeakestDomain =
  | 'Cloud Concepts'
  | 'Core Azure Services'
  | 'Management & Governance'
  | 'N/A';

export interface PracticeSession {
  id: string;
  user_id: string;
  test_date: string;
  score: number;
  weakest_domain: WeakestDomain;
  created_at: string;
}

export type PracticeSessionInsert = {
  test_date: string;
  score: number;
  weakest_domain: WeakestDomain;
};
