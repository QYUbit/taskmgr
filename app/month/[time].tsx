import MonthView from '@/components/month/MonthView';
import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';

export default function MonthScreen() {
  const { time } = useLocalSearchParams<{ time: string }>();
  const [year, month] = time.split('-').map(p => Number(p));

  const router = useRouter();

  const handleDayPress = (day: number) => {
    router.push(`/day/${year}-${month}-${day}` as Href)
  };
  
  return (
    <MonthView year={year} month={month} onDayPress={handleDayPress} />
  );
}
