import { Colors } from "@/constants/colors";
import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export interface NumberInputProps {
  value: number;
  onChange?: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  theme: Colors;
}

export default function NumberInput({ value, onChange, min, max, step = 1, theme }: NumberInputProps) {
  const [inputValue, setInputValue] = useState(value.toString());
  const [showControls, setShowControls] = useState(false);

  const handleBlur = () => {
    let num = parseInt(inputValue) || min;
    num = Math.max(min, Math.min(max, num));
    if (step > 1) {
      num = Math.round(num / step) * step;
    }
    setInputValue(num.toString());
    onChange && onChange(num);
  };

  const increment = () => {
    const newValue = Math.min(max, value + step);
    setInputValue(newValue.toString());
    onChange && onChange(newValue);
  };

  const decrement = () => {
    const newValue = Math.max(min, value - step);
    setInputValue(newValue.toString());
    onChange && onChange(newValue);
  };

  return (
    <View style={styles.numberInputContainer}>
      <TouchableOpacity
        onPress={decrement}
        onLongPress={() => setShowControls(true)}
        onPressOut={() => setShowControls(false)}
        style={[styles.controlButton, { backgroundColor: theme.surface }]}
      >
        <Text style={[styles.controlButtonText, { color: theme.text }]}>-</Text>
      </TouchableOpacity>

      <TextInput
        style={[styles.numberInput, {
          color: theme.text,
          backgroundColor: theme.surface,
          borderColor: theme.border
        }]}
        value={inputValue}
        onChangeText={setInputValue}
        onBlur={handleBlur}
        keyboardType="numeric"
        onFocus={() => setShowControls(true)}
        onPressIn={() => setShowControls(true)}
      />

      <TouchableOpacity
        onPress={increment}
        onLongPress={() => setShowControls(true)}
        onPressOut={() => setShowControls(false)}
        style={[styles.controlButton, { backgroundColor: theme.surface }]}
      >
        <Text style={[styles.controlButtonText, { color: theme.text }]}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  numberInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 120,
  },
  numberInput: {
    minWidth: 50,
    textAlign: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 4,
    fontSize: 16,
  },
  controlButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  controlButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
