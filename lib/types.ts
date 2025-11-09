export type RecurrencePattern = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface Task {
  id: string;
  title: string;
  duration: number; // in minutes
  due_date: string; // ISO date string
  flexibility: number; // in days - how many days the task can be delayed
  completed: boolean;
  user_id: string;
  is_recurring: boolean;
  recurrence_pattern?: RecurrencePattern;
  recurrence_interval?: number; // every X days/weeks/months/years
  recurrence_end_date?: string; // ISO date string
  parent_task_id?: string;
  created_at: string;
  updated_at: string;
}

export interface TaskInsert {
  title: string;
  duration: number;
  due_date: string;
  flexibility: number; // in days
  completed?: boolean;
  is_recurring?: boolean;
  recurrence_pattern?: RecurrencePattern;
  recurrence_interval?: number;
  recurrence_end_date?: string;
  parent_task_id?: string;
}

export interface TaskUpdate {
  title?: string;
  duration?: number;
  due_date?: string;
  flexibility?: number; // in days
  completed?: boolean;
  is_recurring?: boolean;
  recurrence_pattern?: RecurrencePattern;
  recurrence_interval?: number;
  recurrence_end_date?: string;
}
