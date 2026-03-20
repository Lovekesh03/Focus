import { useAppTheme } from '@/hooks/useAppTheme';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput } from 'react-native';
import { Theme } from '@/constants/theme';
import { useTaskStore } from '@/store/useTaskStore';
import { Button } from './Button';

export const ReflectionPrompt: React.FC = () => {
  const { colors } = useAppTheme();
  const styles = useStyles(colors);

  const [visible, setVisible] = useState(false);
  const [reflectionText, setReflectionText] = useState('');
  const tasks = useTaskStore(state => state.tasks);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const missedYesterday = tasks.filter(t => {
      const tDate = new Date(t.createdAt);
      tDate.setHours(0, 0, 0, 0);
      return tDate.getTime() === yesterday.getTime() && !t.completed;
    });

    if (missedYesterday.length > 0) {
      // In production we would check a local `has_reflected_today` flag
      setVisible(true);
    }
  }, [tasks]);

  const handleSubmit = () => {
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Missed Tasks</Text>
          <Text style={styles.subtitle}>
            You had some uncompleted tasks yesterday. Take a moment to reflect: what held you back?
          </Text>
          <TextInput
            style={styles.input}
            multiline
            placeholder="I was too tired, I got distracted by..."
            value={reflectionText}
            onChangeText={setReflectionText}
            placeholderTextColor={colors.textMuted}
            autoFocus
          />
          <Button title="Save Reflection" onPress={handleSubmit} />
          <Button 
            title="Skip for now" 
            onPress={() => setVisible(false)} 
            variant="outline" 
            style={{ marginTop: Theme.spacing.md }} 
          />
        </View>
      </View>
    </Modal>
  );
};

const useStyles = (colors: any) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    padding: Theme.spacing.xl,
    borderRadius: Theme.radius.xl,
    width: '100%',
  },
  title: {
    fontFamily: Theme.typography.fontFamily.bold,
    fontSize: Theme.typography.sizes.xl,
    color: colors.text,
    marginBottom: Theme.spacing.sm,
  },
  subtitle: {
    fontFamily: Theme.typography.fontFamily.medium,
    fontSize: Theme.typography.sizes.md,
    color: colors.textMuted,
    marginBottom: Theme.spacing.md,
    lineHeight: 22,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.md,
    fontFamily: Theme.typography.fontFamily.regular,
    fontSize: Theme.typography.sizes.md,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: Theme.spacing.lg,
  }
});
