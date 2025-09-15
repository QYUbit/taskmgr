import { Colors } from "@/constants/colors";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

export interface DayCardProps {
  day: number | null;
  theme: Colors;
  isHighlighted: boolean;
  onPress?: () => void
}

export default function DayCard({ day, theme, isHighlighted, onPress }: DayCardProps) {
  return (
    <TouchableOpacity
      style={[styles.dayCard, { 
        backgroundColor: isHighlighted ? theme.eventBackground + "70" : theme.surface,
        borderColor: isHighlighted ? theme.eventBackground : theme.border,
      }]}
      onPress={() => day !== null && onPress ? onPress() : null}
    >
      {day && (
        <Text style={[styles.dayNumber, { color: theme.text }]}>
          {day}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  dayCard: {
    flex: 1,
    margin: 3,
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    minHeight: 50,
    alignItems: 'center'
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
})
