import DayView from '@/components/timeline/DayView';
import { TimelineItem } from '@/lib/types/ui';
import React from 'react';

export default function DayScreen() {
  const handleEventPress = (event: TimelineItem): void => {
    console.log('Event pressed:', event.title);
  };
  
  return (
    <DayView onEventPress={handleEventPress} />
  );
}
