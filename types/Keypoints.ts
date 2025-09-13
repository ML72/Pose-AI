export interface Keypoint {
    x: number,
    y: number,
    score: number,
    name: string
}

export interface Keypoints {
    keypoints: Keypoint[];
    keypoints3D: Keypoint[];
}