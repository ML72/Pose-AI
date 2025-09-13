import React from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
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
import KeypointVisualization from '../components/KeypointVisualization';
import { selectUserPoseImage, selectUserPoseKeypoints, selectSimilarImageFilenames } from '../store/slices/data';

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
  
  // Get pose data from Redux store
  const userPoseImage = useSelector(selectUserPoseImage);
  const userPoseKeypoints = useSelector(selectUserPoseKeypoints);
  const similarImageFilenames = useSelector(selectSimilarImageFilenames);
  
  // Use Redux image if available, fallback to location state
  const displayImageUrl = userPoseImage || userImageUrl;

  // Use similar poses from Redux or fallback to placeholder
  const recommended = similarImageFilenames.length >= 2 ? [
    { id: 1, title: 'Best Match', filename: similarImageFilenames[0] },
    { id: 2, title: 'Second Match', filename: similarImageFilenames[1] }
  ] : [
    { id: 1, title: 'Editorial Pose A', filename: null },
    { id: 2, title: 'Editorial Pose B', filename: null }
  ];

  // Enhanced metrics based on keypoint data
  const getMetrics = () => {
    if (!userPoseKeypoints || !userPoseKeypoints.keypoints.length) {
      return [
        { label: 'Posture', value: 'N/A' },
        { label: 'Keypoints', value: 'N/A' },
        { label: 'Analysis', value: 'Upload required' }
      ];
    }

    const validKeypoints = userPoseKeypoints.keypoints.filter(kp => kp.score > 0.5);
    const avgConfidence = validKeypoints.length > 0 
      ? (validKeypoints.reduce((sum, kp) => sum + kp.score, 0) / validKeypoints.length * 100).toFixed(0)
      : '0';

    return [
      { label: 'Keypoints Detected', value: `${validKeypoints.length}/33` },
      { label: 'Confidence', value: `${avgConfidence}%` },
      { label: 'Model', value: 'BlazePose' }
    ];
  };

  const metrics = getMetrics();

  // Enhanced tips based on pose analysis
  const getTips = () => {
    if (!userPoseKeypoints || !userPoseKeypoints.keypoints.length) {
      return [
        'Upload an image to get personalized pose analysis.',
        'Make sure your full body is visible in the photo.',
        'Use good lighting for better keypoint detection.'
      ];
    }

    const validKeypoints = userPoseKeypoints.keypoints.filter(kp => kp.score > 0.5);
    const tips = [];

    if (validKeypoints.length < 20) {
      tips.push('Consider better lighting or a clearer pose for improved detection.');
    } else {
      tips.push('Great pose detection! Your keypoints are clearly visible.');
    }

    tips.push('Keypoint colors indicate detection confidence: red (high), orange (medium), yellow (low).');
    tips.push('Green lines connect related body parts to show your pose structure.');
    tips.push('Higher confidence scores indicate more reliable pose detection.');

    return tips;
  };

  const tips = getTips();

  return (
    <CustomPage useBindingContainer={false}>
      {/* Header / Hero-lite */}
      <Box sx={{ py: { xs: 3, sm: 5 } }}>
        <Container maxWidth="lg" sx={{ position: 'relative' }}>
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
                <Chip 
                  label={userPoseKeypoints ? "Pose Analyzed" : "No Analysis"} 
                  color={userPoseKeypoints ? "success" : "warning"} 
                  variant="outlined" 
                  size="small" 
                />
              </Stack>
            </Stack>

            <Stack direction="row" spacing={1}>
              <Button startIcon={<ArrowBack />} variant="text" onClick={() => history.push('/upload')}>
                Back
              </Button>
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
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Your Photo with Pose Analysis</Typography>
                  <Box sx={{ 
                    ...imgFrameSx, 
                    height: { xs: 320, sm: 400 }, 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 1
                  }}>
                    {displayImageUrl ? (
                      <KeypointVisualization
                        imageUrl={displayImageUrl}
                        keypoints={userPoseKeypoints}
                        maxWidth={460}
                        maxHeight={380}
                      />
                    ) : (
                      <Stack alignItems="center" justifyContent="center" sx={{ width: '100%', height: '100%' }}>
                        <Typography variant="body2" color="text.secondary">No image provided</Typography>
                        <Button size="small" sx={{ mt: 1 }} onClick={() => history.push('/upload')}>Upload one</Button>
                      </Stack>
                    )}
                  </Box>
                  
                  {userPoseKeypoints && (
                    <Box sx={{ 
                      mt: 1, 
                      p: 1, 
                      backgroundColor: 'rgba(106, 17, 203, 0.05)', 
                      borderRadius: 1,
                      border: '1px solid rgba(106, 17, 203, 0.1)'
                    }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                        Pose Visualization Legend:
                      </Typography>
                      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#ff0000' }} />
                          <Typography variant="caption">High confidence</Typography>
                        </Stack>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#ff8000' }} />
                          <Typography variant="caption">Medium confidence</Typography>
                        </Stack>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Box sx={{ width: 12, height: 2, bgcolor: '#00ff00' }} />
                          <Typography variant="caption">Body connections</Typography>
                        </Stack>
                      </Stack>
                    </Box>
                  )}
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

                  {/* Download Report button removed per request */}
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
            <Typography variant="body2" color="text.secondary">
              {similarImageFilenames.length >= 2 
                ? 'AI-matched reference poses based on similarity analysis of your keypoints.'
                : 'Two curated editorial options based on your photo. Each shows a reference and your photo adapted to match.'
              }
            </Typography>
          </Stack>

          <Grid container spacing={3}>
            {recommended.map((pose) => (
              <Grid key={pose.id} item xs={12} md={6}>
                <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(106, 17, 203, 0.18)', background: 'linear-gradient(145deg, rgba(255,255,255,0.96) 0%, rgba(252,248,255,0.96) 100%)' }}>
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>{pose.title}</Typography>
                    <Grid container spacing={1.5}>
                      <Grid item xs={6}>
                        <Box sx={{ ...grayBoxSx, height: 220, padding: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {pose.filename ? (
                            <Box sx={{
                              width: '100%',
                              height: '100%',
                              borderRadius: 2,
                              overflow: 'hidden',
                              boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
                              backgroundColor: 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              p: 0
                            }}>
                              <img
                                src={`/data/images/${pose.filename}`}
                                alt="Reference pose"
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  display: 'block'
                                }}
                              />
                            </Box>
                          ) : (
                            <Typography variant="caption" color="text.secondary">Reference</Typography>
                          )}
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ ...grayBoxSx, height: 220, padding: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Box sx={{
                            width: '100%',
                            height: '100%',
                            borderRadius: 2,
                            overflow: 'hidden',
                            boxShadow: '0 6px 18px rgba(0,0,0,0.04)',
                            backgroundColor: 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            p: 0
                          }}>
                            <Typography variant="caption" color="text.secondary">Edited</Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                    <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                      <Chip size="small" label="Natural" variant="outlined" />
                      <Chip size="small" label="Balanced" variant="outlined" />
                    </Stack>
                    {/* Buttons removed as requested */}
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
