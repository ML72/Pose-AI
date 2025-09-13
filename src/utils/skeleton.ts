// BlazePose keypoints (33 total) - MediaPipe Pose Landmarker format
// See: https://developers.google.com/mediapipe/solutions/vision/pose_landmarker
export const BLAZEPOSE_SKELETON_EDGES: [number, number][] = [
  // Face connections
  [0, 1], [1, 2], [2, 3], [3, 7], [0, 4], [4, 5], [5, 6], [6, 8],
  // Body connections  
  [9, 10], // mouth
  [11, 12], // shoulders
  [11, 23], [12, 24], // shoulder to hip
  [23, 24], // hips
  // Arms
  [11, 13], [13, 15], [15, 17], [15, 19], [15, 21], [17, 19], // left arm
  [12, 14], [14, 16], [16, 18], [16, 20], [16, 22], [18, 20], // right arm
  // Legs
  [23, 25], [25, 27], [27, 29], [27, 31], [29, 31], // left leg
  [24, 26], [26, 28], [28, 30], [28, 32], [30, 32], // right leg
];

// PoseNet keypoints (17 total) for backward compatibility
export const POSENET_SKELETON_EDGES: [number, number][] = [
  [0, 1], [0, 2], [1, 3], [2, 4], // head
  [5, 6], [6, 12], [12, 11], [11, 5], // body
  [6, 8], [8, 10], [5, 7], [7, 9], // arms
  [12, 14], [14, 16], [11, 13], [13, 15], // legs
];

// Default to BlazePose skeleton (better for 33 keypoints)
export const SKELETON_EDGES = BLAZEPOSE_SKELETON_EDGES;

export const MIN_CONFIDENCE = 0.5;
