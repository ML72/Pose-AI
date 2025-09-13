import { Keypoint } from "../types/Keypoints";
import { SKELETON_EDGES } from "./skeleton";

export const cosineSim = (
    x1: number, y1: number, x2: number, y2: number,
    x3: number, y3: number, x4: number, y4: number
) => {
    const dx1 = x2 - x1;
    const dy1 = y2 - y1;
    const dx2 = x4 - x3;
    const dy2 = y4 - y3;
    return (dx1 * dx2 + dy1 * dy2)
        / (Math.sqrt(dx1 ** 2 + dy1 ** 2) * Math.sqrt(dx2 ** 2 + dy2 ** 2));
}

// Normalizes keypoints so that max x/y is 1 and min x/y is 0
export const normalizeKeypoints = (keypoints: Keypoint[]) => {
    const xVals = keypoints.map(kp => kp.x);
    const yVals = keypoints.map(kp => kp.y);
    const maxX = Math.max(...xVals);
    const maxY = Math.max(...yVals);
    const minX = Math.min(...xVals);
    const minY = Math.min(...yVals);
    return keypoints.map(kp => {
        return {
            x: (kp.x - minX) / (maxX - minX),
            y: (kp.y - minY) / (maxY - minY),
            score: kp.score,
            name: kp.name
        }
    });
}

// Average cosine similarity across skeleton edges (lower can mean less similar if using as distance)
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
}