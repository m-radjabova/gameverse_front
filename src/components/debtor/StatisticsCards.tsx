import { Avatar, Box, Card, CardContent, LinearProgress, Typography } from "@mui/material";
import { FaCheckCircle, FaClock, FaMoneyBillWave, FaReceipt } from "react-icons/fa";
import type { Debt } from "../../types/types";

interface Props {
    formatCurrency: (amount: number) => string;
    totalDebt: number;
    pendingDebt: number;
    paidDebt: number;
    debts: Debt[];
}

function StatisticsCards({ formatCurrency, totalDebt, pendingDebt, paidDebt, debts }: Props) {
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 4 }}>
      {/* Total Debt Card */}
      <Card 
        sx={{ 
          flex: "1 1 280px", 
          minWidth: "280px", 
          borderRadius: 3,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          border: '1px solid',
          borderColor: 'divider',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
            <Box>
              <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1, fontWeight: 500 }}>
                Total Debt
              </Typography>
              <Typography variant="h3" fontWeight="700" color="primary.main">
                {formatCurrency(totalDebt || 0)}
              </Typography>
              <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                Outstanding balance
              </Typography>
            </Box>
            <Avatar 
              sx={{ 
                bgcolor: '#e3f2fd',
                color: '#1976d2',
                width: 64,
                height: 64,
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
              }}
            >
              <FaMoneyBillWave size={28} />
            </Avatar>
          </Box>
          <LinearProgress
            variant="determinate"
            value={100}
            sx={{ 
              height: 8, 
              borderRadius: 4,
              bgcolor: '#e3f2fd',
              '& .MuiLinearProgress-bar': {
                bgcolor: '#1976d2',
                borderRadius: 4,
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Pending Debt Card */}
      <Card 
        sx={{ 
          flex: "1 1 280px", 
          minWidth: "280px", 
          borderRadius: 3,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          border: '1px solid',
          borderColor: 'divider',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
            <Box>
              <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1, fontWeight: 500 }}>
                Pending
              </Typography>
              <Typography variant="h3" fontWeight="700" color="warning.main">
                {formatCurrency(pendingDebt)}
              </Typography>
              <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                {totalDebt > 0 ? `${((pendingDebt / totalDebt) * 100).toFixed(1)}% of total` : 'No pending debt'}
              </Typography>
            </Box>
            <Avatar 
              sx={{ 
                bgcolor: '#fff3e0',
                color: '#f57c00',
                width: 64,
                height: 64,
                boxShadow: '0 4px 12px rgba(245, 124, 0, 0.2)',
              }}
            >
              <FaClock size={28} />
            </Avatar>
          </Box>
          <LinearProgress
            variant="determinate"
            value={totalDebt > 0 ? (pendingDebt / totalDebt) * 100 : 0}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: '#fff3e0',
              "& .MuiLinearProgress-bar": {
                bgcolor: '#f57c00',
                borderRadius: 4,
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Paid Debt Card */}
      <Card 
        sx={{ 
          flex: "1 1 280px", 
          minWidth: "280px", 
          borderRadius: 3,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          border: '1px solid',
          borderColor: 'divider',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
            <Box>
              <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1, fontWeight: 500 }}>
                Paid
              </Typography>
              <Typography variant="h3" fontWeight="700" color="success.main">
                {formatCurrency(paidDebt)}
              </Typography>
              <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                {totalDebt > 0 ? `${((paidDebt / totalDebt) * 100).toFixed(1)}% of total` : 'No payments yet'}
              </Typography>
            </Box>
            <Avatar 
              sx={{ 
                bgcolor: '#e8f5e9',
                color: '#2e7d32',
                width: 64,
                height: 64,
                boxShadow: '0 4px 12px rgba(46, 125, 50, 0.2)',
              }}
            >
              <FaCheckCircle size={28} />
            </Avatar>
          </Box>
          <LinearProgress
            variant="determinate"
            value={totalDebt > 0 ? (paidDebt / totalDebt) * 100 : 0}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: '#e8f5e9',
              "& .MuiLinearProgress-bar": {
                bgcolor: '#2e7d32',
                borderRadius: 4,
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Total Records Card */}
      <Card 
        sx={{ 
          flex: "1 1 280px", 
          minWidth: "280px", 
          borderRadius: 3,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          border: '1px solid',
          borderColor: 'divider',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
            <Box>
              <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1, fontWeight: 500 }}>
                Total Records
              </Typography>
              <Typography variant="h3" fontWeight="700" color="info.main">
                {debts.length}
              </Typography>
              <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                Debt transaction{debts.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
            <Avatar 
              sx={{ 
                bgcolor: '#e3f2fd',
                color: '#0288d1',
                width: 64,
                height: 64,
                boxShadow: '0 4px 12px rgba(2, 136, 209, 0.2)',
              }}
            >
              <FaReceipt size={28} />
            </Avatar>
          </Box>
          <LinearProgress
            variant="determinate"
            value={100}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: '#e3f2fd',
              "& .MuiLinearProgress-bar": {
                bgcolor: '#0288d1',
                borderRadius: 4,
              },
            }}
          />
        </CardContent>
      </Card>
    </Box>
  );
}

export default StatisticsCards;