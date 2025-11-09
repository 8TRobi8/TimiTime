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
   * For recurring tasks, only returns the next upcoming instance
   */
  async getTasks(): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('due_date', { ascending: true });

    if (error) throw error;
    
    // Filter to show only the first upcoming instance for each recurring series
    return this.filterRecurringTasks(data || []);
  },

  /**
   * Get tasks that fit within a given time duration
   * For recurring tasks, only returns the next upcoming instance
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
    
    // Filter to show only the first upcoming instance for each recurring series
    return this.filterRecurringTasks(data || []);
  },

  /**
   * Filter tasks to show only the first upcoming instance for each recurring series
   * @param tasks - All tasks from the database
   * @returns Filtered list with only the next upcoming task for each recurring series
   */
  filterRecurringTasks(tasks: Task[]): Task[] {
    const now = new Date();
    const result: Task[] = [];
    const seenRecurringSeries = new Set<string>();

    for (const task of tasks) {
      // Determine the series identifier
      const seriesId = task.parent_task_id || (task.is_recurring ? task.id : null);
      
      if (!seriesId) {
        // Non-recurring task (no parent and not marked as recurring)
        result.push(task);
      } else {
        // Part of a recurring series
        if (!seenRecurringSeries.has(seriesId)) {
          // Find all tasks in this series (including the parent if it exists)
          const seriesTasks = tasks.filter(t => 
            t.id === seriesId || t.parent_task_id === seriesId
          );
          
          // Find the next upcoming uncompleted task in this series
          const upcomingTask = seriesTasks
            .filter(t => !t.completed && new Date(t.due_date) >= now)
            .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())[0];
          
          if (upcomingTask) {
            result.push(upcomingTask);
          }
          
          seenRecurringSeries.add(seriesId);
        }
      }
    }

    return result;
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
