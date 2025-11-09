import { supabase } from './supabase';
import type { Task, TaskInsert, TaskUpdate, RecurrencePattern } from './types';

/**
 * Calculate the next due date based on recurrence pattern and interval
 */
function getNextDueDate(
  currentDate: Date,
  pattern: RecurrencePattern,
  interval: number
): Date {
  const nextDate = new Date(currentDate);
  
  switch (pattern) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + interval);
      break;
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + (interval * 7));
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + interval);
      break;
    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + interval);
      break;
  }
  
  return nextDate;
}

export const taskService = {
  /**
   * Get all tasks for the current user
   */
  async getTasks(): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get tasks that fit within a given time duration
   * @param maxDuration - Maximum duration in minutes
   */
  async getTasksByDuration(maxDuration: number): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .lte('duration', maxDuration)
      .eq('completed', false)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Create a new task
   */
  async createTask(task: TaskInsert): Promise<Task> {
    // Get the current user's ID
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Add user_id to the task
    const taskWithUserId = {
      ...task,
      user_id: user.id,
    };

    const { data, error } = await supabase
      .from('tasks')
      .insert(taskWithUserId)
      .select()
      .single();

    if (error) throw error;
    
    // If it's a recurring task, create future instances
    if (data.is_recurring && data.recurrence_pattern && data.recurrence_interval) {
      await this.createRecurringInstances(data);
    }
    
    return data;
  },

  /**
   * Create future instances of a recurring task
   */
  async createRecurringInstances(parentTask: Task): Promise<void> {
    if (!parentTask.is_recurring || !parentTask.recurrence_pattern || !parentTask.recurrence_interval) {
      return;
    }

    const instances: TaskInsert[] = [];
    let currentDueDate = new Date(parentTask.due_date);
    const endDate = parentTask.recurrence_end_date 
      ? new Date(parentTask.recurrence_end_date)
      : new Date(currentDueDate.getTime() + (365 * 24 * 60 * 60 * 1000)); // Default 1 year

    // Generate up to 50 instances or until end date
    for (let i = 0; i < 50; i++) {
      currentDueDate = getNextDueDate(
        currentDueDate,
        parentTask.recurrence_pattern,
        parentTask.recurrence_interval
      );

      if (currentDueDate > endDate) break;

      instances.push({
        title: parentTask.title,
        duration: parentTask.duration,
        due_date: currentDueDate.toISOString(),
        flexibility: parentTask.flexibility,
        completed: false,
        is_recurring: false, // instances are not recurring themselves
        parent_task_id: parentTask.id,
      });
    }

    if (instances.length > 0) {
      // Get the current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Add user_id to all instances
      const instancesWithUserId = instances.map(instance => ({
        ...instance,
        user_id: user.id,
      }));

      const { error } = await supabase
        .from('tasks')
        .insert(instancesWithUserId);

      if (error) throw error;
    }
  },

  /**
   * Update an existing task
   */
  async updateTask(id: string, updates: TaskUpdate): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a task
   */
  async deleteTask(id: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Mark task as completed
   */
  async toggleTaskComplete(id: string, completed: boolean): Promise<Task> {
    return this.updateTask(id, { completed });
  },
};
