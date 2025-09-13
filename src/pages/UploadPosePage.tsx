import React from 'react';
import CustomPage from '../components/CustomPage';
import {
  Box,
  Button,
  Chip,
  Container,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  Paper,
  Stack,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  CircularProgress
} from '@mui/material';
import {
  CloudUpload,
  Image as ImageIcon,
  AutoAwesome,
  CheckCircle,
  Style as StyleIcon,
  ArrowBack
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { setNewAlert } from '../service/alert';
import { setUserPoseImage, setUserPoseKeypoints, setSimilarImageFilenames, setDesiredStyle, setPrioritizedAreas, setOutputMode, clearImprovementSuggestions, clearEditedImages } from '../store/slices/data';
import { estimateKeypointsWithBlazePose, convertImageToBase64 } from '../service/blazePose';
import { findSimilarPoses } from '../utils/poseComparison';

const genres = [
  'Portrait', 'Full Body', 'Editorial', 'Fitness', 'Street', 'Fashion', 'Studio'
];

const focusAreas = ['Posture', 'Symmetry', 'Angles', 'Hands', 'Expression'];

const UploadPosePage: React.FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const [file, setFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [selectedGenres, setSelectedGenres] = React.useState<string[]>(['Portrait']);
  const [selectedFocus, setSelectedFocus] = React.useState<string[]>(['Posture', 'Symmetry']);
  const [highQuality, setHighQuality] = React.useState<boolean>(true);
  const [mode, setMode] = React.useState<'Casual' | 'Formal'>('Casual');
  const [isAnalyzing, setIsAnalyzing] = React.useState<boolean>(false);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  // Cleanup object URL
  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Keep Redux in sync with selections so Results page can use them
  React.useEffect(() => {
    // Dispatch current selections whenever they change
    dispatch(setDesiredStyle(selectedGenres));
    dispatch(setPrioritizedAreas(selectedFocus));
    dispatch(setOutputMode(mode));
  }, [dispatch, selectedGenres, selectedFocus, mode]);

  const handlePickClick = () => inputRef.current?.click();

  const handleFiles = (files: FileList | null) => {
    const f = files?.[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      setNewAlert(dispatch, { msg: 'Please select an image file', alertType: 'warning' });
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  const onAnalyze = async () => {
    if (!file) {
      setNewAlert(dispatch, { msg: 'Please upload an image first', alertType: 'warning' });
      return;
    }

    setIsAnalyzing(true);

    try {
      // Clear any existing improvement suggestions before starting new analysis
      dispatch(clearImprovementSuggestions());
      
      // Clear any existing edited images to ensure fresh generation
      dispatch(clearEditedImages());

      // Convert image to base64
      const base64Image = await convertImageToBase64(file);

      // Create an image element for pose detection
      const img = new Image();
      img.src = previewUrl!;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // Run pose detection with BlazePose
      const keypoints = await estimateKeypointsWithBlazePose(img);

      // Save keypoints to Redux store
      dispatch(setUserPoseImage(base64Image));
      dispatch(setUserPoseKeypoints(keypoints));

      // Load keypoints dataset and find similar poses
      try {
        const response = await fetch('/data/keypoints.json');
        if (!response.ok) {
          throw new Error('Failed to load keypoints dataset');
        }
        const keypointsDataset = await response.json();

        // Find top 2 similar poses
        const similarFilenames = findSimilarPoses(keypoints.keypoints, keypointsDataset, 2);
        dispatch(setSimilarImageFilenames(similarFilenames));

        console.log('Found similar poses:', similarFilenames);
      } catch (datasetError) {
        console.warn('Could not load pose comparison dataset:', datasetError);
        // Continue without similar poses - this is not a critical failure
      }

      setNewAlert(dispatch, { msg: 'Pose analysis completed successfully!', alertType: 'success' });

      // Navigate to results page
      history.push('/results', { userImageUrl: previewUrl, fileName: file?.name });

    } catch (error) {
      console.error('Error during pose analysis:', error);
      setNewAlert(dispatch, { msg: 'Failed to analyze pose. Please try again.', alertType: 'error' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <CustomPage useBindingContainer={false}>
      <Box
        sx={{
          py: { xs: 3, sm: 5 },
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          // animation: 'slideOut 0.5s ease-in-out'
        }}
      >
        <style>
          {`
            @keyframes slideIn {
              0% {
                opacity: 0;
                transform: translateX(100%);
              }
              100% {
                opacity: 1;
                transform: translateX(0);
              }
            }

            @keyframes slideOut {
              0% {
                opacity: 1;
                transform: translateX(0);
              }
              100% {
                opacity: 0;
                transform: translateX(-100%);
              }
            }
          `}
        </style>
        <Container maxWidth="lg" sx={{ position: 'relative' }} >
          <Grid container spacing={2} alignItems="center" justifyContent="space-between">
            {/* Uploader Card */}
            <Grid direction={{ xs: 'column' }} item xs={12} md={6} alignItems={{ xs: 'flex-start' }}>
              <Stack direction={{ xs: 'column' }} spacing={2} alignItems={{ xs: 'flex-start'}} justifyContent="space-between" sx={{ mb: 2 }}>
                <Stack direction="row" spacing={1}>
                  <Button startIcon={<ArrowBack />} variant="text" onClick={() => history.push('/')}>Back</Button>
                </Stack>
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
                    Upload your photo
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                    <Chip label="Choose an image" variant="outlined" size="small" />
                    <Chip label="Mode: Auto" color="primary" variant="outlined" size="small" />
                  </Stack>
                </Stack>
              </Stack>
              <Box sx={{ p: 0.75, borderRadius: 3, background: 'primary.dark' }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2, sm: 3 },
                    borderRadius: 2.5,
                    background: 'linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(252,248,255,0.9) 100%)',
                    border: '1px solid rgba(106, 17, 203, 0.18)'
                  }}
                >
                  <Stack spacing={2}>
                    {/* Dropzone */}
                    <Box
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={onDrop}
                      onClick={handlePickClick}
                      sx={{
                        cursor: 'pointer',
                        border: '2px dashed rgba(106, 17, 203, 0.35)',
                        borderRadius: 2,
                        p: { xs: 3, sm: 4 },
                        textAlign: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: 220,
                        background: 'linear-gradient(180deg, rgba(106,17,203,0.06), rgba(229,57,53,0.06))',
                        '&:hover': { background: 'rgba(106,17,203,0.06)' }
                      }}
                    >
                      <Stack spacing={1.5} alignItems="center">
                        <IconButton
                          sx={{
                            background: 'linear-gradient(135deg, #6A11CB 0%, #E53935 100%)',
                            color: 'white',
                            width: 64,
                            height: 64,
                            '&:hover': { background: 'linear-gradient(135deg, #4C0FA3 0%, #B71C1C 100%)' },
                            boxShadow: '0 10px 30px rgba(106,17,203,0.35)'
                          }}
                        >
                          <CloudUpload />
                        </IconButton>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          Drag & drop image here, or click to browse
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          JPG, PNG up to 10MB
                        </Typography>
                      </Stack>
                      <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) => handleFiles(e.target.files)}
                      />
                    </Box>

                    {/* Preview */}
                    {previewUrl && (
                      <Box>
                        <Divider sx={{ my: 1.5 }} />
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
                          <Box
                            sx={{
                              flex: '0 0 auto',
                              width: { xs: '100%', sm: 220 },
                              height: { xs: 220, sm: 180 },
                              borderRadius: 2,
                              overflow: 'hidden',
                              border: '1px solid rgba(106, 17, 203, 0.25)',
                              background: 'rgba(106,17,203,0.04)'
                            }}
                          >
                            <img src={previewUrl} alt={file?.name || 'preview'} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                          </Box>
                          <Stack spacing={1} sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                              <ImageIcon color="primary" /> {file?.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {(file && `${Math.round(file.size / 1024)} KB`) || ''}
                            </Typography>
                            <Stack direction="row" spacing={1}>
                              <Chip size="small" color="success" icon={<CheckCircle />} label="Ready for analysis" />
                            </Stack>
                          </Stack>
                        </Stack>
                      </Box>
                    )}

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="flex-end">
                      <Button variant="outlined" onClick={() => { setFile(null); setPreviewUrl(null); if (inputRef.current) inputRef.current.value = ""; }} disabled={!file}>
                        Clear
                      </Button>
                      <Button
                        variant="contained"
                        endIcon={<AutoAwesome />}
                        onClick={onAnalyze}
                        disabled={!file}
                        sx={{ px: 3 }}
                      >
                        Analyze
                      </Button>
                    </Stack>
                  </Stack>
                </Paper>
              </Box>
            </Grid>

            {/* Right Side */}
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 0.75, borderRadius: 3, background: 'secondary.dark' }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2, sm: 3 },
                    borderRadius: 2.5,
                    background: 'linear-gradient(145deg, rgba(255,255,255,0.92) 0%, rgba(255,248,248,0.92) 100%)',
                    border: '1px solid rgba(229, 57, 53, 0.18)'
                  }}
                >
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <StyleIcon color="primary" />
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Style & Focus
                      </Typography>
                    </Stack>

                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                        Mode
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
                        {['Casual', 'Formal'].map((m) => (
                          <Chip
                            key={m}
                            label={m}
                            color={mode === m ? 'primary' : 'default'}
                            variant={mode === m ? 'filled' : 'outlined'}
                            onClick={() => {
                              setMode(m as 'Casual' | 'Formal');
                              // mirror selection to Redux
                              dispatch(setOutputMode(m));
                            }}
                          />
                        ))}
                      </Stack>
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                        Desired Style
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {genres.map((g) => {
                          const selected = selectedGenres.includes(g);
                          return (
                            <Chip
                              key={g}
                              label={g}
                              color={selected ? 'primary' : 'default'}
                              variant={selected ? 'filled' : 'outlined'}
                              onClick={() => {
                                setSelectedGenres((prev) => {
                                  const next = prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g];
                                  dispatch(setDesiredStyle(next));
                                  return next;
                                });
                              }}
                              sx={{ mb: 1 }}
                            />
                          );
                        })}
                      </Stack>
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                        What to prioritize
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {focusAreas.map((f) => {
                          const selected = selectedFocus.includes(f);
                          return (
                            <Chip
                              key={f}
                              label={f}
                              color={selected ? 'secondary' : 'default'}
                              variant={selected ? 'filled' : 'outlined'}
                              onClick={() => {
                                setSelectedFocus((prev) => {
                                  const next = prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f];
                                  dispatch(setPrioritizedAreas(next));
                                  return next;
                                });
                              }}
                              sx={{ mb: 1 }}
                            />
                          );
                        })}
                      </Stack>
                    </Box>

                    <Divider />

                    <FormControlLabel
                      control={<Switch checked={highQuality} onChange={(e) => setHighQuality(e.target.checked)} />}
                      label="High-quality analysis"
                    />

                    <Typography variant="caption" color="text.secondary">
                      Your image is processed on-device. We do not upload images to servers.
                    </Typography>
                  </Stack>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </CustomPage>
  );
};

export default UploadPosePage;
