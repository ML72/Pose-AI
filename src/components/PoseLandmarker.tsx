import React, { useCallback, useRef, useState } from 'react';
import { Keypoint, Keypoints } from '../types/Keypoints';

// MediaPipe Tasks Vision imports (loaded via ESM)
// We intentionally import types at runtime to avoid SSR issues; paths resolved by bundler.
import {
  FilesetResolver,
  PoseLandmarker,
  PoseLandmarkerResult
} from '@mediapipe/tasks-vision';

type MediaPipePoseLandmarker = PoseLandmarker;

// 33-landmark skeleton pairs using BlazePose indices
// Ref: https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker
const BLAZEPOSE_EDGES: Array<[number, number]> = [
  [0,1],[1,2],[2,3],[3,7], // face: nose→eyes→ears
  [0,4],[4,5],[5,6],[6,8],
  [9,10], // shoulders
  [11,12], // shoulders
  [11,13],[13,15], // left arm
  [12,14],[14,16], // right arm
  [11,23],[12,24], // torso
  [23,24],
  [23,25],[25,27], // left leg
  [24,26],[26,28], // right leg
  [27,29],[29,31], // left foot
  [28,30],[30,32], // right foot
];

const PoseLandmarkerComponent: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [poseLandmarker, setPoseLandmarker] = useState<MediaPipePoseLandmarker | null>(null);
  const [resultPose, setResultPose] = useState<Keypoints | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => setImage(img);
  };

  const ensureLandmarker = useCallback(async () => {
    if (poseLandmarker) return poseLandmarker;
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    );
    const landmarker = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        // Use the full model; consider heavy for max accuracy if performance is acceptable
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task'
      },
      runningMode: 'IMAGE',
      numPoses: 1,
      minPoseDetectionConfidence: 0.5,
      minPosePresenceConfidence: 0.5,
      minTrackingConfidence: 0.5
    });
    setPoseLandmarker(landmarker);
    return landmarker;
  }, [poseLandmarker]);

  const mapMediaPipeToKeypoints = (
    mpResult: PoseLandmarkerResult,
    imgWidth: number,
    imgHeight: number
  ): Keypoints | null => {
    if (!mpResult.landmarks || mpResult.landmarks.length === 0) return null;
    const lm = mpResult.landmarks[0]; // 2D normalized landmarks
    const world = mpResult.worldLandmarks?.[0]; // 3D world landmarks in meters (x,y,z)

    const keypoints2d: Keypoint[] = lm.map((p, idx) => ({
      x: p.x * imgWidth,
      y: p.y * imgHeight,
      score: typeof p.visibility === 'number' ? p.visibility : 1.0,
      name: String(idx)
    }));

    const keypoints3d: Keypoint[] = (world || []).map((p, idx) => ({
      x: p.x,
      y: p.y,
      score: 1.0,
      name: String(idx)
    }));

    return { keypoints: keypoints2d, keypoints3D: keypoints3d };
  };

  const drawPose = (pose: Keypoints, scale: number, canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx || !image) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // Draw keypoints
    ctx.fillStyle = 'rgba(255, 0, 0, 0.9)';
    pose.keypoints.forEach((kp) => {
      if (kp.score > 0.3) {
        ctx.beginPath();
        ctx.arc(kp.x * scale, kp.y * scale, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Draw skeleton
    ctx.strokeStyle = 'lime';
    ctx.lineWidth = 2;
    BLAZEPOSE_EDGES.forEach(([i, j]) => {
      const a = pose.keypoints[i];
      const b = pose.keypoints[j];
      if (a && b && a.score > 0.3 && b.score > 0.3) {
        ctx.beginPath();
        ctx.moveTo(a.x * scale, a.y * scale);
        ctx.lineTo(b.x * scale, b.y * scale);
        ctx.stroke();
      }
    });
  };

  const runPose = async () => {
    if (!image || !canvasRef.current) return;
    const landmarker = await ensureLandmarker();

    // Prepare canvas size similar to PoseNet component
    const canvas = canvasRef.current;
    const MAX_WIDTH = 500;
    const MAX_HEIGHT = 500;
    const scale = Math.min(
      MAX_WIDTH / image.naturalWidth,
      MAX_HEIGHT / image.naturalHeight
    );
    const scaledWidth = image.naturalWidth * scale;
    const scaledHeight = image.naturalHeight * scale;
    canvas.width = scaledWidth;
    canvas.height = scaledHeight;

    const mpResult = landmarker.detect(image);
    const pose = mapMediaPipeToKeypoints(mpResult, image.naturalWidth, image.naturalHeight);
    if (!pose) return;
    setResultPose(pose);
    drawPose(pose, scale, canvas);
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      <button onClick={runPose} disabled={!image}>Detect Pose (MediaPipe 33)</button>
      <canvas ref={canvasRef} style={{ border: '1px solid black' }} />
      {resultPose && (
        <div style={{ marginTop: 8 }}>
          <small>Detected {resultPose.keypoints.length} landmarks</small>
        </div>
      )}
    </div>
  );
};

export default PoseLandmarkerComponent;

