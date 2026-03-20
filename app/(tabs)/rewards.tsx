import { useAppTheme } from '@/hooks/useAppTheme';
import React, { useMemo } from 'react';
import { StyleSheet, View, Text, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '@/constants/theme';
import { useTaskStore } from '@/store/useTaskStore';
import { Feather } from '@expo/vector-icons';

const BADGES = [
  { id: '10_days', title: '10 Day Streak', days: 10, icon: 'star', color: '#FFD700' },
  { id: '30_days', title: '30 Day Streak', days: 30, icon: 'shield', color: '#C0C0C0' },
  { id: '50_days', title: '50 Day Streak', days: 50, icon: 'award', color: '#B8860B' },
];

export default function RewardsScreen() {
  const { colors } = useAppTheme();
  const styles = useStyles(colors);

  const tasks = useTaskStore(state => state.tasks);

  const bestStreak = useMemo(() => {
    const dateCounts: Record<string, number> = {};
    tasks.forEach(t => {
      if (t.completed) {
        const dateStr = new Date(t.createdAt).toISOString().split('T')[0];
        dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
      }
    });

    let best = 0;
    let tempStreak = 0;
    let today = new Date();
    
    for (let i = 0; i < 365; i++) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      
      if (dateCounts[dStr] && dateCounts[dStr] > 0) {
        tempStreak++;
        if (tempStreak > best) best = tempStreak;
      } else {
        tempStreak = 0;
      }
    }
    return best;
  }, [tasks]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>Reward Gallery</Text>
      </View>
      
      <FlatList
        data={BADGES}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => {
          const isUnlocked = bestStreak >= item.days;
          return (
            <View style={[styles.badgeCard, !isUnlocked && styles.lockedCard]}>
              <View style={[styles.iconContainer, !isUnlocked && styles.lockedIconContainer]}>
                <Feather 
                  name={item.icon as any} 
                  size={48} 
                  color={isUnlocked ? item.color : colors.textMuted} 
                />
              </View>
              <Text style={styles.badgeTitle}>{item.title}</Text>
              {!isUnlocked && (
                <Text style={styles.lockedText}>Need {item.days - bestStreak} more</Text>
              )}
            </View>
          );
        }}
      />
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
  listContent: {
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.md,
  },
  badgeCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  lockedCard: {
    opacity: 0.7,
    backgroundColor: colors.background,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    marginBottom: Theme.spacing.md,
  },
  lockedIconContainer: {
    backgroundColor: colors.border,
  },
  badgeTitle: {
    fontFamily: Theme.typography.fontFamily.semiBold,
    fontSize: Theme.typography.sizes.md,
    color: colors.text,
    textAlign: 'center',
  },
  lockedText: {
    fontFamily: Theme.typography.fontFamily.medium,
    fontSize: Theme.typography.sizes.sm,
    color: colors.textMuted,
    marginTop: Theme.spacing.xs,
  }
});
