import { useTheme } from "@/hooks/useTheme";
import { SafeAreaView, ScrollView, StyleSheet, Text, View, ViewStyle } from "react-native";
import EventCard from "./EventCard";
import TimeColumn from "./TimeColumn";
import TimeIndicator from "./TimeIndicator";

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

interface DayViewProps {
  date?: Date;
  events?: Event[];
  onEventPress?: (event: ProcessedEvent) => void;
  showCurrentTime?: boolean;
}

export default function DayView({ 
  date = new Date(), 
  events = [], 
  onEventPress,
  showCurrentTime = true 
}: DayViewProps) {
  const theme = useTheme();
  
  const getCurrentTimePosition = (): number => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    return (currentMinutes / (24 * 60)) * (24 * 60);
  };
  
  const sortedEvents: Event[] = events
    .filter((event: Event) => event.startTime >= 0 && event.endTime <= 24 * 60)
    .sort((a: Event, b: Event) => a.startTime - b.startTime);
  
  const processEvents = (events: Event[]): ProcessedEvent[] => {
    const processedEvents: ProcessedEvent[] = [];
    
    events.forEach((event: Event, index: number) => {
      const overlapping = events.filter((otherEvent: Event, otherIndex: number) => 
        otherIndex !== index &&
        ((event.startTime >= otherEvent.startTime && event.startTime < otherEvent.endTime) ||
         (event.endTime > otherEvent.startTime && event.endTime <= otherEvent.endTime) ||
         (event.startTime <= otherEvent.startTime && event.endTime >= otherEvent.endTime))
      );
      
      processedEvents.push({
        ...event,
        width: overlapping.length > 0 ? `${100 / (overlapping.length + 1)}%` : '95%',
        left: overlapping.length > 0 ? `${(overlapping.filter(e => e.startTime <= event.startTime).length * 100) / (overlapping.length + 1)}%` : '2.5%'
      });
    });
    
    return processedEvents;
  };
  
  const processedEvents: ProcessedEvent[] = processEvents(sortedEvents);
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.dateText, { color: theme.text }]}>
            {date.toLocaleDateString('de-DE', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
        </View>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.dayContainer}>
          <TimeColumn theme={theme} />
          
          <View style={styles.eventsContainer}>
            {processedEvents.map((event: ProcessedEvent, index: number) => (
              <View
                key={`${event.id}-${index}`}
                style={[
                  styles.eventContainer,
                  {
                    top: (event.startTime / (24 * 60)) * (24 * 60),
                    width: event.width,
                    left: event.left,
                  } as ViewStyle
                ]}
              >
                <EventCard
                  event={event}
                  theme={theme}
                  onPress={onEventPress}
                />
              </View>
            ))}
            
            {showCurrentTime && (
              <TimeIndicator
                time={getCurrentTimePosition()}
                theme={theme}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: {
    flex: 1,
  },
  header: {
    borderBottomWidth: 1,
    paddingTop: 32,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  themeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeButtonText: {
    fontSize: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 50,
  },
  dayContainer: {
    flexDirection: 'row',
    minHeight: 24 * 60,
  },
  eventsContainer: {
    flex: 1,
    position: 'relative',
  },
  eventContainer: {
    position: 'absolute',
    paddingHorizontal: 2,
  },
})
