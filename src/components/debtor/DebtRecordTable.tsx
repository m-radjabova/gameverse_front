import {
    Box,
    Button,
    Chip,
    Divider,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
} from "@mui/material";
import { FaMoneyBillWave, FaReceipt } from "react-icons/fa";
import { FaCalendarAlt, FaChartLine, FaClock, FaHistory, FaPlus } from "react-icons/fa";
import { formatCurrency, formatDateTime, getStatusInfo } from "../../utils";
import type { Debt, Debtor } from "../../types/types";

type Props = {
  debtor: Debtor;
  debts: Debt[];
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  allPaid: boolean;
  setOpenHistoryPayment: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenRepaySingleDebt: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedDebtId: React.Dispatch<React.SetStateAction<number | null>>;
  setOpenAllPaidModal: React.Dispatch<React.SetStateAction<boolean>>;
};

function DebtRecordTable({ debtor, debts, setOpen, allPaid, setOpenHistoryPayment, setOpenAllPaidModal, setOpenRepaySingleDebt, setSelectedDebtId }: Props) {
  return (
   <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            p: 3,
            bgcolor: "#fafafa",
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
                  bgcolor: "#e3f2fd",
                  color: "#1976d2",
                  p: 1,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FaReceipt size={20} />
              </Box>
              Debt Records
            </Typography>
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{ mt: 0.5, ml: 5.5 }}
            >
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
                textTransform: "none",
                fontWeight: "600",
                fontSize: "0.95rem",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                "&:hover": {
                  bgcolor: "primary.dark",
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
                },
                transition: "all 0.3s ease",
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
                    <TableCell
                      sx={{
                        fontWeight: "700",
                        width: "80px",
                        color: "text.primary",
                      }}
                    >
                      #
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: "700", color: "text.primary" }}
                    >
                      <Box display="flex" alignItems="center" gap={1}>
                        <FaCalendarAlt size={14} />
                        Date & Time
                      </Box>
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: "700", color: "text.primary" }}
                    >
                      <Box display="flex" alignItems="center" gap={1}>
                        <FaMoneyBillWave size={14} />
                        Amount
                      </Box>
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: "700", color: "text.primary" }}
                    >
                      <Box display="flex" alignItems="center" gap={1}>
                        <FaChartLine size={14} />
                        Status
                      </Box>
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: "700", color: "text.primary" }}
                    >
                      <Box display="flex" alignItems="center" gap={1}>
                        <FaClock size={14} />
                        Remaining
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
                        onClick={() => {
                          if (allPaid) {
                            setOpenAllPaidModal(true);
                            return;
                          }
                          setSelectedDebtId(debt.debt_id);
                          setOpenRepaySingleDebt(true);
                        }}
                        sx={{
                          cursor: allPaid ? "not-allowed" : "pointer",
                          transition: "all 0.2s ease",
                          opacity: allPaid ? 0.6 : 1,
                          "&:hover": {
                            bgcolor: allPaid ? "transparent" : "#f8f9fc",
                            boxShadow: allPaid
                              ? "none"
                              : "0 4px 12px rgba(0,0,0,0.1)",
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
                              bgcolor: "#f5f5f5",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 600,
                              color: "text.secondary",
                            }}
                          >
                            {index + 1}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body1"
                            fontWeight="600"
                            color="text.primary"
                          >
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
                              boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={<FaClock />}
                            label={formatCurrency(debt.remaining || 0)}
                            variant="outlined"
                            sx={{
                              fontWeight: "700",
                              color: "#FF9800",
                              border: "2px solid #FF9800",
                              height: 36,
                              fontSize: "0.875rem",
                              "& .MuiChip-icon": {
                                color: "#FF9800",
                                fontSize: "14px",
                              },
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
              <Typography
                variant="body2"
                color="textSecondary"
                fontWeight="500"
              >
                Showing{" "}
                <strong style={{ color: "#1976d2" }}>{debts.length}</strong>{" "}
                debt record
                {debts.length !== 1 ? "s" : ""}
              </Typography>
              <Box display="flex" gap={2} alignItems="center">
                <Chip
                  icon={<FaReceipt style={{ fontSize: "14px" }} />}
                  label="Total Records"
                  size="small"
                  sx={{
                    bgcolor: "white",
                    fontWeight: 600,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                />
                <Typography variant="h6" fontWeight="700" color="primary">
                  {debts.length}
                </Typography>
              </Box>
            </Box>
          </>
        ) : (
          <Box
            sx={{
              p: 10,
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                bgcolor: "#f5f5f5",
                borderRadius: "50%",
                width: 120,
                height: 120,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
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
            <Typography
              variant="body1"
              color="textSecondary"
              sx={{ mb: 4, maxWidth: 400 }}
            >
              This debtor has no debt records yet. Add the first debt record to
              start tracking.
            </Typography>
            <Button
              variant="contained"
              startIcon={<FaPlus />}
              onClick={() => setOpen(true)}
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
              Add First Debt Record
            </Button>
          </Box>
        )}
      </Paper>
  )
}

export default DebtRecordTable