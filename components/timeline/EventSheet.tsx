import { Colors } from '@/constants/colors';
import { CalendarDate, TimeRange } from '@/lib/data/time';
import { Event, NewEvent } from '@/lib/types/data';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import BottomSheet, { BottomSheetRefProps } from '../ui/BottomSheet';

interface EventFormSheetProps {
  visible: boolean;
  onClose: () => void;
  onSave: (eventData: NewEvent | Partial<Event>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  event?: Event | null;
  date: CalendarDate;
  theme: Colors;
}


export default function EventFormSheet({
  visible,
  onClose,
  onSave,
  onDelete,
  event,
  date,
  theme
}: EventFormSheetProps) {

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [saving, setSaving] = useState(false);

  const bottomSheetRef = useRef<BottomSheetRefProps | null>(null);

  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.scrollTo(-700);
    } else {
      bottomSheetRef.current?.close();
    }
  }, [visible])

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description || '');
      setStartTime(event.duration.start.toString());
      setEndTime(event.duration.end.toString());
    } else {
      setTitle('');
      setDescription('');
      const now = new Date();
      const currentHour = now.getHours();
      const nextHour = (currentHour + 1) % 24;
      setStartTime(`${String(currentHour).padStart(2, '0')}:00`);
      setEndTime(`${String(nextHour).padStart(2, '0')}:00`);
    }
  }, [event]);

  const handleSave = async () => {
    if (!title.trim()) return;

    setSaving(true);
    try {
      const duration = TimeRange.fromString(startTime, endTime);
      
      if (event) {
        await onSave({
          ...event,
          title: title.trim(),
          description: description.trim(),
          duration,
        });
      } else {
        const newEvent: NewEvent = {
          title: title.trim(),
          description: description.trim(),
          duration,
          date,
          sourceType: 'manual',
          isDismissed: false,
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
    if (!event || !onDelete) return;
    
    setSaving(true);
    try {
      await onDelete(event.id);
      onClose();
    } catch (error) {
      console.error('Failed to delete event:', error);
    } finally {
      setSaving(false);
    }
  };

  const validateTime = (time: string): string => {
    const parts = time.split(':');
    if (parts.length !== 2) return '00:00';
    
    const hours = Math.max(0, Math.min(23, parseInt(parts[0]) || 0));
    const minutes = Math.max(0, Math.min(59, parseInt(parts[1]) || 0));
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      handleStyle={{backgroundColor: theme.background}}
      handleBarColor={theme.textSecondary}
      snapPoints={[-700, -200]}
      onClose={onClose}
    >
      <View>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={theme.textSecondary} />
          </TouchableOpacity>
          
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            {event ? 'Edit Event' : 'Create Event'}
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
              autoFocus={!event}
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
            />
          </View>

          <View style={styles.timeRow}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Start</Text>
              <TextInput
                style={[styles.input, { 
                  color: theme.text,
                  backgroundColor: theme.background,
                  borderColor: theme.border
                }]}
                value={startTime}
                onChangeText={setStartTime}
                onBlur={() => setStartTime(validateTime(startTime))}
                placeholder="00:00"
                placeholderTextColor={theme.textSecondary}
                keyboardType="numbers-and-punctuation"
              />
            </View>


            <View style={styles.timeSeparator}>
              <Ionicons name="arrow-forward" size={20} color={theme.textSecondary} />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>End</Text>
              <TextInput
                style={[styles.input, { 
                  color: theme.text,
                  backgroundColor: theme.background,
                  borderColor: theme.border
                }]}
                value={endTime}
                onChangeText={setEndTime}
                onBlur={() => setEndTime(validateTime(endTime))}
                placeholder="00:00"
                placeholderTextColor={theme.textSecondary}
                keyboardType="numbers-and-punctuation"
              />
            </View>
          </View>

          <View style={styles.dateInfo}>
            <Ionicons name="calendar-outline" size={18} color={theme.textSecondary} />
            <Text style={[styles.dateText, { color: theme.textSecondary }]}>
              {date.toDateObject().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </Text>
          </View>

          {event && onDelete && (
            <TouchableOpacity
              style={[styles.deleteButton, { borderColor: theme.red }]}
              onPress={handleDelete}
              disabled={saving}
            >
              <Ionicons name="trash-outline" size={20} color={theme.red} />
              <Text style={[styles.deleteButtonText, { color: theme.red }]}>
                Delete Event
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
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
});