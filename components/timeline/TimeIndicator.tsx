import { Colors } from "@/constants/colors";
import { StyleSheet, View } from "react-native";

export default function TimeIndicator({ time, theme }: { time: number, theme: Colors }) {
  return (
    <>
      <View
        style={[
          styles.dot,
          {
            backgroundColor: theme.red,
            top: time - 4,
          }
        ]}
      />
      <View
        style={[
          styles.line,
          {
            backgroundColor: theme.red,
            top: time,
          }
        ]}
      />
    </>
  )
}

const styles = StyleSheet.create({
  dot: {
    position: 'absolute',
    left: 0,
    zIndex: 101,
    borderRadius: 10,
    height: 12,
    width: 12
  },
  line: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    borderRadius: 1.5,
    zIndex: 100,
  },
})
