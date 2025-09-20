import { Colors } from "@/constants/colors";
import { CalendarDate, DateRange, DayTime, TimeRange } from "@/lib/data/time";
import { NewTodo, Todo } from "@/lib/types/data";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import BottomSheet, { BottomSheetRefProps } from "../ui/BottomSheet";

export interface TodoSheetProps {
  todo?: Todo | null;
  visible: boolean;
  theme: Colors;
  onClose: () => void;
  onSave: (eventData: NewTodo | Partial<Todo>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export default function TodoSheet({
  todo,
  visible,
  theme,
  onClose,
  onSave,
  onDelete,
}: TodoSheetProps) {

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState(new DayTime(9, 0));
  const [endTime, setEndTime] = useState(new DayTime(10, 0));
  const [startDate, setStartDate] = useState<CalendarDate | null>(null);
  const [endDate, setEndDate] = useState<CalendarDate | null>(null);
  const [repeatOn, setRepeatOn] = useState<number[]>([]);

  const [saving, setSaving] = useState(false);
  const [startTimeSelect, setStartTimeSelect] = useState(false);
  const [endTimeSelect, setEndTimeSelect] = useState(false);
  const [startDateSelect, setStartDateSelect] = useState(false);
  const [endDateSelect, setEndDateSelect] = useState(false);

  const bottomSheetRef = useRef<BottomSheetRefProps>(null);
  const titleInputRef = useRef<TextInput>(null);
  const descriptionInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      if (todo) {
        bottomSheetRef.current?.scrollTo(-750);
      } else {
        bottomSheetRef.current?.scrollTo(-690);
      }

      if (!todo) {
        titleInputRef.current?.focus();
      }
    } else {
      handleClose();
    }
  }, [visible])

  useEffect(() => {
    if (todo) {
      setTitle(todo.title);
      setDescription(todo.description);
      setStartTime(todo.duration.start);
      setEndTime(todo.duration.end);
      setStartDate(todo.dateRange?.start ?? null);
      setEndDate(todo.dateRange?.end ?? null);
      setRepeatOn(todo.repeatOn);
    } else {
      setTitle('');
      setDescription('');
      const now = new Date();
      const currentHour = now.getHours();
      const nextHour = (currentHour + 1) % 24;
      setStartTime(new DayTime(currentHour, 0));
      setEndTime(new DayTime(nextHour, 0));
      setRepeatOn([]);
    }
  }, [todo]);

  const handleClose = () => {
    titleInputRef.current?.blur();
    descriptionInputRef.current?.blur();
    bottomSheetRef.current?.close();
  };
  
  const handleSave = async () => {
    if (!title.trim()) return;

    setSaving(true);
    try {
      const duration = new TimeRange(startTime, endTime);
      const dateRange = startDate || endDate
      ? new DateRange(startDate, endDate) : undefined;
      
      if (todo) {
        await onSave({
          ...todo,
          title: title.trim(),
          description: description.trim(),
          dateRange,
          duration,
          repeatOn,
        });
      } else {
        const newEvent: NewTodo = {
          title: title.trim(),
          description: description.trim(),
          dateRange,
          duration,
          repeatOn,
          isTemplate: false,
        };
        await onSave(newEvent);
      }

      onClose();
    } catch (error) {
      console.error('Failed to save event:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!todo || !onDelete) return;
    
    setSaving(true);
    try {
      await onDelete(todo.id);
      onClose();
    } catch (error) {
      console.error('Failed to delete event:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleTimeChange = (selected?: Date, type: 'start' | 'end' = 'start') => {
    if (type === 'start') {
      if (selected) setStartTime(DayTime.fromDateObject(selected));
      setStartTimeSelect(false);
    } else {
      if (selected) setEndTime(DayTime.fromDateObject(selected));
      setEndTimeSelect(false);
    }
  };

  const handleDateChange = (selected?: Date, type: 'start' | 'end' = 'start') => {
    if (type === 'start') {
      if (selected) setStartDate(CalendarDate.fromDateObject(selected));
      setStartDateSelect(false);
    } else {
      if (selected) setEndDate(CalendarDate.fromDateObject(selected));
      setEndDateSelect(false);
    }
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      handleStyle={{backgroundColor: theme.background}}
      handleBarColor={theme.textSecondary}
      snapPoints={todo? [-750, -300] : [-690, -300]}
      avoidKeyboard={false}
      onClose={onClose}
      onSnap={() => {
        titleInputRef.current?.blur();
        descriptionInputRef.current?.blur();
      }}
    >
      <View>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={theme.textSecondary} />
          </TouchableOpacity>
          
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            {todo ? 'Edit Task' : 'Create Task'}
          </Text>
          
          <TouchableOpacity
            onPress={handleSave}
            style={[styles.saveButton, { opacity: saving ? 0.5 : 1 }]}
            disabled={saving || !title.trim()}
          >
            <Text style={[styles.saveButtonText, { color: theme.primary }]}>
              Save
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView
          style={styles.form}
          contentContainerStyle={styles.formContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Title</Text>
            <TextInput
              style={[styles.input, { 
                color: theme.text,
                backgroundColor: theme.background,
                borderColor: theme.border
              }]}
              value={title}
              onChangeText={setTitle}
              placeholder="Event title"
              placeholderTextColor={theme.textSecondary}
              ref={titleInputRef}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea, { 
                color: theme.text,
                backgroundColor: theme.background,
                borderColor: theme.border
              }]}
              value={description}
              onChangeText={setDescription}
              placeholder="Add description (optional)"
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={3}
              ref={descriptionInputRef}
            />
          </View>

          <View style={styles.timeRow}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Start</Text>
              <TouchableOpacity onPress={() => setStartTimeSelect(true)} activeOpacity={0.8}>
                <View style={[styles.fakeInputContainer, {backgroundColor: theme.background, borderColor: theme.border}]}>
                  <Text style={{color: theme.text, fontSize: 15}}>{startTime.toString()}</Text>
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.timeSeparator}>
              <Ionicons name="arrow-forward" size={20} color={theme.background} />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>End</Text>
              <TouchableOpacity onPress={() => setEndTimeSelect(true)} activeOpacity={0.8}>
                <View style={[styles.fakeInputContainer, {backgroundColor: theme.background, borderColor: theme.border}]}>
                  <Text style={{color: theme.text, fontSize: 15}}>{endTime.toString()}</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.timeRow}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>From</Text>
              <TouchableOpacity onPress={() => setStartDateSelect(true)} activeOpacity={0.8}>
                <View style={[styles.fakeInputContainer, {backgroundColor: theme.background, borderColor: theme.border}]}>
                  <Text style={{color: theme.text, fontSize: 15}}>{startDate?.toString()}</Text>
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.timeSeparator}>
              <Ionicons name="arrow-forward" size={20} color={theme.background} />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>To</Text>
              <TouchableOpacity onPress={() => setEndDateSelect(true)} activeOpacity={0.8}>
                <View style={[styles.fakeInputContainer, {backgroundColor: theme.background, borderColor: theme.border}]}>
                  <Text style={{color: theme.text, fontSize: 15}}>{endDate?.toString()}</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {startTimeSelect && (
            <DateTimePicker
              value={startTime.toDateObject()}
              mode="time"
              display="clock"
              onChange={(_, selected) => handleTimeChange(selected, 'start')}
              style={{backgroundColor: theme.background}}
            />
          )}

          {endTimeSelect && (
            <DateTimePicker
              value={endTime.toDateObject()}
              mode="time"
              display="clock"
              onChange={(_, selected) => handleTimeChange(selected, 'end')}
            />
          )}

          {startDateSelect && (
            <DateTimePicker
              value={startDate?.toDateObject() ?? new Date()}
              mode="date"
              display="calendar"
              onChange={(_, selected) => handleDateChange(selected, 'start')}
            />
          )}

          {endDateSelect && (
            <DateTimePicker
              value={endDate?.toDateObject() ?? new Date()}
              mode="date"
              display="calendar"
              onChange={(_, selected) => handleDateChange(selected, 'end')}
            />
          )}

          {todo && onDelete && (
            <TouchableOpacity
              style={[styles.deleteButton, { borderColor: theme.red }]}
              onPress={handleDelete}
              disabled={saving}
            >
              <Ionicons name="trash-outline" size={20} color={theme.red} />
              <Text style={[styles.deleteButtonText, { color: theme.red }]}>
                Delete Task
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  saveButton: {
    padding: 4,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  form: {
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)'
  },
  formContent: {
    padding: 10,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  timeSeparator: {
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.03)',
    marginBottom: 5,
  },
  dateText: {
    fontSize: 14,
    marginLeft: 8,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 20,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  fakeInputContainer: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
});
