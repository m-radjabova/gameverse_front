import { useParams } from "react-router-dom";
import useDebtor from "../../hooks/useDebtor";
import {
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
  FaExclamationTriangle,
  FaCheckCircle,
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
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 600, px: 4 }}>
          <LinearProgress
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: "rgba(255, 255, 255, 0.2)",
              "& .MuiLinearProgress-bar": {
                background:
                  "linear-gradient(90deg, #fff 0%, rgba(255, 255, 255, 0.8) 100%)",
              },
            }}
          />
          <Typography
            variant="h5"
            sx={{
              textAlign: "center",
              mt: 4,
              color: "white",
              fontWeight: 600,
            }}
          >
            Loading debtor information...
          </Typography>
        </Box>
      </Box>
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
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#f8f9fc",
          p: 3,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 8,
            textAlign: "center",
            maxWidth: 600,
            width: "100%",
            border: "2px solid",
            borderColor: "divider",
          }}
        >
          <Box
            sx={{
              bgcolor: "#ffebee",
              borderRadius: "50%",
              width: 120,
              height: 120,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
              mb: 4,
            }}
          >
            <FaExclamationTriangle size={56} color="#d32f2f" />
          </Box>
          <Typography variant="h3" fontWeight="800" color="error" gutterBottom>
            Debtor Not Found
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 5, fontSize: "1.1rem", lineHeight: 1.7 }}
          >
            The debtor you are looking for does not exist or has been removed
            from the system.
          </Typography>
          <Button
            component={Link}
            to="/home/debtor"
            variant="contained"
            size="large"
            startIcon={<FaArrowLeft />}
            sx={{
              px: 5,
              py: 1.75,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
              fontSize: "1.1rem",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              boxShadow: "0 8px 24px rgba(102, 126, 234, 0.3)",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 12px 32px rgba(102, 126, 234, 0.4)",
              },
              transition: "all 0.3s ease",
            }}
          >
            Back to Debtors
          </Button>
        </Paper>
      </Box>
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
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f8f9fc",
      }}
    >
      {/* Header Section */}
      <Paper
        elevation={0}
        sx={{
          overflow: "hidden",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            p: 3,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            position: "relative",
          }}
        >
          {/* Background decorative elements */}
          <Box
            sx={{
              position: "absolute",
              top: -50,
              right: -50,
              width: 250,
              height: 250,
              borderRadius: "50%",
              bgcolor: "rgba(255, 255, 255, 0.08)",
              filter: "blur(40px)",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              bottom: -40,
              left: -40,
              width: 200,
              height: 200,
              borderRadius: "50%",
              bgcolor: "rgba(255, 255, 255, 0.08)",
              filter: "blur(40px)",
            }}
          />

          <Box
            sx={{
              // maxWidth: 1400,
              mx: "auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 4,
              position: "relative",
              zIndex: 1,
            }}
          >
            {/* Debtor Info */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor: "white",
                  color: "#667eea",
                  fontSize: "2.5rem",
                  fontWeight: "800",
                  boxShadow: "0 12px 32px rgba(0,0,0,0.25)",
                  border: "5px solid rgba(255, 255, 255, 0.3)",
                }}
              >
                {getInitials(debtor.full_name)}
              </Avatar>
              <Box>
                <Typography
                  variant="h3"
                  fontWeight="800"
                  sx={{
                    mb: 1.5,
                    textShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  }}
                >
                  {debtor.full_name}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    flexWrap: "wrap",
                  }}
                >
                  <Chip
                    icon={<FaUser style={{ fontSize: "14px" }} />}
                    label={`ID: #${debtor.debtor_id}`}
                    sx={{
                      bgcolor: "rgba(255,255,255,0.2)",
                      color: "white",
                      fontWeight: "700",
                      fontSize: "0.9rem",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255,255,255,0.3)",
                      px: 1,
                      height: 36,
                      "& .MuiChip-icon": {
                        color: "white",
                      },
                    }}
                  />
                  <Chip
                    icon={<FaPhone style={{ fontSize: "14px" }} />}
                    label={formatPhoneNumber(debtor.phone_number)}
                    sx={{
                      bgcolor: "rgba(255,255,255,0.2)",
                      color: "white",
                      fontWeight: "700",
                      fontSize: "0.9rem",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255,255,255,0.3)",
                      px: 1,
                      height: 36,
                      "& .MuiChip-icon": {
                        color: "white",
                      },
                    }}
                  />
                  <Chip
                    icon={
                      allPaid ? (
                        <FaCheckCircle style={{ fontSize: "14px" }} />
                      ) : (
                        <FaMoneyBillWave style={{ fontSize: "14px" }} />
                      )
                    }
                    label={`Total: ${formatCurrency(debtor.total_debt || 0)}`}
                    sx={{
                      bgcolor: allPaid ? "#4CAF50" : "white",
                      color: allPaid ? "white" : "#667eea",
                      fontWeight: "800",
                      fontSize: "0.95rem",
                      px: 1.5,
                      height: 36,
                      boxShadow: allPaid
                        ? "0 4px 16px rgba(76, 175, 80, 0.4)"
                        : "0 4px 16px rgba(0,0,0,0.2)",
                      "& .MuiChip-icon": {
                        color: allPaid ? "white" : "#667eea",
                      },
                    }}
                  />
                </Box>
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Tooltip
                title={allPaid ? "All debts are paid" : "Make a payment"}
                arrow
              >
                <span>
                  <Button
                    variant="contained"
                    startIcon={
                      allPaid ? <FaCheckCircle /> : <FaMoneyBillWave />
                    }
                    onClick={handleRepaymentClick}
                    sx={{
                      bgcolor: allPaid ? "#4CAF50" : "white",
                      color: allPaid ? "white" : "#667eea",
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: "800",
                      fontSize: "1rem",
                      boxShadow: allPaid
                        ? "0 6px 20px rgba(76, 175, 80, 0.4)"
                        : "0 6px 20px rgba(0,0,0,0.2)",
                      "&:hover": {
                        bgcolor: allPaid ? "#388E3C" : "rgba(255,255,255,0.95)",
                        transform: "translateY(-2px)",
                        boxShadow: allPaid
                          ? "0 8px 28px rgba(76, 175, 80, 0.5)"
                          : "0 8px 28px rgba(0,0,0,0.25)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    {allPaid ? "All Paid ✓" : "Repayment"}
                  </Button>
                </span>
              </Tooltip>
              <Tooltip title="Add new debt" arrow>
                <Button
                  variant="contained"
                  startIcon={<FaPlus />}
                  onClick={() => setOpen(true)}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    color: "white",
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: "800",
                    fontSize: "1rem",
                    backdropFilter: "blur(10px)",
                    border: "2px solid rgba(255,255,255,0.3)",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.3)",
                      transform: "translateY(-2px)",
                      borderColor: "rgba(255,255,255,0.5)",
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
                  to="/home/debtor"
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    color: "white",
                    width: 48,
                    height: 48,
                    backdropFilter: "blur(10px)",
                    border: "2px solid rgba(255,255,255,0.3)",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.3)",
                      transform: "translateY(-2px)",
                      borderColor: "rgba(255,255,255,0.5)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  <FaArrowLeft size={20} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Content Section */}
      <Box sx={{mx: "auto", px: 3, py: 4 }}>
        {/* Statistics Cards */}
        <StatisticsCards
          formatCurrency={formatCurrency}
          totalDebt={totalDebts}
          pendingDebt={pendingDebt}
          paidDebt={paidDebt}
          debts={debts}
        />

        {/* Result Component */}
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
      </Box>

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
    </Box>
  );
}

export default DebtorPage;