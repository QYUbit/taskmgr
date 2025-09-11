import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useEventOperations } from '../../hooks/useEvents';
import { useGhostEventOperations } from '../../hooks/useGhostEvents';
import { TimelineItem, useTimeline } from '../../hooks/useTimeline';
import { Event, GhostEvent } from '../../lib/db/types';

export default function TimelineScreen() {
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  
  const { timelineItems, loading, error, refetch } = useTimeline(selectedDate);
  const { renderGhostEvent } = useGhostEventOperations();
  const { markEventCompleted } = useEventOperations();

  const handleGhostEventPress = async (ghostEvent: GhostEvent) => {
    Alert.alert(
      'Ghost Event',
      `Do you want to schedule "${ghostEvent.title}" for ${ghostEvent.date}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Schedule',
          onPress: async () => {
            try {
              await renderGhostEvent(ghostEvent.id, ghostEvent.todoId, ghostEvent.date);
              refetch();
              Alert.alert('Success', 'Event has been scheduled!');
            } catch (error) {
              Alert.alert('Error', 'Failed to schedule event');
            }
          }
        }
      ]
    );
  };

  const handleEventPress = (event: Event) => {
    console.log('Open event details for:', event.title);
  };

  const handleEventComplete = async (event: Event) => {
    try {
      await markEventCompleted(event.id);
      refetch();
      Alert.alert('Completed', `"${event.title}" has been marked as completed!`);
    } catch (error) {
      Alert.alert('Error', 'Failed to complete event');
    }
  };

  const renderTimelineItem = (item: TimelineItem) => {
    const isGhost = 'isGhost' in item;
    const timeRange = item.timeRange;

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.timelineItem,
          isGhost && styles.ghostEvent,
          !isGhost && (item as Event).completedAt && styles.completedEvent
        ]}
        onPress={() => isGhost ? handleGhostEventPress(item as GhostEvent) : handleEventPress(item as Event)}
        onLongPress={() => !isGhost && handleEventComplete(item as Event)}
      >
        <View style={styles.timeColumn}>
          <Text style={[styles.timeText, isGhost && styles.ghostText]}>
            {timeRange.startTime}
          </Text>
          <Text style={[styles.timeText, isGhost && styles.ghostText]}>
            {timeRange.endTime}
          </Text>
        </View>
        
        <View style={styles.eventContent}>
          <Text style={[styles.eventTitle, isGhost && styles.ghostText]}>
            {item.title}
          </Text>
          <Text style={[styles.eventDescription, isGhost && styles.ghostText]}>
            {item.description}
          </Text>
          {isGhost && <Text style={styles.ghostLabel}>👻 Tap to schedule</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading timeline...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.dateHeader}>{selectedDate}</Text>
      
      <ScrollView style={styles.timeline}>
        {timelineItems.length === 0 ? (
          <Text style={styles.emptyState}>No events for this day</Text>
        ) : (
          timelineItems.map(renderTimelineItem)
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  dateHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  timeline: {
    flex: 1,
  },
  timelineItem: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  ghostEvent: {
    opacity: 0.6,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: 'transparent',
  },
  completedEvent: {
    opacity: 0.5,
    backgroundColor: '#e8f5e8',
  },
  timeColumn: {
    marginRight: 12,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  ghostText: {
    color: '#888',
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  eventDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  ghostLabel: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 4,
  },
  emptyState: {
    textAlign: 'center',
    color: '#888',
    marginTop: 40,
  },
});