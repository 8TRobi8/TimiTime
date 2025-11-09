import { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ScrollView,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { taskService } from '@/lib/task-service';
import type { Task, TaskInsert, RecurrencePattern } from '@/lib/types';

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filterDuration, setFilterDuration] = useState('');
  const [isFiltered, setIsFiltered] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [flexibility, setFlexibility] = useState<number>(0);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern>('daily');
  const [recurrenceInterval, setRecurrenceInterval] = useState('1');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('');

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await taskService.getTasks();
      setTasks(data);
      setIsFiltered(false);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterByDuration = async () => {
    const minutes = parseInt(filterDuration);
    if (isNaN(minutes) || minutes <= 0) {
      Alert.alert('Error', 'Please enter a valid duration in minutes');
      return;
    }

    try {
      setLoading(true);
      const data = await taskService.getTasksByDuration(minutes);
      setTasks(data);
      setIsFiltered(true);
      setFilterModalVisible(false);
      setFilterDuration('');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to filter tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    if (!title || !duration || !dueDate) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const durationNum = parseInt(duration);
    if (isNaN(durationNum) || durationNum <= 0) {
      Alert.alert('Error', 'Please enter a valid duration in minutes');
      return;
    }

    // Validate recurring task fields if recurring is enabled
    if (isRecurring) {
      const intervalNum = parseInt(recurrenceInterval);
      if (isNaN(intervalNum) || intervalNum <= 0) {
        Alert.alert('Error', 'Please enter a valid recurrence interval');
        return;
      }
    }

    try {
      const newTask: TaskInsert = {
        title,
        duration: durationNum,
        due_date: dueDate,
        flexibility,
        completed: false,
        is_recurring: isRecurring,
      };

      // Add recurring fields if enabled
      if (isRecurring) {
        newTask.recurrence_pattern = recurrencePattern;
        newTask.recurrence_interval = parseInt(recurrenceInterval);
        if (recurrenceEndDate) {
          newTask.recurrence_end_date = recurrenceEndDate;
        }
      }

      await taskService.createTask(newTask);
      setModalVisible(false);
      resetForm();
      loadTasks();
      Alert.alert('Success', isRecurring ? 'Recurring task created successfully' : 'Task created successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create task');
    }
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      await taskService.toggleTaskComplete(task.id, !task.completed);
      loadTasks();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update task');
    }
  };

  const resetForm = () => {
    setTitle('');
    setDuration('');
    setDueDate('');
    setFlexibility(0);
    setIsRecurring(false);
    setRecurrencePattern('daily');
    setRecurrenceInterval('1');
    setRecurrenceEndDate('');
  };

  const getTaskUrgencyColor = (task: Task) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    
    const dueDate = new Date(task.due_date);
    dueDate.setHours(0, 0, 0, 0); // Start of due date
    
    const flexibilityEndDate = new Date(dueDate);
    flexibilityEndDate.setDate(flexibilityEndDate.getDate() + task.flexibility);
    
    // Green: due date is in the future
    if (dueDate > today) {
      return '#34c759'; // Green
    }
    
    // Yellow: due date is today with no flexibility OR due date is past but within flexibility
    if (dueDate.getTime() === today.getTime() && task.flexibility === 0) {
      return '#ff9500'; // Yellow
    }
    
    if (dueDate < today && flexibilityEndDate >= today) {
      return '#ff9500'; // Yellow
    }
    
    // Red: due date + flexibility is in the past
    return '#ff3b30'; // Red
  };

  const renderTask = ({ item }: { item: Task }) => {
    const urgencyColor = getTaskUrgencyColor(item);
    
    return (
      <TouchableOpacity
        style={[
          styles.taskCard,
          {
            backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#f2f2f7',
            borderColor: colors.border,
            borderLeftWidth: 4,
            borderLeftColor: urgencyColor,
          },
          item.completed && styles.taskCompleted,
        ]}
        onPress={() => handleToggleComplete(item)}
      >
        <View style={styles.taskHeader}>
          <ThemedText
            type="defaultSemiBold"
            style={[styles.taskTitle, item.completed && styles.taskTitleCompleted]}
          >
            {item.title}
          </ThemedText>
          <View style={styles.badgeContainer}>
            {item.is_recurring && (
              <View style={[styles.recurringBadge, { backgroundColor: colors.tint }]}>
                <ThemedText style={styles.recurringText}>🔁</ThemedText>
              </View>
            )}
            <View style={[styles.flexibilityBadge, { backgroundColor: urgencyColor }]}>
              <ThemedText style={styles.flexibilityText}>
                {item.flexibility === 0 ? 'No flex' : `+${item.flexibility}d`}
              </ThemedText>
            </View>
          </View>
        </View>
        <View style={styles.taskDetails}>
          <ThemedText style={styles.taskDetail}>⏱️ {item.duration} min</ThemedText>
          <ThemedText style={styles.taskDetail}>
            📅 {new Date(item.due_date).toLocaleDateString()}
          </ThemedText>
          {item.is_recurring && item.recurrence_pattern && (
            <ThemedText style={styles.taskDetail}>
              🔁 {item.recurrence_pattern}
            </ThemedText>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Tasks</ThemedText>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: colors.tint }]}
            onPress={() => setFilterModalVisible(true)}
          >
            <ThemedText style={styles.headerButtonText}>🔍 Find Tasks</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: colors.tint }]}
            onPress={() => setModalVisible(true)}
          >
            <ThemedText style={styles.headerButtonText}>+ Add</ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      {isFiltered && (
        <TouchableOpacity
          style={[styles.filterBanner, { backgroundColor: colors.tint }]}
          onPress={loadTasks}
        >
          <ThemedText style={styles.filterBannerText}>
            Showing filtered tasks · Tap to show all
          </ThemedText>
        </TouchableOpacity>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      ) : (
        <FlatList
          data={tasks}
          renderItem={renderTask}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>
                No tasks yet. Tap &quot;Add&quot; to create one!
              </ThemedText>
            </View>
          }
        />
      )}

      {/* Create Task Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#fff' }]}>
            <ScrollView>
              <ThemedText type="subtitle" style={styles.modalTitle}>
                Create New Task
              </ThemedText>

              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colorScheme === 'dark' ? '#2c2c2e' : '#f2f2f7',
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="Task title"
                placeholderTextColor={colors.textSecondary}
                value={title}
                onChangeText={setTitle}
              />

              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colorScheme === 'dark' ? '#2c2c2e' : '#f2f2f7',
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="Duration (minutes)"
                placeholderTextColor={colors.textSecondary}
                value={duration}
                onChangeText={setDuration}
                keyboardType="numeric"
              />

              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colorScheme === 'dark' ? '#2c2c2e' : '#f2f2f7',
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="Due date (YYYY-MM-DD)"
                placeholderTextColor={colors.textSecondary}
                value={dueDate}
                onChangeText={setDueDate}
              />

              <ThemedText style={styles.label}>Flexibility (days):</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colorScheme === 'dark' ? '#2c2c2e' : '#f2f2f7',
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="Days the task can be delayed (e.g., 0, 1, 2, 3)"
                placeholderTextColor={colors.textSecondary}
                value={flexibility.toString()}
                onChangeText={(text) => setFlexibility(parseInt(text) || 0)}
                keyboardType="numeric"
              />

              <View style={styles.quickFlexButtons}>
                {[0, 1, 2, 3, 7].map((days) => (
                  <TouchableOpacity
                    key={days}
                    style={[styles.quickFlexButton, { borderColor: colors.tint }]}
                    onPress={() => setFlexibility(days)}
                  >
                    <ThemedText style={{ color: colors.tint }}>
                      {days === 0 ? 'No flex' : `${days}d`}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Recurring Task Section */}
              <View style={styles.recurringSection}>
                <View style={styles.switchContainer}>
                  <ThemedText style={styles.label}>Recurring Task:</ThemedText>
                  <Switch
                    value={isRecurring}
                    onValueChange={setIsRecurring}
                    trackColor={{ false: '#767577', true: colors.tint }}
                    thumbColor={isRecurring ? '#fff' : '#f4f3f4'}
                  />
                </View>

                {isRecurring && (
                  <>
                    <ThemedText style={styles.label}>Recurrence Pattern:</ThemedText>
                    <View style={styles.recurrenceButtons}>
                      {(['daily', 'weekly', 'monthly', 'yearly'] as RecurrencePattern[]).map((pattern) => (
                        <TouchableOpacity
                          key={pattern}
                          style={[
                            styles.recurrenceButton,
                            { borderColor: colors.tint },
                            recurrencePattern === pattern && { backgroundColor: colors.tint },
                          ]}
                          onPress={() => setRecurrencePattern(pattern)}
                        >
                          <ThemedText style={[
                            { color: recurrencePattern === pattern ? '#fff' : colors.tint },
                            styles.recurrenceButtonText,
                          ]}>
                            {pattern.charAt(0).toUpperCase() + pattern.slice(1)}
                          </ThemedText>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <ThemedText style={styles.label}>Every (interval):</ThemedText>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: colorScheme === 'dark' ? '#2c2c2e' : '#f2f2f7',
                          color: colors.text,
                          borderColor: colors.border,
                        },
                      ]}
                      placeholder="e.g., 1 for every day, 2 for every other day"
                      placeholderTextColor={colors.textSecondary}
                      value={recurrenceInterval}
                      onChangeText={setRecurrenceInterval}
                      keyboardType="numeric"
                    />

                    <ThemedText style={styles.label}>End Date (optional):</ThemedText>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: colorScheme === 'dark' ? '#2c2c2e' : '#f2f2f7',
                          color: colors.text,
                          borderColor: colors.border,
                        },
                      ]}
                      placeholder="YYYY-MM-DD (leave empty for 1 year)"
                      placeholderTextColor={colors.textSecondary}
                      value={recurrenceEndDate}
                      onChangeText={setRecurrenceEndDate}
                    />
                  </>
                )}
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setModalVisible(false);
                    resetForm();
                  }}
                >
                  <ThemedText>Cancel</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: colors.tint }]}
                  onPress={handleCreateTask}
                >
                  <ThemedText style={styles.modalButtonText}>Create</ThemedText>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#fff' }]}>
            <ThemedText type="subtitle" style={styles.modalTitle}>
              I have free time...
            </ThemedText>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colorScheme === 'dark' ? '#2c2c2e' : '#f2f2f7',
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Enter duration in minutes (e.g., 15)"
              placeholderTextColor={colors.textSecondary}
              value={filterDuration}
              onChangeText={setFilterDuration}
              keyboardType="numeric"
            />

            <View style={styles.quickFilters}>
              {[5, 10, 15, 30, 60].map((min) => (
                <TouchableOpacity
                  key={min}
                  style={[styles.quickFilterButton, { borderColor: colors.tint }]}
                  onPress={() => setFilterDuration(min.toString())}
                >
                  <ThemedText style={{ color: colors.tint }}>{min} min</ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setFilterModalVisible(false);
                  setFilterDuration('');
                }}
              >
                <ThemedText>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.tint }]}
                onPress={handleFilterByDuration}
              >
                <ThemedText style={styles.modalButtonText}>Find Tasks</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 60,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  headerButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  headerButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  filterBanner: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  filterBannerText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
  },
  taskCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  taskCompleted: {
    opacity: 0.6,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitle: {
    flex: 1,
    marginRight: 8,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  recurringBadge: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
  },
  recurringText: {
    fontSize: 10,
    fontWeight: '600',
  },
  flexibilityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  flexibilityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'uppercase',
  },
  taskDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  taskDetail: {
    fontSize: 14,
    opacity: 0.8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.6,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '90%',
  },
  modalTitle: {
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  label: {
    marginBottom: 8,
    marginTop: 4,
  },
  quickFlexButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  quickFlexButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  flexibilityButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  flexibilityButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#8e8e93',
    alignItems: 'center',
  },
  flexibilityButtonActive: {
    borderWidth: 0,
  },
  flexibilityButtonText: {
    fontSize: 14,
  },
  flexibilityButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  quickFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  quickFilterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#8e8e93',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  recurringSection: {
    marginTop: 8,
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recurrenceButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  recurrenceButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  recurrenceButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

