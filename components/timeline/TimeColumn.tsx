import { Colors } from "@/constants/colors";
import { StyleSheet, Text, View } from "react-native";

export default function TimeColumn({ theme }: { theme: Colors }) {
  const hours: number[] = Array.from({ length: 24 }, (_, i) => i);
  
  return (
    <View style={styles.seperator}>
      {hours.map((hour: number) => {
        return hour !== 25 ? (
          <View key={hour} style={styles.slot}>
            <Text style={[styles.text, { color: theme.textSecondary }]}>
              {hour.toString().padStart(2, '0')}:00
            </Text>
            <View style={[styles.line, { backgroundColor: theme.seperator }]} />
          </View>
        ) : (
          <View key={hour} style={styles.slot}></View>
        )
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  seperator: {
    width: 80,
    paddingRight: 10,
    paddingLeft: 10,
  },
  slot: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  text: {
    fontSize: 12,
    width: 50,
    textAlign: 'right',
    paddingRight: 8,
  },
  line: {
    flex: 1,
    height: 1,
    marginTop: 8,
  },
})