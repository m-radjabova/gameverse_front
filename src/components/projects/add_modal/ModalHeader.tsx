import { Box, Typography, IconButton } from "@mui/material";
import { IoMdCheckmarkCircle, IoMdClose } from "react-icons/io";
import { FaEdit } from "react-icons/fa";

interface ModalHeaderProps {
  isEditing?: boolean;
  onClose?: () => void;
  title?: string;
}

function ModalHeader({ isEditing, onClose, title }: ModalHeaderProps) {
  return (
    <Box
      sx={{
        mb: 4,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 1.5,
            backgroundColor: isEditing ? "#6366f1" : "#10b981",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "1.2rem",
            boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
          }}
        >
          {isEditing ? <FaEdit /> : <IoMdCheckmarkCircle />}
        </Box>
        <Box>
          <Typography variant="h5" sx={{ color: "white", fontWeight: 600, mb: 0.5 }}>
            {title || (isEditing ? "Edit Task" : "Create Task")}
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem" }}>
            {isEditing ? "Update your task details" : "Add a new task to your project"}
          </Typography>
        </Box>
      </Box>
      <IconButton onClick={onClose} sx={{ color: "rgba(255,255,255,0.6)" }}>
        <IoMdClose />
      </IconButton>
    </Box>
  );
}

export default ModalHeader;