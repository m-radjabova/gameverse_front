import { useEffect, useState } from "react";
import apiClient from "../apiClient/apiClient";
import type { Todo } from "../types/types";

function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    getTodos();
  }, []);

  const getTodos = async () => {
    try {
      const response = await apiClient.get("/todos");
      setTodos(response.data);
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  };

  const addTodos = async (todo : Todo) => {
    try {
      const response = await apiClient.post("/todos", todo);
      setTodos([...todos, response.data]);
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  };

  const updateTodo = async (todo : Todo) => {
    try {
      const response = await apiClient.put(`/todos/${todo.id}`, todo);
      setTodos(todos.map((u) => (u.id === todo.id ? response.data : u)));
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  };

  const deleteTodo = async (id: number) => {
    try {
      await apiClient.delete(`/todos/${id}`);
      setTodos(todos.filter((todo) => todo.id !== id));
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  const toggleTodo = async (id: number) => {
    try {
      const response = await apiClient.patch(`/todos/${id}/toggle`);
      setTodos(prev => prev.map(t => t.id === id ? response.data : t));
      return response.data;
    } catch (error) {
      console.error('Error toggling todo:', error);
      throw error;
    }
  };

  return { todos, getTodos, addTodos, updateTodo, deleteTodo, toggleTodo };
}

export default useTodos;
