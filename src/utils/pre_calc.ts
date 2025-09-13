import * as posenet from "@tensorflow-models/posenet";
import * as tf from "@tensorflow/tfjs-node";
import { Keypoint, Keypoints } from "../types/Keypoints";
import * as fs from "fs";
import * as path from "path";

const ASSETS_DIR = path.resolve(__dirname, "../../assets/images");
const OUTPUT_FILE = path.resolve(__dirname, "../../assets/data/pose_keypoints.json");

const mapPoseNetToKeypoints = (pose: posenet.Pose): Keypoints => {
  const keypoints: Keypoint[] = pose.keypoints.map((kp) => ({
    x: kp.position.x,
    y: kp.position.y,
    score: kp.score,
    name: kp.part,
  }));
  return { keypoints, keypoints3D: [] };
};

(async () => {
  // Load PoseNet
  const net = await posenet.load({
    architecture: "MobileNetV1",
    outputStride: 16,
    inputResolution: { width: 257, height: 257 },
    multiplier: 0.75,
  });

  const results: Record<string, Keypoints> = {};

  // Read all image files
  const files = fs.readdirSync(ASSETS_DIR).filter((f) => /\.(jpg|jpeg|png)$/i.test(f));

  for (const file of files) {
    const filePath = path.join(ASSETS_DIR, file);

    // Load image as tf.Tensor
    const imageBuffer = fs.readFileSync(filePath);
    const tfImage = tf.node.decodeImage(imageBuffer); // returns [height, width, 3] tensor

    // Run PoseNet
    const poseNetPose = await net.estimateSinglePose(tfImage, { flipHorizontal: false });
    const pose: Keypoints = mapPoseNetToKeypoints(poseNetPose);

    results[file] = pose;
    console.log(`Processed ${file}`);

    tfImage.dispose(); // free memory
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
  console.log(`✅ Saved keypoints to ${OUTPUT_FILE}`);
})();
