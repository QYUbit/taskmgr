import { Colors } from "@/constants/colors";
import { forwardRef, useImperativeHandle, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type PickerProps = {
  options: string[];
  selectedOption?: string;
  onSelect: (option: string) => void;
  theme: Colors;
};

type PickerRef = {
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
};

const Picker = forwardRef<PickerRef, PickerProps>((props, ref) => {
  const { theme } = props;
  const [isOpen, setIsOpen] = useState(false);

  useImperativeHandle(ref, () => ({
    isOpen,
    toggle: () => setIsOpen(!isOpen),
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  }));

  return (
    <View style={[styles.container]}>
      <TouchableOpacity
        style={[styles.dropdown, { backgroundColor: theme.surface, borderColor: theme.border }]}
        onPress={() => setIsOpen(!isOpen)}
      >
        <Text style={[styles.text, { color: theme.text }]}>
          {props.selectedOption || 'Select an option'}
        </Text>
      </TouchableOpacity>

      {isOpen && (
        <View style={[styles.options, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {props.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.option}
              onPress={() => {
                props.onSelect(option);
                setIsOpen(false);
              }}
            >
              <Text style={[styles.optionText, {
                color: option === props.selectedOption ? theme.eventBackground : theme.text
              }]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { position: 'relative' },
  dropdown: {
    height: 40,
    borderWidth: 1,
    borderRadius: 4,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  text: { fontSize: 16 },
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
    paddingHorizontal: 10,
    paddingVertical: 10
  },
  optionText: {
    fontSize: 16
  },
});

export default Picker;