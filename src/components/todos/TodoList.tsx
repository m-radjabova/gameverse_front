import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
  Typography,
  Button,
  Checkbox,
  Chip,
} from "@mui/material";
import type { Todo } from "../../types/types";
import { FaEdit, FaTrash } from "react-icons/fa";
import useTodos from "../../hooks/useTodos";

import { useState } from "react";
import TodoModal from "./TodoForm";
import { useNavigate } from "react-router-dom";

function TodoList() {
  const { todos, addTodos, updateTodo, deleteTodo, toggleTodo } = useTodos();
  const [open, setOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const navigate = useNavigate();

  const handleCreateTodo = () => {
    setSelectedTodo(null);
    setOpen(true);
  };

  const handleEditTodo = (todo: Todo) => {
    setSelectedTodo(todo);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedTodo(null);
  };

  const handleSubmit = (todo: Todo) => {
    if (todo.id) {
      updateTodo(todo);
    } else {
      addTodos(todo);
    }
    handleClose();
  };

  const handleDeleteTodo = (id: number) => {
    if (window.confirm("Are you sure you want to delete this todo?")) {
      deleteTodo(id);
    }
  };

  const handleToggleTodo = async (id: number) => {
    try {
      await toggleTodo(id);
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };
  return (
    <TableContainer component={Paper}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
        p={2}
      >
        <Button variant="contained" onClick={() => navigate(-1)}>Back</Button>
        <Typography variant="h4" component="h1">
          Todo Management
        </Typography>
        <Button variant="contained" onClick={handleCreateTodo} size="large">
          Create Todo
        </Button>
      </Box>
      <Table sx={{ minWidth: 650 }} aria-label="todo table">
        <TableHead>
          <TableRow>
            <TableCell>
              <strong>Status</strong>
            </TableCell>
            <TableCell>
              <strong>Title</strong>
            </TableCell>
            <TableCell>
              <strong>User ID</strong>
            </TableCell>
            <TableCell>
              <strong>Actions</strong>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {todos.map((todo) => (
            <TableRow
              key={todo.id}
              sx={{ 
                "&:last-child td, &:last-child th": { border: 0 },
                backgroundColor: todo.completed ? '#f8fff8' : 'inherit'
              }}
            >
              <TableCell>
                <Box display="flex" alignItems="center">
                  <Checkbox
                    checked={todo.completed}
                    onChange={() => handleToggleTodo(todo.id!)}
                    color="success"
                  />
                  <Chip
                    label={todo.completed ? "Completed" : "Pending"}
                    color={todo.completed ? "success" : "warning"}
                    size="small"
                  />
                </Box>
              </TableCell>
              <TableCell>
                <Typography 
                  variant="body1"
                  sx={{
                    textDecoration: todo.completed ? 'line-through' : 'none',
                    color: todo.completed ? 'text.secondary' : 'text.primary',
                    fontWeight: todo.completed ? 'normal' : 'medium'
                  }}
                >
                  {todo.title}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip label={`User ${todo.user_id}`} variant="outlined" />
              </TableCell>
              <TableCell>
                <Box display="flex" gap={1}>
                  <IconButton
                    color="primary"
                    onClick={() => handleEditTodo(todo)}
                    size="small"
                  >
                    <FaEdit />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteTodo(todo.id!)}
                    size="small"
                  >
                    <FaTrash />
                  </IconButton>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <TodoModal 
        isOpen={open} 
        onClose={handleClose} 
        onSubmit={handleSubmit} 
        editingTodo={selectedTodo}
      />
    </TableContainer>
  );
}

export default TodoList;