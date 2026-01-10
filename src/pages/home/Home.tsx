import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Paper,
  Button,
  Chip,
  IconButton,
  Stack,
  alpha,
  useTheme,
  Tooltip,
  Badge
} from "@mui/material";

import useContextPro from "../../hooks/useContextPro";
import useShop from "../../hooks/useShop";
import { 
  FaCheck, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaSignOutAlt, 
  FaStore,
  FaUser, 
  FaUsers,
  FaPlus,
  FaCog,
  FaShieldAlt,
  FaSignal,
  FaBell,
  FaArrowUp,
  FaArrowDown,
  FaClock,
  FaWallet
} from "react-icons/fa";
import UpdateShopModal from "../../components/shop/UpdateShopModal";
import type { ReqShop } from "../../types/types";

interface StatCardProps {
  title: string;
  value: string;
  color: string;
  gradient: string;
  icon: React.ReactNode;
  trend?: number;
  subtitle?: string;
}

function Home() {
  const theme = useTheme();
  const [openModal, setOpenModal] = useState(false);
  const { state: { shop }, dispatch } = useContextPro();
  const navigate = useNavigate();
  
  const shopId = shop?.shop_id;
  const { statistics, updateShop } = useShop(shopId);
  
  const [statsData, setStatsData] = useState<StatCardProps[]>([]);

  useEffect(() => {
    if (statistics?.statistics) {
      const stats = statistics.statistics;
      const totalDebt = stats.total_debts || 0;
      const paidDebt = stats.total_paid_debt || 0;
      const unpaidDebt = stats.total_unpaid_debt || 0;
      
      setStatsData([
        { 
          title: "Active Debtors", 
          value: stats.total_debtors?.toString() || "0", 
          color: "#6366f1",
          gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
          icon: <FaUsers />,
          trend: 12,
          subtitle: "Total customers"
        },
        { 
          title: "Total Debt", 
          value: `${totalDebt.toLocaleString()}`,
          color: "#10b981",
          gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          icon: <FaWallet />,
          trend: 8,
          subtitle: "All transactions"
        },
        { 
          title: "Outstanding", 
          value: `$${unpaidDebt.toLocaleString()}`,
          color: "#f59e0b",
          gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
          icon: <FaClock />,
          trend: -5,
          subtitle: "Pending payment"
        },
        { 
          title: "Collected", 
          value: `$${paidDebt.toLocaleString()}`,
          color: "#06b6d4",
          gradient: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
          icon: <FaCheck />,
          trend: 15,
          subtitle: "Successfully paid"
        }
      ]);
    }
  }, [statistics, theme]);

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    navigate('/');
  };

  const handleClose = () => {
    setOpenModal(false);
  };

  const handleUpdate = (data?: ReqShop) => {
    if (data) {
      updateShop(data);
      setOpenModal(false);
    }
  };

  if (!shop) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        }}
      >
        <Stack alignItems="center" spacing={4}>
          <Box
            sx={{
              position: "relative",
              width: 100,
              height: 100
            }}
          >
            <Box
              sx={{
                position: "absolute",
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                border: `4px solid ${alpha("#fff", 0.3)}`,
                borderTopColor: "#fff",
                animation: "spin 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite",
                "@keyframes spin": {
                  "0%": { transform: "rotate(0deg)" },
                  "100%": { transform: "rotate(360deg)" }
                }
              }}
            />
          </Box>
          <Box textAlign="center">
            <Typography 
              variant="h5" 
              sx={{
                color: "white",
                fontWeight: 700,
                mb: 1
              }}
            >
              Loading Dashboard
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
              Preparing your workspace...
            </Typography>
          </Box>
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#f8f9fc",
        overflow: "hidden"
      }}
    >
      {/* Compact Header */}
      <Paper
        elevation={0}
        sx={{
          background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
          borderBottom: "none",
          color: "white",
          flexShrink: 0
        }}
      >
        <Box sx={{ mx: "auto", px: 3, py: 2 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  background: "rgba(255, 255, 255, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backdropFilter: "blur(10px)"
                }}
              >
                <FaStore style={{ color: "white", fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={800}>
                  Debt Manager
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  Professional Management System
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={2}>
              <Tooltip title="Notifications" arrow>
                <IconButton
                  sx={{
                    width: 40,
                    height: 40,
                    background: "rgba(255, 255, 255, 0.15)",
                    "&:hover": {
                      background: "rgba(255, 255, 255, 0.25)"
                    }
                  }}
                >
                  <Badge badgeContent={3} color="error">
                    <FaBell style={{ color: "white", fontSize: 16 }} />
                  </Badge>
                </IconButton>
              </Tooltip>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  background: "rgba(255, 255, 255, 0.15)",
                  backdropFilter: "blur(10px)"
                }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    background: "white",
                    color: "#6366f1",
                    fontWeight: 700,
                    fontSize: "0.9rem"
                  }}
                >
                  {shop.shop_name.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="body2" fontWeight={700} fontSize="0.85rem">
                    {shop.shop_name}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8, fontSize: "0.7rem" }}>
                    {shop.owner_name || "Store Owner"}
                  </Typography>
                </Box>
              </Box>
              
              <Tooltip title="Logout" arrow>
                <IconButton
                  onClick={handleLogout}
                  sx={{
                    width: 40,
                    height: 40,
                    background: "rgba(239, 68, 68, 0.2)",
                    "&:hover": {
                      background: "rgba(239, 68, 68, 0.3)",
                      transform: "rotate(180deg)"
                    },
                    transition: "all 0.4s ease"
                  }}
                >
                  <FaSignOutAlt style={{ color: "white", fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Box>
      </Paper>

      {/* Main Content - Scrollable */}
      <Box sx={{ flex: 1, overflow: "auto" }}>
        <Box sx={{ mx: "auto", px: 3, py: 3 }}>
          {/* Compact Welcome Section */}
          <Box sx={{ mb: 3 }}>
            <Typography 
              variant="h4" 
              sx={{
                fontWeight: 800,
                mb: 1,
                background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}
            >
              Welcome back, {shop.owner_name || "Store Owner"} 👋
            </Typography>
            
            <Stack direction="row" spacing={1.5} flexWrap="wrap">
              <Chip
                icon={<FaShieldAlt style={{ fontSize: 12 }} />}
                label={`ID: ${shop.shop_id}`}
                size="small"
                sx={{ 
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  color: "white",
                  fontWeight: 600,
                  '& .MuiChip-icon': {
                    color: "white"
                  }
                }}
              />
              <Chip
                icon={<FaSignal style={{ fontSize: 12 }} />}
                label="Online"
                size="small"
                sx={{ 
                  background: alpha("#6366f1", 0.1),
                  color: "#6366f1",
                  fontWeight: 600,
                  border: `1px solid ${alpha("#6366f1", 0.2)}`
                }}
              />
              <Chip
                label={new Date().toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
                size="small"
                sx={{ 
                  background: alpha("#06b6d4", 0.1),
                  color: "#06b6d4",
                  fontWeight: 600
                }}
              />
            </Stack>
          </Box>

          {/* Modern Stats Grid - Gradient Cards */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                lg: 'repeat(4, 1fr)'
              },
              gap: 2.5,
              mb: 3
            }}
          >
            {statsData.map((stat, index) => (
              <Card
                key={index}
                sx={{
                  position: "relative",
                  overflow: "hidden",
                  background: stat.gradient,
                  borderRadius: 3,
                  boxShadow: `0 8px 32px ${alpha(stat.color, 0.25)}`,
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  border: "none",
                  "&:hover": {
                    transform: "translateY(-8px) scale(1.02)",
                    boxShadow: `0 20px 48px ${alpha(stat.color, 0.4)}`,
                    "& .stat-icon": {
                      transform: "scale(1.15) rotate(10deg)"
                    },
                    "& .shine": {
                      left: "100%"
                    }
                  },
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                    background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)",
                    pointerEvents: "none"
                  }
                }}
              >
                <Box
                  className="shine"
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: "-100%",
                    width: "50%",
                    height: "100%",
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                    transition: "left 0.6s ease",
                    pointerEvents: "none"
                  }}
                />
                
                <CardContent sx={{ p: 2.5, position: "relative", zIndex: 1 }}>
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box
                        className="stat-icon"
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: 2.5,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "rgba(255, 255, 255, 0.25)",
                          backdropFilter: "blur(10px)",
                          border: "2px solid rgba(255, 255, 255, 0.3)",
                          transition: "all 0.4s ease"
                        }}
                      >
                        <Box sx={{ 
                          color: "white", 
                          fontSize: 26,
                          display: "flex"
                        }}>
                          {stat.icon}
                        </Box>
                      </Box>
                      
                      {stat.trend && (
                        <Chip
                          icon={stat.trend > 0 ? <FaArrowUp /> : <FaArrowDown />}
                          label={`${stat.trend > 0 ? '+' : ''}${stat.trend}%`}
                          size="small"
                          sx={{
                            height: 28,
                            fontWeight: 700,
                            fontSize: "0.75rem",
                            background: "rgba(255, 255, 255, 0.25)",
                            backdropFilter: "blur(10px)",
                            color: "white",
                            border: "1px solid rgba(255, 255, 255, 0.3)",
                            '& .MuiChip-icon': {
                              color: "white",
                              fontSize: "0.75rem"
                            }
                          }}
                        />
                      )}
                    </Stack>
                    
                    <Box>
                      <Typography
                        variant="h3"
                        sx={{ 
                          fontWeight: 900,
                          fontSize: { xs: '2rem', md: '2.5rem' },
                          mb: 0.5,
                          color: "white",
                          textShadow: "0 2px 8px rgba(0,0,0,0.2)",
                          letterSpacing: '-0.02em'
                        }}
                      >
                        {stat.value}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ 
                          textTransform: "uppercase",
                          letterSpacing: 1.2,
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          color: "rgba(255,255,255,0.95)",
                          mb: 0.25
                        }}
                      >
                        {stat.title}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ 
                          color: "rgba(255,255,255,0.8)",
                          fontWeight: 500,
                          fontSize: "0.7rem"
                        }}
                      >
                        {stat.subtitle}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Box>

          {/* Store Info & Quick Actions - Compact */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                lg: '1.5fr 1fr'
              },
              gap: 3
            }}
          >
            {/* Store Information */}
            <Card
              sx={{
                background: "white",
                borderRadius: 3,
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                overflow: "hidden"
              }}
            >
              <Box
                sx={{
                  p: 2.5,
                  background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                  position: "relative"
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      background: "rgba(255, 255, 255, 0.2)",
                      backdropFilter: "blur(10px)",
                      border: `2px solid rgba(255, 255, 255, 0.3)`,
                      fontSize: "1.5rem",
                      color: "white"
                    }}
                  >
                    <FaStore />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={800} color="white">
                      Store Information
                    </Typography>
                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.9)" }}>
                      Business details
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <CardContent sx={{ p: 2.5 }}>
                <Stack spacing={2}>
                  {[
                    {
                      icon: <FaStore />,
                      label: "Store Name",
                      value: shop.shop_name,
                      color: "#6366f1"
                    },
                    {
                      icon: <FaUser />,
                      label: "Owner Name",
                      value: shop.owner_name || "Not specified",
                      color: "#8b5cf6"
                    },
                    {
                      icon: <FaPhone />,
                      label: "Contact",
                      value: shop.phone_number || "Not provided",
                      color: "#10b981"
                    },
                    {
                      icon: <FaMapMarkerAlt />,
                      label: "Address",
                      value: shop.address || "Not provided",
                      color: "#f59e0b"
                    }
                  ].map((item, index) => (
                    <Paper
                      key={index}
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        background: alpha(item.color, 0.06),
                        border: `1px solid ${alpha(item.color, 0.15)}`,
                        transition: "all 0.3s ease",
                        "&:hover": {
                          background: alpha(item.color, 0.1),
                          transform: "translateX(6px)"
                        }
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar
                          sx={{
                            bgcolor: alpha(item.color, 0.15),
                            color: item.color,
                            width: 44,
                            height: 44,
                            fontSize: "1.2rem"
                          }}
                        >
                          {item.icon}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: "text.secondary",
                              fontWeight: 600,
                              textTransform: "uppercase",
                              letterSpacing: 0.5,
                              fontSize: "0.65rem"
                            }}
                          >
                            {item.label}
                          </Typography>
                          <Typography variant="subtitle2" fontWeight={700} fontSize="0.95rem">
                            {item.value}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card
              sx={{
                background: "white",
                borderRadius: 3,
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                overflow: "hidden"
              }}
            >
              <Box
                sx={{
                  p: 2.5,
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      background: "rgba(255, 255, 255, 0.2)",
                      backdropFilter: "blur(10px)",
                      border: `2px solid rgba(255, 255, 255, 0.3)`,
                      fontSize: "1.5rem",
                      color: "white"
                    }}
                  >
                    ⚡
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={800} color="white">
                      Quick Actions
                    </Typography>
                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.9)" }}>
                      Common tasks
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <CardContent sx={{ p: 2.5 }}>
                <Stack spacing={2}>
                  {[
                    {
                      icon: <FaPlus />,
                      label: "Add New Debtor",
                      description: "Register customer",
                      color: "#6366f1",
                      onClick: () => navigate('/home/debtor')
                    },
                    {
                      icon: <FaCog />,
                      label: "Settings",
                      description: "Manage account",
                      color: "#8b5cf6",
                      onClick: () => setOpenModal(true)
                    }
                  ].map((action, index) => (
                    <Button
                      key={index}
                      fullWidth
                      onClick={action.onClick}
                      sx={{
                        py: 2,
                        px: 2.5,
                        borderRadius: 2,
                        justifyContent: "flex-start",
                        background: alpha(action.color, 0.08),
                        border: `2px solid ${alpha(action.color, 0.15)}`,
                        transition: "all 0.3s ease",
                        "&:hover": {
                          background: `linear-gradient(135deg, ${action.color} 0%, ${alpha(action.color, 0.8)} 100%)`,
                          border: `2px solid ${action.color}`,
                          transform: "translateX(6px)",
                          boxShadow: `0 6px 20px ${alpha(action.color, 0.3)}`,
                          "& .action-icon": {
                            transform: "scale(1.15)",
                            color: "white"
                          },
                          "& .action-text": {
                            color: "white"
                          },
                          "& .action-desc": {
                            color: "rgba(255,255,255,0.9)"
                          }
                        }
                      }}
                    >
                      <Stack direction="row" spacing={2} alignItems="center" width="100%">
                        <Avatar
                          className="action-icon"
                          sx={{
                            bgcolor: alpha(action.color, 0.15),
                            color: action.color,
                            width: 44,
                            height: 44,
                            transition: "all 0.3s ease"
                          }}
                        >
                          {action.icon}
                        </Avatar>
                        <Box textAlign="left">
                          <Typography 
                            className="action-text"
                            variant="subtitle2" 
                            fontWeight={700}
                            fontSize="0.9rem"
                            sx={{ 
                              color: "text.primary",
                              transition: "color 0.3s ease"
                            }}
                          >
                            {action.label}
                          </Typography>
                          <Typography 
                            className="action-desc"
                            variant="caption"
                            fontSize="0.7rem"
                            sx={{ 
                              color: "text.secondary",
                              transition: "color 0.3s ease"
                            }}
                          >
                            {action.description}
                          </Typography>
                        </Box>
                      </Stack>
                    </Button>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>

      <UpdateShopModal open={openModal} onClose={handleClose} onUpdate={handleUpdate} shop={shop} />
    </Box>
  );
}

export default Home;