import {
  Box,
  Button,
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
import { useMemo, useState, type ChangeEvent } from "react";
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
  FaSearch,
  FaTimes,
  FaStore,
  FaMoneyBillWave,
  FaSortAmountDown,
  FaHome,
} from "react-icons/fa";

import { useDebounce } from "../../hooks/useDebounce";
import DebtorTable from "./DebtorTable";
import useContextPro from "../../hooks/useContextPro";
import { formatCurrency } from "../../utils";
import { useNavigate } from "react-router-dom";

function DebtorList() {
  const {
    state: { shop },
  } = useContextPro();
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    name: "",
  });
  const navigate = useNavigate();

  const debouncedSearch = useDebounce(filters.name, 400);

  const filterParams = useMemo((): FilterParams => {
    return {
      name: debouncedSearch,
    };
  }, [debouncedSearch]);

  const { debtors, debtorsLoading, addDebtor, page, setPage, limit, shopId } =
    useDebtor(undefined, filterParams);

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = (data: ReqDebtor) => {
    if (!shopId) {
      alert("Shop tanlanmagan!");
      return;
    }
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

  const handlePageChange = (event: ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  if (debtorsLoading) {
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
                background: "linear-gradient(90deg, #fff 0%, rgba(255, 255, 255, 0.8) 100%)",
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
            Loading debtors information...
          </Typography>
        </Box>
      </Box>
    );
  }

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
          }}
        >
          <Box
            sx={{
              // maxWidth: 1400,
              mx: "auto",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: 3,
            }}
          >
            <Box sx={{ flex: 1, minWidth: 300 }}>

              {shop && (
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 1.5,
                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    mb: 2,
                  }}
                >
                  <FaStore size={30} />
                  <Typography variant="h3" fontWeight={600}>
                    {shop.shop_name}
                  </Typography>
                </Box>
              )}

              <Box sx={{ position: "relative", maxWidth: 500 }}>
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
                      backgroundColor: "white",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": {
                        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                      },
                      "& input": {
                        padding: "14px 16px",
                        fontWeight: 500,
                        fontSize: "0.95rem",
                        color: "#333",
                        "&::placeholder": {
                          color: "#888",
                          opacity: 1,
                        },
                      },
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(255, 255, 255, 0.3)",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(255, 255, 255, 0.5)",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "white",
                      },
                    },
                  }}
                />
              </Box>
            </Box>

            <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
              <Button
                variant="contained"
                onClick={() => {
                  if (!shopId) {
                    alert("Please select a shop first!");
                    return;
                  }
                  setOpen(true);
                }}
                size="large"
                disabled={!shopId}
                sx={{
                  bgcolor: "white",
                  color: "#667eea",
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 0.95)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                  },
                  "&:disabled": {
                    bgcolor: "rgba(255, 255, 255, 0.3)",
                    color: "rgba(102, 126, 234, 0.5)",
                  },
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
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
                Add Debtor
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate("/home")}
                startIcon={<FaHome />}
                sx={{
                  borderColor: "rgba(255, 255, 255, 0.3)",
                  color: "white",
                  "&:hover": {
                    borderColor: "white",
                    bgcolor: "rgba(255, 255, 255, 0.1)",
                    transform: "translateY(-2px)",
                  },
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: "600",
                  textTransform: "none",
                  fontSize: "1rem",
                  transition: "all 0.3s ease",
                }}
              >
                Home
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Statistics Cards */}
        <Box sx={{ bgcolor: "#f8f9fc", py: 4 }}>
          <Box sx={{  mx: "auto", px: 3 }}>
            {!shopId ? (
              <Box
                sx={{
                  textAlign: "center",
                  py: 8,
                  backgroundColor: "rgba(255, 152, 0, 0.05)",
                  border: "2px dashed rgba(255, 152, 0, 0.3)",
                }}
              >
                <FaStore
                  size={64}
                  style={{ color: "#ff9800", marginBottom: 24 }}
                />
                <Typography variant="h5" color="warning.main" fontWeight={700}>
                  Shop tanlanmagan!
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mt: 2, maxWidth: 500, mx: "auto" }}
                >
                  Debtor ma'lumotlarini ko'rish va boshqarish uchun avval shop
                  tanlang.
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    lg: "repeat(3, 1fr)",
                  },
                  gap: 2.5,
                }}
              >
                {[
                  {
                    title: "Total Debtors",
                    value: totalDebtors.toString(),
                    subtitle: "Active accounts",
                    color: "#1976d2",
                    gradient: "linear-gradient(135deg, #1976d2 0%, #2196f3 100%)",
                    icon: <FaUser />,
                    progress: 100,
                    progressLabel: "Status",
                  },
                  {
                    title: "Total Debt",
                    value: formatCurrency(totalDebt),
                    subtitle: "Outstanding balance",
                    color: "#d32f2f",
                    gradient: "linear-gradient(135deg, #d32f2f 0%, #f44336 100%)",
                    icon: <FaMoneyBillWave />,
                    progress: Math.min((totalDebt / 100000) * 100, 100),
                    progressLabel: "Utilization",
                  },
                  {
                    title: "High Debt Accounts",
                    value: highDebtCount.toString(),
                    subtitle: "Over $5,000",
                    color: "#f57c00",
                    gradient: "linear-gradient(135deg, #f57c00 0%, #ff9800 100%)",
                    icon: <FaSortAmountDown />,
                    progress: totalDebtors > 0 ? (highDebtCount / totalDebtors) * 100 : 0,
                    progressLabel: "Risk Ratio",
                  },
                ].map((stat, index) => (
                  <Card
                    key={index}
                    sx={{
                      position: "relative",
                      overflow: "hidden",
                      background: stat.gradient,
                      borderRadius: 3,
                      boxShadow: `0 8px 32px ${stat.color}40`,
                      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                      border: "none",
                      "&:hover": {
                        transform: "translateY(-8px) scale(1.02)",
                        boxShadow: `0 20px 48px ${stat.color}66`,
                        "& .stat-icon": {
                          transform: "scale(1.15) rotate(10deg)",
                        },
                        "& .shine": {
                          left: "100%",
                        },
                      },
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0,
                        background:
                          "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)",
                        pointerEvents: "none",
                      },
                    }}
                  >
                    {/* Shine Effect */}
                    <Box
                      className="shine"
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: "-100%",
                        width: "50%",
                        height: "100%",
                        background:
                          "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                        transition: "left 0.6s ease",
                        pointerEvents: "none",
                      }}
                    />

                    <CardContent sx={{ p: 2.5, position: "relative", zIndex: 1 }}>
                      <Box sx={{ mb: 2 }}>
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="flex-start"
                          mb={2}
                        >
                          {/* Icon */}
                          <Box
                            className="stat-icon"
                            sx={{
                              width: 56,
                              height: 56,
                              borderRadius: 3,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: "rgba(255, 255, 255, 0.25)",
                              backdropFilter: "blur(10px)",
                              border: "2px solid rgba(255, 255, 255, 0.3)",
                              transition: "all 0.4s ease",
                              boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                            }}
                          >
                            <Box
                              sx={{
                                color: "white",
                                fontSize: 26,
                                display: "flex",
                              }}
                            >
                              {stat.icon}
                            </Box>
                          </Box>
                        </Box>

                        {/* Value and Title */}
                        <Box>
                          <Typography
                            variant="h2"
                            sx={{
                              fontWeight: 900,
                              fontSize: { xs: "2.5rem", md: "3rem" },
                              mb: 1,
                              color: "white",
                              textShadow: "0 2px 8px rgba(0,0,0,0.2)",
                              letterSpacing: "-0.02em",
                            }}
                          >
                            {stat.value}
                          </Typography>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              textTransform: "uppercase",
                              letterSpacing: 1.5,
                              fontWeight: 700,
                              fontSize: "0.7rem",
                              color: "rgba(255,255,255,0.95)",
                              mb: 0.5,
                            }}
                          >
                            {stat.title}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "rgba(255,255,255,0.8)",
                              fontWeight: 600,
                              fontSize: "0.85rem",
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <Box
                              sx={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                bgcolor: "white",
                                opacity: 0.7,
                              }}
                            />
                            {stat.subtitle}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Progress Bar */}
                      <Box sx={{ mt: 3, position: "relative" }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 1,
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              color: "white",
                              fontWeight: 700,
                              fontSize: "0.75rem",
                              opacity: 0.9,
                            }}
                          >
                            {stat.progressLabel}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "white",
                              fontWeight: 800,
                              fontSize: "0.8rem",
                            }}
                          >
                            {stat.progress.toFixed(1)}%
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            height: 10,
                            borderRadius: 5,
                            backgroundColor: "rgba(255, 255, 255, 0.25)",
                            overflow: "hidden",
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                          }}
                        >
                          <Box
                            sx={{
                              width: `${Math.min(100, stat.progress)}%`,
                              height: "100%",
                              background: "rgba(255, 255, 255, 0.4)",
                              backdropFilter: "blur(5px)",
                              borderRadius: 5,
                              position: "relative",
                              transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)",
                              boxShadow: "0 2px 8px rgba(255, 255, 255, 0.3)",
                              "&::after": {
                                content: '""',
                                position: "absolute",
                                top: 0,
                                left: "-100%",
                                width: "100%",
                                height: "100%",
                                background:
                                  "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent)",
                                animation: "progress-shine 2s infinite",
                              },
                            }}
                          />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Table Section */}
      <Box sx={{ mx: "auto", px: 3, py: 4 }}>
        {shopId ? (
          <DebtorTable
            debtors={debtors}
            handlePageChange={handlePageChange}
            setOpen={setOpen}
            page={page}
            limit={limit}
            totalDebt={totalDebt}
          />
        ) : (
          <Paper
            sx={{
              p: 8,
              textAlign: "center",
              backgroundColor: "white",
              border: "2px dashed",
              borderColor: "divider",
            }}
          >
            <FaStore size={64} style={{ color: "#ccc", marginBottom: 24 }} />
            <Typography variant="h5" color="text.secondary" fontWeight={600} gutterBottom>
              No shop selected
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Please select a shop from the sidebar to view debtor information
            </Typography>
          </Paper>
        )}
      </Box>

      {/* Debtor Form Modal */}
      <DebtorForm
        open={open}
        handleClose={handleClose}
        onSubmit={handleSubmit}
        shopName={shop?.shop_name}
      />
    </Box>
  );
}

export default DebtorList;