import React from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
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
import { selectUserPoseImage, selectUserPoseKeypoints, selectSimilarImageFilenames, selectDesiredStyle, selectPrioritizedAreas, selectOutputMode, selectImprovementSuggestions, setImprovementSuggestions, selectEditedImages, setEditedImages } from '../store/slices/data';
import { analyzePoses } from '../service/poseSuggestions';
import { Skeleton } from '@mui/material';
import { editImages } from '../service/imageEdit';

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

// Style for recommended pose images to match user photo display
const recommendedPoseFrameSx = {
  position: 'relative',
  width: '100%',
  height: { xs: 200, sm: 240 }, // Slightly smaller than main user photo but maintains aspect ratio
  borderRadius: 2.5,
  overflow: 'hidden',
  background: 'linear-gradient(180deg, rgba(106,17,203,0.06), rgba(229,57,53,0.06))',
  border: '1px solid rgba(106, 17, 203, 0.25)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 1
} as const;

const ResultsPage: React.FC = () => {
  const history = useHistory();
  const location = useLocation<LocationState>();
  const dispatch = useDispatch();
  const userImageUrl = location.state?.userImageUrl ?? null;
  const fileName = location.state?.fileName ?? 'uploaded_photo.jpg';
  
  // Get pose data from Redux store
  const userPoseImage = useSelector(selectUserPoseImage);
  const userPoseKeypoints = useSelector(selectUserPoseKeypoints);
  const similarImageFilenames = useSelector(selectSimilarImageFilenames);
  const desiredStyle = useSelector(selectDesiredStyle);
  const prioritizedAreas = useSelector(selectPrioritizedAreas);
  const outputMode = useSelector(selectOutputMode);
  const improvementSuggestions = useSelector(selectImprovementSuggestions);
  const editedImages = useSelector(selectEditedImages);
  const [loadingSuggestions, setLoadingSuggestions] = React.useState<boolean>(true);
  const [loadingEditedImages, setLoadingEditedImages] = React.useState<boolean>(false);
  
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

  // Helper to fetch a public image and convert to base64 data URL
  const fetchImageAsDataUrl = async (relativePath: string): Promise<string> => {
    const res = await fetch(relativePath);
    if (!res.ok) throw new Error(`Failed to fetch ${relativePath}`);
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read image blob'));
      reader.readAsDataURL(blob);
    });
  };

  // Helper to convert base64 string to File object
  const base64ToFile = (base64String: string, filename: string = 'image.jpg'): File => {
    const arr = base64String.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new File([u8arr], filename, { type: mime });
  };

  // Kick off pose suggestions and edited images on load
  React.useEffect(() => {
    let cancelled = false;
    const run = async () => {
      // Start with skeleton state
      setLoadingSuggestions(true);
      
      // If we already have improvement suggestions, skip the API call
      if (improvementSuggestions && improvementSuggestions.length > 0) {
        setLoadingSuggestions(false);
        return;
      }
      
      // Preconditions: need user image and two reference filenames
      const hasUserImage = !!(userPoseImage || userImageUrl);
      const hasTwoRefs = similarImageFilenames && similarImageFilenames.length >= 2;
      if (!hasUserImage || !hasTwoRefs) {
        setLoadingSuggestions(false);
        return;
      }

      try {
        const ref1Path = `/data/images/${similarImageFilenames[0]}`;
        const ref2Path = `/data/images/${similarImageFilenames[1]}`;
        const [ref1, ref2] = await Promise.all([
          fetchImageAsDataUrl(ref1Path),
          fetchImageAsDataUrl(ref2Path)
        ]);

        const original = userPoseImage || userImageUrl!;
        const response = await analyzePoses({
          originalImage: original,
          referenceImage1: ref1,
          referenceImage2: ref2,
          desiredStyle: desiredStyle || [],
          prioritizedAreas: prioritizedAreas || [],
          outputMode: outputMode || 'Casual'
        });

        if (!cancelled) {
          if (response.success) {
            const bullets: string[] = [];
            if (response.overallFeedback) bullets.push(response.overallFeedback);
            if (response.suggestedImprovements) bullets.push(response.suggestedImprovements);
            if (response.poseChanges && response.poseChanges.length) {
              response.poseChanges.slice(0, 4).forEach((pc) => {
                bullets.push(`Ref ${pc.referenceImage}: ${pc.changeDescription} — ${pc.benefit}`);
              });
            }
            dispatch(setImprovementSuggestions(bullets));
          } else {
            dispatch(setImprovementSuggestions([response.error || 'Failed to retrieve suggestions.']));
          }
        }
      } catch (err: any) {
        if (!cancelled) {
          dispatch(setImprovementSuggestions(['Could not fetch AI suggestions at this time.']))
        }
      } finally {
        if (!cancelled) setLoadingSuggestions(false);
      }
    };

    run();
    return () => { cancelled = true; };
    // Re-run if inputs change significantly
  }, [userPoseImage, userImageUrl, similarImageFilenames, desiredStyle, prioritizedAreas, outputMode, improvementSuggestions, dispatch]);

  // Handle edited images generation
  React.useEffect(() => {
    let cancelled = false;
    
    const generateEditedImages = async () => {
      // If edited images already exist, skip
      if (editedImages && editedImages.length >= 2) {
        return;
      }

      // Preconditions: need user image and two reference filenames
      const hasUserImage = !!(userPoseImage || userImageUrl);
      const hasTwoRefs = similarImageFilenames && similarImageFilenames.length >= 2;
      if (!hasUserImage || !hasTwoRefs) {
        return;
      }

      setLoadingEditedImages(true);

      try {
        const ref1Path = `/data/images/${similarImageFilenames[0]}`;
        const ref2Path = `/data/images/${similarImageFilenames[1]}`;
        const [ref1, ref2] = await Promise.all([
          fetchImageAsDataUrl(ref1Path),
          fetchImageAsDataUrl(ref2Path)
        ]);

        const original = userPoseImage || userImageUrl!;
        const userImageFile = base64ToFile(original, 'user-image.jpg');

        // Generate edited images for both reference poses
        const [edit1Response, edit2Response] = await Promise.all([
          editImages({ image1: userImageFile, image2: base64ToFile(ref1, 'ref1.jpg') }),
          editImages({ image1: userImageFile, image2: base64ToFile(ref2, 'ref2.jpg') })
        ]);

        if (!cancelled) {
          const newEditedImages: string[] = [];
          
          if (edit1Response.success && edit1Response.imageB64) {
            newEditedImages.push(`data:image/png;base64,${edit1Response.imageB64}`);
          }
          
          if (edit2Response.success && edit2Response.imageB64) {
            newEditedImages.push(`data:image/png;base64,${edit2Response.imageB64}`);
          }
          
          if (newEditedImages.length > 0) {
            dispatch(setEditedImages(newEditedImages));
          }
        }
      } catch (err: any) {
        console.error('Failed to generate edited images:', err);
      } finally {
        if (!cancelled) setLoadingEditedImages(false);
      }
    };

    generateEditedImages();
    return () => { cancelled = true; };
  }, [userPoseImage, userImageUrl, similarImageFilenames, editedImages, dispatch]);

  return (
    <CustomPage useBindingContainer={false}>
      {/* Header / Hero-lite */}
      <Box sx={{ py: { xs: 3, sm: 5 } }}>
        <Container maxWidth="lg" sx={{ position: 'relative' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between">
            <Stack spacing={2} alignItems="flex-start">
              <Button startIcon={<ArrowBack />} variant="text" onClick={() => history.push('/upload')}>
                Back
              </Button>
              <Stack direction="column" spacing={2} width={'100%'} style={{ marginTop: 30 }}>
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
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', marginLeft: 'auto' }}>
                  <Chip label={`File: ${fileName || '—'}`} variant="outlined" size="small" />
                  <Chip label="Mode: Auto" color="primary" variant="outlined" size="small" />
                  <Chip label="v0 Preview" color="secondary" variant="outlined" size="small" />
                </Stack>
              </Stack>
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

                  {/* Use a semantic list so we can precisely control bullet placement with CSS ::before */}
                  <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, '& li': { mb: 1 } }}>
                    {loadingSuggestions ? (
                      [1,2,3,4].map((i) => (
                        <Box
                          component="li"
                          key={i}
                          sx={{
                            position: 'relative',
                            pl: '1.1em',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              left: 0,
                              // position bullet relative to the first line of text
                              top: '0.28em',
                              width: '0.55em',
                              height: '0.55em',
                              borderRadius: '50%',
                              bgcolor: 'primary.main'
                            }
                          }}
                        >
                          <Skeleton variant="text" width="85%" height={18} />
                        </Box>
                      ))
                    ) : improvementSuggestions && improvementSuggestions.length ? (
                      improvementSuggestions.map((t, i) => (
                        <Box
                          component="li"
                          key={i}
                          sx={{
                            position: 'relative',
                            pl: '1.15em',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              left: 0,
                              top: '0.28em',
                              width: '0.55em',
                              height: '0.55em',
                              borderRadius: '50%',
                              bgcolor: 'primary.main'
                            }
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">{t}</Typography>
                        </Box>
                      ))
                    ) : (
                      tips.map((t, i) => (
                        <Box
                          component="li"
                          key={i}
                          sx={{
                            position: 'relative',
                            pl: '1.15em',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              left: 0,
                              top: '0.28em',
                              width: '0.55em',
                              height: '0.55em',
                              borderRadius: '50%',
                              bgcolor: 'primary.main'
                            }
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">{t}</Typography>
                        </Box>
                      ))
                    )}
                  </Box>

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
                ? 'AI-matched reference poses based on similarity analysis of your keypoints. Note that the generated images are simply demo examples which help visualize the pose for you.'
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
                        <Box sx={recommendedPoseFrameSx}>
                          {pose.filename ? (
                            <img
                              src={`/data/images/${pose.filename}`}
                              alt="Reference pose"
                              style={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain',
                                display: 'block'
                              }}
                            />
                          ) : (
                            <Typography variant="caption" color="text.secondary">Reference</Typography>
                          )}
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={recommendedPoseFrameSx}>
                          {loadingEditedImages ? (
                            <Skeleton variant="rectangular" width="90%" height="90%" sx={{ borderRadius: 2 }} />
                          ) : editedImages && editedImages[pose.id - 1] ? (
                            <img
                              src={editedImages[pose.id - 1]}
                              alt="AI-edited pose"
                              style={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain',
                                display: 'block'
                              }}
                            />
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              {displayImageUrl ? 'Generating...' : 'Upload image first'}
                            </Typography>
                          )}
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
