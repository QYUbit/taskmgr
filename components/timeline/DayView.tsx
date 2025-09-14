import { useSettings } from "@/hooks/useSettings";
import { useTheme } from "@/hooks/useTheme";
import { useTimeline } from "@/hooks/useTimeline";
import { CalendarDate } from "@/lib/data/time";
import { TimelineItem } from "@/lib/types/ui";
import { useFocusEffect } from "expo-router";
import { useCallback, useRef } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View, ViewStyle } from "react-native";
import EventCard from "./EventCard";
import TimeColumn from "./TimeColumn";
import TimeIndicator from "./TimeIndicator";

interface DayViewProps {
  date?: CalendarDate;
  onEventPress?: (event: TimelineItem) => void;
}

export default function DayView({ date = CalendarDate.fromDateObject(new Date()), onEventPress}: DayViewProps) {
  const theme = useTheme();
  const { settings } = useSettings();
  const { timelineItems } = useTimeline(date);

  const scrollViewRef = useRef<ScrollView | null>(null)
  
  const getCurrentTimePosition = (): number => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    return (currentMinutes / (24 * 60)) * (24 * 60);
  };

  useFocusEffect(
    useCallback(() => {
      scrollViewRef.current?.scrollTo({ y: getCurrentTimePosition() })
    }, [])
  )
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.dateText, { color: theme.text }]}>
            {date.toDateObject().toLocaleDateString('en-US', { 
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
        ref={scrollViewRef}
      >
        <View style={styles.dayContainer}>
          <TimeColumn theme={theme} />
          
          <View style={styles.eventsContainer}>
            {timelineItems.map((event, index) => (
              <View
                key={`${event.id}-${index}`}
                style={[
                  styles.eventContainer,
                  {
                    top: (event.duration.start.toMinutes() / (24 * 60)) * (24 * 60),
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
            
            {settings.showCurrentTime && (
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
    paddingTop: 35,
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
