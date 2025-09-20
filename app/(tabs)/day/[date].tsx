import DayView from "@/components/timeline/DayView";
import { CalendarDate } from "@/lib/data/time";
import { TimelineItem } from "@/lib/types/ui";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { ParamListBase } from "@react-navigation/native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useMemo } from "react";

export default function DayScreen() {
  const { date: dateParam } = useLocalSearchParams<{ date: string }>();

  const navigation = useNavigation<BottomTabNavigationProp<ParamListBase>>();

  const date = useMemo(
    () => dateParam
    ? CalendarDate.fromString(dateParam)
    : CalendarDate.fromDateObject(new Date()),
    [dateParam]
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener("tabPress", () => {
      if (navigation.isFocused()) {
        const today = CalendarDate.fromDateObject(new Date());
        navigation.setParams({ date: today.toString() });
      }
    });

    return unsubscribe;
  }, [navigation, date]);

  const handleEventPress = (event: TimelineItem) => {
    console.log('Event pressed:', event.title);
  };

  return (
    <DayView date={date} onEventPress={handleEventPress} />
  )
}
