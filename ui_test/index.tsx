import DayView from '@/components/timeline/DayView';
import React from 'react';

interface Event {
  id: number;
  title: string;
  startTime: number;
  endTime: number;
  color?: string;
}

interface ProcessedEvent extends Event {
  width: string;
  left: string;
}

const sampleEvents: Event[] = [
  {
    id: 1,
    title: 'Sleep',
    startTime: 0, // 09:00
    endTime: 7 * 60 + 20, // 10:30
    color: '#10B981'
  },
  {
    id: 2,
    title: 'Matrix',
    startTime: 8 * 60, // 12:00
    endTime: 13 * 60 + 30, // 13:00
    color: '#F59E0B'
  },
  {
    id: 3,
    title: 'Projektbesprechung',
    startTime: 14 * 60, // 14:00
    endTime: 15 * 60 + 30, // 15:30
    color: '#8B5CF6'
  },
  {
    id: 4,
    title: 'Code Review',
    startTime: 16 * 60, // 16:00
    endTime: 17 * 60, // 17:00
    color: '#EF4444'
  },
  {
    id: 5,
    title: 'Z',
    startTime: 23 * 60 + 30,
    endTime: 24 * 60,
  }
];

export default function DayScreen() {
  const handleEventPress = (event: ProcessedEvent): void => {
    console.log('Event pressed:', event.title);
  };
  
  return (
    <DayView
      date={new Date()}
      events={sampleEvents}
      onEventPress={handleEventPress}
      showCurrentTime={true}
    />
  );
}
