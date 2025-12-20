import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  IconButton,
  TextField,
  InputAdornment,
} from "@mui/material";
import useDebtor from "../../hooks/useDebtor";
import { useMemo, useState } from "react";
import DebtorForm from "./modal/DebtorForm";
import type {
  ReqDebtor,
  Debtor,
  FilterState,
  FilterParams,
} from "../../types/types";
import {
  FaUserPlus,
  FaUser,
  FaMoneyBillWave,
  FaIdCard,
  FaSortAmountDown,
  FaSearch,
  FaTimes,
} from "react-icons/fa";
import {
  formatCurrency,
} from "../../utils";
import { useDebounce } from "../../hooks/useDebounce";
import DebtorTable from "./DebtorTable";

function DebtorList() {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    name: "",
  });

  const debouncedSearch = useDebounce(filters.name, 400);

  const filterParams = useMemo((): FilterParams => {
    return {
      name: debouncedSearch,
    };
  }, [debouncedSearch]);

  const { debtors, debtorsLoading, addDebtor, page, setPage, limit } =
    useDebtor(undefined, 3000, filterParams);

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = (data: ReqDebtor) => {
    addDebtor(data);
    handleClose();
  };

  const totalDebtors = debtors.data.length;
  const totalDebt = debtors.data.reduce(
    (sum: number, debtor: Debtor) => sum + (debtor.total_debt || 0),
    0
  );
  const highDebtCount = debtors.data.filter(
    (d: Debtor) => (d.total_debt || 0) > 5000
  ).length;

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  if (debtorsLoading) {
    return (
      <Container sx={{ py: 4 }}>
        <Box sx={{ width: "100%" }}>
          <LinearProgress sx={{ height: 3, borderRadius: 2 }} />
          <Box sx={{ textAlign: "center", mt: 4 }}>
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
          overflow: "hidden",
          mb: 4,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            p: 4,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 3,
          }}
        >
          <Box display="flex" flexDirection="column" gap={2}>
            <Box display="flex" alignItems="center" gap={2}>
              <Box
                sx={{
                  bgcolor: "rgba(255, 255, 255, 0.2)",
                  p: 1.5,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FaIdCard size={28} />
              </Box>
              <Box>
                <Typography
                  variant="h4"
                  component="h1"
                  fontWeight="700"
                  sx={{ mb: 0.5 }}
                >
                  Debt Management
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.95 }}>
                  Track and manage all debtor accounts
                </Typography>
              </Box>
            </Box>
            <Box
              sx={{
                position: "relative",
                width: "100%",
                maxWidth: "400px",
                "&:hover .search-icon": {
                  transform: "scale(1.1)",
                },
              }}
            >
              <TextField
                variant="outlined"
                size="medium"
                fullWidth
                placeholder="Search debtors by name..."
                value={filters.name}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, name: e.target.value }))
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FaSearch
                        className="search-icon"
                        style={{
                          color: "#667eea",
                          transition: "transform 0.3s ease",
                        }}
                      />
                    </InputAdornment>
                  ),
                  endAdornment: filters.name && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() =>
                          setFilters((prev) => ({ ...prev, name: "" }))
                        }
                        sx={{
                          color: "#999",
                          "&:hover": {
                            color: "#667eea",
                            backgroundColor: "rgba(102, 126, 234, 0.1)",
                          },
                        }}
                      >
                        <FaTimes size={16} />
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: 3,
                    backgroundColor: "#f8f9fc",
                    border: "1px solid transparent",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      backgroundColor: "#f0f2f7",
                      borderColor: "rgba(102, 126, 234, 0.3)",
                      boxShadow: "0 4px 12px rgba(102, 126, 234, 0.08)",
                    },
                    "& input": {
                      padding: "12px 14px",
                      fontWeight: 500,
                      fontSize: "0.95rem",
                      color: "#333",
                      "&::placeholder": {
                        color: "#888",
                        opacity: 1,
                      },
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "transparent",
                      transition: "border-color 0.3s ease",
                    },
                  },
                }}
              />

              {filters.name && (
                <Typography
                  variant="caption"
                  sx={{
                    position: "absolute",
                    top: -8,
                    left: 12,
                    backgroundColor: "white",
                    px: 1,
                    color: "#667eea",
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    borderRadius: 1,
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    zIndex: 1,
                    animation: "slideIn 0.3s ease",
                    "@keyframes slideIn": {
                      from: {
                        opacity: 0,
                        transform: "translateY(-10px)",
                      },
                      to: {
                        opacity: 1,
                        transform: "translateY(0)",
                      },
                    },
                  }}
                >
                  🔍 Searching: "{filters.name}"
                </Typography>
              )}
            </Box>
          </Box>
          <Button
            variant="contained"
            onClick={() => setOpen(true)}
            size="large"
            sx={{
              bgcolor: "white",
              color: "#667eea",
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 0.95)",
                transform: "translateY(-2px)",
                boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
              },
              px: 4,
              py: 1.5,
              borderRadius: 3,
              fontWeight: "600",
              textTransform: "none",
              fontSize: "1rem",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              transition: "all 0.3s ease",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
            startIcon={<FaUserPlus />}
          >
            Add New Debtor
          </Button>
        </Box>

        {/* Statistics Cards */}
        <Box sx={{ p: 4, bgcolor: "#f8f9fc" }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                lg: 'repeat(3, 1fr)',
              },
              gap: 3,
            }}
          >
            {/* Total Debtors Card */}
            <Card
      sx={{
        borderRadius: 3,
        background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(33, 150, 243, 0.05) 100%)',
        border: '1px solid rgba(25, 118, 210, 0.15)',
        boxShadow: '0 8px 32px rgba(25, 118, 210, 0.1)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 20px 40px rgba(25, 118, 210, 0.2)',
          '& .icon-wrapper': {
            transform: 'scale(1.1) rotate(5deg)',
          },
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #1976d2 0%, #2196f3 100%)',
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 2 }}
        >
          <Box>
            <Typography
              variant="subtitle2"
              sx={{
                mb: 1,
                fontWeight: 600,
                color: '#1976d2',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontSize: '0.75rem',
              }}
            >
              Total Debtors
            </Typography>
            <Typography
              variant="h2"
              fontWeight="800"
              sx={{
                color: '#1976d2',
                textShadow: '0 2px 4px rgba(25, 118, 210, 0.2)',
                mb: 0.5,
              }}
            >
              {totalDebtors}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: '#1976d2',
                opacity: 0.8,
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#1976d2', opacity: 0.6 }} />
              Active accounts in system
            </Typography>
          </Box>
          <Box
            className="icon-wrapper"
            sx={{
              position: 'relative',
              width: 72,
              height: 72,
              borderRadius: '18px',
              background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(25, 118, 210, 0.4)',
              color: 'white',
              transition: 'transform 0.4s ease',
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
            <FaUser size={28} />
          </Box>
        </Box>
        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" sx={{ color: '#1976d2', fontWeight: 600 }}>
              Accounts Status
            </Typography>
            <Typography variant="caption" sx={{ color: '#1976d2', fontWeight: 700 }}>
              100%
            </Typography>
          </Box>
          <Box sx={{ 
            height: 8, 
            borderRadius: 4,
            backgroundColor: 'rgba(25, 118, 210, 0.15)',
            overflow: 'hidden',
          }}>
            <Box sx={{ 
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, #1976d2 0%, #2196f3 100%)',
              borderRadius: 4,
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

    {/* Total Debt Card */}
    <Card
      sx={{
        borderRadius: 3,
        background: 'linear-gradient(135deg, rgba(211, 47, 47, 0.05) 0%, rgba(244, 67, 54, 0.05) 100%)',
        border: '1px solid rgba(211, 47, 47, 0.15)',
        boxShadow: '0 8px 32px rgba(211, 47, 47, 0.1)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 20px 40px rgba(211, 47, 47, 0.2)',
          '& .icon-wrapper': {
            transform: 'scale(1.1) rotate(5deg)',
          },
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #d32f2f 0%, #f44336 100%)',
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 2 }}
        >
          <Box>
            <Typography
              variant="subtitle2"
              sx={{
                mb: 1,
                fontWeight: 600,
                color: '#d32f2f',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontSize: '0.75rem',
              }}
            >
              Total Debt
            </Typography>
            <Typography
              variant="h2"
              fontWeight="800"
              sx={{
                color: '#d32f2f',
                textShadow: '0 2px 4px rgba(211, 47, 47, 0.2)',
                mb: 0.5,
              }}
            >
              {formatCurrency(totalDebt)}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: '#d32f2f',
                opacity: 0.8,
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#d32f2f', opacity: 0.6 }} />
              Outstanding balance
            </Typography>
          </Box>
          <Box
            className="icon-wrapper"
            sx={{
              position: 'relative',
              width: 72,
              height: 72,
              borderRadius: '18px',
              background: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(211, 47, 47, 0.4)',
              color: 'white',
              transition: 'transform 0.4s ease',
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
        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" sx={{ color: '#d32f2f', fontWeight: 600 }}>
              Debt Utilization
            </Typography>
            <Typography variant="caption" sx={{ color: '#d32f2f', fontWeight: 700 }}>
              {Math.min((totalDebt / 100000) * 100, 100).toFixed(1)}%
            </Typography>
          </Box>
          <Box sx={{ 
            height: 8, 
            borderRadius: 4,
            backgroundColor: 'rgba(211, 47, 47, 0.15)',
            overflow: 'hidden',
          }}>
            <Box sx={{ 
              width: `${Math.min((totalDebt / 100000) * 100, 100)}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #d32f2f 0%, #f44336 100%)',
              borderRadius: 4,
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

    {/* High Debt Accounts Card */}
    <Card
      sx={{
        borderRadius: 3,
        background: 'linear-gradient(135deg, rgba(245, 124, 0, 0.05) 0%, rgba(255, 152, 0, 0.05) 100%)',
        border: '1px solid rgba(245, 124, 0, 0.15)',
        boxShadow: '0 8px 32px rgba(245, 124, 0, 0.1)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 20px 40px rgba(245, 124, 0, 0.2)',
          '& .icon-wrapper': {
            transform: 'scale(1.1) rotate(5deg)',
          },
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #f57c00 0%, #ff9800 100%)',
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 2 }}
        >
          <Box>
            <Typography
              variant="subtitle2"
              sx={{
                mb: 1,
                fontWeight: 600,
                color: '#f57c00',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontSize: '0.75rem',
              }}
            >
              High Debt Accounts
            </Typography>
            <Typography
              variant="h2"
              fontWeight="800"
              sx={{
                color: '#f57c00',
                textShadow: '0 2px 4px rgba(245, 124, 0, 0.2)',
                mb: 0.5,
              }}
            >
              {highDebtCount}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: '#f57c00',
                opacity: 0.8,
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#f57c00', opacity: 0.6 }} />
              Accounts over $5,000
            </Typography>
          </Box>
          <Box
            className="icon-wrapper"
            sx={{
              position: 'relative',
              width: 72,
              height: 72,
              borderRadius: '18px',
              background: 'linear-gradient(135deg, #f57c00 0%, #ff9800 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(245, 124, 0, 0.4)',
              color: 'white',
              transition: 'transform 0.4s ease',
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
            <FaSortAmountDown size={28} />
          </Box>
        </Box>
        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" sx={{ color: '#f57c00', fontWeight: 600 }}>
              High Risk Ratio
            </Typography>
            <Typography variant="caption" sx={{ color: '#f57c00', fontWeight: 700 }}>
              {totalDebtors > 0 ? ((highDebtCount / totalDebtors) * 100).toFixed(1) : 0}%
            </Typography>
          </Box>
          <Box sx={{ 
            height: 8, 
            borderRadius: 4,
            backgroundColor: 'rgba(245, 124, 0, 0.15)',
            overflow: 'hidden',
          }}>
            <Box sx={{ 
              width: `${totalDebtors > 0 ? (highDebtCount / totalDebtors) * 100 : 0}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #f57c00 0%, #ff9800 100%)',
              borderRadius: 4,
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
          </Box>
        </Box>
      </Paper>

      {/* Debtors Table */}
      <DebtorTable debtors={debtors} handlePageChange={handlePageChange} setOpen={setOpen} page={page}
      limit={limit} totalDebt={totalDebt} />
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
