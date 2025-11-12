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

  // Get tasks for a specific date
  const getTasksForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return tasks.filter((task) => {
      const dueDate = new Date(task.due_date);
      const dueDateString = dueDate.toISOString().split('T')[0];
      
      if (task.flexibility === 0) {
        // No flexibility: show only on due date
        return dueDateString === dateString;
      } else {
        // With flexibility: check if date is within range
        const flexEndDate = new Date(dueDate);
        flexEndDate.setDate(flexEndDate.getDate() + task.flexibility);
        const flexEndString = flexEndDate.toISOString().split('T')[0];
        
        return dateString >= dueDateString && dateString <= flexEndString;
      }
    });
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

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
              
              {/* Task Indicators */}
              <View style={styles.taskIndicators}>
                {dayTasks.map((task) => {
                  const dueDate = new Date(task.due_date);
                  const dueDateString = dueDate.toISOString().split('T')[0];
                  const currentDateString = date.toISOString().split('T')[0];
                  
                  if (task.flexibility === 0 || dueDateString === currentDateString) {
                    // Show dot on due date or when no flexibility
                    return (
                      <View
                        key={task.id}
                        style={[styles.taskDot, { backgroundColor: task.color }]}
                      />
                    );
                  } else {
                    // Show line indicator for flexibility range
                    const flexEndDate = new Date(dueDate);
                    flexEndDate.setDate(flexEndDate.getDate() + task.flexibility);
                    const flexEndString = flexEndDate.toISOString().split('T')[0];
                    
                    // Determine if this is start, middle, or end of flexibility range
                    const isStart = currentDateString === dueDateString;
                    const isEnd = currentDateString === flexEndString;
                    
                    return (
                      <View
                        key={task.id}
                        style={[
                          styles.taskLine,
                          { backgroundColor: task.color },
                          isStart && styles.taskLineStart,
                          isEnd && styles.taskLineEnd,
                        ]}
                      />
                    );
                  }
                })}
              </View>
            </View>
          );
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
  taskLine: {
    width: '80%',
    height: 3,
    borderRadius: 1.5,
  },
  taskLineStart: {
    marginLeft: '10%',
  },
  taskLineEnd: {
    marginRight: '10%',
  },
});
