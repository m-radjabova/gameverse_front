import {
  Box,
  Button,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Avatar,
  Card,
  CardContent,
  LinearProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import useDebtor from "../../hooks/useDebtor";
import { useState } from "react";
import DebtorForm from "./DebtorForm";
import type { ReqDebtor, Debtor } from "../../types/types";
import {
  FaUserPlus,
  FaUser,
  FaPhone,
  FaMoneyBillWave,
  FaIdCard,
  FaSortAmountDown,
  FaChevronRight,
} from "react-icons/fa";
import { formatCurrency, formatPhoneNumber, getAvatarColor, getDebtColor, getInitials } from "../../utils";
import { useNavigate } from "react-router-dom";

function DebtorList() {
  const [open, setOpen] = useState(false);
  const { debtors, debtorsLoading,addDebtor } = useDebtor();
  const navigate = useNavigate();

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = (data: ReqDebtor) => {
    addDebtor(data);
    handleClose();
  };

  const totalDebtors = debtors.length;
  const totalDebt = debtors.reduce((sum, debtor) => sum + (debtor.total_debt || 0), 0);
  const highDebtCount = debtors.filter(d => (d.total_debt || 0) > 5000).length;

  if (debtorsLoading) {
    return (
      <Container sx={{ py: 4 }}>
        <Box sx={{ width: '100%' }}>
          <LinearProgress sx={{ height: 3, borderRadius: 2 }} />
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="h6" color="textSecondary">
              Loading debtors information...
            </Typography>
          </Box>
        </Box>
      </Container>
    );
  }
  return (
    <Container maxWidth="xl" sx={{ p: 4 }}>
      {/* Header Section */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          overflow: 'hidden',
          mb: 4,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box
          sx={{
            p: 4,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 3,
          }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Box
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                p: 1.5,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FaIdCard size={28} />
            </Box>
            <Box>
              <Typography variant="h4" component="h1" fontWeight="700" sx={{ mb: 0.5 }}>
                Debt Management
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.95 }}>
                Track and manage all debtor accounts
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            onClick={() => setOpen(true)}
            size="large"
            sx={{
              bgcolor: 'white',
              color: '#667eea',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.95)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
              },
              px: 4,
              py: 1.5,
              borderRadius: 3,
              fontWeight: '600',
              textTransform: 'none',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
            startIcon={<FaUserPlus />}
          >
            Add New Debtor
          </Button>
        </Box>

        {/* Statistics Cards */}
        <Box sx={{ p: 4, bgcolor: '#f8f9fc' }}>
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 3,
            justifyContent: 'center'
          }}>
            {/* Total Debtors Card */}
            <Card
              sx={{
                borderRadius: 3,
                bgcolor: 'white',
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                flex: '1 1 300px',
                maxWidth: '400px',
                minWidth: '280px',
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
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1, fontWeight: 500 }}>
                      Total Debtors
                    </Typography>
                    <Typography variant="h3" fontWeight="700" color="primary">
                      {totalDebtors}
                    </Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                      Active accounts
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
                    <FaUser size={28} />
                  </Avatar>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={100}
                  sx={{
                    mt: 2.5,
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

            {/* Total Debt Card */}
            <Card
              sx={{
                borderRadius: 3,
                bgcolor: 'white',
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                flex: '1 1 300px',
                maxWidth: '400px',
                minWidth: '280px',
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
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1, fontWeight: 500 }}>
                      Total Debt
                    </Typography>
                    <Typography variant="h3" fontWeight="700" color="error.main">
                      {formatCurrency(totalDebt)}
                    </Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                      Outstanding balance
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      bgcolor: '#ffebee',
                      color: '#d32f2f',
                      width: 64,
                      height: 64,
                      boxShadow: '0 4px 12px rgba(211, 47, 47, 0.2)',
                    }}
                  >
                    <FaMoneyBillWave size={28} />
                  </Avatar>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min((totalDebt / 100000) * 100, 100)}
                  sx={{
                    mt: 2.5,
                    height: 8,
                    borderRadius: 4,
                    bgcolor: '#ffebee',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: '#d32f2f',
                      borderRadius: 4,
                    },
                  }}
                />
              </CardContent>
            </Card>

            {/* High Debt Accounts Card */}
            <Card
              sx={{
                borderRadius: 3,
                bgcolor: 'white',
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                flex: '1 1 300px',
                maxWidth: '400px',
                minWidth: '280px',
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
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1, fontWeight: 500 }}>
                      High Debt Accounts
                    </Typography>
                    <Typography variant="h3" fontWeight="700" color="warning.main">
                      {highDebtCount}
                    </Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                      Over $5,000
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
                    <FaSortAmountDown size={28} />
                  </Avatar>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={totalDebtors > 0 ? (highDebtCount / totalDebtors) * 100 : 0}
                  sx={{
                    mt: 2.5,
                    height: 8,
                    borderRadius: 4,
                    bgcolor: '#fff3e0',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: '#f57c00',
                      borderRadius: 4,
                    },
                  }}
                />
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Paper>

      {/* Debtors Table */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ p: 4 }}>
          {debtors.length === 0 ? (
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
                  bgcolor: '#f5f5f5',
                  borderRadius: '50%',
                  p: 4,
                  mb: 2,
                }}
              >
                <FaUser size={72} color="#9e9e9e" />
              </Box>
              <Typography variant="h5" fontWeight="600" color="text.primary">
                No debtors found
              </Typography>
              <Typography variant="body1" color="textSecondary" sx={{ maxWidth: 400, textAlign: 'center' }}>
                Add your first debtor to start tracking debts and managing accounts efficiently
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
                Add First Debtor
              </Button>
            </Box>
          ) : (
            <>
              <Box sx={{ overflowX: 'auto' }}>
                <Table sx={{ 
                  minWidth: 650,
                  '& .MuiTableCell-root': {
                    py: 2.5,
                    borderColor: 'divider',
                  }
                }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#fafafa' }}>
                      <TableCell sx={{ fontWeight: '700', fontSize: '0.95rem', color: 'text.primary' }}>
                        Debtor
                      </TableCell>
                      <TableCell sx={{ fontWeight: '700', fontSize: '0.95rem', color: 'text.primary' }}>
                        Contact
                      </TableCell>
                      <TableCell sx={{ fontWeight: '700', fontSize: '0.95rem', color: 'text.primary' }}>
                        Total Debt
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: '700', fontSize: '0.95rem', color: 'text.primary' }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {debtors.map((debtor: Debtor) => (
                      <TableRow
                        key={debtor.debtor_id}
                        sx={{
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: '#f8f9fc',
                            '& td': { 
                              color: 'primary.main',
                            },
                            '& .action-button': {
                              opacity: 1,
                            }
                          },
                          '&:last-child td, &:last-child th': { border: 0 }
                        }}
                        onClick={() => navigate(`/debtor/${debtor.debtor_id}`)}
                      >
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar
                              sx={{
                                bgcolor: getAvatarColor(debtor.full_name),
                                width: 44,
                                height: 44,
                                fontWeight: '700',
                                fontSize: '1rem',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                              }}
                            >
                              {getInitials(debtor.full_name)}
                            </Avatar>
                            <Box>
                              <Typography variant="body1" fontWeight="600" sx={{ mb: 0.25 }}>
                                {debtor.full_name}
                              </Typography>
                              <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.8rem' }}>
                                ID: #{debtor.debtor_id}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1.5}>
                            <Box
                              sx={{
                                bgcolor: '#f5f5f5',
                                borderRadius: 1,
                                p: 0.75,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
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
                              fontWeight: '700',
                              fontSize: '0.9rem',
                              minWidth: '120px',
                              height: '36px',
                              borderRadius: 2,
                              boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
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
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  bgcolor: 'primary.main',
                                  color: 'white',
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

              {/* Summary Footer */}
              <Box
                sx={{
                  mt: 4,
                  p: 3,
                  bgcolor: '#f8f9fc',
                  borderRadius: 3,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography variant="body2" color="textSecondary" fontWeight="500">
                  Showing <strong style={{ color: '#1976d2' }}>{debtors.length}</strong> debtor{debtors.length !== 1 ? 's' : ''}
                </Typography>
                <Box display="flex" gap={2} alignItems="center">
                  <Chip
                    label="Total Outstanding"
                    size="small"
                    sx={{
                      bgcolor: 'white',
                      fontWeight: 600,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  />
                  <Typography variant="h6" fontWeight="700" sx={{ 
                    color: '#d32f2f',
                    fontSize: '1.25rem',
                  }}>
                    {formatCurrency(totalDebt)}
                  </Typography>
                </Box>
              </Box>
            </>
          )}
        </Box>
      </Paper>

      {/* Debtor Form Modal */}
      <DebtorForm 
        open={open} 
        handleClose={handleClose} 
        onSubmit={handleSubmit} 
      />
    </Container>
  );
}

export default DebtorList;