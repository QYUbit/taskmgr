import { Colors } from "@/constants/colors";
import { Todo } from "@/lib/types/data";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

export interface TodoCardProps {
  todo: Todo;
  onPress?: () => void;
  theme: Colors;
}

const letters = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

const daysToLetters = (days: number[]) => {
  return days.map(day => letters[day]).join(' ');
}

export default function TodoCard({ todo, onPress, theme }: TodoCardProps) {
  return (
    <TouchableOpacity style={[styles.container, { backgroundColor: theme.primary }]} onPress={onPress}>
      <Text style={[styles.text, { color: theme.lightText }]}>{todo.title}</Text>
      {
        todo.isTemplate ? (
          <Text style={[styles.detailsText, { color: theme.textSecondary }]}>
            Template
          </Text>
        ) : todo.repeatOn ? (
          <Text style={[styles.detailsText, { color: theme.textSecondary }]}>
            {daysToLetters(todo.repeatOn)}
          </Text>
        ) : null
      }
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 50,
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  text: {
    fontSize: 17
  },
  detailsText: {
    fontSize: 13
  }
});
