import { useEffect, useRef } from "react";
import { Animated, StyleSheet, TouchableWithoutFeedback } from "react-native";

export interface BackDropProps {
  isActive: boolean;
  onPress?: () => void;
}

export default function BackDrop({ isActive, onPress }: BackDropProps) {
  const backdropAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (isActive) {
      Animated.timing(backdropAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start()
    } else {
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start()
    }      
  }, [isActive])

  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <Animated.View
        style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            opacity: backdropAnim,
          }}
      />
    </TouchableWithoutFeedback>
  );
}
