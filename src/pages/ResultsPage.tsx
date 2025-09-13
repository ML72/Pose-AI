import React from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
  Card,
  CardContent
} from '@mui/material';
import { ArrowBack, AutoAwesome, Download, TipsAndUpdates } from '@mui/icons-material';
import CustomPage from '../components/CustomPage';

type LocationState = {
  userImageUrl?: string | null;
  fileName?: string | null;
};

const grayBoxSx = {
  position: 'relative',
  width: '100%',
  height: 220,
  borderRadius: 2,
  background: 'linear-gradient(180deg, rgba(106,17,203,0.06), rgba(229,57,53,0.06))',
  border: '1px solid rgba(106, 17, 203, 0.18)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'text.secondary'
} as const;

const imgFrameSx = {
  position: 'relative',
  width: '100%',
  height: { xs: 280, sm: 360 },
  borderRadius: 2.5,
  overflow: 'hidden',
  background: 'linear-gradient(180deg, rgba(106,17,203,0.06), rgba(229,57,53,0.06))',
  border: '1px solid rgba(106, 17, 203, 0.25)'
} as const;

const ResultsPage: React.FC = () => {
  const history = useHistory();
  const location = useLocation<LocationState>();
  const userImageUrl = location.state?.userImageUrl ?? null;
  const fileName = location.state?.fileName ?? 'uploaded_photo.jpg';

  // Placeholder recommended poses – replace with real data later
  const recommended = [
    { id: 1, title: 'Editorial Pose A' },
    { id: 2, title: 'Portrait Pose B' },
    { id: 3, title: 'Full-Body Pose C' }
  ];

  // Basic stub metrics – swap for real analysis later
  const metrics = [
    { label: 'Posture', value: 'Good' },
    { label: 'Symmetry', value: 'Medium' },
    { label: 'Angles', value: 'Needs Work' }
  ];

  const tips = [
    'Relax shoulders and elongate the neck for a cleaner silhouette.',
    'Shift weight to one leg to create a natural S-curve.',
    'Slightly angle chin down and towards the camera for definition.',
  ];

  return (
    <CustomPage useBindingContainer={false}>
      {/* Header / Hero-lite */}
      <Box sx={{ py: { xs: 3, sm: 5 } }}>
        <Container maxWidth="lg">
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between">
            <Stack spacing={1}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #6A11CB 0%, #E53935 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                Analysis Results
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                <Chip label={`File: ${fileName || '—'}`} variant="outlined" size="small" />
                <Chip label="Mode: Auto" color="primary" variant="outlined" size="small" />
                <Chip label="v0 Preview" color="secondary" variant="outlined" size="small" />
              </Stack>
            </Stack>

            <Stack direction="row" spacing={1}>
              <Button startIcon={<ArrowBack />} variant="text" onClick={() => history.push('/upload')}>
                Back
              </Button>
              <Button variant="contained" startIcon={<AutoAwesome />}>Improve</Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Main content */}
      <Container maxWidth="lg" sx={{ pb: 6 }}>
        <Grid container spacing={4}>
          {/* Left: Uploaded image */}
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 0.75, borderRadius: 3, background: 'primary.dark' }}>
              <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2.5, background: 'linear-gradient(145deg, rgba(255,255,255,0.92) 0%, rgba(252,248,255,0.92) 100%)', border: '1px solid rgba(106, 17, 203, 0.18)' }}>
                <Stack spacing={1.5}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Your Photo</Typography>
                  <Box sx={imgFrameSx}>
                    {userImageUrl ? (
                      <img src={userImageUrl} alt={fileName || 'uploaded'} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    ) : (
                      <Stack alignItems="center" justifyContent="center" sx={{ width: '100%', height: '100%' }}>
                        <Typography variant="body2" color="text.secondary">No image provided</Typography>
                        <Button size="small" sx={{ mt: 1 }} onClick={() => history.push('/upload')}>Upload one</Button>
                      </Stack>
                    )}
                  </Box>
                </Stack>
              </Paper>
            </Box>
          </Grid>

          {/* Right: Quick analysis + tips */}
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 0.75, borderRadius: 3, background: 'secondary.dark', height: '100%' }}>
              <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2.5, height: '100%', background: 'linear-gradient(145deg, rgba(255,255,255,0.94) 0%, rgba(255,248,248,0.94) 100%)', border: '1px solid rgba(229, 57, 53, 0.18)' }}>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <TipsAndUpdates color="primary" />
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Quick Review</Typography>
                  </Stack>

                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                    {metrics.map((m) => (
                      <Chip key={m.label} label={`${m.label}: ${m.value}`} variant="outlined" />
                    ))}
                  </Stack>

                  <Divider />

                  <Stack spacing={1}>
                    {tips.map((t, i) => (
                      <Stack key={i} direction="row" spacing={1} alignItems="flex-start">
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', mt: '10px' }} />
                        <Typography variant="body2" color="text.secondary">{t}</Typography>
                      </Stack>
                    ))}
                  </Stack>

                  <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ pt: 1 }}>
                    <Button variant="outlined" startIcon={<Download />}>Download Report</Button>
                  </Stack>
                </Stack>
              </Paper>
            </Box>
          </Grid>
        </Grid>

        {/* Recommended Poses */}
        <Box sx={{ mt: 5 }}>
          <Stack spacing={1} sx={{ mb: 2 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #6A11CB 0%, #E53935 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Recommended Poses
            </Typography>
            <Typography variant="body2" color="text.secondary">Three curated options based on your photo. Each shows a reference and your photo adapted to match.</Typography>
          </Stack>

          <Grid container spacing={3}>
            {recommended.map((pose) => (
              <Grid key={pose.id} item xs={12} md={4}>
                <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(106, 17, 203, 0.18)', background: 'linear-gradient(145deg, rgba(255,255,255,0.96) 0%, rgba(252,248,255,0.96) 100%)' }}>
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>{pose.title}</Typography>
                    <Grid container spacing={1.5}>
                      <Grid item xs={6}>
                        <Box sx={{ ...grayBoxSx, height: 160 }}>
                          <Typography variant="caption" color="text.secondary">Reference</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ ...grayBoxSx, height: 160 }}>
                          <Typography variant="caption" color="text.secondary">Edited</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                    <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                      <Chip size="small" label="Natural" variant="outlined" />
                      <Chip size="small" label="Balanced" variant="outlined" />
                    </Stack>
                    <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 1.5 }}>
                      <Button size="small" variant="outlined">Details</Button>
                      <Button size="small" variant="contained">Apply</Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </CustomPage>
  );
};

export default ResultsPage;
