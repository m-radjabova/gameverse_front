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
  Paper,
  IconButton,
  Avatar,
  Divider,
} from "@mui/material";
import { useForm } from "react-hook-form";
import type { ReqDebtor } from "../../types/types";
import {
  FaUser,
  FaPhone,
  FaPlus,
  FaTimes,
  FaIdCard,
  FaEye,
} from "react-icons/fa";

interface DebtorFormProps {
  open: boolean;
  handleClose: () => void;
  onSubmit: (data: ReqDebtor) => void;
}

function DebtorForm({ open, handleClose, onSubmit }: DebtorFormProps) {
  const {
    register,
    handleSubmit: formSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ReqDebtor>();

  const createDebtor = (data: ReqDebtor) => {
    onSubmit(data);
    reset();
  };

  const handleCloseDialog = () => {
    reset();
    handleClose();
  };

  const validatePhoneNumber = (value: string) => {
    if (!value) return "Phone number is required";
    
    const phonePattern = /^\+998\d{9}$/;
    const uzbekPattern = /^998\d{9}$/;
    
    if (!phonePattern.test(value) && !uzbekPattern.test(value)) {
      return "Phone number must start with +998 or 998 followed by 9 digits";
    }
    
    return true;
  };

  const formatPhoneNumber = (value: string): string => {
    if (!value) return "";
    
    const numbers = value.replace(/\D/g, '');
    
    if (numbers.startsWith('998') && numbers.length === 12) {
      return `+${numbers}`;
    }
    
    if (numbers.length === 9) {
      return `+998${numbers}`;
    }
    
    return value;
  };

  const fullName = watch("full_name");
  const phoneNumber = watch("phone_number");
  const isFormValid = fullName && phoneNumber;

  return (
    <Dialog
      open={open}
      onClose={handleCloseDialog}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: "hidden",
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        },
      }}
    >
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          py: 3,
          px: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative Background Elements */}
        <Box
          sx={{
            position: 'absolute',
            top: -30,
            right: -30,
            width: 120,
            height: 120,
            borderRadius: '50%',
            bgcolor: 'rgba(255, 255, 255, 0.1)',
          }}
        />

        <Box display="flex" alignItems="center" gap={2} sx={{ position: 'relative', zIndex: 1 }}>
          <Avatar
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.25)',
              color: 'white',
              width: 48,
              height: 48,
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
            }}
          >
            <FaIdCard size={22} />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight="700">
              Create New Debtor
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.95, mt: 0.5 }}>
              Add a new debtor to the system
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={handleCloseDialog}
          sx={{
            color: "white",
            bgcolor: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.3)',
              transform: 'rotate(90deg)',
            },
            transition: 'all 0.3s ease',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <FaTimes size={18} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 4, bgcolor: '#f8f9fc' }}>
        <form onSubmit={formSubmit(createDebtor)}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              mb: 3,
              bgcolor: 'white',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box display="flex" alignItems="center" gap={1.5} mb={3}>
              <Box
                sx={{
                  bgcolor: '#e3f2fd',
                  color: '#1976d2',
                  p: 1,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FaUser size={16} />
              </Box>
              <Typography variant="subtitle1" fontWeight="700" color="text.primary">
                Personal Information
              </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Full Name Field */}
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Full Name"
                variant="outlined"
                error={!!errors.full_name}
                helperText={errors.full_name?.message || "Enter the debtor's complete name"}
                placeholder="e.g., John Doe Smith"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box
                        sx={{
                          bgcolor: '#f5f5f5',
                          borderRadius: 1.5,
                          p: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <FaUser color="#666" size={16} />
                      </Box>
                    </InputAdornment>
                  ),
                }}
                {...register("full_name", {
                  required: "Full name is required",
                  minLength: {
                    value: 3,
                    message: "Full name must be at least 3 characters",
                  }
                })}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2.5,
                    bgcolor: 'white',
                    '&:hover': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main',
                      },
                    },
                    '&.Mui-focused': {
                      boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    fontWeight: 500,
                  },
                }}
              />
            </Box>

            {/* Phone Number Field */}
            <Box>
              <TextField
                fullWidth
                label="Phone Number"
                variant="outlined"
                error={!!errors.phone_number}
                helperText={errors.phone_number?.message || "Format: +998 XX XXX XX XX"}
                placeholder="+998 90 123 45 67"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box
                        sx={{
                          bgcolor: '#f5f5f5',
                          borderRadius: 1.5,
                          p: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <FaPhone color="#666" size={16} />
                      </Box>
                    </InputAdornment>
                  ),
                  inputProps: {
                    maxLength: 13,
                  },
                }}
                {...register("phone_number", {
                  required: "Phone number is required",
                  validate: validatePhoneNumber,
                  onChange: (e) => {
                    const formatted = formatPhoneNumber(e.target.value);
                    if (formatted !== e.target.value) {
                      e.target.value = formatted;
                    }
                  },
                })}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2.5,
                    bgcolor: 'white',
                    '&:hover': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main',
                      },
                    },
                    '&.Mui-focused': {
                      boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    fontWeight: 500,
                  },
                }}
              />
            </Box>
          </Paper>

          {/* Live Preview */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              bgcolor: '#e3f2fd',
              borderRadius: 3,
              border: '2px dashed',
              borderColor: '#1976d2',
            }}
          >
            <Box display="flex" alignItems="center" gap={1.5} mb={2}>
              <Box
                sx={{
                  bgcolor: '#1976d2',
                  color: 'white',
                  p: 1,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FaEye size={14} />
              </Box>
              <Typography variant="subtitle2" fontWeight="700" color="primary.main">
                Preview
              </Typography>
            </Box>
            <Box display="flex" flexDirection="column" gap={1.5}>
              <Box
                sx={{
                  bgcolor: 'white',
                  p: 2,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    bgcolor: '#f5f5f5',
                    borderRadius: 1.5,
                    p: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FaUser color="#666" size={14} />
                </Box>
                <Box flex={1}>
                  <Typography variant="caption" color="textSecondary" fontWeight="500">
                    Full Name
                  </Typography>
                  <Typography variant="body2" fontWeight="600" color="text.primary">
                    {fullName || "Not specified"}
                  </Typography>
                </Box>
              </Box>
              <Box
                sx={{
                  bgcolor: 'white',
                  p: 2,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    bgcolor: '#f5f5f5',
                    borderRadius: 1.5,
                    p: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FaPhone color="#666" size={14} />
                </Box>
                <Box flex={1}>
                  <Typography variant="caption" color="textSecondary" fontWeight="500">
                    Phone Number
                  </Typography>
                  <Typography variant="body2" fontWeight="600" color="text.primary">
                    {phoneNumber || "Not specified"}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>

          <DialogActions sx={{ px: 0, pt: 3, pb: 0 }}>
            <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
              <Button
                onClick={handleCloseDialog}
                variant="outlined"
                startIcon={<FaTimes />}
                sx={{
                  flex: 1,
                  borderRadius: 2.5,
                  py: 1.5,
                  textTransform: "none",
                  fontWeight: "700",
                  fontSize: "1rem",
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                    bgcolor: 'rgba(102, 126, 234, 0.05)',
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<FaPlus />}
                disabled={!isFormValid}
                sx={{
                  flex: 1,
                  borderRadius: 2.5,
                  py: 1.5,
                  textTransform: "none",
                  fontWeight: "700",
                  fontSize: "1rem",
                  background: isFormValid 
                    ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    : undefined,
                  boxShadow: isFormValid ? '0 4px 12px rgba(102, 126, 234, 0.4)' : 'none',
                  "&:hover": {
                    background: isFormValid
                      ? "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)"
                      : undefined,
                    transform: isFormValid ? 'translateY(-2px)' : 'none',
                    boxShadow: isFormValid ? '0 6px 16px rgba(102, 126, 234, 0.5)' : 'none',
                  },
                  "&:disabled": {
                    background: 'grey.300',
                    color: 'grey.500',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Create Debtor
              </Button>
            </Box>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default DebtorForm;