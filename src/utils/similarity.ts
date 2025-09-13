import { Keypoint } from "../types/Keypoints";
import { cosineSim } from "./calculate";
import { SKELETON_EDGES } from "./skeleton";

export const averageSkeletonSimilarity = (kps1: Keypoint[], kps2: Keypoint[]) => {
  let sum = 0;
  let count = 0;
  for (const [i, j] of SKELETON_EDGES) {
    const dx = cosineSim(
      kps1[i].x, kps1[i].y, kps1[j].x, kps1[j].y,
      kps2[i].x, kps2[i].y, kps2[j].x, kps2[j].y
    );
    sum += dx;
    count += 1;
  }
  return sum / Math.max(1, count);
};
