import { FaCheckCircle, FaClock, FaChartLine } from "react-icons/fa";
import { green,orange, red } from "@mui/material/colors";


export const getAvatarColor = (name: string) => {
  const colors = [
    "#FF6B6B", // Red
    "#4ECDC4", // Teal
    "#FFD166", // Yellow
    "#06D6A0", // Green
    "#118AB2", // Blue
    "#EF476F", // Pink
    "#7209B7", // Purple
    "#F3722C", // Orange
    "#277DA1", // Dark Blue
    "#90BE6D", // Light Green
  ];
  const index = name.length % colors.length;
  return colors[index];
};

export const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export const getDebtColor = (amount: number) => {
  if (amount === 0) return "success";
  if (amount < 1000) return "warning";
  if (amount < 5000) return "info";
  return "error";
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatPhoneNumber = (phone: string) => {
  if (!phone) return "N/A";
  return phone.replace(/(\+998)(\d{2})(\d{3})(\d{2})(\d{2})/, "$1 $2 $3 $4 $5");
};

export const getStatusInfo = (status: boolean) => {
  if (status) {
    return {
      text: "Paid",
      color: "success" as const,
      icon: <FaCheckCircle />,
    };
  } else {
    return {
      text: "Pending",
      color: "warning" as const,
      icon: <FaClock />,
    };
  }
};

export const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid date";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};



export const getStatusColor = (status: boolean, remaining: number) => {
    if (remaining <= 0) return green[500];
    if (status) return orange[500];
    return red[500];
  };

export const getStatusIcon = (status: boolean, remaining: number) => {
    const iconStyle = { fontSize: 16, marginRight: 4 };
    if (remaining <= 0) return <FaCheckCircle style={iconStyle} />;
    if (status) return <FaClock style={iconStyle} />;
    return <FaChartLine style={iconStyle} />;
  };

export const getStatusText = (status: boolean, remaining: number) => {
    if (remaining <= 0) return "Fully Paid";
    if (status) return "In Progress";
    return "Pending";
  };