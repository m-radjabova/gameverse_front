import { useParams } from "react-router-dom";
import useDebtor from "../../hooks/useDebtor";
import {
  Container,
  Paper,
  Box,
  Typography,
  Chip,
  Avatar,
  Button,
  Tooltip,
  LinearProgress,
  IconButton,
} from "@mui/material";
import {
  FaArrowLeft,
  FaMoneyBillWave,
  FaUser,
  FaPlus,
  FaPhone,
  FaExclamationTriangle
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { formatCurrency, formatPhoneNumber, getInitials } from "../../utils";
import StatisticsCards from "./StatisticsCards";
import { useState } from "react";
import DebtForm from "./modal/DebtForm";
import RepaymentForm from "./modal/RepaymentForm";
import type { ReqDebt, ResulType } from "../../types/types";
import PaymentHistoryModal from "./modal/PaymentHistoryModal";
import AllPaidModal from "./modal/AllPaidModal";
import RepaySingleDebt from "./modal/RepaySingleDebt";
import DebtRecordTable from "./DebtRecordTable";
import Result from "./Result";

function DebtorPage() {
  const { id } = useParams();
  const {
    debtor,
    debts,
    debtorLoading,
    debtsLoading,
    addDebtToDebtor,
    debtRepayment,
    debtsHistory,
    repaySingleDebt,
  } = useDebtor(Number(id));

  const [open, setOpen] = useState(false);
  const [openRepayment, setOpenRepayment] = useState(false);
  const [openHistoryPayment, setOpenHistoryPayment] = useState(false);
  const [openAllPaidModal, setOpenAllPaidModal] = useState(false);
  const [openRepaySingleDebt, setOpenRepaySingleDebt] = useState(false);
  const [selectedDebtId, setSelectedDebtId] = useState<number | null>(null);
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState<ResulType>(null);

  if (debtorLoading || debtsLoading) {
    return (
      <Container sx={{ py: 4 }}>
        <Box sx={{ width: "100%" }}>
          <LinearProgress sx={{ height: 3, borderRadius: 2 }} />
          <Box sx={{ textAlign: "center", mt: 4 }}>
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

  const handleCloseRepayModal = () => {
    setOpenRepaySingleDebt(false);
  };

  const allPaid =
    debts.length > 0 && debts.every((debt) => debt.status === true);

  if (!debtor) {
    return (
      <Container sx={{ py: 6 }}>
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: "center",
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box
            sx={{
              bgcolor: "#ffebee",
              borderRadius: "50%",
              width: 100,
              height: 100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
              mb: 3,
            }}
          >
            <FaExclamationTriangle size={48} color="#d32f2f" />
          </Box>
          <Typography variant="h4" fontWeight="700" color="error" gutterBottom>
            Debtor Not Found
          </Typography>
          <Typography
            variant="body1"
            color="textSecondary"
            sx={{ mb: 4, maxWidth: 500, mx: "auto" }}
          >
            The debtor you are looking for does not exist or has been removed
            from the system.
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
              textTransform: "none",
              fontWeight: 600,
              fontSize: "1rem",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
              },
              transition: "all 0.3s ease",
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

  const handleRepayment = async (amount: number) => {
    const response = await debtRepayment(amount);
    return response;
  };

  const handleRepaymentClick = () => {
    if (allPaid) {
      setOpenAllPaidModal(true);
    } else {
      setOpenRepayment(true);
    }
  };

  const handleSingleRepay = (amount: number) => {
    if (!selectedDebtId) return;
    repaySingleDebt(selectedDebtId, amount);
    setOpenRepaySingleDebt(false);
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
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: "50%",
              bgcolor: "rgba(255, 255, 255, 0.1)",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              bottom: -30,
              left: -30,
              width: 150,
              height: 150,
              borderRadius: "50%",
              bgcolor: "rgba(255, 255, 255, 0.1)",
            }}
          />

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 3,
              position: "relative",
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
                  boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                  border: "4px solid rgba(255, 255, 255, 0.3)",
                }}
              >
                {getInitials(debtor.full_name)}
              </Avatar>
              <Box>
                <Typography
                  variant="h4"
                  fontWeight="700"
                  gutterBottom
                  sx={{ mb: 1.5 }}
                >
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
                    icon={<FaUser style={{ fontSize: "14px" }} />}
                    label={`ID: #${debtor.debtor_id}`}
                    size="small"
                    sx={{
                      bgcolor: "rgba(255,255,255,0.25)",
                      color: "white",
                      fontWeight: "600",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255,255,255,0.3)",
                      "& .MuiChip-icon": {
                        color: "white",
                      },
                    }}
                  />
                  <Chip
                    icon={<FaPhone style={{ fontSize: "14px" }} />}
                    label={formatPhoneNumber(debtor.phone_number)}
                    size="small"
                    sx={{
                      bgcolor: "rgba(255,255,255,0.25)",
                      color: "white",
                      fontWeight: "600",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255,255,255,0.3)",
                      "& .MuiChip-icon": {
                        color: "white",
                      },
                    }}
                  />
                  <Chip
                    icon={<FaMoneyBillWave style={{ fontSize: "14px" }} />}
                    label={`Total: ${formatCurrency(debtor.total_debt || 0)}`}
                    size="small"
                    sx={{
                      bgcolor: "rgba(255,255,255,0.95)",
                      color: "#667eea",
                      fontWeight: "700",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      "& .MuiChip-icon": {
                        color: "#667eea",
                      },
                    }}
                  />
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
              <Tooltip
                title={allPaid ? "All debts are paid" : "Make a payment"}
                arrow
              >
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
                    textTransform: "none",
                    fontWeight: "700",
                    fontSize: "0.95rem",
                    boxShadow: allPaid
                      ? "0 4px 12px rgba(76, 175, 80, 0.3)"
                      : "0 4px 12px rgba(0,0,0,0.15)",
                    "&:hover": {
                      bgcolor: allPaid ? "#388E3C" : "rgba(255,255,255,0.95)",
                      transform: "translateY(-2px)",
                      boxShadow: allPaid
                        ? "0 6px 16px rgba(76, 175, 80, 0.4)"
                        : "0 6px 16px rgba(0,0,0,0.2)",
                    },
                    transition: "all 0.3s ease",
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
                    textTransform: "none",
                    fontWeight: "700",
                    fontSize: "0.95rem",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,0.3)",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.35)",
                      transform: "translateY(-2px)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  Add Debt
                </Button>
              </Tooltip>
              <Tooltip title="Return to list" arrow>
                <IconButton
                  component={Link}
                  to="/debtor"
                  sx={{
                    bgcolor: "rgba(255,255,255,0.25)",
                    color: "white",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,0.3)",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.35)",
                      transform: "translateY(-2px)",
                    },
                    transition: "all 0.3s ease",
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

     <Result result={result} setResult={setResult} />

      {/* Debt Records Table */}
      <DebtRecordTable
        debtor={debtor}
        debts={debts}
        setOpen={setOpen}
        allPaid={allPaid}
        setOpenHistoryPayment={setOpenHistoryPayment}
        setOpenRepaySingleDebt={setOpenRepaySingleDebt}
        setSelectedDebtId={setSelectedDebtId}
        setOpenAllPaidModal={setOpenAllPaidModal}
      />

      {/* Modals */}
      <DebtForm
        open={open}
        handleClose={handleClose}
        onSubmit={handleAddDebt}
      />
      <RepaymentForm
        open={openRepayment}
        handleClose={handleCloseRepayment}
        onSubmit={handleRepayment}
        amount={amount}
        setAmount={setAmount}
        result={result}
        setResult={setResult}
      />
      <PaymentHistoryModal
        open={openHistoryPayment}
        handleClose={handleCloseHistoryPayment}
        debtsHistory={debtsHistory}
      />

      <AllPaidModal
        open={openAllPaidModal}
        onClose={() => setOpenAllPaidModal(false)}
      />

      <RepaySingleDebt
        open={openRepaySingleDebt}
        handleClose={handleCloseRepayModal}
        onSubmit={handleSingleRepay}
        debt_id={selectedDebtId!}
      />
    </Container>
  );
}

export default DebtorPage;
