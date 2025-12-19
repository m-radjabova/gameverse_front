import { useParams } from "react-router-dom";
import useDebtor from "../../hooks/useDebtor";
import {
  Container,
  Paper,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  Button,
  Tooltip,
  LinearProgress,
  IconButton,
  Divider
} from "@mui/material";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaReceipt,
  FaUser,
  FaPlus,
  FaPhone,
  FaExclamationTriangle,
  FaHistory,
  FaChartLine,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { formatCurrency, formatDateTime, getInitials, getStatusInfo } from "../../utils";
import StatisticsCards from "./StatisticsCards";
import { useState } from "react";
import DebtForm from "./DebtForm";
import RepaymentForm from "./RepaymentForm";
import type { ReqDebt } from "../../types/types";
import PaymentHistoryModal from "./PaymentHistoryModal";
import AllPaidModal from "./AllPaidModal";

function DebtorPage() {
  const { id } = useParams();
  const { debtor, debts, debtorLoading, debtsLoading, addDebtToDebtor, debtRepayment, debtsHistory } = useDebtor(Number(id));
  const [open, setOpen] = useState(false);
  const [openRepayment, setOpenRepayment] = useState(false);
  const [openHistoryPayment, setOpenHistoryPayment] = useState(false);
  const [openAllPaidModal, setOpenAllPaidModal] = useState(false);
 
  if (debtorLoading || debtsLoading) {
    return (
      <Container sx={{ py: 4 }}>
        <Box sx={{ width: '100%' }}>
          <LinearProgress sx={{ height: 3, borderRadius: 2 }} />
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="h6" color="textSecondary">
              Loading debtor information...
            </Typography>
          </Box>
        </Box>
      </Container>
    );
  }

  const handleClose = () => {
    setOpen(false);
  };

  const handleCloseRepayment = () => {
    setOpenRepayment(false);
  };

  const handleCloseHistoryPayment = () => {
    setOpenHistoryPayment(false);
  };

  const allPaid = debts.length > 0 && debts.every((debt) => debt.status === true);

  if (!debtor) {
    return (
      <Container sx={{ py: 6 }}>
        <Paper 
          elevation={0}
          sx={{ 
            p: 6, 
            textAlign: "center",
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box
            sx={{
              bgcolor: '#ffebee',
              borderRadius: '50%',
              width: 100,
              height: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              mb: 3,
            }}
          >
            <FaExclamationTriangle size={48} color="#d32f2f" />
          </Box>
          <Typography variant="h4" fontWeight="700" color="error" gutterBottom>
            Debtor Not Found
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
            The debtor you are looking for does not exist or has been removed from the system.
          </Typography>
          <Button
            component={Link}
            to="/"
            variant="contained"
            size="large"
            startIcon={<FaArrowLeft />}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Back to Debtors
          </Button>
        </Paper>
      </Container>
    );
  }

  const totalDebts = debtor.total_debt;

  const pendingDebt = debts
    .filter((d) => !d.status)
    .reduce((sum, debt) => sum + (debt.amount || 0), 0);
  const paidDebt = debts
    .filter((d) => d.status)
    .reduce((sum, debt) => sum + (debt.amount || 0), 0);

  const handleAddDebt = (amount: number) => {
    const newDebt: ReqDebt = {
      amount: amount,
    };
    addDebtToDebtor(newDebt);
  };

  const handleRepayment = (amount: number) => {
    debtRepayment(amount);
  };

  const handleRepaymentClick = () => {
    if (allPaid) {
      setOpenAllPaidModal(true);
    } else {
      setOpenRepayment(true);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 4,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            position: "relative",
            overflow: "hidden",
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          {/* Decorative Background Elements */}
          <Box
            sx={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: '50%',
              bgcolor: 'rgba(255, 255, 255, 0.1)',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: -30,
              left: -30,
              width: 150,
              height: 150,
              borderRadius: '50%',
              bgcolor: 'rgba(255, 255, 255, 0.1)',
            }}
          />

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 3,
              position: 'relative',
              zIndex: 1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
              <Avatar
                sx={{
                  width: 90,
                  height: 90,
                  bgcolor: "white",
                  color: "#667eea",
                  fontSize: "2.25rem",
                  fontWeight: "700",
                  boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                  border: '4px solid rgba(255, 255, 255, 0.3)',
                }}
              >
                {getInitials(debtor.full_name)}
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="700" gutterBottom sx={{ mb: 1.5 }}>
                  {debtor.full_name}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    flexWrap: "wrap",
                  }}
                >
                  <Chip
                    icon={<FaUser style={{ fontSize: '14px' }} />}
                    label={`ID: #${debtor.debtor_id}`}
                    size="small"
                    sx={{
                      bgcolor: "rgba(255,255,255,0.25)",
                      color: "white",
                      fontWeight: "600",
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      '& .MuiChip-icon': {
                        color: 'white',
                      },
                    }}
                  />
                  <Chip
                    icon={<FaPhone style={{ fontSize: '14px' }} />}
                    label={debtor.phone_number}
                    size="small"
                    sx={{
                      bgcolor: "rgba(255,255,255,0.25)",
                      color: "white",
                      fontWeight: "600",
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      '& .MuiChip-icon': {
                        color: 'white',
                      },
                    }}
                  />
                  <Chip
                    icon={<FaMoneyBillWave style={{ fontSize: '14px' }} />}
                    label={`Total: ${formatCurrency(debtor.total_debt || 0)}`}
                    size="small"
                    sx={{
                      bgcolor: "rgba(255,255,255,0.95)",
                      color: "#667eea",
                      fontWeight: "700",
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      '& .MuiChip-icon': {
                        color: '#667eea',
                      },
                    }}
                  />
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: "flex", gap: 1.5, flexWrap: 'wrap' }}>
              <Tooltip title={allPaid ? "All debts are paid" : "Make a payment"} arrow>
                <Button
                  variant="contained"
                  startIcon={<FaMoneyBillWave />}
                  onClick={handleRepaymentClick}
                  sx={{
                    bgcolor: allPaid ? "#4CAF50" : "white",
                    color: allPaid ? "white" : "#667eea",
                    px: 3,
                    py: 1.25,
                    borderRadius: 2.5,
                    textTransform: 'none',
                    fontWeight: "700",
                    fontSize: '0.95rem',
                    boxShadow: allPaid 
                      ? '0 4px 12px rgba(76, 175, 80, 0.3)' 
                      : '0 4px 12px rgba(0,0,0,0.15)',
                    "&:hover": { 
                      bgcolor: allPaid ? "#388E3C" : "rgba(255,255,255,0.95)",
                      transform: 'translateY(-2px)',
                      boxShadow: allPaid 
                        ? '0 6px 16px rgba(76, 175, 80, 0.4)' 
                        : '0 6px 16px rgba(0,0,0,0.2)',
                    },
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::after': allPaid ? {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                      animation: 'shine 2s infinite',
                    } : {},
                    '@keyframes shine': {
                      '0%': { left: '-100%' },
                      '100%': { left: '100%' },
                    }
                  }}
                >
                  {allPaid ? "All Paid ✓" : "Repayment"}
                </Button>
              </Tooltip>
              <Tooltip title="Add new debt" arrow>
                <Button
                  variant="contained"
                  startIcon={<FaPlus />}
                  onClick={() => setOpen(true)}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.25)",
                    color: "white",
                    px: 3,
                    py: 1.25,
                    borderRadius: 2.5,
                    textTransform: 'none',
                    fontWeight: "700",
                    fontSize: '0.95rem',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    "&:hover": { 
                      bgcolor: "rgba(255,255,255,0.35)",
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Add Debt
                </Button>
              </Tooltip>
              <Tooltip title="Return to list" arrow>
                <IconButton
                  component={Link}
                  to="/"
                  sx={{
                    bgcolor: "rgba(255,255,255,0.25)",
                    color: "white",
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    "&:hover": { 
                      bgcolor: "rgba(255,255,255,0.35)",
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  <FaArrowLeft size={18} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Statistics Cards */}
      <StatisticsCards 
        formatCurrency={formatCurrency} 
        totalDebt={totalDebts} 
        pendingDebt={pendingDebt} 
        paidDebt={paidDebt} 
        debts={debts}  
      />

      {/* Debt Records Table */}
      <Paper 
        elevation={0} 
        sx={{ 
          borderRadius: 4, 
          overflow: "hidden",
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box 
          display="flex" 
          alignItems="center" 
          justifyContent="space-between" 
          sx={{ 
            p: 3, 
            bgcolor: '#fafafa',
          }}
        >
          <Box>
            <Typography
              variant="h5"
              fontWeight="700"
              display="flex"
              alignItems="center"
              gap={1.5}
              color="text.primary"
            >
              <Box
                sx={{
                  bgcolor: '#e3f2fd',
                  color: '#1976d2',
                  p: 1,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FaReceipt size={20} />
              </Box>
              Debt Records
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5, ml: 5.5 }}>
              All debt transactions for {debtor.full_name}
            </Typography>
          </Box>
          <Tooltip title="View payment history" arrow>
            <Button
              onClick={() => setOpenHistoryPayment(true)}
              variant="contained"
              startIcon={<FaHistory />}
              sx={{
                bgcolor: "primary.main",
                color: "white",
                px: 3,
                py: 1.25,
                borderRadius: 2.5,
                textTransform: 'none',
                fontWeight: "600",
                fontSize: '0.95rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                "&:hover": { 
                  bgcolor: "primary.dark",
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Payment History
            </Button>
          </Tooltip>
        </Box>

        <Divider />

        {debts.length > 0 ? (
          <>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: "#f8f9fc" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "700", width: "80px", color: 'text.primary' }}>
                      #
                    </TableCell>
                    <TableCell sx={{ fontWeight: "700", color: 'text.primary' }}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <FaCalendarAlt size={14} />
                        Date & Time
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: "700", color: 'text.primary' }}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <FaMoneyBillWave size={14} />
                        Amount
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: "700", color: 'text.primary' }}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <FaChartLine size={14} />
                        Status
                      </Box>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {debts.map((debt, index) => {
                    const statusInfo = getStatusInfo(debt.status);

                    return (
                      <TableRow
                        key={debt.debt_id}
                        sx={{
                          transition: 'all 0.2s ease',
                          "&:hover": { 
                            bgcolor: "#f8f9fc",
                          },
                          "&:last-child td": { border: 0 },
                        }}
                      >
                        <TableCell>
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: 2,
                              bgcolor: '#f5f5f5',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 600,
                              color: 'text.secondary',
                            }}
                          >
                            {index + 1}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body1" fontWeight="600" color="text.primary">
                            {formatDateTime(debt.date_time)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={formatCurrency(debt.amount || 0)}
                            color="primary"
                            variant="outlined"
                            sx={{ 
                              fontWeight: "700", 
                              fontSize: "0.9rem",
                              borderWidth: 2,
                              height: 36,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={statusInfo.icon}
                            label={statusInfo.text}
                            color={statusInfo.color}
                            variant="filled"
                            sx={{ 
                              fontWeight: "700", 
                              minWidth: "110px",
                              height: 36,
                              boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            <Box
              sx={{
                p: 3,
                bgcolor: "#f8f9fc",
                borderTop: 1,
                borderColor: "divider",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Typography variant="body2" color="textSecondary" fontWeight="500">
                Showing <strong style={{ color: '#1976d2' }}>{debts.length}</strong> debt record
                {debts.length !== 1 ? "s" : ""}
              </Typography>
              <Box display="flex" gap={2} alignItems="center">
                <Chip
                  icon={<FaReceipt style={{ fontSize: '14px' }} />}
                  label="Total Records"
                  size="small"
                  sx={{
                    bgcolor: 'white',
                    fontWeight: 600,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                />
                <Typography variant="h6" fontWeight="700" color="primary">
                  {debts.length}
                </Typography>
              </Box>
            </Box>
          </>
        ) : (
          <Box sx={{ p: 10, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Box
              sx={{
                bgcolor: '#f5f5f5',
                borderRadius: '50%',
                width: 120,
                height: 120,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
              }}
            >
              <FaReceipt size={56} color="#9e9e9e" />
            </Box>
            <Typography
              variant="h5"
              fontWeight="600"
              color="text.primary"
              sx={{ mb: 1 }}
            >
              No debt records found
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 4, maxWidth: 400 }}>
              This debtor has no debt records yet. Add the first debt record to start tracking.
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<FaPlus />}
              onClick={() => setOpen(true)}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Add First Debt Record
            </Button>
          </Box>
        )}
      </Paper>

      {/* Modals */}
      <DebtForm open={open} handleClose={handleClose} onSubmit={handleAddDebt} />
      <RepaymentForm 
        open={openRepayment} 
        handleClose={handleCloseRepayment} 
        onSubmit={handleRepayment}
      />
      <PaymentHistoryModal open={openHistoryPayment} handleClose={handleCloseHistoryPayment} debtsHistory={debtsHistory} />
      
      <AllPaidModal 
        open={openAllPaidModal} 
        onClose={() => setOpenAllPaidModal(false)} 
      />
    </Container>
  );
}

export default DebtorPage;