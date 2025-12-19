import { useNavigate } from "react-router-dom";
import { Container, Box, Typography, Button, Grid, Card, CardContent } from "@mui/material";
import { FaUsers, FaChartLine, FaWallet, FaBell } from "react-icons/fa";

function Home() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <FaUsers size={32} />,
      title: "Manage Debtors",
      description: "Keep track of all people who owe you money in one organized place"
    },
    {
      icon: <FaChartLine size={32} />,
      title: "Track Progress",
      description: "Visualize payment trends and monitor debt collection progress"
    },
    {
      icon: <FaWallet size={32} />,
      title: "Financial Overview",
      description: "Get a complete picture of your outstanding debts and payments"
    },
    {
      icon: <FaBell size={32} />,
      title: "Stay Updated",
      description: "Never miss a payment with timely reminders and notifications"
    }
  ];

  return (
    <Box sx={{ position: 'relative', overflow: 'hidden', minHeight: '100vh' }}>
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, py: 8 }}>
        {/* Hero Section */}
        <Box sx={{ mb: 8, textAlign: 'center' }}>
          <Typography 
            variant="h2" 
            sx={{ 
              fontWeight: 800, 
              mb: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'fadeInDown 1s ease-out',
              fontSize: { xs: '2.5rem', md: '3.5rem' }
            }}
          >
            Debt Manager
          </Typography>
          
          <Typography 
            variant="h5" 
            color="text.secondary" 
            sx={{ 
              mb: 2,
              fontWeight: 400,
              animation: 'fadeInUp 1s ease-out 0.2s backwards',
              maxWidth: '600px',
              mx: 'auto'
            }}
          >
            Your smart companion for managing finances and tracking debts effortlessly
          </Typography>

          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ 
              mb: 4,
              animation: 'fadeInUp 1s ease-out 0.4s backwards',
              maxWidth: '500px',
              mx: 'auto'
            }}
          >
            Stay organized, get paid on time, and maintain healthy financial relationships
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            justifyContent: 'center', 
            flexWrap: 'wrap',
            animation: 'fadeInUp 1s ease-out 0.6s backwards'
          }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<FaUsers />}
              onClick={() => navigate('/debtor')}
              sx={{
                borderRadius: 3,
                px: 5,
                py: 1.8,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1.1rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 12px 32px rgba(102, 126, 234, 0.5)',
                }
              }}
            >
              Get Started
            </Button>
            
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/debtor')}
              sx={{
                borderRadius: 3,
                px: 5,
                py: 1.8,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1.1rem',
                borderWidth: 2,
                borderColor: '#667eea',
                color: '#667eea',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderWidth: 2,
                  transform: 'translateY(-3px)',
                  borderColor: '#764ba2',
                  backgroundColor: 'rgba(102, 126, 234, 0.05)',
                }
              }}
            >
              View Dashboard
            </Button>
          </Box>
        </Box>

        {/* Features Grid */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          {features.map((feature, index) => (
            <Box key={index} sx={{ margin : '0 auto' }} >
              <Card 
                sx={{
                  height: '100%',
                  borderRadius: 4,
                  transition: 'all 0.3s ease',
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(102, 126, 234, 0.1)',
                  animation: `fadeInUp 0.8s ease-out ${0.2 * index}s backwards`,
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 40px rgba(102, 126, 234, 0.2)',
                    borderColor: 'rgba(102, 126, 234, 0.3)',
                  }
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box 
                    sx={{ 
                      display: 'inline-flex',
                      p: 2,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      mb: 2
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 700, 
                      mb: 1,
                      color: '#2c3e50'
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ lineHeight: 1.7 }}
                  >
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Grid>

        {/* Stats Section */}
        <Box 
          sx={{ 
            textAlign: 'center',
            p: 4,
            borderRadius: 4,
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(102, 126, 234, 0.2)',
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#2c3e50' }}>
            Take Control of Your Finances Today
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: '600px', mx: 'auto' }}>
            Join thousands of users who have simplified their debt management and improved their financial health
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/debtor')}
            sx={{
              borderRadius: 3,
              px: 5,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: '0 12px 32px rgba(102, 126, 234, 0.5)',
              }
            }}
          >
            Start Managing Now
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

export default Home;