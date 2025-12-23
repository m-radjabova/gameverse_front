import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  Chip,
} from "@mui/material";
import { FaMoneyBillWave, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import type { ResulType } from "../../../types/types";

interface RepaymentFormProps {
  open: boolean;
  handleClose: () => void;
  onSubmit: (amount: number) => Promise<ResulType>; 
  result: ResulType | null;
  amount: string;
  setAmount: (value: string) => void;
  setResult: (value: ResulType | null) => void;
}

function RepaymentForm({ open, handleClose, onSubmit, result, amount, setAmount, setResult }: RepaymentFormProps) {
  const [loading, setLoading] = useState(false);
  const textFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (open && !result && e.key === 'Enter' && !loading) {
        e.preventDefault();
        handleSubmit();
      }
      
      if (open && e.key === 'Escape') {
        handleCloseModal();
      }
    };

    if (open && textFieldRef.current && !result) {
      setTimeout(() => {
        textFieldRef.current?.focus();
      }, 100);
    }

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, result, loading, amount]);

  const handleSubmit = async () => {
    if (!amount || Number(amount) <= 0 || loading || result) return;
    
    setLoading(true);
    try {
      const response = await onSubmit(Number(amount));
      setResult(response);
      
      if (response && response.remaining_amount === 0) {
        setTimeout(() => {
          handleCloseModal();
        }, 10000);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    handleClose();
    setTimeout(() => {
      setAmount("");
    }, 300);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleCloseModal}
      maxWidth="sm"
      fullWidth
    >
      <form onSubmit={handleFormSubmit}>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                bgcolor: "#e3f2fd",
                color: "#1976d2",
                p: 1,
                borderRadius: 2,
                display: "flex",
              }}
            >
              <FaMoneyBillWave size={24} />
            </Box>
            <Typography variant="h6" fontWeight="700">
              Make Payment
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent>
          <TextField
            inputRef={textFieldRef}
            autoFocus
            margin="dense"
            label="Payment Amount"
            type="number"
            fullWidth
            variant="outlined"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={loading || !!result}
            sx={{ mb: 2 }}
            inputProps={{
              min: "0.01",
              step: "0.01",
              "aria-label": "Payment amount in soums"
            }}
          />

          {result && (
            <Box sx={{ mt: 2 }}>
              {result.success ? (
                <>
                  <Alert 
                    severity="success" 
                    icon={<FaCheckCircle />}
                    sx={{ mb: 2 }}
                  >
                    <Typography fontWeight="600">
                      {result.message}
                    </Typography>
                  </Alert>

                  {/* To'langan qarzlar */}
                  {result.processed_debts?.map((debt, index: number) => (
                    <Box 
                      key={index}
                      sx={{ 
                        p: 2, 
                        mb: 1.5, 
                        bgcolor: "#f5f5f5", 
                        borderRadius: 2,
                        border: "1px solid #e0e0e0"
                      }}
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" color="textSecondary">
                          Debt #{debt.debt_id}
                        </Typography>
                        <Chip
                          label={debt.status === "fully_paid" ? "Fully Paid" : "Partially Paid"}
                          color={debt.status === "fully_paid" ? "success" : "warning"}
                          size="small"
                        />
                      </Box>
                      <Typography variant="h6" fontWeight="700" sx={{ mt: 1 }}>
                        {debt.paid.toLocaleString()} so'm
                      </Typography>
                    </Box>
                  ))}

                  {/* Ortiqcha pul */}
                  {result.remaining_amount > 0 && (
                    <Alert 
                      severity="warning" 
                      icon={<FaExclamationTriangle />}
                      sx={{ mt: 2 }}
                    >
                      <Typography fontWeight="600" gutterBottom>
                        Excess Payment Detected!
                      </Typography>
                      <Typography variant="body2">
                        You have <strong>{result.remaining_amount.toLocaleString()} so'm</strong> remaining.
                        This amount was not applied as there are no pending debts.
                      </Typography>
                    </Alert>
                  )}

                  {/* Jami ma'lumot */}
                  <Box 
                    sx={{ 
                      mt: 2, 
                      p: 2, 
                      bgcolor: "#e3f2fd", 
                      borderRadius: 2,
                      border: "1px solid #90caf9"
                    }}
                  >
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Total Paid
                    </Typography>
                    <Typography variant="h5" fontWeight="700" color="primary">
                      {result.total_paid.toLocaleString()} so'm
                    </Typography>
                  </Box>
                </>
              ) : (
                <Alert severity="error">
                  {result.message}
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2.5 }}>
          <Button 
            onClick={handleCloseModal}
            sx={{ textTransform: "none" }}
            type="button"
          >
            {result ? "Close" : "Cancel"}
          </Button>
          {!result && (
            <Button
              type="submit"
              variant="contained"
              disabled={!amount || Number(amount) <= 0 || loading}
              sx={{ textTransform: "none", px: 3 }}
            >
              {loading ? "Processing..." : "Submit Payment"}
            </Button>
          )}
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default RepaymentForm;