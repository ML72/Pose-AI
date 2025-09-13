import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.poseai.app', // Must be unique and should correspond to domain
  appName: 'Pose-AI',
  webDir: 'dist',
  bundledWebRuntime: false
};

export default config;
