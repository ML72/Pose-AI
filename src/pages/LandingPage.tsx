import React from 'react';
import { 
  Button, 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent,
  Stack,
  Chip,
  IconButton,
  Paper,
  AppBar,
  Toolbar
} from '@mui/material';
import { 
  CameraAlt, 
  ModelTraining, 
  AutoAwesome, 
  ArrowForward,
  PhotoCamera,
  Palette,
  Psychology,
  TrendingUp,
  LockOutlined,
  Speed,
  CloudDone,
  Gesture,
  Bolt
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import CustomPage from '../components/CustomPage';
import { setNewAlert } from '../service/alert';

const LandingPage: React.FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const handleGetStarted = () => {
    // Navigate to upload page
    try {
      history.push('/upload');
    } catch {
      setNewAlert(dispatch, { msg: "Navigating to upload…" });
    }
  };

  const features = [
    {
      icon: <CameraAlt fontSize="large" />,
      title: "Upload",
      description: "Start with any portrait photo to begin pose analysis."
    },
    {
      icon: <Psychology fontSize="large" />,
      title: "Analyze",
      description: "AI evaluates body landmarks, symmetry, and composition."
    },
    {
      icon: <Gesture fontSize="large" />,
      title: "Suggest",
      description: "Receive tailored pose suggestions for modeling and photoshoots."
    },
    {
      icon: <TrendingUp fontSize="large" />,
      title: "Refine",
      description: "Iterate quickly and pick the style that fits your shot."
    }
  ];

  const highlights = [
  { icon: <LockOutlined fontSize="small" sx={{ mr: 0.5 }} />, label: 'Encrypted Data' },
  { icon: <Speed fontSize="small" sx={{ mr: 0.5 }} />, label: 'Quick Iteration' },
  { icon: <CloudDone fontSize="small" sx={{ mr: 0.5 }} />, label: 'Privacy First' }
  ];

  return (
    <CustomPage useBindingContainer={false}>
      {/* Hero Section */}
      {/* Header */}
      <AppBar position="fixed" sx={{ backgroundColor: 'rgba(249, 231, 242, 0.5)', opacity: 1, height: '10vh', justifyContent: 'center', boxShadow: 'none' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'rgb(157, 114, 165)', display: 'flex', alignItems: 'center', fontSize: '1rem', letterSpacing: 2, fontWeight: '600' }}>
            <Box
              component="img"
              src="/favicon.png"
              alt="Pose AI Logo"
              sx={{ width: 60, height: 60, mr: 1 }}
              style={{ marginRight: 18, marginLeft: 8 }}
            />
            {/* Pose-AI */}
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        sx={{
          background: 'radial-gradient(1200px 600px at 80% 10%, rgba(154, 72, 245, 0.14), transparent 60%), radial-gradient(800px 400px at 10% 90%, rgba(229, 57, 53, 0.14), transparent 70%), linear-gradient(135deg, rgba(106, 17, 203, 0.10) 0%, rgba(229, 57, 53, 0.10) 100%)',
          minHeight: { xs: 'auto', sm: '70vh' },
          py: { xs: 3, sm: 6 },
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          marginTop: '10vh',
          overflow: 'hidden',
          // Animated grid overlay
          '& .tech-grid': {
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(106,17,203,0.12) 1px, transparent 1px),
              linear-gradient(90deg, rgba(229,57,53,0.10) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px, 40px 40px',
            maskImage: 'radial-gradient(circle at 60% 20%, black 30%, transparent 70%)',
            opacity: 0.4,
            pointerEvents: 'none',
            zIndex: 0
          },
          // Floating glow orbs
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '20%',
            right: '10%',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(106, 17, 203, 0.16) 0%, transparent 70%)',
            filter: 'blur(80px)',
            zIndex: 0
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '10%',
            left: '5%',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(229, 57, 53, 0.18) 0%, transparent 70%)',
            filter: 'blur(60px)',
            zIndex: 0
          }
        }}
      >
        <Box className="tech-grid" />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={8}>
              <Stack spacing={3}>
                <Box>
                  <Chip
                    label="AI-Powered Pose Suggestions"
                    color="primary"
                    variant="outlined"
                    sx={{
                      mb: 2,
                      fontWeight: 'medium',
                      borderWidth: 2
                    }}
                  />
                  <Typography
                    variant="h2"
                    component="h1"
                    sx={{
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #6A11CB 0%, #E53935 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      lineHeight: 1.2,
                      mb: 2
                    }}
                  >
                    Perfect Your Pose
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      color: 'text.secondary',
                      lineHeight: 1.6,
                      maxWidth: '600px'
                    }}
                  >
                    Transform your photography with intelligent pose suggestions. 
                    Upload a photo and get professional modeling and photoshoot recommendations 
                    powered by advanced AI technology.
                  </Typography>
                </Box>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForward />}
                    onClick={handleGetStarted}
                    sx={{
                      py: 1.5,
                      px: 4,
                      background: 'primary.main',
                      boxShadow: '0 8px 24px rgba(181, 54, 255, 0.3)',
                      '&:hover': {
                        background: 'secondary.main',
                        transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Get Started
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<AutoAwesome />}
                    onClick={() => history.push('/results')}
                    sx={{
                      py: 1.5,
                      px: 4,
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      background: 'transparent',
                      '&:hover': {
                        borderColor: 'primary.dark',
                        background: 'primary.light',
                        transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    See Demo
                  </Button>
                </Stack>

                <Stack direction="row" spacing={1.5} sx={{ mt: 1, flexWrap: 'wrap' }}>
                  {highlights.map((h, i) => (
                    <Chip key={i} icon={h.icon as any} label={h.label} variant="outlined" sx={{ borderColor: 'rgba(106,17,203,0.25)' }} />
                  ))}
                </Stack>
              </Stack>
            </Grid>
            <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: { xs: 2, sm: 0 } }}>
              {/* Gradient border wrapper */}
              <Box
                sx={{
                  p: { xs: 1.5, md: 0.75 },
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, rgba(106,17,203,0.45), rgba(229,57,53,0.45))',
                  mt: { xs: 3, md: 0 },
                  mb: { xs: 3, md: 0 },
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Paper
                  elevation={12}
                  sx={{
                    p: { xs: 2, md: 3 },
                    textAlign: 'center',
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.90) 0%, rgba(255,250,252,0.90) 100%)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(106, 17, 203, 0.18)',
                    borderRadius: 2.5,
                    position: 'relative',
                    overflow: 'hidden',
                    width: { xs: '100%', sm: 340, md: 'auto' },
                    minWidth: { xs: 0, sm: 260 },
                    maxWidth: { xs: '100%', sm: 340 },
                  }}
                >
                  <IconButton
                    sx={{
                      background: 'transparent',
                      color: 'inherit',
                      mb: 2,
                      width: { xs: 72, sm: 96 },
                      height: { xs: 72, sm: 96 },
                      p: 0,
                      borderRadius: '50%',
                      border: 'none',
                      boxShadow: 'none',
                      position: 'relative',
                      // faint layered glows behind the icon
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: { xs: 110, sm: 150 },
                        height: { xs: 110, sm: 150 },
                        borderRadius: '50%',
                        background: 'radial-gradient(circle at 30% 30%, rgba(154,72,245,0.16), transparent 35%), radial-gradient(circle at 70% 70%, rgba(229,57,53,0.12), transparent 40%)',
                        filter: 'blur(28px)',
                        zIndex: -2,
                        pointerEvents: 'none'
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: { xs: 78, sm: 110 },
                        height: { xs: 78, sm: 110 },
                        borderRadius: '50%',
                        background: 'radial-gradient(circle at 40% 40%, rgba(154,72,245,0.22), transparent 40%), radial-gradient(circle at 60% 60%, rgba(229,57,53,0.14), transparent 45%)',
                        filter: 'blur(14px)',
                        zIndex: -1,
                        pointerEvents: 'none'
                      },
                      '&:hover': {
                        background: 'transparent'
                      }
                    }}
                  >
                    <Box
                      component="img"
                      src="/favicon.png"
                      alt="Camera"
                      sx={{
                        width: { xs: 40, sm: 64 },
                        height: { xs: 40, sm: 64 },
                        objectFit: 'contain',
                        display: 'block'
                      }}
                    />
                  </IconButton>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Live Preview
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Pose landmarks detected in seconds
                  </Typography>

                  {/* Animated pose SVG */}
                  <Box
                    sx={{
                      position: 'relative',
                      height: { xs: 180, sm: 260, md: 340 },
                      width: '100%',
                      borderRadius: 2,
                      background: 'linear-gradient(180deg, rgba(106,17,203,0.07), rgba(229,57,53,0.07))',
                      border: '1px solid rgba(106,17,203,0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      '@keyframes dash': {
                        '0%': { strokeDashoffset: 60 },
                        '100%': { strokeDashoffset: 0 }
                      }
                    }}
                  >
                    <svg width="100%" height="100%" viewBox="0 0 300 280" preserveAspectRatio="xMidYMid meet">
                      {/* Glow backdrop */}
                      <defs>
                        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                          <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                          <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                      </defs>
                      {/* Torso */}
                      <g stroke="#9D5CFF" strokeWidth="3.5" strokeLinecap="round" fill="none" filter="url(#glow)" style={{ filter: 'drop-shadow(0 0 6px rgba(106,17,203,0.6))' as any }}>
                        <circle cx="150" cy="70" r="18" fill="rgba(106,17,203,0.18)" />
                        <line x1="150" y1="88" x2="150" y2="160" className="dash" style={{ strokeDasharray: '6 6', animation: 'dash 4s linear infinite' as any }} />
                        {/* Arms */}
                        <line x1="150" y1="110" x2="110" y2="140" />
                        <line x1="150" y1="110" x2="190" y2="140" />
                        {/* Legs */}
                        <line x1="150" y1="160" x2="120" y2="220" />
                        <line x1="150" y1="160" x2="180" y2="220" />
                        {/* Joints */}
                        <circle cx="150" cy="110" r="4" />
                        <circle cx="110" cy="140" r="4" />
                        <circle cx="190" cy="140" r="4" />
                        <circle cx="150" cy="160" r="4" />
                        <circle cx="120" cy="220" r="4" />
                        <circle cx="180" cy="220" r="4" />
                      </g>
                    </svg>
                    {/* floating highlight */}
                    <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 0.5, borderRadius: 999, background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(106,17,203,0.25)', backdropFilter: 'blur(6px)', fontSize: { xs: '0.8rem', sm: '1rem' } }}>
                      <Bolt fontSize="small" sx={{ color: 'primary.main' }} />
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>Lightning Fast</Typography>
                    </Box>
                  </Box>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box textAlign="center" mb={6}>
          <Typography
            variant="h3"
            component="h2"
            sx={{
              fontWeight: 700,
              mb: 2,
              background: 'linear-gradient(135deg, #6A11CB 0%, #E53935 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            How It Works
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto' }}>
            Our AI-powered platform makes professional pose suggestions accessible to everyone
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Box sx={{ p: 0.75, height: '100%', borderRadius: 3, background: 'primary.dark' }}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    textAlign: 'center',
                    p: 3,
                    background: 'linear-gradient(145deg, rgba(255,255,255,0.86) 0%, rgba(252,248,255,0.86) 100%)',
                    border: '1px solid rgba(106, 17, 203, 0.18)',
                    borderRadius: 2.5,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 40px rgba(106, 17, 203, 0.18)',
                      border: '1px solid rgba(106, 17, 203, 0.25)'
                    }
                  }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        color: 'primary.main',
                        mb: 2,
                        display: 'flex',
                        justifyContent: 'center'
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          position: 'relative',
          background: 'linear-gradient(135deg, #efe0ffff 0%, #ffe7e7ff 100%)',
          py: 8,
          overflow: 'hidden'
        }}
      >
        {/* subtle grid */}
        <Box sx={{ position: 'absolute', inset: 0, opacity: 0.3, backgroundImage: 'linear-gradient(rgba(106,17,203,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(229,57,53,0.10) 1px, transparent 1px)', backgroundSize: '44px 44px, 44px 44px' }} />
        <Container maxWidth="md">
          <Paper
            elevation={12}
            sx={{
              p: 6,
              textAlign: 'center',
               background: 'linear-gradient(145deg, rgba(255,255,255,0.96) 0%, rgba(255,248,248,0.96) 100%)',
               backdropFilter: 'blur(10px)',
               border: '1px solid rgba(106, 17, 203, 0.15)',
              borderRadius: 4
            }}
          >
            <AutoAwesome
              sx={{
                fontSize: 48,
                color: 'primary.main',
                mb: 2
              }}
            />
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                mb: 2,
                background: 'linear-gradient(135deg, #6A11CB 0%, #E53935 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Ready to Transform Your Photos?
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: '500px', mx: 'auto' }}>
              Join thousands of photographers and models who trust our AI for professional pose suggestions
            </Typography>
            <Button
              variant="contained"
              size="large"
              endIcon={<ModelTraining />}
              onClick={handleGetStarted}
              sx={{
                py: 1.5,
                px: 4,
                background: 'linear-gradient(135deg, #6A11CB 0%, #E53935 100%)',
                boxShadow: '0 8px 24px rgba(106, 17, 203, 0.30)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4C0FA3 0%, #B71C1C 100%)',
                  boxShadow: '0 12px 32px rgba(106, 17, 203, 0.40)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Start Analyzing
            </Button>
          </Paper>
        </Container>
      </Box>
    </CustomPage>
  )
};

export default LandingPage;
