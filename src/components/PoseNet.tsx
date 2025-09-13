import React, { useRef, useState } from "react";
import * as posenet from "@tensorflow-models/posenet";
import "@tensorflow/tfjs";

import { Keypoints, Keypoint } from "../types/Keypoints";
import { cosineSim } from '../utils/calculate';

const PoseNet: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [mostSimilarImage, setMostSimilarImage] = useState<string | null>(null);

  const skeleton: [number, number][] = [
    [0, 3], [0, 4], [0, 5], [0, 6], // head
    [5, 6], [6, 12], [12, 11], [11, 5], // body
    [6, 8], [8, 10], [5, 7], [7, 9], // arms
    [12, 14], [14, 16], [11, 13], [13, 15] // legs
  ];

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => setImage(img);
    }
  };

  // Convert posenet pose to your Keypoints type
  const mapPoseNetToKeypoints = (pose: posenet.Pose): Keypoints => {
    const keypoints: Keypoint[] = pose.keypoints.map((kp) => ({
      x: kp.position.x,
      y: kp.position.y,
      score: kp.score,
      name: kp.part
    }));
    return { keypoints, keypoints3D: [] }; // keep keypoints3D empty for now
  };

  const calculateDistance = (kps1: Keypoint[], kps2: Keypoint[]) => {
    let sum = 0;
    let count = 0;

    skeleton.forEach(([i, j], idx) => {
      const dx = cosineSim(
        kps1[i].x, kps1[i].y, kps1[j].x, kps1[j].y,
        kps2[i].x, kps2[i].y, kps2[j].x, kps2[j].y
      );
      sum += dx;
      count++;
    });

    return sum / count; 
  };

  const findMostSimilarImage = async (uploadedPose: Keypoints) => {
    // Load precomputed poses from JSON
    const response = await fetch("../../assets/data/poses.json");
    const poseData = await response.json();
  
    let minDistance = Infinity;
    let closestImage: string | null = null;
  
    for (const entry of poseData) {
      const pose: Keypoints = entry.pose;
  
      const distance = calculateDistance(uploadedPose.keypoints, pose.keypoints);
      if (distance < minDistance) {
        minDistance = distance;
        closestImage = entry.image;
      }
    }
  
    setMostSimilarImage(closestImage);
  }; 

  const runPoseNet = async () => {
    if (!image || !canvasRef.current) return;

    const net = await posenet.load({
      architecture: "MobileNetV1",
      outputStride: 16,
      inputResolution: { width: 257, height: 257 },
      multiplier: 0.75,
    });

    const poseNetPose = await net.estimateSinglePose(image, { flipHorizontal: false });
    const pose: Keypoints = mapPoseNetToKeypoints(poseNetPose);

    const canvas = canvasRef.current;
    const MAX_WIDTH = 500;
    const MAX_HEIGHT = 500;
    const scale = Math.min(MAX_WIDTH / image.naturalWidth, MAX_HEIGHT / image.naturalHeight);
    const scaledWidth = image.naturalWidth * scale;
    const scaledHeight = image.naturalHeight * scale;

    canvas.width = scaledWidth;
    canvas.height = scaledHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, scaledWidth, scaledHeight);

    // Draw keypoints
    pose.keypoints.forEach((kp) => {
      if (kp.score > 0.5) {
        ctx.beginPath();
        ctx.arc(kp.x * scale, kp.y * scale, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "red";
        ctx.fill();
      }
    });

    // Draw skeleton
    ctx.strokeStyle = "lime";
    ctx.lineWidth = 2;
    skeleton.forEach(([i, j]) => {
      const kp1 = pose.keypoints[i];
      const kp2 = pose.keypoints[j];
      if (kp1.score > 0.5 && kp2.score > 0.5) {
        ctx.beginPath();
        ctx.moveTo(kp1.x * scale, kp1.y * scale);
        ctx.lineTo(kp2.x * scale, kp2.y * scale);
        ctx.stroke();
      }
    });

    await findMostSimilarImage(pose);
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      <button onClick={runPoseNet} disabled={!image}>
        Detect Pose
      </button>
      <canvas ref={canvasRef} style={{ border: "1px solid black" }} />
      {mostSimilarImage && (
        <div>
          <h3>Most Similar Image:</h3>
          <img src={mostSimilarImage} alt="Most Similar" style={{ maxWidth: "100%" }} />
        </div>
      )}
    </div>
  );
};

export default PoseNet;
