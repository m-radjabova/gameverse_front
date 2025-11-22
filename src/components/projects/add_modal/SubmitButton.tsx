import { Button } from "@mui/material";
import type { ReactNode } from "react";

interface SubmitButtonProps {
  isEditing?: boolean;
  startIcon?: ReactNode;
  children: string;
}

function SubmitButton({ isEditing, startIcon, children }: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      fullWidth
      variant="contained"
      size="large"
      startIcon={startIcon}
      sx={{
        mb: 2,
        py: 1.5,
        borderRadius: 2,
        fontSize: "1rem",
        fontWeight: 600,
        backgroundColor: isEditing ? "#6366f1" : "#10b981",
        background: isEditing
          ? "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
          : "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
        boxShadow: isEditing
          ? "0 4px 15px rgba(99, 102, 241, 0.3)"
          : "0 4px 15px rgba(16, 185, 129, 0.3)",
        "&:hover": {
          background: isEditing
            ? "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)"
            : "linear-gradient(135deg, #34d399 0%, #10b981 100%)",
          boxShadow: isEditing
            ? "0 6px 20px rgba(99, 102, 241, 0.4)"
            : "0 6px 20px rgba(16, 185, 129, 0.4)",
          transform: "translateY(-1px)",
        },
        transition: "all 0.3s ease",
      }}
    >
      {children}
    </Button>
  );
}

export default SubmitButton;