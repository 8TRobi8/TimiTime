export interface Task {
  id: string;
  title: string;
  duration: number; // in minutes
  due_date: string; // ISO date string
  flexibility: number; // in days - how many days the task can be delayed
  completed: boolean;
  color: string; // hex color for calendar visualization
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface TaskInsert {
  title: string;
  duration: number;
  due_date: string;
  flexibility: number; // in days
  color?: string; // hex color for calendar visualization
  completed?: boolean;
}

export interface TaskUpdate {
  title?: string;
  duration?: number;
  due_date?: string;
  flexibility?: number; // in days
  color?: string; // hex color for calendar visualization
  completed?: boolean;
}
