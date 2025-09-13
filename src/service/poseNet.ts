import * as posenet from "@tensorflow-models/posenet";
import "@tensorflow/tfjs"; // ensure TensorFlow backend is registered in browser

import { Keypoints, Keypoint } from "../types/Keypoints";
import { averageSkeletonSimilarity } from "../utils/calculate";

let keypointsData: any = null;

let model: posenet.PoseNet | null = null;

const mapPoseNetToKeypoints = (pose: posenet.Pose): Keypoints => {
  const keypoints: Keypoint[] = pose.keypoints.map((kp) => ({
    x: kp.position.x,
    y: kp.position.y,
    score: kp.score,
    name: kp.part,
  }));
  return { keypoints, keypoints3D: [] };
};

export const loadPoseNet = async () => {
  if (model) return model;
  model = await posenet.load({
    architecture: "MobileNetV1",
    outputStride: 16,
    inputResolution: { width: 257, height: 257 },
    multiplier: 0.75,
  });
  return model;
};

export const estimateKeypointsFromImage = async (
  image: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
): Promise<Keypoints> => {
  const net = await loadPoseNet();
  const poseNetPose = await net.estimateSinglePose(image, { flipHorizontal: false });
  return mapPoseNetToKeypoints(poseNetPose);
};

type DatasetEntry = { image: string; pose: Keypoints };

const parseKeypointsDataset = (data: any): DatasetEntry[] => {
  // Accept either an array of { image, pose } or an object map { [image]: pose }
  if (Array.isArray(data)) {
    // Try to coerce array items
    return data
      .map((entry: any) => {
        if (entry && typeof entry === "object") {
          if (entry.image && entry.pose) return entry as DatasetEntry;
          // Known schema: { filename, keypoints }
          if (entry.filename && entry.keypoints) {
            const url = new URL(`../../assets/images/${entry.filename}` , import.meta.url).toString();
            return { image: url, pose: entry.keypoints } as DatasetEntry;
          }
          // If entry has a single key mapping
          const keys = Object.keys(entry);
          if (keys.length === 1) {
            const k = keys[0];
            return { image: k, pose: entry[k] } as DatasetEntry;
          }
        }
        return null;
      })
      .filter(Boolean) as DatasetEntry[];
  }

  if (data && typeof data === "object") {
    return Object.entries(data).map(([image, pose]) => ({ image, pose: pose as Keypoints }));
  }

  return [];
};

export const findMostSimilarImage = async (uploadedPose: Keypoints): Promise<string | null> => {
  // Load keypoints data if not already loaded
  if (!keypointsData) {
    try {
      const response = await fetch('/data/keypoints.json');
      keypointsData = await response.json();
    } catch (error) {
      console.error('Failed to load keypoints data:', error);
      return null;
    }
  }

  const dataset = parseKeypointsDataset(keypointsData as any);

  let best: { image: string; score: number } | null = null;
  for (const entry of dataset) {
    const score = averageSkeletonSimilarity(uploadedPose.keypoints, entry.pose.keypoints);
    if (!best || score < best.score) {
      best = { image: entry.image, score };
    }
  }
  return best?.image ?? null;
};
