
import { Keypoints } from '../types/keypoints';
import { normalizeKeypoints, cosineSim } from './calculate';

const WEIGHTS = {
    head: 0.2,
    body: 0.1,
    arms: 0.35,
    legs: 0.35
}
const BODY_SEGMENTS = {
    head: [
        [0, 4], [0, 3], [0, 6], [0, 5]
    ],
    body: [
        [5, 6], [6, 12], [12, 11], [11, 5]
    ],
    arms: [
        [6, 8], [8, 10], [5, 7], [7, 9]
    ],
    legs: [
        [12, 14], [14, 16], [11, 13], [13, 15]
    ]
}

// Compares similarity metrics between two sets of keypoints
export const compareKeypoints = (keypoints1: Keypoints, keypoints2: Keypoints) => {
    const normKeypoints1 = normalizeKeypoints(keypoints1.keypoints);
    const normKeypoints2 = normalizeKeypoints(keypoints2.keypoints);
    
    // Calculate similarity scores for each body segment
    let result: any = {}
    for(const [name, segments] of Object.entries(BODY_SEGMENTS)) {
        let score = 0;
        for(const [i, j] of segments) {
            const kp1 = normKeypoints1[i];
            const kp2 = normKeypoints1[j];
            const kp3 = normKeypoints2[i];
            const kp4 = normKeypoints2[j];
            score += cosineSim(kp1.x, kp1.y, kp2.x, kp2.y, kp3.x, kp3.y, kp4.x, kp4.y);
        }
        result[name] = score / segments.length;
    }

    // Calculate overall similiarity score
    let overallScore = 0;
    for(const [name, weight] of Object.entries(WEIGHTS)) {
        overallScore += weight * result[name];
    }
    result['overall'] = overallScore;

    return result;
}
