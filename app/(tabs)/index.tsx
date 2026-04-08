import { useAppTheme } from '@/hooks/useAppTheme';
import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Theme } from '@/constants/theme';
import { useTaskStore } from '@/store/useTaskStore';
import { TaskItem } from '@/components/TaskItem';
import { ProgressRing } from '@/components/ProgressRing';
import { ReflectionPrompt } from '@/components/ReflectionPrompt';

export default function TasksScreen() {
  const { colors } = useAppTheme();
  const styles = useStyles(colors);

  const tasks = useTaskStore(state => state.tasks);
  const addTask = useTaskStore(state => state.addTask);
  const themeOverride = useTaskStore(state => state.themeOverride);
  const setThemeOverride = useTaskStore(state => state.setThemeOverride);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Focus list shows:
  // 1. All uncompleted tasks (even from previous days)
  // 2. Tasks completed today
  // Only show tasks created today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const activeTasks = tasks.filter(t => {
    const tDate = new Date(t.createdAt);
    tDate.setHours(0, 0, 0, 0);
    return tDate.getTime() === today.getTime();
  }).sort((a, b) => {
    // Show uncompleted first, then by priority/date
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return b.createdAt - a.createdAt;
  });

  const completedCount = activeTasks.filter(t => t.completed).length;
  const progress = activeTasks.length > 0 ? completedCount / activeTasks.length : 0;

  const toggleTheme = () => {
    const themes: Array<'light' | 'dark' | 'system'> = ['system', 'dark', 'light'];
    const nextTheme = themes[(themes.indexOf(themeOverride) + 1) % themes.length];
    setThemeOverride(nextTheme);
  };

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      addTask({ title: newTaskTitle.trim(), priority: 'medium' });
      setNewTaskTitle('');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <ReflectionPrompt />
        <View style={styles.header}>
          <View>
            <Text style={styles.dateText}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </Text>
            <Text style={styles.title}>Your Focus</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
              <Feather 
                name={themeOverride === 'dark' ? 'moon' : themeOverride === 'light' ? 'sun' : 'smartphone'} 
                size={24} 
                color={colors.textMuted} 
              />
            </TouchableOpacity>
            <ProgressRing progress={progress} size={64} strokeWidth={6} />
          </View>
        </View>

        <FlatList
          data={activeTasks}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <TaskItem task={item} />}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No tasks for today. Add one below!</Text>
            </View>
          }
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="What needs to be done?"
            value={newTaskTitle}
            onChangeText={setNewTaskTitle}
            onSubmitEditing={handleAddTask}
            placeholderTextColor={colors.textMuted}
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
            <Feather name="plus" size={24} color={colors.surface} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const useStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.xl,
    paddingBottom: Theme.spacing.lg,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeToggle: {
    padding: Theme.spacing.sm,
    marginRight: Theme.spacing.md,
  },
  dateText: {
    fontFamily: Theme.typography.fontFamily.medium,
    fontSize: Theme.typography.sizes.sm,
    color: colors.textMuted,
    marginBottom: 4,
  },
  title: {
    fontFamily: Theme.typography.fontFamily.bold,
    fontSize: Theme.typography.sizes.xxl,
    color: colors.text,
  },
  listContent: {
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: 100,
  },
  emptyContainer: {
    paddingVertical: Theme.spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: Theme.typography.fontFamily.medium,
    fontSize: Theme.typography.sizes.md,
    color: colors.textMuted,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: Theme.spacing.md,
    paddingBottom: Platform.OS === 'ios' ? Theme.spacing.xl : Theme.spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 48,
    backgroundColor: colors.background,
    borderRadius: Theme.radius.lg,
    paddingHorizontal: Theme.spacing.md,
    fontFamily: Theme.typography.fontFamily.medium,
    fontSize: Theme.typography.sizes.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addButton: {
    width: 48,
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: Theme.radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Theme.spacing.sm,
  }
});
