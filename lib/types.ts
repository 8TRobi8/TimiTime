export interface Task {
  id: string;
  title: string;
  duration: number; // in minutes
  due_date: string; // ISO date string
  flexibility: 'low' | 'medium' | 'high';
  completed: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface TaskInsert {
  title: string;
  duration: number;
  due_date: string;
  flexibility: 'low' | 'medium' | 'high';
  completed?: boolean;
}

export interface TaskUpdate {
  title?: string;
  duration?: number;
  due_date?: string;
  flexibility?: 'low' | 'medium' | 'high';
  completed?: boolean;
}
