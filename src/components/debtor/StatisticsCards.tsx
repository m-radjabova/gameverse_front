import {Box, Card, CardContent, Typography } from "@mui/material";
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

  const safeTotalDebt = totalDebt || 0;
  const safePaidDebt = paidDebt || 0;

  const totalAmount = safeTotalDebt + safePaidDebt;

  const pendingProgress =
    totalAmount > 0 ? (safeTotalDebt / totalAmount) * 100 : 0;

  const paidProgress =
    totalAmount > 0 ? (safePaidDebt / totalAmount) * 100 : 0;


  return (
    <Box sx={{ 
      display: "grid", 
      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(4, 1fr)" }, 
      gap: 3, 
      mb: 4 
    }}>
      {/* Total Debt Card */}
      <Card 
        sx={{ 
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(25, 118, 210, 0.1)',
          border: '1px solid rgba(25, 118, 210, 0.15)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          background: `
            linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(33, 150, 243, 0.05) 100%),
            radial-gradient(circle at 80% 20%, rgba(25, 118, 210, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 20% 80%, rgba(33, 150, 243, 0.1) 0%, transparent 50%)
          `,
          '&:hover': {
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: '0 12px 32px rgba(25, 118, 210, 0.2)',
            borderColor: 'rgba(25, 118, 210, 0.3)',
          },
        }}
      >
        {/* Decorative Elements */}
        <Box
          sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(25, 118, 210, 0.1) 0%, transparent 70%)',
          }}
        />
        
        <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ 
                mb: 1, 
                fontWeight: 600,
                background: 'linear-gradient(90deg, #1976d2 0%, #2196f3 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '0.5px',
              }}>
                TOTAL DEBT
              </Typography>
              <Typography variant="h3" fontWeight="800" sx={{ 
                color: '#1976d2',
                textShadow: '0 2px 8px rgba(25, 118, 210, 0.2)',
                mb: 0.5,
              }}>
                {formatCurrency(totalDebt)}
              </Typography>
              <Typography variant="caption" sx={{ 
                color: '#1976d2',
                opacity: 0.8,
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#1976d2', opacity: 0.6 }} />
                Outstanding balance
              </Typography>
            </Box>
            <Box
              sx={{
                position: 'relative',
                width: 70,
                height: 70,
                borderRadius: '18px',
                background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(25, 118, 210, 0.4)',
                color: 'white',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  inset: 1,
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              <FaMoneyBillWave size={28} />
            </Box>
          </Box>
          
          {/* Progress Bar with Gradient */}
          <Box sx={{ mt: 3, position: 'relative' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="caption" sx={{ color: '#1976d2', fontWeight: 600 }}>
                Full Amount
              </Typography>
              <Typography variant="caption" sx={{ color: '#1976d2', fontWeight: 700, fontSize: '0.8rem' }}>
                100%
              </Typography>
            </Box>
            <Box sx={{ 
              height: 10, 
              borderRadius: 5,
              backgroundColor: 'rgba(25, 118, 210, 0.15)',
              overflow: 'hidden',
              position: 'relative',
            }}>
              <Box sx={{ 
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, #1976d2 0%, #2196f3 100%)',
                borderRadius: 5,
                position: 'relative',
                overflow: 'hidden',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                  animation: 'shine 2s infinite',
                },
              }} />
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Pending Debt Card */}
      <Card 
        sx={{ 
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(245, 124, 0, 0.1)',
          border: '1px solid rgba(245, 124, 0, 0.15)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          background: `
            linear-gradient(135deg, rgba(245, 124, 0, 0.05) 0%, rgba(255, 152, 0, 0.05) 100%),
            radial-gradient(circle at 80% 20%, rgba(245, 124, 0, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 20% 80%, rgba(255, 152, 0, 0.1) 0%, transparent 50%)
          `,
          '&:hover': {
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: '0 12px 32px rgba(245, 124, 0, 0.2)',
            borderColor: 'rgba(245, 124, 0, 0.3)',
          },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -40,
            right: -40,
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245, 124, 0, 0.1) 0%, transparent 70%)',
          }}
        />
        
        <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ 
                mb: 1, 
                fontWeight: 600,
                background: 'linear-gradient(90deg, #f57c00 0%, #ff9800 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '0.5px',
              }}>
                PENDING
              </Typography>
              <Typography variant="h3" fontWeight="800" sx={{ 
                color: '#f57c00',
                textShadow: '0 2px 8px rgba(245, 124, 0, 0.2)',
                mb: 0.5,
              }}>
                {formatCurrency(pendingDebt)}
              </Typography>
              <Typography variant="caption" sx={{ 
                color: '#f57c00',
                opacity: 0.8,
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#f57c00', opacity: 0.6 }} />
                {totalAmount > 0
                ? `${pendingProgress.toFixed(1)}% of total`
                : 'No unpaid debt'}

              </Typography>
            </Box>
            <Box
              sx={{
                position: 'relative',
                width: 70,
                height: 70,
                borderRadius: '18px',
                background: 'linear-gradient(135deg, #f57c00 0%, #ff9800 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(245, 124, 0, 0.4)',
                color: 'white',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  inset: 1,
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              <FaClock size={28} />
            </Box>
          </Box>
          
          <Box sx={{ mt: 3, position: 'relative' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="caption" sx={{ color: '#f57c00', fontWeight: 600 }}>
                Pending Amount
              </Typography>
              <Typography variant="caption" sx={{ color: '#f57c00', fontWeight: 700, fontSize: '0.8rem' }}>
                {pendingProgress.toFixed(1)}%
              </Typography>
            </Box>
            <Box sx={{ 
              height: 10, 
              borderRadius: 5,
              backgroundColor: 'rgba(245, 124, 0, 0.15)',
              overflow: 'hidden',
            }}>
              <Box sx={{ 
                width: `${Math.min(100, pendingProgress)}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #f57c00 0%, #ff9800 100%)',
                borderRadius: 5,
                position: 'relative',
                transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                  animation: 'shine 2s infinite',
                },
              }} />
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Paid Debt Card */}
      <Card 
        sx={{ 
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(46, 125, 50, 0.1)',
          border: '1px solid rgba(46, 125, 50, 0.15)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          background: `
            linear-gradient(135deg, rgba(46, 125, 50, 0.05) 0%, rgba(76, 175, 80, 0.05) 100%),
            radial-gradient(circle at 80% 20%, rgba(46, 125, 50, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 20% 80%, rgba(76, 175, 80, 0.1) 0%, transparent 50%)
          `,
          '&:hover': {
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: '0 12px 32px rgba(46, 125, 50, 0.2)',
            borderColor: 'rgba(46, 125, 50, 0.3)',
          },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -40,
            left: -40,
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(46, 125, 50, 0.1) 0%, transparent 70%)',
          }}
        />
        
        <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ 
                mb: 1, 
                fontWeight: 600,
                background: 'linear-gradient(90deg, #2e7d32 0%, #4caf50 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '0.5px',
              }}>
                PAID
              </Typography>
              <Typography variant="h3" fontWeight="800" sx={{ 
                color: '#2e7d32',
                textShadow: '0 2px 8px rgba(46, 125, 50, 0.2)',
                mb: 0.5,
              }}>
                {formatCurrency(paidDebt)}
              </Typography>
              <Typography variant="caption" sx={{ 
                color: '#2e7d32',
                opacity: 0.8,
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#2e7d32', opacity: 0.6 }} />
                {totalAmount > 0
                  ? `${paidProgress.toFixed(1)}% of total`
                  : 'No payments yet'}
              </Typography>
            </Box>
            <Box
              sx={{
                position: 'relative',
                width: 70,
                height: 70,
                borderRadius: '18px',
                background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(46, 125, 50, 0.4)',
                color: 'white',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  inset: 1,
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              <FaCheckCircle size={28} />
            </Box>
          </Box>
          
          <Box sx={{ mt: 3, position: 'relative' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="caption" sx={{ color: '#2e7d32', fontWeight: 600 }}>
                Paid Amount
              </Typography>
              <Typography variant="caption" sx={{ color: '#2e7d32', fontWeight: 700, fontSize: '0.8rem' }}>
                {paidProgress.toFixed(1)}%
              </Typography>
            </Box>
            <Box sx={{ 
              height: 10, 
              borderRadius: 5,
              backgroundColor: 'rgba(46, 125, 50, 0.15)',
              overflow: 'hidden',
            }}>
              <Box sx={{ 
                width: `${Math.min(100, paidProgress)}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #2e7d32 0%, #4caf50 100%)',
                borderRadius: 5,
                position: 'relative',
                transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                  animation: 'shine 2s infinite',
                },
              }} />
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Total Records Card */}
      <Card 
        sx={{ 
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(2, 136, 209, 0.1)',
          border: '1px solid rgba(2, 136, 209, 0.15)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          background: `
            linear-gradient(135deg, rgba(2, 136, 209, 0.05) 0%, rgba(3, 169, 244, 0.05) 100%),
            radial-gradient(circle at 80% 20%, rgba(2, 136, 209, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 20% 80%, rgba(3, 169, 244, 0.1) 0%, transparent 50%)
          `,
          '&:hover': {
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: '0 12px 32px rgba(2, 136, 209, 0.2)',
            borderColor: 'rgba(2, 136, 209, 0.3)',
          },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            bottom: -40,
            right: -40,
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(2, 136, 209, 0.1) 0%, transparent 70%)',
          }}
        />
        
        <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ 
                mb: 1, 
                fontWeight: 600,
                background: 'linear-gradient(90deg, #0288d1 0%, #03a9f4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '0.5px',
              }}>
                TOTAL RECORDS
              </Typography>
              <Typography variant="h3" fontWeight="800" sx={{ 
                color: '#0288d1',
                textShadow: '0 2px 8px rgba(2, 136, 209, 0.2)',
                mb: 0.5,
              }}>
                {debts.length}
              </Typography>
              <Typography variant="caption" sx={{ 
                color: '#0288d1',
                opacity: 0.8,
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#0288d1', opacity: 0.6 }} />
                Debt transaction{debts.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
            <Box
              sx={{
                position: 'relative',
                width: 70,
                height: 70,
                borderRadius: '18px',
                background: 'linear-gradient(135deg, #0288d1 0%, #03a9f4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(2, 136, 209, 0.4)',
                color: 'white',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  inset: 1,
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              <FaReceipt size={28} />
            </Box>
          </Box>
          
          <Box sx={{ mt: 3, position: 'relative' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="caption" sx={{ color: '#0288d1', fontWeight: 600 }}>
                Records Count
              </Typography>
              <Typography variant="caption" sx={{ color: '#0288d1', fontWeight: 700, fontSize: '0.8rem' }}>
                100%
              </Typography>
            </Box>
            <Box sx={{ 
              height: 10, 
              borderRadius: 5,
              backgroundColor: 'rgba(2, 136, 209, 0.15)',
              overflow: 'hidden',
            }}>
              <Box sx={{ 
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, #0288d1 0%, #03a9f4 100%)',
                borderRadius: 5,
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                  animation: 'shine 2s infinite',
                },
              }} />
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* CSS Animations */}
      <style>{`
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </Box>
  );
}

export default StatisticsCards;