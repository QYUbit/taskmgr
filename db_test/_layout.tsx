import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { CalendarDate, DateRange, TimeRange } from '../lib/data/time';
import { dbService } from '../lib/db/service';
import { Event, NewEvent, NewTodo, Todo } from '../lib/types/data';

export default function TestDBScreen() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [todoTitle, setTodoTitle] = useState('Test Todo');
  const [eventTitle, setEventTitle] = useState('Test Event');
  const [eventDate, setEventDate] = useState('2024-01-16');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const todosData = await dbService.getAllTodos();
      const eventsData = await dbService.getEventsForDate(eventDate);
      setTodos(todosData);
      setEvents(eventsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const testCreateTodo = async () => {
    setLoading(true);
    try {
      const newTodo: NewTodo = {
        title: todoTitle,
        description: 'Test description',
        repeatOn: [],
        isTemplate: false,
        dateRange: DateRange.fromString('2024-01-15', '2024-01-20'),
        duration: TimeRange.fromString('09:00', '10:00')
      };

      await dbService.createTodo(newTodo);
      await loadData();
      Alert.alert('Success', 'Todo created');
    } catch (error: any) {
      Alert.alert('Error', `Failed to create todo: ${error.message}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const testCreateEvent = async () => {
    setLoading(true);
    try {
      const newEvent: NewEvent = {
        title: eventTitle,
        description: 'Test event description',
        date: CalendarDate.fromString(eventDate),
        duration: TimeRange.fromString('14:00', '15:00'),
        sourceType: 'manual',
        isDismissed: false
      };

      await dbService.createEvent(newEvent);
      await loadData();
      Alert.alert('Success', 'Event created');
    } catch (error: any) {
      Alert.alert('Error', `Failed to create event: ${error.message}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const testDeleteTodo = async (id: string) => {
    try {
      await dbService.deleteTodo(id);
      await loadData();
      Alert.alert('Success', 'Todo deleted');
    } catch (error: any) {
      Alert.alert('Error', `Failed to delete: ${error.message}`);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Test App</Text>

      {/* Test Controls */}
      <View style={styles.section}>
        <TextInput
          style={styles.input}
          value={todoTitle}
          onChangeText={setTodoTitle}
          placeholder="Todo title"
        />
        <TouchableOpacity
          style={[styles.button, styles.createButton]}
          onPress={testCreateTodo}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Create Todo</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          value={eventTitle}
          onChangeText={setEventTitle}
          placeholder="Event title"
        />
        <TextInput
          style={styles.input}
          value={eventDate}
          onChangeText={setEventDate}
          placeholder="Event date (YYYY-MM-DD)"
        />
        <TouchableOpacity
          style={[styles.button, styles.createButton]}
          onPress={testCreateEvent}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Create Event</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.refreshButton]}
          onPress={loadData}
        >
          <Text style={styles.buttonText}>Refresh Data</Text>
        </TouchableOpacity>
      </View>

      {/* Todos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Todos ({todos.length})</Text>
        {todos.map((todo) => (
          <View key={todo.id} style={styles.item}>
            <Text style={styles.itemTitle}>{todo.title}</Text>
            <Text>{todo.description}</Text>
            <Text>Duration: {todo.duration?.start?.toString()} - {todo.duration?.end?.toString()}</Text>
            <TouchableOpacity
              style={[styles.button, styles.deleteButton]}
              onPress={() => testDeleteTodo(todo.id)}
            >
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Events */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Events for {eventDate} ({events.length})</Text>
        {events.map((event) => (
          <View key={event.id} style={styles.item}>
            <Text style={styles.itemTitle}>{event.title}</Text>
            <Text>{event.description}</Text>
            <Text>Date: {event.date?.toString()}</Text>
            <Text>Time: {event.duration?.start?.toString()} - {event.duration?.end?.toString()}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: 'white',
  },
  button: {
    padding: 12,
    borderRadius: 5,
    marginBottom: 10,
  },
  createButton: {
    backgroundColor: '#007AFF',
  },
  refreshButton: {
    backgroundColor: '#34C759',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    marginTop: 5,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  item: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#eee',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
});