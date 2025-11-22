import { useState } from "react";
import { FaTrash } from "react-icons/fa";
import useTasks from "../../hooks/useTasks";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import type { Task } from "../../types/types";
import AddTaskModal from "../projects/add_modal/AddTaskModal";
import SortableTask from "../projects/SortableTask";
import { ListTask } from "react-bootstrap-icons";
interface TaskListProps {
  tasks: Task[];
}

function TaskList({ tasks }: TaskListProps) {
  const { deleteTask } = useTasks();
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const handleTaskClick = (task: Task): void => {
    setSelectedTask(task);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (task: Task, e: React.MouseEvent): void => {
    e.stopPropagation();
    setTaskToDelete(task);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = (): void => {
    if (taskToDelete) {
      deleteTask(taskToDelete.id);
      setDeleteModalOpen(false);
      setTaskToDelete(null);
    }
  };

  const handleCancelDelete = (): void => {
    setDeleteModalOpen(false);
    setTaskToDelete(null);
  };

  const handleCloseEditModal = (): void => {
    setEditModalOpen(false);
    setSelectedTask(null);
  };

  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <ListTask className="empty-icon" />
        </div>
        <h3>No tasks yet</h3>
        <p>Add your first task to get started</p>
      </div>
    );
  }

  return (
    <div className="task-list-container">
      <div className="tasks-grid">
        {tasks.map((task) => (
          <SortableTask 
            key={task.id} 
            task={task}
            onTaskClick={handleTaskClick}
            onDeleteClick={handleDeleteClick}
          />
        ))}
      </div>

      <AddTaskModal 
        open={editModalOpen} 
        onClose={handleCloseEditModal} 
        task={selectedTask}
      />

      <Dialog
        open={deleteModalOpen}
        onClose={handleCancelDelete}
        className="delete-confirmation-modal"
        PaperProps={{
          className: "modal-paper",
        }}
      >
        <DialogTitle className="modal-title">
          <FaTrash className="title-icon" />
          Delete Task
        </DialogTitle>

        <DialogContent className="modal-content">
          <Typography className="modal-message">
            Are you sure you want to delete "
            <span className="task-name-highlight">
              {taskToDelete?.title || "this task"}
            </span>"?
            <br />
            <span className="warning-text">
              This action cannot be undone.
            </span>
          </Typography>
        </DialogContent>

        <DialogActions className="modal-actions">
          <Button
            onClick={handleCancelDelete}
            className="cancel-btn"
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            className="confirm-delete-btn"
            variant="contained"
            startIcon={<FaTrash />}
          >
            Delete Task
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default TaskList;