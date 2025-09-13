import { Keypoints } from "../types/Keypoints";
import { MIN_CONFIDENCE, SKELETON_EDGES } from "./skeleton";

export const drawPoseOnCanvas = (
  ctx: CanvasRenderingContext2D,
  pose: Keypoints,
  scale: number
) => {
  // Draw skeleton first (behind keypoints)
  ctx.strokeStyle = "#00ff00"; // Bright green for visibility
  ctx.lineWidth = 1; // Reduced from 3
  SKELETON_EDGES.forEach(([i, j]) => {
    const kp1 = pose.keypoints[i];
    const kp2 = pose.keypoints[j];
    
    // Skip lines that connect to face keypoints (indices 0-10)
    const connectsToFace = i <= 10 || j <= 10;
    if (connectsToFace) {
      return; // Skip face connections
    }
    
    if (kp1 && kp2 && kp1.score > MIN_CONFIDENCE && kp2.score > MIN_CONFIDENCE) {
      ctx.beginPath();
      ctx.moveTo(kp1.x * scale, kp1.y * scale);
      ctx.lineTo(kp2.x * scale, kp2.y * scale);
      ctx.stroke();
    }
  });

  // Draw keypoints on top
  pose.keypoints.forEach((kp, index) => {
    if (kp && kp.score > MIN_CONFIDENCE) {
      // Skip all face keypoints (0-10) to reduce visual clutter
      // BlazePose face keypoints: 0-10 are face-related
      const isFaceKeypoint = index <= 10;
      
      if (isFaceKeypoint) {
        return; // Skip all face keypoints
      }
      
      ctx.beginPath();
      ctx.arc(kp.x * scale, kp.y * scale, 1.5, 0, Math.PI * 2);

      // Color code keypoints by confidence
      if (kp.score > 0.8) {
        ctx.fillStyle = "#ff0000"; // High confidence: red
      } else if (kp.score > 0.6) {
        ctx.fillStyle = "#ff8000"; // Medium confidence: orange
      } else {
        ctx.fillStyle = "#ffff00"; // Low confidence: yellow
      }
      
      ctx.fill();
      
      // Add white border for better visibility
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  });
};
