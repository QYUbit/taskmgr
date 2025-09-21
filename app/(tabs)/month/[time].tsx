import MonthView from '@/components/month/MonthView';
import { CalendarDate } from '@/lib/utils/time';
import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';

export default function MonthScreen() {
  const { time } = useLocalSearchParams<{ time: string }>();

  const date = CalendarDate.current()

  const [year, month] = time
  ? time.split('-').map(p => Number(p))
  : [date.year, date.month];

  const router = useRouter();

  const handleDayPress = (day: number) => {
    router.push(`/day/${year}-${month}-${day}` as Href);
  };
  
  return (
    <MonthView year={year} month={month} onDayPress={handleDayPress} />
  );
}
