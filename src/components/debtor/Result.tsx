import {
  Box,
  Paper,
    Typography,
    IconButton,
    Tooltip,
    Chip,
    Button,
} from "@mui/material";
import { FaCheckCircle, FaClock, FaExclamationTriangle, FaLightbulb, FaMoneyBillWave, FaTimes, FaTimesCircle } from "react-icons/fa";
import { LinearProgress } from "@mui/material";
import { formatCurrency } from "../../utils";
import type { ResulType } from "../../types/types";

interface Props{
    result: ResulType | null;
    setResult: (value: ResulType | null) => void;
}

function Result({ result, setResult,  }: Props) {
  return (
    <>
    {result && result.success && (
        <Paper
          elevation={0}
          sx={{
            mb: 3,
            borderRadius: 3,
            overflow: "hidden",
            border: "none",
            background: "linear-gradient(135deg, #f8fafc 0%, #f0f9ff 100%)",
            boxShadow:
              "0 10px 30px rgba(76, 175, 80, 0.12), 0 4px 12px rgba(76, 175, 80, 0.08)",
            position: "relative",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "4px",
              background: "linear-gradient(90deg, #4CAF50 0%, #66BB6A 100%)",
            },
          }}
        >
          {/* Success Header */}
          <Box sx={{ p: 3, pb: 2.5 }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="flex-start"
            >
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    position: "relative",
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      background: "rgba(76, 175, 80, 0.08)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: "white",
                      color: "#4CAF50",
                      p: 1.5,
                      borderRadius: "14px",
                      display: "flex",
                      border: "1.5px solid rgba(76, 175, 80, 0.15)",
                      boxShadow: "0 4px 12px rgba(76, 175, 80, 0.12)",
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    <FaCheckCircle size={20} />
                  </Box>
                </Box>
                <Box>
                  <Typography
                    variant="h6"
                    fontWeight="700"
                    color="#1B5E20"
                    sx={{ mb: 0.25 }}
                  >
                    Payment Successful! 🎉
                  </Typography>
                  <Typography
                    variant="body2"
                    color="#64748B"
                    sx={{ fontSize: "0.875rem" }}
                  >
                    {result.message}
                  </Typography>
                </Box>
              </Box>
              <Tooltip title="Clear notification" arrow>
                <IconButton
                  size="small"
                  onClick={() => setResult(null)}
                  sx={{
                    color: "#94A3B8",
                    bgcolor: "white",
                    border: "1px solid #E2E8F0",
                    width: "32px",
                    height: "32px",
                    "&:hover": {
                      bgcolor: "#FFEBEE",
                      color: "#EF4444",
                      borderColor: "#FECACA",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  <FaTimesCircle size={14} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Processed Debts Section */}
          {result.processed_debts && result.processed_debts.length > 0 && (
            <Box sx={{ px: 3, pb: 2.5 }}>
              <Box display="flex" alignItems="center" gap={1.5} mb={2.5}>
                <Box
                  sx={{
                    width: "3px",
                    height: "18px",
                    background:
                      "linear-gradient(180deg, #4CAF50 0%, #2E7D32 100%)",
                    borderRadius: "3px",
                  }}
                />
                <Typography
                  variant="subtitle1"
                  fontWeight="600"
                  color="#334155"
                >
                  📋 Processed Debts
                </Typography>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {result.processed_debts.map((debt) => (
                  <Paper
                    key={debt.debt_id}
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: 2.5,
                      border: "1px solid #E2E8F0",
                      background:
                        "linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 100%)",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        borderColor: "#86EFAC",
                        boxShadow: "0 4px 20px rgba(76, 175, 80, 0.1)",
                      },
                    }}
                  >
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Box>
                        <Typography
                          variant="caption"
                          color="#64748B"
                          fontWeight="500"
                          display="block"
                        >
                          Debt #{debt.debt_id}
                        </Typography>
                        <Typography
                          variant="h6"
                          fontWeight="700"
                          color="#1B5E20"
                        >
                          {formatCurrency(debt.paid)}
                        </Typography>
                      </Box>
                      <Chip
                        icon={
                          debt.status === "fully_paid" ? (
                            <FaCheckCircle size={12} />
                          ) : (
                            <FaClock size={12} />
                          )
                        }
                        label={
                          debt.status === "fully_paid"
                            ? "FULLY PAID"
                            : "PARTIAL"
                        }
                        color={
                          debt.status === "fully_paid" ? "success" : "warning"
                        }
                        size="small"
                        sx={{
                          fontWeight: "600",
                          fontSize: "0.75rem",
                          px: 1.5,
                          py: 0.75,
                          borderRadius: "10px",
                        }}
                      />
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={debt.status === "fully_paid" ? 100 : 50}
                      sx={{
                        mt: 1.5,
                        height: 6,
                        borderRadius: 3,
                        bgcolor: "#F1F5F9",
                        "& .MuiLinearProgress-bar": {
                          borderRadius: 3,
                          background:
                            debt.status === "fully_paid"
                              ? "linear-gradient(90deg, #4CAF50 0%, #66BB6A 100%)"
                              : "linear-gradient(90deg, #F59E0B 0%, #FBBF24 100%)",
                        },
                      }}
                    />
                  </Paper>
                ))}
              </Box>
            </Box>
          )}

          {/* Excess Payment Section */}
          {result.remaining_amount > 0 && (
            <Box
              sx={{
                mx: 3,
                mb: 2.5,
                p: 2.5,
                borderRadius: 2.5,
                background: "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)",
                border: "1.5px solid #FCD34D",
                position: "relative",
              }}
            >
              <Box display="flex" alignItems="flex-start" gap={2} mb={2.5}>
                <Box
                  sx={{
                    color: "#D97706",
                    flexShrink: 0,
                    mt: 0.25,
                  }}
                >
                  <FaExclamationTriangle size={18} />
                </Box>
                <Box>
                  <Typography
                    variant="subtitle2"
                    fontWeight="600"
                    color="#92400E"
                    gutterBottom
                  >
                    Excess Payment
                  </Typography>
                  <Typography
                    variant="body2"
                    color="#92400E"
                    sx={{ opacity: 0.8, fontSize: "0.8125rem" }}
                  >
                    Couldn't be applied to any pending debts
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  background: "white",
                  border: "1.5px solid #FBBF24",
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="caption"
                  color="#92400E"
                  fontWeight="500"
                  display="block"
                  gutterBottom
                >
                  Unused Amount
                </Typography>
                <Typography
                  variant="h5"
                  fontWeight="800"
                  color="#D97706"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                  }}
                >
                  <FaMoneyBillWave size={20} />
                  {formatCurrency(result.remaining_amount)}
                </Typography>
              </Box>

              <Box
                sx={{
                  mt: 2,
                  p: 1.5,
                  borderRadius: 2,
                  background: "rgba(255, 255, 255, 0.7)",
                  border: "1px solid rgba(251, 191, 36, 0.2)",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 1.5,
                }}
              >
                <Box sx={{ color: "#F59E0B", flexShrink: 0, mt: 0.25 }}>
                  <FaLightbulb size={14} />
                </Box>
                <Typography
                  variant="caption"
                  color="#78350F"
                  sx={{ fontStyle: "italic", lineHeight: 1.4 }}
                >
                  This amount will remain in your balance for future payments.
                </Typography>
              </Box>
            </Box>
          )}

          {/* Total Summary */}
          <Box
            sx={{
              mx: 3,
              mb: 3,
              p: 2.5,
              borderRadius: 2.5,
              background: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)",
              border: "1.5px solid #93C5FD",
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="flex-end"
            >
              <Box>
                <Typography
                  variant="caption"
                  color="#475569"
                  fontWeight="500"
                  display="block"
                  gutterBottom
                >
                  TOTAL PAID
                </Typography>
                <Typography
                  variant="h5"
                  fontWeight="800"
                  color="#1E40AF"
                  sx={{ lineHeight: 1 }}
                >
                  {formatCurrency(result.total_paid)}
                </Typography>
              </Box>

              {result.remaining_amount > 0 && (
                <Box>
                  <Typography
                    variant="caption"
                    color="#B45309"
                    fontWeight="500"
                    display="block"
                    gutterBottom
                  >
                    UNUSED
                  </Typography>
                  <Typography variant="h6" fontWeight="700" color="#B45309">
                    {formatCurrency(result.remaining_amount)}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          {/* Action Button */}
          <Box sx={{ px: 3, pb: 3, textAlign: "center" }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setResult(null)}
              startIcon={<FaTimes size={12} />}
              sx={{
                textTransform: "none",
                fontWeight: 500,
                px: 2.5,
                py: 0.75,
                borderRadius: 2,
                borderColor: "#DC2626",
                color: "#DC2626",
                fontSize: "0.8125rem",
                "&:hover": {
                  borderColor: "#B91C1C",
                  bgcolor: "rgba(220, 38, 38, 0.04)",
                },
              }}
            >
              Clear Notification
            </Button>
          </Box>
        </Paper>
      )}
    </>
  )
}

export default Result