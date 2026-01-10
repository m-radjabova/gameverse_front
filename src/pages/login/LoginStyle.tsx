import { styled, alpha } from '@mui/material/styles';
import { Box, Paper, Typography, Button, TextField, Dialog } from '@mui/material';
import { FaStore } from 'react-icons/fa';

export const GradientBackground = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0, // padding olib tashlandi
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
    top: '-200px',
    right: '-200px',
    zIndex: 0
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.08)} 0%, transparent 70%)`,
    bottom: '-150px',
    left: '-150px',
    zIndex: 0
  }
}));

export const LoginContainer = styled(Box)(({ theme  }) => ({
  width: '100%',
  height: '100vh', 
  position: 'relative',
  zIndex: 1
}));

export const MainCard = styled(Paper)(({ theme }) => ({
  display: 'flex',
  borderRadius: 0, 
  overflow: 'hidden',
  width: '100%', 
  height: '100%',
  boxShadow: 'none', 
  backgroundColor: theme.palette.background.paper,
  position: 'relative'
}));

export const FeaturesSidebar = styled(Box)(({ theme }) => ({
  flex: 1,
  background: `linear-gradient(135deg, 
    ${theme.palette.primary.dark} 0%, 
    ${theme.palette.primary.main} 100%
  )`,
  padding: theme.spacing(6), 
  color: 'white',
  minWidth: '450px', 
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center', 
  position: 'relative',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  transition: 'background-image 0.5s ease-in-out',
}));

export const LoginFormSection = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(6),
  minWidth: '400px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center', 
  overflowY: 'auto', 
}));

export const LogoHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'column',
  justifyContent: 'center',
  textAlign: 'center',
  marginBottom: theme.spacing(4)
}));

export const MainLogo = styled(Box)(({ theme }) => ({
  fontSize: '52px',
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(2),
  display: 'flex',
  justifyContent: 'center',
  '& svg': {
    filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))'
  }
}));

export const GradientText = styled(Typography)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  fontWeight: 800
}));

export const GradientButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(4),
  padding: theme.spacing(1.8),
  borderRadius: 14,
  fontSize: '1rem',
  fontWeight: 700,
  textTransform: 'none',
  letterSpacing: '0.5px',
  color: 'white',
  background: `linear-gradient(135deg, 
    ${theme.palette.primary.main} 0%, 
    ${theme.palette.primary.dark} 100%
  )`,
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
    background: `linear-gradient(135deg, 
      ${theme.palette.primary.dark} 0%, 
      ${theme.palette.primary.main} 100%
    )`,
    '&::after': {
      transform: 'translateX(100%)'
    }
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.common.white, 0.3)}, transparent)`,
    transition: 'transform 0.6s ease'
  }
}));

export const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    backgroundColor: alpha(theme.palette.background.paper, 0.9),
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: theme.palette.background.paper,
      transform: 'translateY(-2px)',
      boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.15)}`
    },
    '&.Mui-focused': {
      backgroundColor: theme.palette.background.paper,
      boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.2)}`
    }
  },
  '& .MuiInputLabel-root': {
    fontWeight: 500
  }
}));

export const FeatureIcon = styled(Box)(({ theme }) => ({
  width: 48,
  height: 48,
  borderRadius: 12,
  backgroundColor: alpha('#ffffff', 0.2),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: theme.spacing(2.5),
  fontSize: '20px',
  flexShrink: 0
}));

export const FormSection = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(2),
  minWidth: '400px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center', 
  overflowY: 'auto',
}));

export const LogoIcon = styled(FaStore)(({ theme }) => ({
  fontSize: 52,
  color: theme.palette.primary.main,
  filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))',
  marginBottom: theme.spacing(2),
}));

export const GlassDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 24,
    backdropFilter: 'blur(20px)',
    backgroundColor: alpha(theme.palette.background.paper, 0.95),
    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
    boxShadow: `
      0 25px 80px ${alpha(theme.palette.common.black, 0.2)},
      inset 0 1px 0 ${alpha(theme.palette.common.white, 0.3)}
    `,
    overflow: 'hidden'
  }
}));

export const DialogHeader = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, 
    ${theme.palette.primary.main} 0%, 
    ${theme.palette.primary.dark} 100%
  )`,
  padding: theme.spacing(3),
  color: 'white',
  position: 'relative',
  overflow: 'hidden'
}));

export const FloatingIcon = styled(Box)(({ theme }) => ({
  position: 'absolute',
  right: -40,
  top: -40,
  width: 120,
  height: 120,
  borderRadius: '50%',
  background: `radial-gradient(circle, ${alpha('#ffffff', 0.1)} 0%, transparent 70%)`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 40,
  opacity: 0.5
}));