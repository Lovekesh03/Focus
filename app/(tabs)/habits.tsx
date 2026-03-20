import { useAppTheme } from '@/hooks/useAppTheme';
import React, { useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '@/constants/theme';
import { useTaskStore } from '@/store/useTaskStore';
import { CalendarHeatmap, HeatmapData } from '@/components/CalendarHeatmap';
import { Feather } from '@expo/vector-icons';

export default function HabitsScreen() {
  const { colors } = useAppTheme();
  const styles = useStyles(colors);

  const tasks = useTaskStore(state => state.tasks);

  const { heatmapData, currentStreak, bestStreak } = useMemo(() => {
    const dateCounts: Record<string, number> = {};
    tasks.forEach(t => {
      if (t.completed) {
        // Fallback or exact date mapping
        const dateStr = new Date(t.createdAt).toISOString().split('T')[0];
        dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
      }
    });

    const data: HeatmapData[] = Object.keys(dateCounts).map(date => ({
      date,
      count: dateCounts[date],
    }));

    let current = 0;
    let best = 0;
    let today = new Date();
    
    // Simplistic current streak math
    for (let i = 0; i < 365; i++) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      
      if (dateCounts[dStr] && dateCounts[dStr] > 0) {
        current++;
      } else if (i === 0) {
        // Today missing doesn't break the streak yet
        continue;
      } else {
        break;
      }
    }
    
    // Simplistic best streak math
    let tempStreak = 0;
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

    return { heatmapData: data, currentStreak: current, bestStreak: best };
  }, [tasks]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>Habits & Streaks</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Feather name="zap" size={24} color={colors.danger} style={styles.statIcon} />
            <Text style={styles.statNum}>{currentStreak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Feather name="award" size={24} color={colors.primary} style={styles.statIcon} />
            <Text style={styles.statNum}>{bestStreak}</Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </View>
        </View>

        <View style={styles.heatmapCard}>
          <CalendarHeatmap data={heatmapData} days={90} />
        </View>
      </ScrollView>
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
    paddingBottom: 100,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: Theme.spacing.lg,
    borderRadius: Theme.radius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statIcon: {
    marginBottom: Theme.spacing.sm,
  },
  statNum: {
    fontFamily: Theme.typography.fontFamily.bold,
    fontSize: Theme.typography.sizes.xxl,
    color: colors.text,
  },
  statLabel: {
    fontFamily: Theme.typography.fontFamily.medium,
    fontSize: Theme.typography.sizes.sm,
    color: colors.textMuted,
  },
  heatmapCard: {
    backgroundColor: colors.surface,
    padding: Theme.spacing.lg,
    borderRadius: Theme.radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  }
});
