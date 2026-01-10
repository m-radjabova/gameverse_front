import { useForm, type FieldValues } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import useContextPro from "../../hooks/useContextPro";
import { toast } from "react-toastify";
import {
  Box,
  Typography,
  InputAdornment,
  CircularProgress,
  Fade,
  Alert,
  alpha,
  useTheme,
  Stack
} from "@mui/material";
import { 
  FaStore, 
  FaSignInAlt, 
  FaShieldAlt
} from "react-icons/fa";
import { FeaturesSidebar, GradientBackground, GradientButton, GradientText, LoginContainer, LoginFormSection, LogoHeader, MainCard, MainLogo, StyledTextField } from "./LoginStyle";
import useImages from "../../hooks/useImages";


function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<FieldValues>();
  const { login, state: { error, isLoading } } = useContextPro();
  const { heroImage, imageLoading } = useImages();
  const navigate = useNavigate();
  const theme = useTheme();

  const onSubmit = async (data: FieldValues) => {
    const result = await login(data.shop_name);
    
    if (result.success) {
      toast.success(`🎉 Welcome back, ${result.shop!.shop_name}!`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
        style: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          fontWeight: 'bold',
          borderRadius: '12px'
        }
      });
      navigate('/home');
    }
  };

  return (
    <GradientBackground>
      <LoginContainer>
        <Fade in timeout={800}>
          <MainCard>
            <FeaturesSidebar
              sx={{
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

            {/* Right Side - Login Form */}
            <LoginFormSection>
              <LogoHeader>
                <MainLogo>
                  <FaStore />
                </MainLogo>
                <GradientText variant="h1" gutterBottom>
                  Store Login
                </GradientText>
                <Typography variant="body1" color="text.secondary">
                  Access your professional debt management dashboard
                </Typography>
              </LogoHeader>

              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <form onSubmit={handleSubmit(onSubmit)} style={{ flex: 1 }}>
                  <Stack spacing={3}>
                    <StyledTextField
                      fullWidth
                      label="Store Name"
                      variant="outlined"
                      placeholder="Enter your registered store name"
                      disabled={isLoading}
                      error={!!errors.shop_name}
                      helperText={errors.shop_name?.message as string}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <FaStore color={theme.palette.primary.main} />
                          </InputAdornment>
                        )
                      }}
                      {...register('shop_name', {
                        required: "Please enter your store name",
                        minLength: {
                          value: 2,
                          message: "Store name must be at least 2 characters"
                        }
                      })}
                    />

                    {error && (
                      <Fade in>
                        <Alert
                          severity="error"
                          icon={<FaShieldAlt />}
                          sx={{
                            borderRadius: 12,
                            backgroundColor: alpha(theme.palette.error.main, 0.08),
                            border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                            '& .MuiAlert-icon': {
                              fontSize: 20
                            }
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
                      startIcon={isLoading ? 
                        <CircularProgress size={20} color="inherit" /> : 
                        <FaSignInAlt />
                      }
                    >
                      {isLoading ? 'Authenticating...' : 'Login to Dashboard'}
                    </GradientButton>

                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ 
                          opacity: 0.7,
                          lineHeight: 1.5,
                          display: 'block'
                        }}
                      >
                        Don&apos;t have an account? 
                      </Typography>
                      <Typography 
                        variant="caption" 
                        color="primary"
                        onClick={() => navigate('/sign-up')}
                        sx={{ 
                          fontWeight: 600,
                          cursor: 'pointer',
                          '&:hover': { textDecoration: 'underline' }
                        }}
                      >
                        Sign Up
                      </Typography>
                    </Box>
                  </Stack>
                </form>

                <Box sx={{ 
                  mt: 'auto', 
                  pt: 3, 
                  borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                }}>
                  <Stack 
                    direction="row" 
                    justifyContent="center" 
                    alignItems="center"
                  >
                    <Typography variant="caption" color="text.secondary">
                      © {new Date().getFullYear()} Debt Manager
                    </Typography>
                  </Stack>
                </Box>
              </Box>
            </LoginFormSection>
          </MainCard>
        </Fade>
      </LoginContainer>
    </GradientBackground>
  );
}

export default LoginPage;