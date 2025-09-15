import { useSettings } from "@/hooks/useSettings";
import { useTheme } from "@/hooks/useTheme";
import { useTimeline } from "@/hooks/useTimeline";
import { CalendarDate } from "@/lib/data/time";
import { TimelineItem } from "@/lib/types/ui";
import Ionicons from '@expo/vector-icons/Ionicons';
import { Href, useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useRef } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";
import EventCard from "./EventCard";
import TimeColumn from "./TimeColumn";
import TimeIndicator from "./TimeIndicator";

interface DayViewProps {
  date: CalendarDate;
  onEventPress?: (event: TimelineItem) => void;
}

export default function DayView({ date, onEventPress}: DayViewProps) {
  const theme = useTheme();
  const router = useRouter();
  const { settings } = useSettings();
  const { timelineItems } = useTimeline(date);

  const scrollViewRef = useRef<ScrollView | null>(null)

  const dayString = date.toDateObject().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric'
  })
  
  const getCurrentTimePosition = (): number => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    return (currentMinutes / (24 * 60)) * (24 * 60) + 7;
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
            {dayString}
          </Text>
          <TouchableOpacity onPress={() => router.push(`/month/${date.year}-${date.month}` as Href)}>
            <Ionicons name="calendar" size={24} color={theme.text} />
          </TouchableOpacity>
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
                    top: event.top,
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
