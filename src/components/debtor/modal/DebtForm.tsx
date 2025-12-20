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
import { FaDollarSign } from "react-icons/fa";

interface Props {
  open: boolean;
  handleClose: () => void;
  onSubmit: (amount: number) => void;
}

interface FormData {
  amount: string;
}

function DebtForm({ open, handleClose, onSubmit }: Props) {
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
          overflow: "hidden",
        }
      }}
    >
      <Box
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
        }}
      >
        <DialogTitle sx={{ color: "inherit", py: 2.5 }}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <FaDollarSign size={24} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              Add New Debt
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5, fontWeight: 300 }}>
            Enter the debt amount you want to add
          </Typography>
        </DialogTitle>
      </Box>
      
      <DialogContent sx={{ py: 3, px: 3 }}>
        <form onSubmit={handleSubmit(onFormSubmit)} noValidate>
          <Controller
            name="amount"
            control={control}
            rules={{
              required: "Amount is required",
              min: {
                value: 0.01,
                message: "Amount must be greater than 0",
              },
              pattern: {
                value: /^[0-9]+(\.[0-9]{1,2})?$/,
                message: "Please enter a valid amount (e.g., 100.50)",
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
                label="Amount"
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
                      borderColor: "#667eea",
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
                      color: "#667eea",
                    }
                  }
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": {
                      borderColor: "#764ba2",
                    },
                  },
                  mt: 0,
                  mb: errors.amount ? 0.5 : 2,
                }}
                inputProps={{
                  step: "0.01",
                  min: "0.01",
                  max: "1000000",
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
                  borderColor: "#667eea",
                  backgroundColor: "rgba(102, 126, 234, 0.04)",
                }
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
                textTransform: "none",
                fontWeight: 500,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                boxShadow: "0 4px 14px 0 rgba(102, 126, 234, 0.3)",
                "&:hover": {
                  boxShadow: "0 6px 20px rgba(102, 126, 234, 0.4)",
                  background: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
                },
                "&:disabled": {
                  background: "#e0e0e0",
                  color: "#9e9e9e",
                }
              }}
            >
              {isSubmitting ? "Saving..." : "Save Debt"}
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default DebtForm;