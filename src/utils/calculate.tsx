import { Keypoint } from "../types/Keypoints";

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