import TodoCard from '@/components/todos/TodoCard';
import TodoSheet from '@/components/todos/TodoSheet';
import EpicButton from '@/components/ui/AddButton';
import Spinner from '@/components/ui/Spinner';
import { useTheme } from '@/hooks/useTheme';
import { useTodoOperations, useTodos } from '@/hooks/useTodos';
import { NewTodo, Todo } from '@/lib/types/data';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function SettingsRoute() {
  const theme = useTheme();
  const { todos, loading, error, refetch } = useTodos();
  const { createTodo, updateTodo, deleteTodo } = useTodoOperations();

  const [showTodoSheet, setShowTodoSheet] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);

  const handleTodoPress = (todo: Todo) => {
    setSelectedTodo(todo);
    setShowTodoSheet(true);
  };

  const handleOpenSheet = () => {
    setSelectedTodo(null);
    setShowTodoSheet(true);
  };

  const handleSaveEvent = async (todoData: NewTodo | Partial<Todo>) => {
    if ('id' in todoData) {
      await updateTodo(todoData.id || '', todoData);
    } else {
      await createTodo(todoData as NewTodo);
    }
    await refetch();
  };

  const handleDeleteEvent = async (id: string) => {
    await deleteTodo(id);
    await refetch();
  };

  if (loading) {
    return <Spinner theme={theme} />
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.headline, { color: theme.text }]}>
            Todos
          </Text>
        </View>
      </View>
      <ScrollView
        style={[{ backgroundColor: theme.background }]}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Event Presets</Text>
        {todos.map((todo) => (
          <TodoCard
            todo={todo}
            onPress={() => handleTodoPress(todo)}
            theme={theme}
            key={todo.id}
          />
        ))}
      </ScrollView>

      <EpicButton
        onPress={() => handleOpenSheet()}
        theme={theme}
        visible={!showTodoSheet}
      />
      
      <TodoSheet
        visible={showTodoSheet}
        onClose={() => {
          setShowTodoSheet(false);
          setSelectedTodo(null);
        }}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        todo={selectedTodo}
        theme={theme}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    borderBottomWidth: 1,
    paddingTop: 35,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headline: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 8
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
});
