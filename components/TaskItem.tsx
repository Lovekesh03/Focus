import { useAppTheme } from '@/hooks/useAppTheme';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Theme } from '@/constants/theme';
import { Task, useTaskStore } from '@/store/useTaskStore';
import Animated, { FadeIn, Layout } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

export const TaskItem: React.FC<{ task: Task }> = ({ task }) => {
  const { colors } = useAppTheme();
  const styles = useStyles(colors);

  const toggleTask = useTaskStore(state => state.toggleTask);
  const updateTaskNotes = useTaskStore(state => state.updateTaskNotes);
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState(task.notes || '');
  const router = useRouter();

  const handleToggle = () => toggleTask(task.id);

  const saveNotes = () => {
    updateTaskNotes(task.id, notes);
    setExpanded(false);
  };

  const openFocusMode = () => {
    // Push the focus router page
    router.push({ pathname: '/focus', params: { id: task.id } });
  };

  return (
    <Animated.View layout={Layout.springify()} style={styles.container}>
      <View style={styles.row}>
        <TouchableOpacity style={styles.checkbox} onPress={handleToggle}>
          {task.completed && <Feather name="check" size={16} color={colors.surface} />}
          {!task.completed && <View style={styles.checkboxEmpty} />}
          {task.completed && <View style={[StyleSheet.absoluteFill, styles.checkboxFilled]} />}
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.content} onPress={() => setExpanded(!expanded)}>
          <Text style={[styles.title, task.completed && styles.titleCompleted]}>
            {task.title}
          </Text>
          {task.notes && !expanded && (
            <Text style={styles.notesPreview} numberOfLines={1}>{task.notes}</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.focusBtn} onPress={openFocusMode}>
          <Feather name="target" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {expanded && (
        <Animated.View entering={FadeIn} style={styles.notesContainer}>
          <TextInput
            style={styles.notesInput}
            multiline
            placeholder="Add short notes or sub-tasks..."
            value={notes}
            onChangeText={setNotes}
            onBlur={saveNotes}
            placeholderTextColor={colors.textMuted}
            autoFocus
          />
        </Animated.View>
      )}
    </Animated.View>
  );
};

const useStyles = (colors: any) => StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    padding: Theme.spacing.md,
    borderRadius: Theme.radius.lg,
    marginBottom: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginRight: Theme.spacing.md,
  },
  checkboxEmpty: {},
  checkboxFilled: {
    backgroundColor: colors.primary,
    zIndex: -1,
    borderRadius: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontFamily: Theme.typography.fontFamily.medium,
    fontSize: Theme.typography.sizes.md,
    color: colors.text,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  notesPreview: {
    fontFamily: Theme.typography.fontFamily.regular,
    fontSize: Theme.typography.sizes.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  focusBtn: {
    padding: Theme.spacing.sm,
  },
  notesContainer: {
    marginTop: Theme.spacing.md,
    paddingTop: Theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  notesInput: {
    fontFamily: Theme.typography.fontFamily.regular,
    fontSize: Theme.typography.sizes.sm,
    color: colors.text,
    minHeight: 60,
    textAlignVertical: 'top',
  }
});
