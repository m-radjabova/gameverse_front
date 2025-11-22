
import { IoMdFlag } from "react-icons/io";
import type { PriorityType } from "./components/projects/add_modal/AddTaskModal";

export const colors: Record<string, string> = {
  TODO: "#7f8c8d",
  INPROGRESS: "#3498db",
  VERIFIED: "#9b59b6",
  DONE: "#2ecc71",
};

export const statusLabels: Record<string, string> = {
  TODO: "To Do",
  INPROGRESS: "In Progress",
  VERIFIED: "Verified",
  DONE: "Done",
};

export const getPriorityIcon = (priority: PriorityType) => {
  const icons = {
    HIGH: <IoMdFlag className="text-red-400" />,
    MEDIUM: <IoMdFlag className="text-yellow-400" />,
    LOW: <IoMdFlag className="text-green-400" />,
  };
  return icons[priority] || null;
};

export const getPriorityColor = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case "high":
      return "priority-high";
    case "medium":
      return "priority-medium";
    case "low":
      return "priority-low";
    default:
      return "priority-default";
  }
};

export const formatDate = (dateString: string) => {
  if (!dateString) return "No date set";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};



export const inputStyles = {
  color: "white !important",
  "& .MuiOutlinedInput-root": {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 2,
    "& fieldset": {
      borderColor: "rgba(255,255,255,0.1)",
      borderWidth: "1.5px",
    },
    "&:hover fieldset": {
      borderColor: "rgba(99, 102, 241, 0.5)",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#6366f1",
      borderWidth: "2px",
    },
  },
  ".MuiInputBase-input": {
    color: "white",
  },
  "& .MuiFormHelperText-root": {
    color: "#ef4444",
    marginLeft: 0.5,
  },
};

export const selectStyles = {
  color: "white",
  backgroundColor: "rgba(255,255,255,0.03)",
  borderRadius: 2,
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(255,255,255,0.1)",
    borderWidth: "1.5px",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(99, 102, 241, 0.5)",
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#6366f1",
    borderWidth: "2px",
  },
  "& .MuiSelect-icon": {
    color: "rgba(255,255,255,0.5)",
  },
  
};