import { Keypoints, Keypoint } from '../types/Keypoints';

// BlazePose keypoint indices for different body parts
export const BODY_PART_INDICES = {
  // Face keypoints (low weight)
  FACE: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  
  // Body core keypoints (medium weight)  
  BODY: [11, 12, 23, 24], // shoulders and hips
  
  // Arm keypoints (high weight)
  LEFT_ARM: [11, 13, 15, 17, 19, 21], // left shoulder to hand
  RIGHT_ARM: [12, 14, 16, 18, 20, 22], // right shoulder to hand
  
  // Leg keypoints (high weight)
  LEFT_LEG: [23, 25, 27, 29, 31], // left hip to foot
  RIGHT_LEG: [24, 26, 28, 30, 32], // right hip to foot
};

// Weight configuration for different body parts
export const BODY_PART_WEIGHTS = {
  FACE: 0.1,
  BODY: 0.5,
  LEFT_ARM: 1.0,
  RIGHT_ARM: 1.0,
  LEFT_LEG: 1.0,
  RIGHT_LEG: 1.0,
};

/**
 * Normalize keypoints to handle rotation, scaling, and translation
 * This centers the pose around the midpoint of shoulders and scales based on torso length
 */
export function normalizeKeypoints(keypoints: Keypoint[]): Keypoint[] {
  if (keypoints.length < 33) {
    throw new Error('Expected 33 keypoints for BlazePose model');
  }

  // Get shoulder and hip keypoints for normalization
  const leftShoulder = keypoints[11];
  const rightShoulder = keypoints[12];
  const leftHip = keypoints[23];
  const rightHip = keypoints[24];

  // Check if core keypoints are valid
  if (leftShoulder.score < 0.5 || rightShoulder.score < 0.5 || 
      leftHip.score < 0.5 || rightHip.score < 0.5) {
    throw new Error('Core keypoints have low confidence, cannot normalize');
  }

  // Calculate center point (midpoint of shoulders)
  const centerX = (leftShoulder.x + rightShoulder.x) / 2;
  const centerY = (leftShoulder.y + rightShoulder.y) / 2;

  // Calculate torso length for scaling normalization
  const hipCenterX = (leftHip.x + rightHip.x) / 2;
  const hipCenterY = (leftHip.y + rightHip.y) / 2;
  const torsoLength = Math.sqrt(
    Math.pow(centerX - hipCenterX, 2) + Math.pow(centerY - hipCenterY, 2)
  );

  // Avoid division by zero
  const scale = torsoLength > 0 ? 100 / torsoLength : 1;

  // Normalize all keypoints
  return keypoints.map(kp => ({
    ...kp,
    x: (kp.x - centerX) * scale,
    y: (kp.y - centerY) * scale
  }));
}

/**
 * Calculate vector between two keypoints
 */
function calculateVector(p1: Keypoint, p2: Keypoint): [number, number] {
  return [p2.x - p1.x, p2.y - p1.y];
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(v1: [number, number], v2: [number, number]): number {
  const dot = v1[0] * v2[0] + v1[1] * v2[1];
  const mag1 = Math.sqrt(v1[0] * v1[0] + v1[1] * v1[1]);
  const mag2 = Math.sqrt(v2[0] * v2[0] + v2[1] * v2[1]);
  
  if (mag1 === 0 || mag2 === 0) return 0;
  return dot / (mag1 * mag2);
}

/**
 * Extract important vectors from normalized keypoints for a body part
 */
function extractBodyPartVectors(keypoints: Keypoint[], indices: number[]): [number, number][] {
  const vectors: [number, number][] = [];
  
  // Create vectors between consecutive keypoints in the body part
  for (let i = 0; i < indices.length - 1; i++) {
    const p1 = keypoints[indices[i]];
    const p2 = keypoints[indices[i + 1]];
    
    // Only include vectors where both keypoints have good confidence
    if (p1.score > 0.5 && p2.score > 0.5) {
      vectors.push(calculateVector(p1, p2));
    }
  }
  
  return vectors;
}

/**
 * Calculate similarity score between two sets of keypoints
 * Returns a score between 0 (completely different) and 1 (identical)
 */
export function calculatePoseSimilarity(keypoints1: Keypoint[], keypoints2: Keypoint[]): number {
  try {
    // Normalize both sets of keypoints
    const normalized1 = normalizeKeypoints(keypoints1);
    const normalized2 = normalizeKeypoints(keypoints2);
    
    let totalScore = 0;
    let totalWeight = 0;
    
    // Compare each body part with its respective weight
    for (const [bodyPart, indices] of Object.entries(BODY_PART_INDICES)) {
      const vectors1 = extractBodyPartVectors(normalized1, indices);
      const vectors2 = extractBodyPartVectors(normalized2, indices);
      
      if (vectors1.length === 0 || vectors2.length === 0) continue;
      
      // Calculate average cosine similarity for this body part
      let bodyPartScore = 0;
      let vectorCount = 0;
      
      const minVectors = Math.min(vectors1.length, vectors2.length);
      for (let i = 0; i < minVectors; i++) {
        const similarity = cosineSimilarity(vectors1[i], vectors2[i]);
        // Convert cosine similarity (-1 to 1) to similarity score (0 to 1)
        bodyPartScore += (similarity + 1) / 2;
        vectorCount++;
      }
      
      if (vectorCount > 0) {
        bodyPartScore /= vectorCount;
        const weight = BODY_PART_WEIGHTS[bodyPart as keyof typeof BODY_PART_WEIGHTS];
        totalScore += bodyPartScore * weight;
        totalWeight += weight;
      }
    }
    
    return totalWeight > 0 ? totalScore / totalWeight : 0;
    
  } catch (error) {
    console.warn('Error calculating pose similarity:', error);
    return 0;
  }
}

/**
 * Find the top N most similar poses from a dataset
 */
export function findSimilarPoses(
  userKeypoints: Keypoint[],
  dataset: Array<{ filename: string; keypoints: { keypoints: Keypoint[] } }>,
  topN: number = 2
): string[] {
  const similarities = dataset.map(entry => ({
    filename: entry.filename,
    similarity: calculatePoseSimilarity(userKeypoints, entry.keypoints.keypoints)
  }));
  
  // Sort by similarity score (descending)
  similarities.sort((a, b) => b.similarity - a.similarity);
  
  // Return top N filenames
  return similarities.slice(0, topN).map(entry => entry.filename);
}