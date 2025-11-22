import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FaUser, FaFlag, FaCalendarAlt, FaTrash } from "react-icons/fa";
import { formatDate, getPriorityColor } from "../../utils";
import type { Task } from "../../types/types";

interface SortableTaskProps {
  task: Task;
  onTaskClick: (task: Task) => void;
  onDeleteClick: (task: Task, e: React.MouseEvent) => void;
}

function SortableTask({ task, onTaskClick, onDeleteClick }: SortableTaskProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: task.id.toString(),
    });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="task-card"
      onClick={() => onTaskClick(task)}
    >
      <div className="task-header">
        <div className="task-title-section">
          <h3 className="task-title">{task.title}</h3>

          <div className="task-meta">
            {task.assignees && task.assignees.length > 0 && (
              <div className="meta-item assignee-info">
                <FaUser className="meta-icon user-icon" />
                <div className="assignees-container">
                  {task.assignees.length === 1 ? (
                    // 1 ta user bo'lsa - to'liq ismi
                    <span
                      className="single-user-name"
                      title={task.assignees[0].username}
                    >
                      {task.assignees[0].username}
                    </span>
                  ) : task.assignees.length === 2 ? (
                    // 2 ta user bo'lsa - qisqartirilgan ismlari
                    <div className="two-users-names">
                      {task.assignees.map((user, index) => (
                        <span
                          key={user.id}
                          className="user-name-short"
                          title={user.username}
                        >
                          {user.username.split(" ")[0]}
                          {index < task.assignees.length - 1 && ", "}
                        </span>
                      ))}
                    </div>
                  ) : (
                    // 3+ ta user bo'lsa - avatar lar
                    <>
                      {task.assignees.slice(0, 3).map((user, index) => (
                        <div
                          key={user.id}
                          className="user-avatar"
                          style={{
                            zIndex: task.assignees.length - index,
                            marginLeft: index > 0 ? "-8px" : "0",
                          }}
                          title={user.username}
                        >
                          {user.username
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </div>
                      ))}
                      {task.assignees.length > 3 && (
                        <div className="user-avatar more-count">
                          +{task.assignees.length - 3}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {task.priority && (
              <div
                className={`meta-item priority-info ${getPriorityColor(
                  task.priority
                )}`}
              >
                <FaFlag className="meta-icon flag-icon" />
                <span className="meta-text">{task.priority}</span>
              </div>
            )}
          </div>
        </div>

        <div className="task-actions">
          <button
            className="delete-task-btn"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteClick(task, e);
            }}
            aria-label="Delete task"
          >
            <FaTrash className="delete-icon" />
          </button>
        </div>
      </div>

      {task.end_date && (
        <div className="task-due-date">
          <FaCalendarAlt className="date-icon" />
          <span className="date-text">End: {formatDate(task.end_date)}</span>
        </div>
      )}
    </div>
  );
}

export default SortableTask;
