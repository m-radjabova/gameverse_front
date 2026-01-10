import { Box, Card, CardContent, Typography, Chip } from "@mui/material";
import { FaCheckCircle, FaClock, FaMoneyBillWave, FaReceipt, FaArrowUp, FaArrowDown } from "react-icons/fa";
import type { Debt } from "../../types/types";

interface Props {
    formatCurrency: (amount: number) => string;
    totalDebt: number;
    pendingDebt: number;
    paidDebt: number;
    debts: Debt[];
}

function StatisticsCards({ formatCurrency, totalDebt, pendingDebt, paidDebt, debts }: Props) {

  const safePendingDebt = pendingDebt || 0;
  const safePaidDebt = paidDebt || 0;

  const totalAmount = safePendingDebt + safePaidDebt;

  const pendingProgress =
    totalAmount > 0 ? (safePendingDebt / totalAmount) * 100 : 0;

  const paidProgress =
    totalAmount > 0 ? (safePaidDebt / totalAmount) * 100 : 0;

  const statsData = [
    {
      title: "Total Debt",
      value: formatCurrency(totalDebt),
      subtitle: "Outstanding balance",
      color: "#1976d2",
      gradient: "linear-gradient(135deg, #1976d2 0%, #2196f3 100%)",
      icon: <FaMoneyBillWave />,
      progress: 100,
      progressLabel: "Full Amount",
      trend: null
    },
    {
      title: "Remaining",
      value: formatCurrency(pendingDebt),
      subtitle: totalAmount > 0 ? `${pendingProgress.toFixed(1)}% of total` : 'No unpaid debt',
      color: "#f57c00",
      gradient: "linear-gradient(135deg, #f57c00 0%, #ff9800 100%)",
      icon: <FaClock />,
      progress: pendingProgress,
      progressLabel: "Pending Amount",
      trend: -5
    },
    {
      title: "Paid",
      value: formatCurrency(paidDebt),
      subtitle: totalAmount > 0 ? `${paidProgress.toFixed(1)}% of total` : 'No payments yet',
      color: "#2e7d32",
      gradient: "linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)",
      icon: <FaCheckCircle />,
      progress: paidProgress,
      progressLabel: "Paid Amount",
      trend: 15
    },
    {
      title: "Total Records",
      value: debts.length.toString(),
      subtitle: `Debt transaction${debts.length !== 1 ? 's' : ''}`,
      color: "#0288d1",
      gradient: "linear-gradient(135deg, #0288d1 0%, #03a9f4 100%)",
      icon: <FaReceipt />,
      progress: 100,
      progressLabel: "Records Count",
      trend: 8
    }
  ];

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          lg: 'repeat(4, 1fr)'
        },
        gap: 2.5,
        mb: 4
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
            boxShadow: `0 8px 32px ${stat.color}40`,
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            border: "none",
            "&:hover": {
              transform: "translateY(-8px) scale(1.02)",
              boxShadow: `0 20px 48px ${stat.color}66`,
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
          {/* Shine Effect */}
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
            <Box sx={{ mb: 2.5 }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                {/* Icon */}
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
                
                {/* Trend Badge */}
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
              </Box>

              {/* Value and Title */}
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
                    fontSize: "0.7rem",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5
                  }}
                >
                  <Box sx={{ 
                    width: 6, 
                    height: 6, 
                    borderRadius: '50%', 
                    bgcolor: 'white', 
                    opacity: 0.7 
                  }} />
                  {stat.subtitle}
                </Typography>
              </Box>
            </Box>
            
            {/* Progress Bar */}
            <Box sx={{ position: 'relative' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'white', 
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    opacity: 0.9
                  }}
                >
                  {stat.progressLabel}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'white', 
                    fontWeight: 700, 
                    fontSize: '0.75rem' 
                  }}
                >
                  {stat.progress.toFixed(1)}%
                </Typography>
              </Box>
              <Box sx={{ 
                height: 8, 
                borderRadius: 4,
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <Box sx={{ 
                  width: `${Math.min(100, stat.progress)}%`,
                  height: '100%',
                  background: 'rgba(255, 255, 255, 0.4)',
                  backdropFilter: 'blur(5px)',
                  borderRadius: 4,
                  position: 'relative',
                  transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 2px 8px rgba(255, 255, 255, 0.3)',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent)',
                    animation: 'progress-shine 2s infinite',
                  },
                }} />
              </Box>
            </Box>
          </CardContent>
        </Card>
      ))}

      {/* CSS Animations */}
      <style>{`
        @keyframes progress-shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </Box>
  );
}

export default StatisticsCards;