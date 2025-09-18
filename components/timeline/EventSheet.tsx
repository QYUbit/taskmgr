import { Colors } from '@/constants/colors';
import { CalendarDate, TimeRange } from '@/lib/data/time';
import { Event, NewEvent } from '@/lib/types/data';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';

interface EventFormSheetProps {
  visible: boolean;
  onClose: () => void;
  onSave: (eventData: NewEvent | Partial<Event>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  event?: Event | null;
  date: CalendarDate;
  theme: Colors;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function EventFormSheet({
  visible,
  onClose,
  onSave,
  onDelete,
  event,
  date,
  theme
}: EventFormSheetProps) {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description || '');
      setStartTime(event.duration.start.toString());
      setEndTime(event.duration.end.toString());
    } else {
      // Reset form for new event
      setTitle('');
      setDescription('');
      const now = new Date();
      const currentHour = now.getHours();
      const nextHour = (currentHour + 1) % 24;
      setStartTime(`${String(currentHour).padStart(2, '0')}:00`);
      setEndTime(`${String(nextHour).padStart(2, '0')}:00`);
    }
  }, [event]);

  useEffect(() => {
    if (visible) {
      console.log('visible')
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -SCREEN_HEIGHT/2,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      console.log("not visible")
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleSave = async () => {
    if (!title.trim()) return;

    setSaving(true);
    try {
      const duration = TimeRange.fromString(startTime, endTime);
      
      if (event) {
        // Update existing event
        await onSave({
          ...event,
          title: title.trim(),
          description: description.trim(),
          duration,
        });
      } else {
        // Create new event
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
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: backdropAnim,
            },
          ]}
        />
      </TouchableWithoutFeedback>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.surface,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
            
            <Text style={[styles.headerTitle, { color: theme.text }]}>
              {event ? 'Edit Event' : JSON.stringify(slideAnim)}
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
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  keyboardAvoid: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: SCREEN_HEIGHT * 0.9,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
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
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 100,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)'
  },
  formContent: {
    padding: 20,
    paddingBottom: 40,
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
    marginBottom: 20,
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