import { useState } from 'react';
import { useForm } from "react-hook-form";
import {
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stack,
  IconButton,
  InputAdornment,
  CircularProgress,
  Fade,
  alpha,
  useTheme,
  Divider,
  Dialog,
  TextField,
  Paper,
  Avatar,
  Chip
} from "@mui/material";
import {
  FaStore,
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaTimes,
  FaCheckCircle,
  FaInfoCircle
} from "react-icons/fa";
import apiClient from "../../apiClient/apiClient";
import { toast } from "react-toastify";
import type { ReqShop } from '../../types/types';

interface Props {
  open: boolean;
  onClose: () => void;
  onUpdate: (data?: ReqShop | undefined) => void;
  shop: {
    shop_id: number;
    shop_name: string;
    owner_name: string;
    phone_number: string;
    address: string;
  };
}

function UpdateShopModal({ open, onClose, onUpdate, shop }: Props) {
  const theme = useTheme();
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      shop_name: shop.shop_name,
      owner_name: shop.owner_name || '',
      phone_number: shop.phone_number || '',
      address: shop.address || ''
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: ReqShop) => {
    setIsLoading(true);
    try {
      const response = await apiClient.put(`/shop/${shop.shop_id}`, data);
      
      if (response.data.success) {
        toast.success('🎉 Store updated successfully!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
          style: {
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            fontWeight: 'bold',
            borderRadius: '16px',
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)'
          }
        });
        
        onUpdate();
        onClose();
      } else {
        toast.error(response.data.message || 'Failed to update store', {
          position: "top-right",
          theme: "colored",
          style: {
            borderRadius: '16px'
          }
        });
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('An error occurred while updating', {
        position: "top-right",
        theme: "colored",
        style: {
          borderRadius: '16px'
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      TransitionComponent={Fade}
      transitionDuration={400}
      PaperProps={{
        sx: {
          borderRadius: 5,
          overflow: 'hidden',
          background: alpha(theme.palette.background.paper, 0.95),
          backdropFilter: 'blur(20px)',
          boxShadow: `0 24px 48px ${alpha('#000', 0.15)}`,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }
      }}
    >
      {/* Animated Background Blobs */}
      <Box
        sx={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          opacity: 0.08,
          filter: 'blur(60px)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -80,
          left: -80,
          width: 250,
          height: 250,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
          opacity: 0.08,
          filter: 'blur(50px)',
        }}
      />

      {/* Header with Gradient */}
      <Box
        sx={{
          position: 'relative',
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          p: 4,
          overflow: 'hidden'
        }}
      >
        {/* Decorative Pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100%',
            height: '100%',
            opacity: 0.1,
            backgroundImage: `
              repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px),
              repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)
            `
          }}
        />

        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" position="relative">
          <Stack direction="row" spacing={3} alignItems="center" mb={2}>
            
            <Box>
              <Typography 
                variant="h4" 
                fontWeight={800} 
                color="white"
                sx={{
                  mb: 0.5,
                  textShadow: '0 2px 10px rgba(0,0,0,0.2)'
                }}
              >
                Update Store
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: alpha('#fff', 0.95),
                  fontWeight: 500
                }}
              >
                Modify your store information and details
              </Typography>
              
              <Chip
                icon={<FaStore style={{ fontSize: 12 }} />}
                label={`ID: ${shop.shop_id}`}
                size="small"
                sx={{
                  mt: 1.5,
                  background: alpha('#fff', 0.2),
                  backdropFilter: 'blur(10px)',
                  color: 'white',
                  fontWeight: 700,
                  border: `1px solid ${alpha('#fff', 0.3)}`,
                  '& .MuiChip-icon': {
                    color: 'white'
                  }
                }}
              />
            </Box>
          </Stack>
          
          <IconButton
            onClick={onClose}
            disabled={isLoading}
            sx={{
              width: 44,
              height: 44,
              background: alpha('#fff', 0.15),
              backdropFilter: 'blur(10px)',
              color: 'white',
              border: `2px solid ${alpha('#fff', 0.2)}`,
              transition: 'all 0.3s ease',
              '&:hover': {
                background: alpha('#fff', 0.25),
                transform: 'rotate(90deg)',
                borderColor: alpha('#fff', 0.4)
              },
              '&:disabled': {
                opacity: 0.5,
                cursor: 'not-allowed'
              }
            }}
          >
            <FaTimes />
          </IconButton>
        </Stack>
      </Box>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 4 }}>
          <form onSubmit={handleSubmit(onSubmit)} id="update-form">
            <Stack spacing={4}>
              {/* Store Information Section */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: alpha('#6366f1', 0.04),
                  border: `2px solid ${alpha('#6366f1', 0.1)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: alpha('#6366f1', 0.06),
                    borderColor: alpha('#6366f1', 0.2)
                  }
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                  <Avatar
                    sx={{
                      width: 44,
                      height: 44,
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      boxShadow: `0 4px 12px ${alpha('#6366f1', 0.3)}`
                    }}
                  >
                    <FaStore />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      Store Information
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Basic details about your store
                    </Typography>
                  </Box>
                </Stack>

                <TextField
                  fullWidth
                  label="Store Name"
                  variant="outlined"
                  disabled={isLoading}
                  error={!!errors.shop_name}
                  helperText={errors.shop_name?.message}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      background: theme.palette.background.paper,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: `0 4px 12px ${alpha('#6366f1', 0.1)}`
                      },
                      '&.Mui-focused': {
                        boxShadow: `0 4px 16px ${alpha('#6366f1', 0.2)}`
                      }
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Avatar
                          sx={{
                            width: 36,
                            height: 36,
                            background: alpha('#6366f1', 0.1),
                            color: '#6366f1'
                          }}
                        >
                          <FaStore size={16} />
                        </Avatar>
                      </InputAdornment>
                    )
                  }}
                  {...register('shop_name', {
                    required: 'Store name is required',
                    minLength: {
                      value: 2,
                      message: 'Store name must be at least 2 characters'
                    }
                  })}
                />
              </Paper>

              {/* Owner Details Section */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: alpha('#8b5cf6', 0.04),
                  border: `2px solid ${alpha('#8b5cf6', 0.1)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: alpha('#8b5cf6', 0.06),
                    borderColor: alpha('#8b5cf6', 0.2)
                  }
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                  <Avatar
                    sx={{
                      width: 44,
                      height: 44,
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
                      boxShadow: `0 4px 12px ${alpha('#8b5cf6', 0.3)}`
                    }}
                  >
                    <FaUser />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      Owner Details
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Information about the store owner
                    </Typography>
                  </Box>
                </Stack>

                <TextField
                  fullWidth
                  label="Owner Name"
                  variant="outlined"
                  disabled={isLoading}
                  error={!!errors.owner_name}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      background: theme.palette.background.paper,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: `0 4px 12px ${alpha('#8b5cf6', 0.1)}`
                      },
                      '&.Mui-focused': {
                        boxShadow: `0 4px 16px ${alpha('#8b5cf6', 0.2)}`
                      }
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Avatar
                          sx={{
                            width: 36,
                            height: 36,
                            background: alpha('#8b5cf6', 0.1),
                            color: '#8b5cf6'
                          }}
                        >
                          <FaUser size={16} />
                        </Avatar>
                      </InputAdornment>
                    )
                  }}
                  {...register('owner_name', {
                    minLength: {
                      value: 2,
                      message: 'Owner name must be at least 2 characters'
                    }
                  })}
                />
              </Paper>

              {/* Contact Information Section */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: alpha('#10b981', 0.04),
                  border: `2px solid ${alpha('#10b981', 0.1)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: alpha('#10b981', 0.06),
                    borderColor: alpha('#10b981', 0.2)
                  }
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                  <Avatar
                    sx={{
                      width: 44,
                      height: 44,
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      boxShadow: `0 4px 12px ${alpha('#10b981', 0.3)}`
                    }}
                  >
                    <FaPhone />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      Contact Information
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Phone number for communication
                    </Typography>
                  </Box>
                </Stack>

                <TextField
                  fullWidth
                  label="Phone Number"
                  variant="outlined"
                  placeholder="+998901234567"
                  disabled={isLoading}
                  error={!!errors.phone_number}
                  helperText={errors.phone_number?.message || "Format: +998XXXXXXXXX"}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      background: theme.palette.background.paper,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: `0 4px 12px ${alpha('#10b981', 0.1)}`
                      },
                      '&.Mui-focused': {
                        boxShadow: `0 4px 16px ${alpha('#10b981', 0.2)}`
                      }
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Avatar
                          sx={{
                            width: 36,
                            height: 36,
                            background: alpha('#10b981', 0.1),
                            color: '#10b981'
                          }}
                        >
                          <FaPhone size={16} />
                        </Avatar>
                      </InputAdornment>
                    )
                  }}
                  {...register('phone_number', {
                    pattern: {
                      value: /^\+998\d{9}$/,
                      message: 'Please enter a valid phone number (+998XXXXXXXXX)'
                    }
                  })}
                />
              </Paper>

              {/* Location Section */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: alpha('#f59e0b', 0.04),
                  border: `2px solid ${alpha('#f59e0b', 0.1)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: alpha('#f59e0b', 0.06),
                    borderColor: alpha('#f59e0b', 0.2)
                  }
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                  <Avatar
                    sx={{
                      width: 44,
                      height: 44,
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      boxShadow: `0 4px 12px ${alpha('#f59e0b', 0.3)}`
                    }}
                  >
                    <FaMapMarkerAlt />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      Location Details
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Physical address of your store
                    </Typography>
                  </Box>
                </Stack>

                <TextField
                  fullWidth
                  label="Store Address"
                  variant="outlined"
                  multiline
                  placeholder="Enter your store's full address..."
                  disabled={isLoading}
                  error={!!errors.address}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      background: theme.palette.background.paper,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: `0 4px 12px ${alpha('#f59e0b', 0.1)}`
                      },
                      '&.Mui-focused': {
                        boxShadow: `0 4px 16px ${alpha('#f59e0b', 0.2)}`
                      }
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                        <Avatar
                          sx={{
                            width: 36,
                            height: 36,
                            background: alpha('#f59e0b', 0.1),
                            color: '#f59e0b'
                          }}
                        >
                          <FaMapMarkerAlt size={16} />
                        </Avatar>
                      </InputAdornment>
                    )
                  }}
                  {...register('address')}
                />
              </Paper>

              {/* Info Box */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${alpha('#06b6d4', 0.05)} 0%, ${alpha('#0891b2', 0.05)} 100%)`,
                  border: `2px dashed ${alpha('#06b6d4', 0.3)}`
                }}
              >
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      background: alpha('#06b6d4', 0.15),
                      color: '#06b6d4'
                    }}
                  >
                    <FaInfoCircle />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight={600} color="text.primary" gutterBottom>
                      Important Information
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                      • Fields marked with * are required
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                      • Phone number must be in Uzbekistan format (+998XXXXXXXXX)
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      • Changes will be reflected immediately after saving
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Stack>
          </form>
        </Box>

        <Divider sx={{ borderColor: alpha(theme.palette.divider, 0.1) }} />
      </DialogContent>

      <DialogActions 
        sx={{ 
          p: 4, 
          pt: 3,
          background: alpha(theme.palette.background.paper, 0.5),
          backdropFilter: 'blur(10px)'
        }}
      >
        <Stack direction="row" spacing={2} width="100%">
          <Button
            fullWidth
            onClick={onClose}
            disabled={isLoading}
            variant="outlined"
            size="large"
            sx={{
              borderRadius: 3,
              py: 1.5,
              px: 4,
              fontWeight: 700,
              borderWidth: 2,
              borderColor: alpha(theme.palette.divider, 0.3),
              color: 'text.secondary',
              textTransform: 'none',
              fontSize: '1rem',
              transition: 'all 0.3s ease',
              '&:hover': {
                borderWidth: 2,
                borderColor: alpha('#ef4444', 0.5),
                background: alpha('#ef4444', 0.05),
                color: '#ef4444',
                transform: 'translateY(-2px)',
                boxShadow: `0 4px 12px ${alpha('#ef4444', 0.2)}`
              },
              '&:disabled': {
                opacity: 0.5
              }
            }}
          >
            <FaTimes style={{ marginRight: 8 }} />
            Cancel
          </Button>
          
          <Button
            fullWidth
            type="submit"
            form="update-form"
            disabled={isLoading}
            variant="contained"
            size="large"
            startIcon={isLoading ? 
              <CircularProgress size={20} color="inherit" /> : 
              <FaCheckCircle />
            }
            sx={{
              borderRadius: 3,
              py: 1.5,
              px: 4,
              fontWeight: 700,
              textTransform: 'none',
              fontSize: '1rem',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              boxShadow: `0 4px 16px ${alpha('#10b981', 0.3)}`,
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                transform: 'translateY(-2px)',
                boxShadow: `0 8px 24px ${alpha('#10b981', 0.4)}`
              },
              '&:disabled': {
                opacity: 0.7,
                background: alpha('#10b981', 0.5)
              }
            }}
          >
            {isLoading ? 'Updating Store...' : 'Save Changes'}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}

export default UpdateShopModal;