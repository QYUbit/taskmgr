import { Colors } from "@/constants/colors";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

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

interface EventCardProps {
  event: ProcessedEvent;
  theme: Colors;
  onPress?: (event: ProcessedEvent) => void;
}

export default function EventCard({ event, theme, onPress }: EventCardProps) {
  const eventHeight = Math.max(((event.endTime - event.startTime) / 60) * 60, 30); // Min 30px height
  
  return (
    <TouchableOpacity
      style={[
        styles.event,
        {
          backgroundColor: event.color || theme.eventBackground,
          height: eventHeight,
        }
      ]}
      onPress={() => onPress && onPress(event)}
      activeOpacity={0.8}
    >
      <Text style={[styles.eventTitle, { color: theme.eventText }]} numberOfLines={1}>
        {event.title}
      </Text>
      <Text style={[styles.eventTime, { color: theme.eventText, opacity: 0.8 }]}>
        {formatTime(event.startTime)} - {formatTime(event.endTime)}
      </Text>
    </TouchableOpacity>
  );
};

const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

const styles = StyleSheet.create({
  event: {
    borderRadius: 12,
    padding: 12,
    margin: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 12,
    fontWeight: '400',
  },
})
