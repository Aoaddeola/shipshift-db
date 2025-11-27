/**
 * Operator Stats Interfaces
 */
export interface Stats {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
  description: string;
}

export interface StatsResponse {
  [key: string]: Stats;
}

export interface StatsOptions {
  dateField?: string;
  entityName?: string;
  totalTitle?: string;
  totalDescription?: string;
  newThisMonthTitle?: string;
  newThisMonthDescription?: string;
}
