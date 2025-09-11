import React from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTodoOperations, useTodos } from '../../hooks/useTodos';
import { TimeConstraint, Todo } from '../../lib/db/types';

export default function TasksScreen() {
  const { todos, loading, error, refetch } = useTodos();
  const { deleteTodo, createTodo } = useTodoOperations();

  //useEffect(() => {
  //  createTodo({
  //      title: `Hey: ${Date.now()}`,
  //      description: "IDK",
  //      isRepeating: false,
  //      repeatOn: [0, 1, 2, 3, 4, 5, 6],
  //      timeConstraint: { type: "daily", duration: { startTime: "18:00", endTime: "21:00" } }
  //  }).then((id: string) => console.log(id))
  //}, [])

  const handleDeleteTodo = async (todo: Todo) => {
    Alert.alert(
      'Delete Todo',
      `Are you sure you want to delete "${todo.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTodo(todo.id);
              refetch();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete todo');
            }
          }
        }
      ]
    );
  };

  const getTimeConstraintText = (constraint: TimeConstraint): string => {
    switch (constraint.type) {
      case 'flexible':
        return 'Anytime';
      case 'daily':
        return `Daily ${constraint.duration.startTime}-${constraint.duration.endTime}`;
      case 'single_day':
        return `${constraint.date} ${constraint.duration.startTime}-${constraint.duration.endTime}`;
      case 'date_range':
        return `${constraint.dateRange.startDate} to ${constraint.dateRange.endDate}`;
    }
  };

  const getRepeatText = (todo: Todo): string => {
    if (!todo.isRepeating) return '';
    
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const repeatDays = todo.repeatOn.map(day => days[day]).join(', ');
    return `Repeats: ${repeatDays}`;
  };

  const renderTodo = ({ item }: { item: Todo }) => (
    <View style={styles.todoItem}>
      <TouchableOpacity 
        style={styles.todoContent}
        onPress={() => {/* Open todo details */}}
      >
        <Text style={styles.todoTitle}>{item.title}</Text>
        <Text style={styles.todoDescription}>{item.description}</Text>
        <Text style={styles.todoConstraint}>{getTimeConstraintText(item.timeConstraint)}</Text>
        {item.isRepeating && (
          <Text style={styles.todoRepeat}>{getRepeatText(item)}</Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => handleDeleteTodo(item)}
      >
        <Text style={styles.deleteButtonText}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading todos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={todos}
        keyExtractor={(item) => item.id}
        renderItem={renderTodo}
        ListEmptyComponent={
          <Text style={styles.emptyState}>No todos yet. Create your first todo!</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  todoItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  todoContent: {
    flex: 1,
  },
  todoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  todoDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  todoConstraint: {
    fontSize: 12,
    color: '#888',
    marginTop: 8,
  },
  todoRepeat: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    fontSize: 18,
  },
  emptyState: {
    textAlign: 'center',
    color: '#888',
    marginTop: 40,
  },
});