import { dbService } from '@/lib/db/service';
import { NewTodo, Todo } from '@/lib/types/data';
import { useCallback, useEffect, useState } from 'react';

export const useTodos = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTodos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const todosData = await dbService.getAllTodos();
      setTodos(todosData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load todos');
      setTodos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  return { 
    todos, 
    loading, 
    error, 
    refetch: loadTodos 
  };
};

export const useTodoOperations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTodo = async (todoData: NewTodo) => {
    try {
      setLoading(true);
      setError(null);
      const id = await dbService.createTodo(todoData);
      return id;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create todo';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateTodo = async (id: string, updates: Partial<Todo>) => {
    try {
      setLoading(true);
      setError(null);
      await dbService.updateTodo(id, updates);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update todo';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await dbService.deleteTodo(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete todo';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { 
    createTodo, 
    updateTodo, 
    deleteTodo, 
    loading, 
    error 
  };
};
