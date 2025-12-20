import { Box, Avatar, Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody, Chip, IconButton, Tooltip, Button, Pagination } from "@mui/material";
import { FaUser, FaUserPlus, FaPhone, FaChevronRight } from "react-icons/fa";
import { getInitials, getDebtColor, formatCurrency, formatPhoneNumber, getAvatarColor2, } from "../../utils";
import type { Debtor } from "../../types/types";
import { useNavigate } from "react-router-dom";

interface Props {
    debtors: { data: Debtor[] ; total: number; length: number; };
    handlePageChange: (event: React.ChangeEvent<unknown>, value: number) => void;
    setOpen: (open: boolean) => void;
    page: number;
    limit: number;
    totalDebt: number;
}
function DebtorTable({ debtors, handlePageChange, setOpen , page, limit, totalDebt}: Props) {
    const navigate = useNavigate();
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
        <Box sx={{ p: 4 }}>
          {debtors.data.length === 0 ? (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              py={10}
              gap={2}
            >
              <Box
                sx={{
                  bgcolor: "#f5f5f5",
                  borderRadius: "50%",
                  p: 4,
                  mb: 2,
                }}
              >
                <FaUser size={72} color="#9e9e9e" />
              </Box>
              <Typography variant="h5" fontWeight="600" color="text.primary">
                No debtors found
              </Typography>
              <Typography
                variant="body1"
                color="textSecondary"
                sx={{ maxWidth: 400, textAlign: "center" }}
              >
                Add your first debtor to start tracking debts and managing
                accounts efficiently
              </Typography>
              <Button
                variant="contained"
                onClick={() => setOpen(true)}
                startIcon={<FaUserPlus />}
                sx={{
                  mt: 3,
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
                Add First Debtor
              </Button>
            </Box>
          ) : (
            <>
              <Box sx={{ overflowX: "auto" }}>
                <Table
                  sx={{
                    minWidth: 650,
                    "& .MuiTableCell-root": {
                      py: 2.5,
                      borderColor: "divider",
                    },
                  }}
                >
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#fafafa" }}>
                      <TableCell
                        sx={{
                          fontWeight: "700",
                          fontSize: "0.95rem",
                          color: "text.primary",
                        }}
                      >
                        Debtor
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: "700",
                          fontSize: "0.95rem",
                          color: "text.primary",
                        }}
                      >
                        Contact
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: "700",
                          fontSize: "0.95rem",
                          color: "text.primary",
                        }}
                      >
                        Total Debt
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: "700",
                          fontSize: "0.95rem",
                          color: "text.primary",
                        }}
                      >
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {debtors.data.map((debtor: Debtor) => (
                      <TableRow
                        key={debtor.debtor_id}
                        sx={{
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            backgroundColor: "#f8f9fc",
                            "& td": {
                              color: "primary.main",
                            },
                            "& .action-button": {
                              opacity: 1,
                            },
                          },
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                        onClick={() => navigate(`/debtor/${debtor.debtor_id}`)}
                      >
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar
                              sx={{
                                bgcolor: getAvatarColor2(debtor.full_name),
                                width: 44,
                                height: 44,
                                fontWeight: "700",
                                fontSize: "1rem",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                              }}
                            >
                              {getInitials(debtor.full_name)}
                            </Avatar>
                            <Box>
                              <Typography
                                variant="body1"
                                fontWeight="600"
                                sx={{ mb: 0.25 }}
                              >
                                {debtor.full_name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="textSecondary"
                                sx={{ fontSize: "0.8rem" }}
                              >
                                ID: #{debtor.debtor_id}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1.5}>
                            <Box
                              sx={{
                                bgcolor: "#f5f5f5",
                                borderRadius: 1,
                                p: 0.75,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <FaPhone size={12} color="#666" />
                            </Box>
                            <Typography variant="body2" fontWeight="500">
                              {formatPhoneNumber(debtor.phone_number)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={formatCurrency(debtor.total_debt || 0)}
                            color={getDebtColor(debtor.total_debt || 0)}
                            size="medium"
                            sx={{
                              fontWeight: "700",
                              fontSize: "0.9rem",
                              minWidth: "120px",
                              height: "36px",
                              borderRadius: 2,
                              boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="View details">
                            <IconButton
                              className="action-button"
                              size="small"
                              sx={{
                                opacity: 0.7,
                                transition: "all 0.2s ease",
                                "&:hover": {
                                  bgcolor: "primary.main",
                                  color: "white",
                                },
                              }}
                            >
                              <FaChevronRight size={16} />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>

              <Box display="flex" justifyContent="center" mt={4}>
                <Pagination
                  count={Math.ceil(debtors.total / limit)}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
              {/* Summary Footer */}
              <Box
                sx={{
                  mt: 4,
                  p: 3,
                  bgcolor: "#f8f9fc",
                  borderRadius: 3,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 2,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography
                  variant="body2"
                  color="textSecondary"
                  fontWeight="500"
                >
                  Showing{" "}
                  <strong style={{ color: "#1976d2" }}>{debtors.length}</strong>{" "}
                  debtor{debtors.length !== 1 ? "s" : ""}
                </Typography>
                <Box display="flex" gap={2} alignItems="center">
                  <Chip
                    label="Total Outstanding"
                    size="small"
                    sx={{
                      bgcolor: "white",
                      fontWeight: 600,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  />
                  <Typography
                    variant="h6"
                    fontWeight="700"
                    sx={{
                      color: "#d32f2f",
                      fontSize: "1.25rem",
                    }}
                  >
                    {formatCurrency(totalDebt)}
                  </Typography>
                </Box>
              </Box>
            </>
          )}
        </Box>
      </Paper>

  )
}

export default DebtorTable