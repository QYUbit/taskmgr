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

const letters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

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
  const [tab, setTab] = useState<'general' | 'schedule' | 'alarm'>('general');

  const bottomSheetRef = useRef<BottomSheetRefProps>(null);
  const titleInputRef = useRef<TextInput>(null);
  const descriptionInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.scrollTo(-600);

      setTab('general');

      if (!todo) {
        setTimeout(() => titleInputRef.current?.focus(), 100);
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

  const handleTabChange = (newTab: 'general' | 'schedule' | 'alarm') => {
    titleInputRef.current?.blur();
    descriptionInputRef.current?.blur();
    setTab(newTab);
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      handleStyle={{backgroundColor: theme.background}}
      handleBarColor={theme.textSecondary}
      snapPoints={[-600, -300]}
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
          
          <View style={[styles.tabBubbles, {backgroundColor: theme.surface}]}>
            <TouchableOpacity
              onPress={() => handleTabChange('general')}
              style={[styles.tabBubble, {backgroundColor: tab === 'general' ? theme.secondary : undefined}]}
            >
              <Text style={{fontSize: 15, color: theme.lightText}}>
                General
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleTabChange('schedule')}
              style={[styles.tabBubble, {backgroundColor: tab === 'schedule' ? theme.secondary : undefined}]}
            >
              <Text style={{fontSize: 15, color: theme.lightText}}>
                Schedule
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleTabChange('alarm')}
              style={[styles.tabBubble, {backgroundColor: tab === 'alarm' ? theme.secondary : undefined}]}
            >
              <Text style={{fontSize: 15, color: theme.lightText}}>
                Alarm
              </Text>
            </TouchableOpacity>
          </View>
          
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

      {tab === 'general' && (
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
      )}

      {tab === 'schedule' && (
        <ScrollView
          style={styles.form}
          contentContainerStyle={styles.formContent}
          keyboardShouldPersistTaps="handled"
        >
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

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Repeat On</Text>
            <View style={styles.bubbleButtons}>
              {letters.map((letter, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => repeatOn.includes(i) ? setRepeatOn(repeatOn.filter(x => x !== i)) : setRepeatOn([...repeatOn, i])}
                  style={[styles.bubbleButton, {backgroundColor: repeatOn.includes(i) ? theme.primary : theme.surface}]}
                >
                  <Text style={[styles.bubbleText, {color: theme.lightText}]}>{letter}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      )}

      {tab === 'alarm' && (
        <ScrollView
          style={styles.form}
          contentContainerStyle={styles.formContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={{color: theme.text}}>Comming Soon</Text>
        </ScrollView>
      )}

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
  tabBubbles: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    borderRadius: 50
  },
  tabBubble: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 50,
  },
  bubbleButtons: {
    display: 'flex',
    alignItems: 'baseline',
    flexDirection: 'row',
    gap: 7,
  },
  bubbleButton: {
    padding: 6,
    width: 36,
    borderRadius: 50
  },
  bubbleText: {
    fontSize: 16,
    textAlign: 'center',
  }
});
