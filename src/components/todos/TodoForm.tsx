import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { Todo } from "../../types/types";
import UseModal from "../../hooks/useModal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (todo: Todo) => void;
  editingTodo: Todo | null;
}

const TodoModal: React.FC<Props> = ({ isOpen, onClose, onSubmit, editingTodo }) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<Todo>({
    defaultValues: {
      title: "",
      user_id: 1,
      completed: false,
    },
  });

  const completed = watch("completed");

  useEffect(() => {
    if (editingTodo) {
      reset(editingTodo);
    } else {
      reset({
        title: "",
        user_id: 1,
        completed: false,
      });
    }
  }, [editingTodo, reset, isOpen]);

  const submitHandler = (data: Todo) => {
    const newTodo = { ...data, id: editingTodo ? editingTodo.id : 0 };
    onSubmit(newTodo);
  };

  return (
    <UseModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingTodo ? "Update Todo" : "Create Todo"}
      size="md"
    >
      <form onSubmit={handleSubmit(submitHandler)} className="todo-form">
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            placeholder="Enter todo title"
            {...register("title", { 
              required: "Title is required", 
              minLength: { 
                value: 3, 
                message: "Title must be at least 3 characters" 
              },
              maxLength: {
                value: 255,
                message: "Title must be less than 255 characters"
              }
            })}
          />
          {errors.title && <span className="error">{errors.title.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="user_id">User ID *</label>
          <input
            type="number"
            id="user_id"
            placeholder="Enter user ID"
            {...register("user_id", { 
              required: "User ID is required", 
              min: { 
                value: 1, 
                message: "User ID must be at least 1" 
              },
              valueAsNumber: true
            })}
          />
          {errors.user_id && <span className="error">{errors.user_id.message}</span>}
        </div>

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              {...register("completed")}
            />
            <span className="checkmark"></span>
            Completed
          </label>
          {completed && (
            <div className="completed-note">
              This todo will be marked as completed
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="submit-btn">
            {editingTodo ? "Update Todo" : "Create Todo"}
          </button>
        </div>
      </form>
    </UseModal>
  );
};

export default TodoModal;