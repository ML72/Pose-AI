import { Keypoints, Keypoint } from "../types/Keypoints";

// Declare MediaPipe types for TypeScript
declare global {
    interface Window {
        MediaPipe: {
            FilesetResolver: any;
            PoseLandmarker: any;
        };
    }
}

let poseLandmarker: any = null;
let mediapiqueLoaded = false;

const loadMediaPipeScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (mediapiqueLoaded) {
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.type = 'module';
        script.innerHTML = `
            import { FilesetResolver, PoseLandmarker } from 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest';
            window.MediaPipe = { FilesetResolver, PoseLandmarker };
            window.dispatchEvent(new CustomEvent('mediapipe-loaded'));
        `;
        
        const onLoad = () => {
            mediapiqueLoaded = true;
            resolve();
        };
        
        const onError = () => {
            reject(new Error('Failed to load MediaPipe script'));
        };
        
        window.addEventListener('mediapipe-loaded', onLoad, { once: true });
        script.onerror = onError;
        
        document.head.appendChild(script);
    });
};

const mapMediaPipeToKeypoints = (mpResult: any, imgWidth: number, imgHeight: number): Keypoints => {
    if (!mpResult.landmarks || mpResult.landmarks.length === 0) {
        return { keypoints: [], keypoints3D: [] };
    }
    
    const lm = mpResult.landmarks[0];
    const world = (mpResult.worldLandmarks && mpResult.worldLandmarks[0]) || [];
    
    const keypoints: Keypoint[] = lm.map((p: any, idx: number) => ({
        x: p.x * imgWidth,
        y: p.y * imgHeight,
        score: typeof p.visibility === 'number' ? p.visibility : 1.0,
        name: String(idx)
    }));
    
    const keypoints3D: Keypoint[] = world.map((p: any, idx: number) => ({
        x: p.x,
        y: p.y,
        score: 1.0,
        name: String(idx)
    }));
    
    return { keypoints, keypoints3D };
};

export const loadBlazePose = async (): Promise<any> => {
    if (poseLandmarker) return poseLandmarker;
    
    // Load MediaPipe script dynamically
    await loadMediaPipeScript();
    
    const vision = await window.MediaPipe.FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm');
    poseLandmarker = await window.MediaPipe.PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task'
        },
        runningMode: 'IMAGE',
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5
    });
    
    return poseLandmarker;
};

export const estimateKeypointsWithBlazePose = async (
    image: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
): Promise<Keypoints> => {
    const landmarker = await loadBlazePose();
    const mpResult = landmarker.detect(image);
    
    // Get image dimensions based on element type
    let imgWidth = 0;
    let imgHeight = 0;
    
    if (image instanceof HTMLImageElement) {
        imgWidth = image.naturalWidth || image.width;
        imgHeight = image.naturalHeight || image.height;
    } else if (image instanceof HTMLVideoElement) {
        imgWidth = image.videoWidth || image.width;
        imgHeight = image.videoHeight || image.height;
    } else if (image instanceof HTMLCanvasElement) {
        imgWidth = image.width;
        imgHeight = image.height;
    }
    
    return mapMediaPipeToKeypoints(mpResult, imgWidth, imgHeight);
};

export const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result);
            } else {
                reject(new Error('Failed to convert image to base64'));
            }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
};