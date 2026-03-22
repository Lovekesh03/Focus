import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Theme } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';

interface Target {
  id: string;
  deadline: string;
  color: string;
  completed: boolean;
}

interface TargetCalendarProps {
  targets: Target[];
  onSelectDate: (date: string) => void;
  selectedDate: string;
  onMonthChange?: (date: Date) => void;
}

const { width } = Dimensions.get('window');

export function TargetCalendar({ targets, onSelectDate, selectedDate, onMonthChange }: TargetCalendarProps) {
  const { colors } = useAppTheme();
  const styles = useStyles(colors);
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrev = () => {
    let nextDate;
    if (viewMode === 'month') {
      nextDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    } else {
      nextDate = new Date(currentMonth.getFullYear() - 1, currentMonth.getMonth(), 1);
    }
    setCurrentMonth(nextDate);
    onMonthChange?.(nextDate);
  };

  const handleNext = () => {
    let nextDate;
    if (viewMode === 'month') {
      nextDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    } else {
      nextDate = new Date(currentMonth.getFullYear() + 1, currentMonth.getMonth(), 1);
    }
    setCurrentMonth(nextDate);
    onMonthChange?.(nextDate);
  };

  const renderMonthHeader = () => {
    const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
    const yearName = currentMonth.getFullYear().toString();
    return (
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{viewMode === 'month' ? monthName : yearName}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => setViewMode(v => v === 'month' ? 'year' : 'month')} style={styles.viewToggle}>
            <Text style={styles.viewToggleText}>{viewMode === 'month' ? 'Year' : 'Month'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handlePrev} style={styles.navButton}>
            <Feather name="chevron-left" size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleNext} style={styles.navButton}>
            <Feather name="chevron-right" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderMonthView = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);
    const days = [];

    // Empty spaces before first day
    for (let i = 0; i < startDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.dayBox} />);
    }

    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isSelected = selectedDate === dateStr;
      const dayTargets = targets.filter(t => t.deadline === dateStr);
      
      days.push(
        <TouchableOpacity 
          key={dateStr} 
          style={[styles.dayBox, isSelected && styles.selectedDay]}
          onPress={() => onSelectDate(dateStr)}
        >
          <Text style={[styles.dayText, isSelected && styles.selectedDayText]}>{d}</Text>
          <View style={styles.dotContainer}>
            {dayTargets.map((t, idx) => (
              <View 
                key={t.id} 
                style={[
                  styles.targetDot, 
                  { backgroundColor: t.color },
                  t.completed && { opacity: 0.3 }
                ]} 
              />
            ))}
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.monthGrid}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
          <View key={day} style={styles.dayHeader}>
            <Text style={styles.dayHeaderText}>{day}</Text>
          </View>
        ))}
        {days}
      </View>
    );
  };

  const renderYearView = () => {
    const year = currentMonth.getFullYear();
    const months = [];
    for (let m = 0; m < 12; m++) {
      const monthDate = new Date(year, m, 1);
      const hasTargets = targets.some(t => {
        const d = new Date(t.deadline);
        return d.getFullYear() === year && d.getMonth() === m;
      });
      
      months.push(
        <TouchableOpacity 
          key={m} 
          style={[styles.miniMonth, hasTargets && { borderColor: colors.primary, borderWidth: 1 }]}
          onPress={() => {
            setCurrentMonth(monthDate);
            setViewMode('month');
          }}
        >
          <Text style={styles.miniMonthName}>{monthDate.toLocaleString('default', { month: 'short' })}</Text>
          <View style={styles.miniMonthGrid}>
             {/* Simple grid representation */}
             {Array.from({ length: 30 }).map((_, i) => (
               <View key={i} style={styles.miniDay} />
             ))}
          </View>
        </TouchableOpacity>
      );
    }
    return <View style={styles.yearGrid}>{months}</View>;
  };

  return (
    <View style={styles.container}>
      {renderMonthHeader()}
      {viewMode === 'month' ? renderMonthView() : renderYearView()}
    </View>
  );
}

const useStyles = (colors: any) => StyleSheet.create({
  container: {
    padding: Theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  headerTitle: {
    fontFamily: Theme.typography.fontFamily.bold,
    fontSize: Theme.typography.sizes.lg,
    color: colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  viewToggle: {
    backgroundColor: colors.border,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: Theme.radius.sm,
    marginRight: 4,
  },
  viewToggleText: {
    fontSize: Theme.typography.sizes.xs,
    fontFamily: Theme.typography.fontFamily.medium,
    color: colors.text,
  },
  navButton: {
    padding: 4,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayHeader: {
    width: (width - Theme.spacing.lg * 3) / 7,
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  dayHeaderText: {
    fontFamily: Theme.typography.fontFamily.semiBold,
    fontSize: Theme.typography.sizes.xs,
    color: colors.textMuted,
  },
  dayBox: {
    width: (width - Theme.spacing.lg * 3) / 7,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Theme.radius.md,
    marginBottom: 4,
  },
  selectedDay: {
    backgroundColor: colors.primary,
  },
  dayText: {
    fontFamily: Theme.typography.fontFamily.medium,
    fontSize: Theme.typography.sizes.md,
    color: colors.text,
  },
  selectedDayText: {
    color: colors.surface,
  },
  dotContainer: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
    height: 4,
    justifyContent: 'center',
  },
  targetDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  yearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.sm,
    justifyContent: 'space-between',
  },
  miniMonth: {
    width: '30%',
    backgroundColor: colors.surface,
    padding: Theme.spacing.sm,
    borderRadius: Theme.radius.md,
    marginBottom: Theme.spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  miniMonthName: {
    fontSize: Theme.typography.sizes.xs,
    fontFamily: Theme.typography.fontFamily.bold,
    color: colors.text,
    marginBottom: 4,
  },
  miniMonthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 1,
    justifyContent: 'center',
  },
  miniDay: {
    width: 3,
    height: 3,
    backgroundColor: colors.heatmapBase,
    borderRadius: 1,
  }
});
