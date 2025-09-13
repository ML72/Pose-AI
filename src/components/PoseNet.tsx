import React, { useRef, useState } from "react";
import { Keypoints } from "../types/Keypoints";
import { estimateKeypointsFromImage, findMostSimilarImage } from "../service/poseNet";
import { drawPoseOnCanvas } from "../utils/draw";

const PoseNet: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [mostSimilarImage, setMostSimilarImage] = useState<string | null>(null);

  

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => setImage(img);
    }
  };

  const findAndSetMostSimilar = async (uploadedPose: Keypoints) => {
    const img = await findMostSimilarImage(uploadedPose);
    setMostSimilarImage(img);
  };

  const runPoseNet = async () => {
    if (!image || !canvasRef.current) return;

  const pose: Keypoints = await estimateKeypointsFromImage(image);

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

  drawPoseOnCanvas(ctx, pose, scale);

  await findAndSetMostSimilar(pose);
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
