import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Chip, Button } from "@mui/material";
import { FaPlus } from "react-icons/fa";
import { statusLabels } from "../../utils";
import AddTaskModal from "./add_modal/AddTaskModal";
import TaskList from "../tasks/TaskList";
import type { StatusType, Task } from "../../types/types";

interface DroppableStatusCardProps {
  statusName: StatusType;
  tasks: Task[];
}

function StatusCard({ statusName, tasks }: DroppableStatusCardProps) {
  const [openAddTask, setOpenAddTask] = useState<boolean>(false);
  
  const { isOver, setNodeRef } = useDroppable({
    id: statusName,
  });

  const getStatusColor = (status: StatusType): string => {
    const statusMap: Record<string, string> = {
      'TODO': 'todo',
      'IN_PROGRESS': 'inprogress',
      'VERIFIED': 'verified', 
      'DONE': 'done'
    };
    
    const normalizedStatus = status.replace(/_/g, '').toUpperCase();
    return statusMap[normalizedStatus] || statusMap[status] || 'todo';
  };

  const formatStatusName = (status: string): string => {
    return statusLabels[status] || status.replace(/_/g, ' ');
  };

  const droppableStyle: React.CSSProperties = {
    opacity: isOver ? 0.8 : 1,
  };

  return (
    <>
      <div 
        className={`status-card ${isOver ? 'drag-over' : ''}`} 
        data-status={getStatusColor(statusName)}
        ref={setNodeRef}
        style={droppableStyle}
      >
        <div className="status-card-header">
          <div className="status-header-main">
            <div className="status-indicator" />
            <Chip
              className="status-badge"
              label={`${formatStatusName(statusName)} • ${tasks.length}`}
              style={{ 
                backgroundColor: isOver ? '#3b82f6' : undefined,
                color: isOver ? 'white' : undefined 
              }}
            />
          </div>
        </div>

        <div className="status-card-content" style={{ height: '100%' }}>
          <TaskList tasks={tasks} />
          
          <div className="add-task-section" style={{ marginTop: 'auto' }}>
            <Button
              className="add-task-btn"
              variant="outlined"
              fullWidth
              onClick={() => setOpenAddTask(true)}
              startIcon={<FaPlus />}
              style={{ marginTop: '16px' }}
            >
              Add Task
            </Button>
          </div>
        </div>
      </div>

      <AddTaskModal 
        open={openAddTask} 
        onClose={() => setOpenAddTask(false)} 
        defaultStatus={statusName} 
      />
    </>
  );
}

export default StatusCard;