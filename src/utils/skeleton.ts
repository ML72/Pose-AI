// PoseNet keypoints are indexed in the order provided by the model
// Edges representing a simple skeleton for similarity/drawing
export const SKELETON_EDGES: [number, number][] = [
  [0, 3], [0, 4], [0, 5], [0, 6], // head
  [5, 6], [6, 12], [12, 11], [11, 5], // body
  [6, 8], [8, 10], [5, 7], [7, 9], // arms
  [12, 14], [14, 16], [11, 13], [13, 15], // legs
];

export const MIN_CONFIDENCE = 0.5;
