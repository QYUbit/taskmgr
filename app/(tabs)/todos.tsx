import Spinner from '@/components/ui/Spinner';
import TodoCard from '@/components/ui/TodoCard';
import { useTheme } from '@/hooks/useTheme';
import { useTodos } from '@/hooks/useTodos';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function SettingsRoute() {
  const theme = useTheme();
  const { todos, loading, error } = useTodos();

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
            onPress={() => console.log(`Todo ${todo.title} pressed`)}
            theme={theme}
            key={todo.id}
          />
        ))}
      </ScrollView>
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
