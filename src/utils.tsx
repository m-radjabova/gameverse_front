import { FaCheckCircle, FaClock, FaChartLine } from "react-icons/fa";
import { green,orange, red } from "@mui/material/colors";


// utils/avatarColors.ts
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
  
  // Ismdagi harflar yig'indisiga qarab rang tanlash
  let sum = 0;
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i);
  }
  const index = sum % colors.length;
  return colors[index];
};

// Yoki ismning hash qiymatiga qarab rang tanlash
export const getAvatarColor2 = (name: string) => {
  const colors = [
    "#FF6B6B", "#4ECDC4", "#FFD166", "#06D6A0", "#118AB2",
    "#EF476F", "#7209B7", "#F3722C", "#277DA1", "#90BE6D",
    "#FF9A76", "#9B5DE5", "#00BBF9", "#00F5D4", "#FF97B7",
    "#FF9E00", "#00C49A", "#D62828", "#003049", "#F77F00"
  ];
  
  // Simple hash function for name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

// Eng yaxshi variant: Ismning birinchi harfidan rang tanlash
export const getAvatarColorByFirstLetter = (name: string) => {
  const colorMap: { [key: string]: string } = {
    'A': "#FF6B6B", // Red
    'B': "#4ECDC4", // Teal
    'C': "#FFD166", // Yellow
    'D': "#06D6A0", // Green
    'E': "#118AB2", // Blue
    'F': "#EF476F", // Pink
    'G': "#7209B7", // Purple
    'H': "#F3722C", // Orange
    'I': "#277DA1", // Dark Blue
    'J': "#90BE6D", // Light Green
    'K': "#FF9A76", // Coral
    'L': "#9B5DE5", // Violet
    'M': "#00BBF9", // Sky Blue
    'N': "#00F5D4", // Mint
    'O': "#FF97B7", // Baby Pink
    'P': "#FF9E00", // Orange
    'Q': "#00C49A", // Green
    'R': "#D62828", // Red
    'S': "#003049", // Navy
    'T': "#F77F00", // Dark Orange
    'U': "#FCBF49", // Gold
    'V': "#EAE2B7", // Beige
    'W': "#D62828", // Red
    'X': "#F77F00", // Orange
    'Y': "#003049", // Navy
    'Z': "#FCBF49", // Gold
  };
  
  const firstLetter = name.charAt(0).toUpperCase();
  return colorMap[firstLetter] || "#667eea"; // default color
};

// Random gradient uchun variant
export const getAvatarGradient = (name: string) => {
  const gradients = [
    "linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)",
    "linear-gradient(135deg, #4ECDC4 0%, #6CE5E5 100%)",
    "linear-gradient(135deg, #FFD166 0%, #FFE194 100%)",
    "linear-gradient(135deg, #06D6A0 0%, #2EF9B9 100%)",
    "linear-gradient(135deg, #118AB2 0%, #2AC9E9 100%)",
    "linear-gradient(135deg, #EF476F 0%, #FF709A 100%)",
    "linear-gradient(135deg, #7209B7 0%, #9D4EDD 100%)",
    "linear-gradient(135deg, #F3722C 0%, #FF9A5C 100%)",
    "linear-gradient(135deg, #277DA1 0%, #4A9FCC 100%)",
    "linear-gradient(135deg, #90BE6D 0%, #B4E197 100%)",
  ];
  
  // Ism harflarining yig'indisiga qarab
  let sum = 0;
  for (let i = 0; i < Math.min(name.length, 5); i++) {
    sum += name.charCodeAt(i);
  }
  const index = sum % gradients.length;
  return gradients[index];
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
      text: "Unpaid",
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
    return "Unpaid";
  };