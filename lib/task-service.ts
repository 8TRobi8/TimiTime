import { supabase } from './supabase';
import type { Task, TaskInsert, TaskUpdate } from './types';

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
    return data;
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
