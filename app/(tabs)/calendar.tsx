import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Modal, TextInput, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Theme } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useTaskStore, Target } from '@/store/useTaskStore';
import { TargetCalendar } from '@/components/TargetCalendar';

export default function CalendarScreen() {
  const { colors } = useAppTheme();
  const styles = useStyles(colors);
  
  const targets = useTaskStore(state => state.targets);
  const addTarget = useTaskStore(state => state.addTarget);
  const toggleTarget = useTaskStore(state => state.toggleTarget);
  const deleteTarget = useTaskStore(state => state.deleteTarget);

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTarget, setNewTarget] = useState({ title: '', notes: '', color: Theme.colors.primary });

  const filteredTargets = targets.filter(t => t.deadline === selectedDate);
  const upcomingTargets = targets
    .filter(t => !t.completed && t.deadline >= new Date().toISOString().split('T')[0])
    .sort((a, b) => a.deadline.localeCompare(b.deadline));

  const handleCreateTarget = () => {
    if (newTarget.title.trim()) {
      addTarget({
        title: newTarget.title.trim(),
        notes: newTarget.notes.trim(),
        deadline: selectedDate,
        color: newTarget.color,
      });
      setNewTarget({ title: '', notes: '', color: Theme.colors.primary });
      setModalVisible(false);
    }
  };

  const colorsToPick = [
    Theme.colors.primary,
    Theme.colors.success,
    Theme.colors.danger,
    '#ED8936', // Orange
    '#9F7AEA', // Purple
    '#38B2AC', // Teal
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>Calendar</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.calendarCard}>
          <TargetCalendar 
            targets={targets} 
            selectedDate={selectedDate} 
            onSelectDate={setSelectedDate} 
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Targets for {new Date(selectedDate).toLocaleDateString('default', { month: 'short', day: 'numeric' })}</Text>
        </View>

        {filteredTargets.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No targets set for this day</Text>
          </View>
        ) : (
          filteredTargets.map(item => (
            <View key={item.id} style={styles.targetItem}>
              <TouchableOpacity style={styles.checkArea} onPress={() => toggleTarget(item.id)}>
                <View style={[styles.checkbox, item.completed && { backgroundColor: item.color, borderColor: item.color }]}>
                  {item.completed && <Feather name="check" size={14} color="white" />}
                </View>
              </TouchableOpacity>
              <View style={styles.targetInfo}>
                <Text style={[styles.targetTitle, item.completed && styles.completedText]}>{item.title}</Text>
                {item.notes ? <Text style={styles.targetNote}>{item.notes}</Text> : null}
              </View>
              <TouchableOpacity onPress={() => deleteTarget(item.id)}>
                <Feather name="trash-2" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          ))
        )}

        {upcomingTargets.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming Focus</Text>
            </View>
            {upcomingTargets.slice(0, 3).map(item => (
              <View key={item.id} style={styles.upcomingRow}>
                <View style={[styles.indicator, { backgroundColor: item.color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.upcomingTitle}>{item.title}</Text>
                  <Text style={styles.upcomingDate}>{new Date(item.deadline).toLocaleDateString('default', { month: 'short', day: 'numeric' })}</Text>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Feather name="plus" size={28} color="white" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Target</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Goal / Target Title</Text>
            <TextInput 
              style={styles.input} 
              placeholder="e.g. Complete Project Proposal" 
              placeholderTextColor={colors.textMuted}
              value={newTarget.title}
              onChangeText={text => setNewTarget(prev => ({ ...prev, title: text }))}
            />

            <Text style={styles.label}>Deadline</Text>
            <View style={styles.deadlineBox}>
               <Feather name="calendar" size={18} color={colors.primary} />
               <Text style={styles.deadlineText}>{new Date(selectedDate).toLocaleDateString(undefined, { dateStyle: 'long' })}</Text>
            </View>
            <Text style={styles.helper}>Tapping the calendar back changes this date.</Text>

            <Text style={styles.label}>Notes (Optional)</Text>
            <TextInput 
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]} 
              placeholder="What details should we remember?" 
              placeholderTextColor={colors.textMuted}
              multiline
              value={newTarget.notes}
              onChangeText={text => setNewTarget(prev => ({ ...prev, notes: text }))}
            />

            <Text style={styles.label}>Pick a Color</Text>
            <View style={styles.colorRow}>
              {colorsToPick.map(c => (
                <TouchableOpacity 
                  key={c} 
                  style={[styles.colorButton, { backgroundColor: c }, newTarget.color === c && styles.selectedColor]} 
                  onPress={() => setNewTarget(prev => ({ ...prev, color: c }))}
                />
              ))}
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleCreateTarget}>
              <Text style={styles.saveButtonText}>Mark Target</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const useStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.xl,
    paddingBottom: Theme.spacing.lg,
  },
  title: {
    fontFamily: Theme.typography.fontFamily.bold,
    fontSize: Theme.typography.sizes.xxl,
    color: colors.text,
  },
  content: {
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: 120,
  },
  calendarCard: {
    backgroundColor: colors.surface,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.sm,
    marginBottom: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeader: {
    marginBottom: Theme.spacing.md,
    marginTop: Theme.spacing.sm,
  },
  sectionTitle: {
    fontFamily: Theme.typography.fontFamily.bold,
    fontSize: Theme.typography.sizes.md,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  targetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: Theme.spacing.md,
    borderRadius: Theme.radius.md,
    marginBottom: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  targetInfo: {
    flex: 1,
    marginLeft: Theme.spacing.md,
  },
  targetTitle: {
    fontFamily: Theme.typography.fontFamily.bold,
    fontSize: Theme.typography.sizes.md,
    color: colors.text,
  },
  targetNote: {
    fontFamily: Theme.typography.fontFamily.regular,
    fontSize: Theme.typography.sizes.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkArea: {
    padding: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  emptyBox: {
    padding: Theme.spacing.xl,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: Theme.radius.md,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: colors.textMuted,
    marginBottom: Theme.spacing.lg,
  },
  emptyText: {
    color: colors.textMuted,
    fontFamily: Theme.typography.fontFamily.medium,
  },
  upcomingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  indicator: {
    width: 4,
    height: 32,
    borderRadius: 2,
    marginRight: Theme.spacing.md,
  },
  upcomingTitle: {
    fontFamily: Theme.typography.fontFamily.semiBold,
    fontSize: Theme.typography.sizes.md,
    color: colors.text,
  },
  upcomingDate: {
    fontSize: Theme.typography.sizes.xs,
    color: colors.textMuted,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: Theme.radius.xl,
    borderTopRightRadius: Theme.radius.xl,
    padding: Theme.spacing.lg,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  modalTitle: {
    fontFamily: Theme.typography.fontFamily.bold,
    fontSize: Theme.typography.sizes.xl,
    color: colors.text,
  },
  label: {
    fontFamily: Theme.typography.fontFamily.bold,
    fontSize: Theme.typography.sizes.sm,
    color: colors.text,
    marginBottom: Theme.spacing.sm,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: Theme.radius.md,
    padding: Theme.spacing.md,
    fontFamily: Theme.typography.fontFamily.medium,
    color: colors.text,
    marginBottom: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  deadlineBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: Theme.spacing.md,
    borderRadius: Theme.radius.md,
    marginBottom: 4,
    gap: 12,
  },
  deadlineText: {
    fontFamily: Theme.typography.fontFamily.bold,
    color: colors.text,
  },
  helper: {
    fontSize: 10,
    color: colors.textMuted,
    marginBottom: Theme.spacing.lg,
    marginLeft: 4,
  },
  colorRow: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.xl,
  },
  colorButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: '#000',
  },
  saveButton: {
    backgroundColor: colors.primary,
    padding: Theme.spacing.lg,
    borderRadius: Theme.radius.lg,
    alignItems: 'center',
  },
  saveButtonText: {
    fontFamily: Theme.typography.fontFamily.bold,
    color: 'white',
    fontSize: Theme.typography.sizes.md,
  }
});
