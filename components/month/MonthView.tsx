import { useSettings } from '@/hooks/useSettings';
import { useTheme } from '@/hooks/useTheme';
import { CalendarDate } from '@/lib/data/time';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import DayCard from './DayCard';

export interface MonthlyCalendarProps {
  year: number;
  month: number;
  onDayPress?: (day: number) => void
}

export default function MonthView({ year, month, onDayPress }: MonthlyCalendarProps) {
  const theme = useTheme();
  const { settings } = useSettings();
  
  const baseDate = settings.weekStartsOn === 1 ? new Date(2024, 0, 1) : new Date(2023, 11, 31);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + i);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  });
  
  const monthName = new Date(year, month - 1, 1).toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });
  
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const daysInMonth = lastDay.getDate();
  
  let firstDayOfWeek = firstDay.getDay();
  firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  
  const calendarDays: (number | null)[] = [];
  
  if (settings.weekStartsOn === 0) {
    calendarDays.push(null);
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }
  
  const totalCells = Math.ceil(calendarDays.length / 7) * 7;
  while (calendarDays.length < totalCells) {
    calendarDays.push(null);
  }
  
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <Text style={[styles.monthTitle, { color: theme.text }]}>
          {monthName}
        </Text>
      </View>
      
      <View style={styles.weekDaysRow}>
        {weekDays.map((day, index) => (
          <Text key={index} style={[styles.weekDayLabel, { color: theme.textSecondary }]}>
            {day}
          </Text>
        ))}
      </View>
      
      <View style={styles.calendarGrid}>
        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} style={styles.weekRow}>
            {week.map((day, dayIndex) => {
              return day !== null ? (
                <DayCard
                  key={dayIndex}
                  day={day}
                  theme={theme}
                  isHighlighted={new CalendarDate(year, month, day).equals(CalendarDate.fromDateObject(new Date()))}
                  onPress={() => onDayPress && onDayPress(day)}
                />
              ) : (
                <DayCard
                  key={dayIndex}
                  day={day}
                  theme={theme}
                  isHighlighted={false}
                />
              )
            })}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 5
  },
  header: {
    borderBottomWidth: 1,
    paddingTop: 35,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  weekDaysRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginTop: 6,
  },
  weekDayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 12,
  },
  calendarGrid: {
    flex: 1,
    paddingHorizontal: 12,
    paddingBottom: 0,
  },
  weekRow: {
    flex: 1,
    flexDirection: 'row',
    marginBottom: 12,
  },
});
