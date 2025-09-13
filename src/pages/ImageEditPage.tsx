import React, { useState, useRef } from 'react';
import {
  Button,
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Stack,
  CircularProgress,
  Alert,
  Paper,
  IconButton
} from '@mui/material';
import {
  CloudUpload,
  AutoAwesome,
  Download,
  Refresh,
  Image as ImageIcon
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';

import CustomPage from '../components/CustomPage';
import { setNewAlert } from '../service/alert';
import { editImages, base64ToBlob, ImageEditRequest } from '../service/imageEdit';

const ImageEditPage: React.FC = () => {
  const dispatch = useDispatch();
  const fileInput1Ref = useRef<HTMLInputElement>(null);
  const fileInput2Ref = useRef<HTMLInputElement>(null);
  
  const [image1, setImage1] = useState<File | null>(null);
  const [image2, setImage2] = useState<File | null>(null);
  const [image1Preview, setImage1Preview] = useState<string>('');
  const [image2Preview, setImage2Preview] = useState<string>('');
  const [resultImageUrl, setResultImageUrl] = useState<string>('');
  const [resultImageB64, setResultImageB64] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');

  // Handle file selection
  const handleFileSelect = (file: File, imageNumber: 1 | 2) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setNewAlert(dispatch, { 
        msg: 'Please select a valid image file (PNG, JPEG, JPG, or WebP)', 
        alertType: 'error' 
      });
      return;
    }

    // Validate file size (4MB limit)
    const maxSize = 4 * 1024 * 1024;
    if (file.size > maxSize) {
      setNewAlert(dispatch, { 
        msg: 'Image must be smaller than 4MB', 
        alertType: 'error' 
      });
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    
    if (imageNumber === 1) {
      setImage1(file);
      setImage1Preview(previewUrl);
    } else {
      setImage2(file);
      setImage2Preview(previewUrl);
    }

    // Clear any previous errors
    setError('');
  };

  // Handle drag and drop
  const handleDrop = (e: React.DragEvent, imageNumber: 1 | 2) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0], imageNumber);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Process images with OpenAI
  const handleProcessImages = async () => {
    if (!image1 || !image2) {
      setNewAlert(dispatch, { 
        msg: 'Please select both images before processing', 
        alertType: 'error' 
      });
      return;
    }

    setIsProcessing(true);
    setError('');
    setResultImageUrl('');
    setResultImageB64('');

    try {
      const request: ImageEditRequest = { image1, image2 };
      const result = await editImages(request);

      if (result.success && result.imageB64) {
        // Convert base64 to data URL for display
        const dataUrl = `data:image/png;base64,${result.imageB64}`;
        setResultImageUrl(dataUrl);
        setResultImageB64(result.imageB64);
        setNewAlert(dispatch, { 
          msg: 'Images processed successfully!', 
          alertType: 'success' 
        });
      } else {
        setError(result.error || 'Failed to process images');
        setNewAlert(dispatch, { 
          msg: result.error || 'Failed to process images', 
          alertType: 'error' 
        });
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'An unexpected error occurred';
      setError(errorMessage);
      setNewAlert(dispatch, { 
        msg: errorMessage, 
        alertType: 'error' 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Download result image
  const handleDownload = () => {
    if (!resultImageB64) return;

    try {
      const blob = base64ToBlob(resultImageB64, 'image/png');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `edited-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setNewAlert(dispatch, { 
        msg: 'Image downloaded successfully!', 
        alertType: 'success' 
      });
    } catch (err) {
      setNewAlert(dispatch, { 
        msg: 'Failed to download image', 
        alertType: 'error' 
      });
    }
  };

  // Reset all inputs
  const handleReset = () => {
    setImage1(null);
    setImage2(null);
    setImage1Preview('');
    setImage2Preview('');
    setResultImageUrl('');
    setResultImageB64('');
    setError('');
    if (fileInput1Ref.current) fileInput1Ref.current.value = '';
    if (fileInput2Ref.current) fileInput2Ref.current.value = '';
  };

  return (
    <CustomPage>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box textAlign="center" mb={4}>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 700,
              mb: 2,
              background: 'linear-gradient(135deg, #6A11CB 0%, #E53935 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            AI Image Editor
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto' }}>
            Upload two images and let our AI create a beautiful artistic composition
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Image Upload Section */}
        <Grid container spacing={3} mb={4}>
          {/* Image 1 Upload */}
          <Grid item xs={12} md={6}>
            <Card 
              elevation={3}
              sx={{ 
                height: '300px',
                border: '2px dashed',
                borderColor: image1 ? 'primary.main' : 'grey.300',
                transition: 'all 0.3s ease',
                '&:hover': { borderColor: 'primary.main' }
              }}
            >
              <CardContent
                sx={{ 
                  height: '100%',
                  p: 0,
                  '&:last-child': { pb: 0 }
                }}
              >
                <Box
                  onDrop={(e) => handleDrop(e, 1)}
                  onDragOver={handleDragOver}
                  onClick={() => fileInput1Ref.current?.click()}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    p: 2,
                    position: 'relative'
                  }}
                >
                  {image1Preview ? (
                    <img
                      src={image1Preview}
                      alt="Image 1"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                        borderRadius: '8px'
                      }}
                    />
                  ) : (
                    <Stack alignItems="center" spacing={2}>
                      <CloudUpload sx={{ fontSize: 48, color: 'primary.main' }} />
                      <Typography variant="h6">Upload Image 1</Typography>
                      <Typography variant="body2" color="text.secondary" textAlign="center">
                        Drag & drop or click to select
                      </Typography>
                    </Stack>
                  )}
                </Box>
                <input
                  ref={fileInput1Ref}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file, 1);
                  }}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Image 2 Upload */}
          <Grid item xs={12} md={6}>
            <Card 
              elevation={3}
              sx={{ 
                height: '300px',
                border: '2px dashed',
                borderColor: image2 ? 'primary.main' : 'grey.300',
                transition: 'all 0.3s ease',
                '&:hover': { borderColor: 'primary.main' }
              }}
            >
              <CardContent
                sx={{ 
                  height: '100%',
                  p: 0,
                  '&:last-child': { pb: 0 }
                }}
              >
                <Box
                  onDrop={(e) => handleDrop(e, 2)}
                  onDragOver={handleDragOver}
                  onClick={() => fileInput2Ref.current?.click()}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    p: 2,
                    position: 'relative'
                  }}
                >
                  {image2Preview ? (
                    <img
                      src={image2Preview}
                      alt="Image 2"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                        borderRadius: '8px'
                      }}
                    />
                  ) : (
                    <Stack alignItems="center" spacing={2}>
                      <CloudUpload sx={{ fontSize: 48, color: 'primary.main' }} />
                      <Typography variant="h6">Upload Image 2</Typography>
                      <Typography variant="body2" color="text.secondary" textAlign="center">
                        Drag & drop or click to select
                      </Typography>
                    </Stack>
                  )}
                </Box>
                <input
                  ref={fileInput2Ref}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file, 2);
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box textAlign="center" mb={4}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              startIcon={isProcessing ? <CircularProgress size={20} color="inherit" /> : <AutoAwesome />}
              onClick={handleProcessImages}
              disabled={!image1 || !image2 || isProcessing}
              sx={{
                py: 1.5,
                px: 4,
                background: 'linear-gradient(135deg, #6A11CB 0%, #E53935 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4C0FA3 0%, #B71C1C 100%)',
                }
              }}
            >
              {isProcessing ? 'Processing...' : 'Generate Art'}
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<Refresh />}
              onClick={handleReset}
              disabled={isProcessing}
            >
              Reset
            </Button>
          </Stack>
        </Box>

        {/* Result Section */}
        {resultImageUrl && (
          <Paper elevation={6} sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
              Generated Artwork
            </Typography>
            <Box sx={{ mb: 3 }}>
              <img
                src={resultImageUrl}
                alt="Generated artwork"
                style={{
                  maxWidth: '100%',
                  maxHeight: '400px',
                  objectFit: 'contain',
                  borderRadius: '8px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                }}
              />
            </Box>
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={handleDownload}
              sx={{
                background: 'linear-gradient(135deg, #6A11CB 0%, #E53935 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4C0FA3 0%, #B71C1C 100%)',
                }
              }}
            >
              Download Image
            </Button>
          </Paper>
        )}
      </Container>
    </CustomPage>
  );
};

export default ImageEditPage;
