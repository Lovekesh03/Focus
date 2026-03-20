import { useAppTheme } from '@/hooks/useAppTheme';
import React from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { Theme } from '@/constants/theme';

export interface HeatmapData {
  date: string; // YYYY-MM-DD
  count: number;
}

interface CalendarHeatmapProps {
  data: HeatmapData[];
  days?: number;
}

export const CalendarHeatmap: React.FC<CalendarHeatmapProps> = ({ data, days = 90 }) => {
  const { colors } = useAppTheme();
  const styles = useStyles(colors);

  const dates = Array.from({ length: days }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    return d.toISOString().split('T')[0];
  });

  const getLevelColor = (count: number) => {
    if (count === 0) return colors.heatmapBase;
    if (count === 1) return colors.heatmapLevel1;
    if (count === 2) return colors.heatmapLevel2;
    if (count === 3) return colors.heatmapLevel3;
    return colors.heatmapLevel4;
  };

  const columns: string[][] = [];
  for (let i = 0; i < dates.length; i += 7) {
    columns.push(dates.slice(i, i + 7));
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Activity Map</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {columns.map((week, weekIndex) => (
          <View key={weekIndex} style={styles.column}>
            {week.map(date => {
              const dayData = data.find(d => d.date === date);
              const count = dayData ? dayData.count : 0;
              return (
                <View 
                  key={date} 
                  style={[styles.box, { backgroundColor: getLevelColor(count) }]} 
                />
              );
            })}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const useStyles = (colors: any) => StyleSheet.create({
  container: {
    marginVertical: Theme.spacing.md,
  },
  title: {
    fontFamily: Theme.typography.fontFamily.semiBold,
    fontSize: Theme.typography.sizes.md,
    color: colors.text,
    marginBottom: Theme.spacing.sm,
  },
  scrollContent: {
    flexDirection: 'row',
    gap: 4,
    paddingVertical: 4,
  },
  column: {
    gap: 4,
  },
  box: {
    width: 14,
    height: 14,
    borderRadius: 3,
  }
});
