import { useForm, Controller } from "react-hook-form";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Box,
  Typography,
  InputAdornment,
} from "@mui/material";
import { Wallet } from "react-bootstrap-icons";

interface Props {
  open: boolean;
  handleClose: () => void;
  onSubmit: (amount: number) => void;
}

interface FormData {
  amount: string;
}

function RepaymentForm({ open, handleClose, onSubmit }: Props) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      amount: "",
    },
  });

  const onFormSubmit = (data: FormData) => {
    if (!data.amount) return;
    
    onSubmit(Number(data.amount));
    handleClose();
    reset();
  };

  const handleDialogClose = () => {
    handleClose();
    reset();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleDialogClose} 
      maxWidth="xs" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          overflow: "hidden"
        }
      }}
    >
      <Box
        sx={{
          background: "linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)",
          color: "white",
        }}
      >
        <DialogTitle sx={{ color: "inherit", py: 2.5 }}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Wallet size={24} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              Debt Repayment
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5, fontWeight: 300 }}>
            Make a payment towards your debt
          </Typography>
        </DialogTitle>
      </Box>
      
      <DialogContent sx={{ py: 3, px: 3 }}>
        <form onSubmit={handleSubmit(onFormSubmit)} noValidate>
          <Controller
            name="amount"
            control={control}
            rules={{
              required: "Payment amount is required",
              min: {
                value: 0.01,
                message: "Amount must be greater than 0",
              },
              pattern: {
                value: /^[0-9]+(\.[0-9]{1,2})?$/,
                message: "Please enter a valid amount (max 2 decimal places)",
              },
              validate: (value) => {
                const numValue = Number(value);
                if (numValue > 1000000) {
                  return "Amount is too large";
                }
                return true;
              }
            }}
            render={({ field }) => (
              <TextField
                {...field}
                autoFocus
                margin="normal"
                label="Payment Amount"
                type="number"
                fullWidth
                variant="outlined"
                error={!!errors.amount}
                helperText={errors.amount?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Typography color="text.secondary">$</Typography>
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: 2,
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#4CAF50",
                      borderWidth: 2,
                    },
                    fontSize: 16,
                    fontWeight: 500,
                  }
                }}
                InputLabelProps={{
                  shrink: true,
                  sx: {
                    fontSize: 15,
                    "&.Mui-focused": {
                      color: "#4CAF50",
                    }
                  }
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": {
                      borderColor: "#2E7D32",
                    },
                  },
                  mt: 0,
                  mb: errors.amount ? 0.5 : 2,
                }}
                inputProps={{
                  step: "0.01",
                  min: "0.01",
                  placeholder: "0.00",
                }}
              />
            )}
          />
          
         <DialogActions sx={{ px: 0, pt: 2, gap: 1.5 }}>
            <Button
              onClick={handleDialogClose}
              variant="outlined"
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
                textTransform: "none",
                fontWeight: 500,
                borderColor: "#e0e0e0",
                color: "text.secondary",
                "&:hover": {
                  borderColor: "#4CAF50",
                  backgroundColor: "rgba(76, 175, 80, 0.04)",
                }
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting }
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
                textTransform: "none",
                fontWeight: 500,
                background: "linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)",
                boxShadow: "0 4px 14px 0 rgba(76, 175, 80, 0.3)",
                "&:hover": {
                  boxShadow: "0 6px 20px rgba(76, 175, 80, 0.4)",
                  background: "linear-gradient(135deg, #43A047 0%, #1B5E20 100%)",
                },
                "&:disabled": {
                  background: "#e0e0e0",
                  color: "#9e9e9e",
                  boxShadow: "none",
                }
              }}
            >
              {isSubmitting ? "Processing..." : "Make Payment"}
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default RepaymentForm;