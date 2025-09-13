import React, { useRef, useEffect } from 'react';
import { Box } from '@mui/material';
import { Keypoints } from '../types/Keypoints';
import { drawPoseOnCanvas } from '../utils/draw';

interface KeypointVisualizationProps {
  imageUrl: string;
  keypoints: Keypoints | null;
  maxWidth?: number;
  maxHeight?: number;
}

const KeypointVisualization: React.FC<KeypointVisualizationProps> = ({
  imageUrl,
  keypoints,
  maxWidth = 500,
  maxHeight = 500
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !keypoints || !imageUrl) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      // Calculate scaling to fit within max dimensions while preserving aspect ratio
      const imgWidth = img.naturalWidth;
      const imgHeight = img.naturalHeight;
      const scale = Math.min(maxWidth / imgWidth, maxHeight / imgHeight, 1);
      
      const displayWidth = imgWidth * scale;
      const displayHeight = imgHeight * scale;
      
      // Set canvas dimensions
      canvas.width = displayWidth;
      canvas.height = displayHeight;
      canvas.style.width = `${displayWidth}px`;
      canvas.style.height = `${displayHeight}px`;
      
      // Clear canvas
      ctx.clearRect(0, 0, displayWidth, displayHeight);
      
      // Draw image
      ctx.drawImage(img, 0, 0, displayWidth, displayHeight);
      
      // Draw keypoints and skeleton
      drawPoseOnCanvas(ctx, keypoints, scale);
    };

    img.onerror = () => {
      console.error('Failed to load image for keypoint visualization');
    };
    
    img.src = imageUrl;
  }, [imageUrl, keypoints, maxWidth, maxHeight]);

  if (!keypoints || !imageUrl) {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'text.secondary',
          border: '1px dashed',
          borderColor: 'divider',
          borderRadius: 1
        }}
      >
        No pose data available
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%'
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      />
    </Box>
  );
};

export default KeypointVisualization;