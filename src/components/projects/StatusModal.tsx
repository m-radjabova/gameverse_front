import { Drawer, Box, Typography, Button, IconButton } from '@mui/material';
import useTaskStatus from "../../hooks/useTaskStatus";
import { useState, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import StatusOption from './StatusOptions';
import { colors, statusLabels } from '../../utils';

interface StatusModalProps {
  open: boolean;
  onClose: () => void;
}

function StatusModal({ open, onClose }: StatusModalProps) {
  const { statusType, addTaskStatus, existingStatusTypes } = useTaskStatus();
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  useEffect(() => {
    if (open) {
      setSelectedStatus('');
    }
  }, [open]);

  const handleCreate = () => {
    if (selectedStatus && !isStatusDisabled(selectedStatus)) {
      addTaskStatus(selectedStatus);
      onClose();
      setSelectedStatus('');
    }
  };

  const isStatusDisabled = (status: string): boolean => {
    return existingStatusTypes.includes(status);
  };

  const handleStatusSelect = (status: string) => {
    if (!isStatusDisabled(status)) {
      setSelectedStatus(status);
    }
  };

  const getButtonBackground = () => {
    if (!selectedStatus) return 'rgba(255, 255, 255, 0.1)';
    if (isStatusDisabled(selectedStatus)) return 'rgba(255, 255, 255, 0.1)';
    return `linear-gradient(135deg, ${colors[selectedStatus]} 0%, ${colors[selectedStatus]}dd 100%)`;
  };

  const getButtonShadow = () => {
    if (!selectedStatus) return 'none';
    if (isStatusDisabled(selectedStatus)) return 'none';
    return `0 4px 20px ${colors[selectedStatus]}40`;
  };

  const isCreateButtonDisabled = !selectedStatus || isStatusDisabled(selectedStatus);

  return (
    <Drawer 
      anchor="right" 
      open={open} 
      onClose={onClose}
      className="status-modal-drawer"
    >
      <Box className="status-modal-container" sx={{ p: 3, width: 400 }}>
        <IconButton 
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <IoMdClose />
        </IconButton>

        <Typography variant="h4" sx={{ mb: 2 }}>
          Create New Project
        </Typography>

        <Box sx={{ mb: 3 }}>
          {statusType.map((st: string) => (
            <StatusOption
              key={st}
              title={st}
              selected={selectedStatus === st}
              onClick={() => handleStatusSelect(st)}
              disabled={isStatusDisabled(st)}
            />
          ))}
        </Box>

        <Button
          fullWidth
          variant="contained"
          onClick={handleCreate}
          disabled={isCreateButtonDisabled}
          sx={{
            background: getButtonBackground(),
            boxShadow: getButtonShadow(),
            '&:hover': {
              background: getButtonBackground(),
              boxShadow: selectedStatus && !isStatusDisabled(selectedStatus) 
                ? `0 8px 30px ${colors[selectedStatus]}60` 
                : 'none',
            },
            '&.Mui-disabled': {
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.3)',
              boxShadow: 'none'
            }
          }}
        >
          {isCreateButtonDisabled 
            ? isStatusDisabled(selectedStatus) 
              ? 'This status already exists' 
              : 'Select Status to Continue'
            : `Create ${statusLabels[selectedStatus] || selectedStatus} Project`
          }
        </Button>
      </Box>
    </Drawer>
  );
}

export default StatusModal;