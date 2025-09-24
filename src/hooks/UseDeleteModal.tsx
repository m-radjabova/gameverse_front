import React from "react";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  size?: "sm" | "md";
}

const UseDeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Deletion",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
  size = "sm",
}) => {
  if (!isOpen) return null;

  const modalStyle = {
    position: "fixed" as const,
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(189, 184, 184, 0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
    animation: "fadeIn 0.2s ease-out",
    backdropFilter: "blur(4px)",
    WebkitBackdropFilter: "blur(4px)",
  };

  const contentStyle = {
    background: "#fff",
    padding: "24px",
    borderRadius: "16px",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.2)",
    position: "relative" as const,
    animation: "slideUp 0.25s ease-out",
    width: getWidthBySize(size),
    maxWidth: "90%",
    display: "flex",
    flexDirection: "column" as const,
    gap: "16px",
  };

  function getWidthBySize(size: string) {
    switch (size) {
      case "sm":
        return "400px";
      case "md":
        return "500px";
      default:
        return "400px";
    }
  }

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
        {/* Title */}
        <h2 style={titleStyle}>{title}</h2>

        {/* Message */}
        <p style={messageStyle}>{message}</p>

        {/* Buttons */}
        <div style={buttonWrapper}>
          <button style={cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button style={deleteBtn} onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const titleStyle = {
  margin: 0,
  fontSize: "1.25rem",
  fontWeight: 700,
  color: "#1a202c",
  textAlign: "center" as const,
};

const messageStyle = {
  fontSize: "1rem",
  color: "#4a5568",
  textAlign: "center" as const,
};

const buttonWrapper = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "12px",
  marginTop: "8px",
};

const cancelBtn = {
  background: "#edf2f7",
  color: "#1a202c",
  border: "none",
  borderRadius: "8px",
  padding: "10px 16px",
  cursor: "pointer",
  fontSize: "0.95rem",
  fontWeight: 500,
  transition: "all 0.2s ease",
};

const deleteBtn = {
  background: "#ef4444",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  padding: "10px 16px",
  cursor: "pointer",
  fontSize: "0.95rem",
  fontWeight: 600,
  transition: "all 0.2s ease",
};

export default UseDeleteModal;
