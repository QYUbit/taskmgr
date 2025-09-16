import DayView from "@/components/timeline/DayView";
import { CalendarDate } from "@/lib/data/time";
import { TimelineItem } from "@/lib/types/ui";
import { useLocalSearchParams } from "expo-router";

export default function DayScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();

  const handleEventPress = (event: TimelineItem) => {
    console.log('Event pressed:', event.title);
  };

  return (
    <DayView date={date ? CalendarDate.fromString(date) : CalendarDate.fromDateObject(new Date())} onEventPress={handleEventPress} />
  )
}
