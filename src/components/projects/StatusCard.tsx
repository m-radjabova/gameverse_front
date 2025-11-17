import { Typography, Chip, Button } from '@mui/material';
import { FaPlus } from 'react-icons/fa';
import type { Status } from '../../types/types';
import './statusCard.css';
import { statusLabels } from '../../utils';

interface StatusCardProps {
  status: Status;
}

function StatusCard({ status }: StatusCardProps) {
  return (
    <div 
      className="status-card" 
      data-status={status.title}
    >
      <div className="status-indicator" />
      
      <div className="status-card-content">
        <Chip 
          className="status-badge"
          label={statusLabels[status.title] || status.title}
        />
        
        <Typography className="status-card-title">
          {statusLabels[status.title] || status.title} Project
        </Typography>

        <Button
          className="add-task-btn"
          variant="outlined"
          fullWidth
          startIcon={<FaPlus />}
        >
          Add Task
        </Button>
      </div>
    </div>
  );
}

export default StatusCard;