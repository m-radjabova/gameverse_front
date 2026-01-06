import { useState } from "react";
import { useForm, type FieldValues } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Box,
  Button,
  Typography,
  InputAdornment,
  CircularProgress,
  Fade,
  Alert,
  alpha,
  useTheme,
  Stack,
} from "@mui/material";
import {
  FaStore,
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaArrowLeft
} from "react-icons/fa";
import { MdPersonAdd } from "react-icons/md";
import apiClient from "../../apiClient/apiClient";
import {
  FeaturesSidebar,
  FormSection,
  GradientBackground,
  GradientButton,
  GradientText,
  LogoHeader,
  LogoIcon,
  MainCard,
  StyledTextField,
} from "./LoginStyle";
import useImages from "../../hooks/useImages";

function SignUp() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { heroImage, imageLoading } = useImages();


  const onSubmit = async (data: FieldValues) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await apiClient.post("/shop/", {
        shop_name: data.shop_name,
        owner_name: data.owner_name,
        phone_number: data.phone_number,
        address: data.address,
      });

      if (response.data.success) {
        toast.success(
          "🎉 Store created successfully! Please login to continue.",
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
            style: {
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              fontWeight: "bold",
              borderRadius: "12px",
            },
          }
        );

        setTimeout(() => {
          navigate("/", {
            state: {
              message: "Store created successfully! Please login.",
            },
          });
        }, 1500);
      } else {
        setError(response.data.message || "Failed to create store");
      }
    } catch (error) {
      console.error("SignUp error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GradientBackground>
      <MainCard>
        <FeaturesSidebar
         sx={{
            flex: 1,
            position: 'relative',
            backgroundImage: heroImage 
              ? `url(${heroImage})`
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transition: 'background-image 0.5s ease-in-out',
          }}>
          {imageLoading && (
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            >
              <CircularProgress sx={{ color: 'white' }} />
            </Box>
          )}
        </FeaturesSidebar>

        {/* Right Side - Registration Form */}
        <FormSection>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 4,
            }}
          >
            <Button
              startIcon={<FaArrowLeft />}
              onClick={() => navigate("/")}
              sx={{
                color: theme.palette.primary.main,
                textTransform: "none",
                fontWeight: 500,
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              Back to Login
            </Button>

            <Link to="/" style={{ textDecoration: "none" }}>
              <Typography
                variant="body2"
                color="primary"
                sx={{ fontWeight: 500 }}
              >
                Already have a store? Login
              </Typography>
            </Link>
          </Box>

          <LogoHeader >
            <LogoIcon />
            <GradientText variant="h1" gutterBottom>
              Register Your Store
            </GradientText>
            <Typography variant="body1" color="text.secondary">
              Fill in your store details to get started
            </Typography>
          </LogoHeader>

          <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <form onSubmit={handleSubmit(onSubmit)} style={{ flex: 1 }}>
              <Stack spacing={3}>
                <StyledTextField
                  fullWidth
                  label="Store Name *"
                  variant="outlined"
                  placeholder="Enter your store name"
                  disabled={isLoading}
                  error={!!errors.shop_name}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FaStore color={theme.palette.primary.main} />
                      </InputAdornment>
                    ),
                  }}
                  {...register("shop_name", {
                    required: "Store name is required",
                    minLength: {
                      value: 2,
                      message: "Store name must be at least 2 characters",
                    },
                  })}
                />

                <StyledTextField
                  fullWidth
                  label="Owner Name *"
                  variant="outlined"
                  placeholder="Enter your name"
                  disabled={isLoading}
                  error={!!errors.owner_name}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FaUser color={theme.palette.primary.main} />
                      </InputAdornment>
                    ),
                  }}
                  {...register("owner_name", {
                    required: "Owner name is required",
                    minLength: {
                      value: 2,
                      message: "Owner name must be at least 2 characters",
                    },
                  })}
                />

                <StyledTextField
                  fullWidth
                  label="Phone Number"
                  variant="outlined"
                  placeholder="Enter phone number"
                  disabled={isLoading}
                  error={!!errors.phone_number}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FaPhone color={theme.palette.success.main} />
                      </InputAdornment>
                    ),
                  }}
                  {...register("phone_number", {
                    pattern: {
                      value: /^\+998\d{2}\d{3}\d{2}\d{2}$/,
                      message: "Please enter a valid phone number",
                    },
                  })}
                />

                <StyledTextField
                  fullWidth
                  label="Store Address"
                  variant="outlined"
                  placeholder="Enter store address"
                  multiline
                  
                  disabled={isLoading}
                  error={!!errors.address}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FaMapMarkerAlt color={theme.palette.warning.main} />
                      </InputAdornment>
                    ),
                  }}
                  {...register("address")}
                />
              </Stack>

              {error && (
                <Fade in>
                  <Alert
                    severity="error"
                    sx={{
                      mt: 3,
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.error.main, 0.08),
                      border: `1px solid ${alpha(
                        theme.palette.error.main,
                        0.2
                      )}`,
                    }}
                  >
                    <Typography variant="body2" fontWeight={500}>
                      {error}
                    </Typography>
                  </Alert>
                </Fade>
              )}

              <GradientButton
                fullWidth
                type="submit"
                disabled={isLoading}
                startIcon={
                  isLoading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <MdPersonAdd />
                  )
                }
                sx={{ mt: 4 }}
              >
                {isLoading ? "Creating Store..." : "Create Store Account"}
              </GradientButton>

              <Box sx={{ textAlign: "center", mt: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  By registering, you agree to our{" "}
                  <Link
                    to="/terms"
                    style={{
                      color: theme.palette.primary.main,
                      fontWeight: 500,
                    }}
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/privacy"
                    style={{
                      color: theme.palette.primary.main,
                      fontWeight: 500,
                    }}
                  >
                    Privacy Policy
                  </Link>
                </Typography>
              </Box>
            </form>

            <Box
              sx={{
                mt: "auto",
                pt: 3,
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="caption" color="text.secondary">
                  Need help? Contact support@debtmanager.com
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  © {new Date().getFullYear()} Debt Manager Pro
                </Typography>
              </Stack>
            </Box>
          </Box>
        </FormSection>
      </MainCard>
    </GradientBackground>
  );
}

export default SignUp;
