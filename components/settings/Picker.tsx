import { Colors } from "@/constants/colors";
import { forwardRef, Key, useCallback, useImperativeHandle, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface PickerOptions {
  label: string;
  value: any;
}

export interface PickerProps {
  options: PickerOptions[];
  selectedValue: any;
  theme: Colors;
  onValueChange?: (newValue: any) => void
}

export interface PickerRef {
  isOpen: () => boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}


const Picker = forwardRef<PickerRef, PickerProps>(({ options, selectedValue, onValueChange, theme }, ref) => {
  const [showOptions, setShowOptions] = useState(false);
  const selectedOption = options.find(opt => opt.value === selectedValue);

  const open = useCallback(() => setShowOptions(true), []);
  const close = useCallback(() => setShowOptions(false), []);
  const toggle = useCallback(() => setShowOptions(p => !p), []);
  const isOpen = useCallback(() => showOptions, [showOptions]);

  useImperativeHandle(ref, () => ({
    open,
    close,
    toggle,
    isOpen
  }), [open, close, toggle, isOpen]);

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]}
      onPress={() => setShowOptions(!showOptions)}
    >
      <Text style={[styles.text, { color: theme.text }]}>
        {selectedOption?.label}
      </Text>

      {showOptions && (
        <View style={[styles.options, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.value as Key}
              style={styles.option}
              onPress={() => {
                onValueChange && onValueChange(option.value);
                setShowOptions(false);
              }}
            >
              <Text style={[styles.optionText, {
                color: option.value === selectedValue ? theme.primary : theme.text
              }]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    width: 120,
    height: 40,
    borderWidth: 1,
    borderRadius: 4,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  text: {
    fontSize: 16,
  },
  options: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: 4,
    zIndex: 10,
  },
  option: {
    padding: 10,
  },
  optionText: {
    fontSize: 16,
  },
});

export default Picker;
