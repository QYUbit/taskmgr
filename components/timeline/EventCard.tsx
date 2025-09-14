import { Colors } from "@/constants/colors";
import { TimelineItem } from "@/lib/types/ui";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface EventCardProps {
  event: TimelineItem;
  theme: Colors;
  onPress?: (event: TimelineItem) => void;
}

export default function EventCard({ event, theme, onPress }: EventCardProps) {
  const eventHeight = Math.max((event.duration.end.toMinutes() - event.duration.start.toMinutes()), 30);

  return (
    <TouchableOpacity
      style={[
        styles.event,
        {
          backgroundColor: /*event.color ||*/ theme.eventBackground,
          opacity: event.isGhost ? 0.4 : 1,
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
        {event.duration.start.toString()} - {event.duration.end.toString()}
      </Text>
    </TouchableOpacity>
  );
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
