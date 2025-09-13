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
  Typography
} from '@mui/material';
import {
  CloudUpload,
  Image as ImageIcon,
  AutoAwesome,
  CheckCircle,
  Style as StyleIcon
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { setNewAlert } from '../service/alert';

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
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  // Cleanup object URL
  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

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

  const onAnalyze = () => {
    if (!file) {
      setNewAlert(dispatch, { msg: 'Please upload an image first', alertType: 'warning' });
      return;
    }
    // Basic stub logic – wire up later to actual analysis
    setNewAlert(dispatch, { msg: 'Image queued for analysis…', alertType: 'success' });
    try {
  history.push('/results', { userImageUrl: previewUrl, fileName: file?.name });
    } catch {}
  };

  return (
    <CustomPage useBindingContainer={false}>
      {/* Hero-ish banner matching Landing vibe */}
      <Box
        sx={{
          py: { xs: 3, sm: 5 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Removed grid and gradient overlays for plain white background */}
        <Container maxWidth="lg" sx={{ position: 'relative' }}>
          <Stack spacing={1} alignItems="flex-start" sx={{ mb: 2 }}>
            <Typography
              variant="h3"
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
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 720 }}>
              Add an image to analyze and choose your preferred style so we can tailor pose suggestions.
            </Typography>
          </Stack>

          <Grid container spacing={4} alignItems="stretch">
            {/* Uploader Card */}
            <Grid item xs={12} md={7}>
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

            {/* Options Card */}
            <Grid item xs={12} md={5}>
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

                    {/* Mode Option - moved below header */}
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
                            onClick={() => setMode(m as 'Casual' | 'Formal')}
                          />
                        ))}
                      </Stack>
                    </Box>

                    {/* Genres */}
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
                              onClick={() =>
                                setSelectedGenres((prev) =>
                                  prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
                                )
                              }
                              sx={{ mb: 1 }}
                            />
                          );
                        })}
                      </Stack>
                    </Box>

                    {/* Focus Areas */}
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
                              onClick={() =>
                                setSelectedFocus((prev) =>
                                  prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
                                )
                              }
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
