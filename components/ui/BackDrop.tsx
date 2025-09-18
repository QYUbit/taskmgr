import { StyleSheet } from "react-native";
import Animated, { SharedValue, useAnimatedStyle } from "react-native-reanimated";

interface Props {
  active: SharedValue<boolean>;
  onTap?: () => void;
  backgroundColor?: string;
}
  
export default function AnimatedBackDrop({ active, onTap, backgroundColor = 'rgba(255, 255, 255, 0.5)' }: Props) {
  const rBackdropStyle = useAnimatedStyle(() => {
    return {
      opacity: active.value ? 1 : 0,
      pointerEvents: active.value ? 'auto' : 'none',
    };
  });

  return (
    <Animated.View
      onTouchEnd={onTap}
      style={[StyleSheet.absoluteFill, rBackdropStyle, {backgroundColor: backgroundColor}]}
    />
  );
}
