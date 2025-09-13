import { Keypoints } from "../types/Keypoints";
import { MIN_CONFIDENCE, SKELETON_EDGES } from "./skeleton";

export const drawPoseOnCanvas = (
  ctx: CanvasRenderingContext2D,
  pose: Keypoints,
  scale: number
) => {
  // Draw keypoints
  pose.keypoints.forEach((kp) => {
    if (kp.score > MIN_CONFIDENCE) {
      ctx.beginPath();
      ctx.arc(kp.x * scale, kp.y * scale, 5, 0, Math.PI * 2);
      ctx.fillStyle = "red";
      ctx.fill();
    }
  });

  // Draw skeleton
  ctx.strokeStyle = "lime";
  ctx.lineWidth = 2;
  SKELETON_EDGES.forEach(([i, j]) => {
    const kp1 = pose.keypoints[i];
    const kp2 = pose.keypoints[j];
    if (kp1.score > MIN_CONFIDENCE && kp2.score > MIN_CONFIDENCE) {
      ctx.beginPath();
      ctx.moveTo(kp1.x * scale, kp1.y * scale);
      ctx.lineTo(kp2.x * scale, kp2.y * scale);
      ctx.stroke();
    }
  });
};
