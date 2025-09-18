import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import { Dimensions, Keyboard, StyleSheet, View, ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { Extrapolation, interpolate, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import AnimatedBackDrop from './BackDrop';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const MAX_TRANSLATE_Y = -SCREEN_HEIGHT + 50;

interface Props {
  canClose?: boolean;
  children?: React.ReactNode;
  handleStyle?: ViewStyle;
  handleBarColor?: string;
  startY?: number;
  snapPoints?: number[];
  backDropColor?: string;
  avoidKeyboard?: boolean;
  onSnap?: (height: number) => void;
  onClose?: () => void;
}

export interface BottomSheetRefProps {
  scrollTo: (destination: number) => void;
  close: () => void;
  isActive: () => boolean;
  getHeight: () => number;
}

const BottomSheet = forwardRef<BottomSheetRefProps, Props>(({
  children,
  handleStyle,
  handleBarColor = 'black',
  backDropColor = 'rgba(0, 0, 0, 0.5)',
  canClose = true,
  startY = 0,
  snapPoints = [MAX_TRANSLATE_Y],
  avoidKeyboard = true,
  onSnap,
  onClose
}, ref) => {
  const translateY = useSharedValue(startY);
  const active = useSharedValue(startY !== 0);

  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const scrollTo = useCallback((destination: number) => {
    'worklet';
    if (canClose) {
      active.value = destination !== 30
    } else {
      active.value = destination !== -30
    }
    translateY.value = withSpring(destination);
  }, []);

  const close = useCallback(() => {
    scrollTo(canClose? 30: -30);
  }, []);

  const isActive = useCallback(() => {
    return active.value;
  }, []);
  
  const getHeight = useCallback(() => {
    return translateY.value;
  }, []);

  useImperativeHandle(ref, () => ({
    scrollTo,
    close,
    isActive,
    getHeight
  }), [scrollTo, close, isActive, getHeight]);

  const context = useSharedValue({ y: 0 });
  
  const gesture = Gesture.Pan()
  .onStart(() => {
    context.value = { y: translateY.value };
  })
  .onUpdate((event) => {
    translateY.value = event.translationY + context.value.y;
    translateY.value = Math.max(translateY.value, MAX_TRANSLATE_Y);
  })
  .onEnd(() => {
    let closestSnapPoint = 0;
    let smallestDistance = Infinity;
    
    for (const point of snapPoints) {
      const distance = Math.abs(Math.abs(translateY.value) - Math.abs(point));
      if (distance < smallestDistance) {
        smallestDistance = distance;
        closestSnapPoint = point;
      }
    }
    
    if (smallestDistance <= Math.abs(0 - translateY.value)) {
      translateY.value = withSpring(closestSnapPoint);
      if (!canClose) {
        active.value = true;
      }
      if (onSnap) scheduleOnRN(() => onSnap(closestSnapPoint));
    } else {
      translateY.value = withSpring(canClose? 30: -30);
      active.value = false;
      if (onClose) scheduleOnRN(() => onClose());
    }
  });
  
  const rBottomSheetStyle = useAnimatedStyle(() => {
    let adjustedTranslateY = translateY.value;
    if (avoidKeyboard) {
      adjustedTranslateY -= keyboardHeight;
    }

    const borderRadius = interpolate(
      translateY.value,
      [MAX_TRANSLATE_Y + 50, MAX_TRANSLATE_Y],
      [25, 15],
      Extrapolation.CLAMP
    );
    
    return {
      borderRadius: borderRadius,
      transform: [{ translateY: adjustedTranslateY }],
    };
  });
  
  return (
    <>
      <AnimatedBackDrop
        active={active}
        backgroundColor={backDropColor}
        onTap={() => {
          scrollTo(canClose? 30: -30);
          if (onClose) onClose();
        }}
      />
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.bottomSheetContainer, rBottomSheetStyle, handleStyle]}>
          <View style={[styles.line, {backgroundColor: handleBarColor}]} />
          {children}
        </Animated.View>
      </GestureDetector>
    </>
  );
});

const styles = StyleSheet.create({
  bottomSheetContainer: {
    height: SCREEN_HEIGHT,
    width: '100%',
    backgroundColor: 'red',
    position: 'absolute',
    top: SCREEN_HEIGHT,
    borderRadius: 25,
  },
  line: {
    width: 75,
    height: 4,
    alignSelf: 'center',
    marginVertical: 15,
    borderRadius: 2,
  },
});

export default BottomSheet;