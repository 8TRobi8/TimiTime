import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from './themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import type { Task } from '@/lib/types';

interface CalendarProps {
  tasks: Task[];
  currentDate: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

export function Calendar({ tasks, currentDate, onPreviousMonth, onNextMonth }: CalendarProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Helper to get days in month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  // Helper to get first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get tasks for a specific date (only dots - tasks with no flexibility)
  const getTasksForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return tasks.filter((task) => {
      const dueDate = new Date(task.due_date);
      const dueDateString = dueDate.toISOString().split('T')[0];
      
      // Only show dot if no flexibility
      return task.flexibility === 0 && dueDateString === dateString;
    });
  };

  // Get task lines that should be drawn (tasks with flexibility)
  const getTaskLines = () => {
    const lines: Array<{
      task: Task;
      startDay: number;
      endDay: number;
      row: number;
    }> = [];

    tasks.forEach((task) => {
      if (task.flexibility === 0) return; // Skip tasks without flexibility

      const dueDate = new Date(task.due_date);
      const flexEndDate = new Date(dueDate);
      flexEndDate.setDate(flexEndDate.getDate() + task.flexibility);

      // Check if task is in current month
      if (
        (dueDate.getFullYear() === year && dueDate.getMonth() === month) ||
        (flexEndDate.getFullYear() === year && flexEndDate.getMonth() === month)
      ) {
        // Calculate start and end days within this month
        let startDay: number;
        let endDay: number;

        if (dueDate.getFullYear() === year && dueDate.getMonth() === month) {
          startDay = dueDate.getDate();
        } else {
          startDay = 1; // Task started in previous month
        }

        if (flexEndDate.getFullYear() === year && flexEndDate.getMonth() === month) {
          endDay = flexEndDate.getDate();
        } else {
          endDay = daysInMonth; // Task continues to next month
        }

        // Calculate which row this task appears in
        const dayIndex = firstDay + startDay - 1;
        const row = Math.floor(dayIndex / 7);

        lines.push({
          task,
          startDay,
          endDay,
          row,
        });
      }
    });

    return lines;
  };

  const taskLines = getTaskLines();

  // Create array of day numbers
  const days: (number | null)[] = [];
  
  // Add empty cells for days before the first day of month
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  
  // Add days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <View style={styles.container}>
      {/* Month Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onPreviousMonth} style={styles.navButton}>
          <ThemedText style={styles.navButtonText}>‹</ThemedText>
        </TouchableOpacity>
        <ThemedText type="subtitle">
          {monthNames[month]} {year}
        </ThemedText>
        <TouchableOpacity onPress={onNextMonth} style={styles.navButton}>
          <ThemedText style={styles.navButtonText}>›</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Day Names */}
      <View style={styles.dayNamesRow}>
        {dayNames.map((name) => (
          <View key={name} style={styles.dayNameCell}>
            <ThemedText style={styles.dayNameText}>{name}</ThemedText>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.gridContainer}>
        <View style={styles.grid}>
          {days.map((day, index) => {
            if (day === null) {
              return <View key={`empty-${index}`} style={styles.dayCell} />;
            }

            const date = new Date(year, month, day);
            const dayTasks = getTasksForDate(date);
            const today = new Date();
            const isToday = 
              date.getDate() === today.getDate() &&
              date.getMonth() === today.getMonth() &&
              date.getFullYear() === today.getFullYear();

            return (
              <View
                key={day}
                style={[
                  styles.dayCell,
                  isToday && { backgroundColor: colorScheme === 'dark' ? '#2c2c2e' : '#f0f0f0' },
                ]}
              >
                <ThemedText
                  style={[
                    styles.dayNumber,
                    isToday && { fontWeight: 'bold', color: colors.tint },
                  ]}
                >
                  {day}
                </ThemedText>
                
                {/* Task Dots (only for tasks with no flexibility) */}
                <View style={styles.taskIndicators}>
                  {dayTasks.map((task) => (
                    <View
                      key={task.id}
                      style={[styles.taskDot, { backgroundColor: task.color || '#007AFF' }]}
                    />
                  ))}
                </View>
              </View>
            );
          })}
        </View>

        {/* Continuous lines for tasks with flexibility */}
        {taskLines.map((line, idx) => {
          const startDayIndex = firstDay + line.startDay - 1;
          const endDayIndex = firstDay + line.endDay - 1;
          
          const startCol = startDayIndex % 7;
          const endCol = endDayIndex % 7;
          const startRow = Math.floor(startDayIndex / 7);
          const endRow = Math.floor(endDayIndex / 7);

          // If the line spans multiple weeks, we need to draw it in segments
          const lineSegments = [];
          
          for (let row = startRow; row <= endRow; row++) {
            const segmentStartCol = row === startRow ? startCol : 0;
            const segmentEndCol = row === endRow ? endCol : 6;
            
            // Calculate position and width
            const leftPercent = (segmentStartCol / 7) * 100;
            const widthPercent = ((segmentEndCol - segmentStartCol + 1) / 7) * 100;
            
            lineSegments.push(
              <View
                key={`${line.task.id}-row${row}`}
                style={[
                  styles.taskLineOverlay,
                  {
                    backgroundColor: line.task.color || '#007AFF',
                    top: row * (100 / Math.ceil(days.length / 7)) + '%',
                    left: `${leftPercent}%`,
                    width: `${widthPercent}%`,
                  },
                ]}
              />
            );
          }
          
          return lineSegments;
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  dayNamesRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayNameCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayNameText: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.6,
  },
  gridContainer: {
    position: 'relative',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%', // 100% / 7 days
    aspectRatio: 1,
    padding: 4,
    borderRadius: 8,
    marginBottom: 4,
  },
  dayNumber: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 4,
  },
  taskIndicators: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 2,
  },
  taskDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  taskLineOverlay: {
    position: 'absolute',
    height: 3,
    borderRadius: 1.5,
    marginTop: 24, // Position below day numbers
  },
});
