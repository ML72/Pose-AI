## Pose-AI

On-device pose analysis with AI-powered suggestions. Upload a photo, detect body landmarks locally with MediaPipe BlazePose, compare against a reference dataset, and (optionally) get improvement tips from OpenAI.

### Highlights
- **On-device detection**: MediaPipe Pose Landmarker runs in the browser via CDN (no server needed for detection)
- **Keypoint overlay**: Visualize 33 keypoints and skeletal connections on your photo
- **Similarity search**: Finds top reference poses from a local dataset using a weighted similarity metric
- **AI suggestions (optional)**: Sends your photo + two references to OpenAI to generate improvement tips with structured JSON output
- **Ionic + Capacitor**: Ship to web, iOS, and Android from one codebase
- **Material UI**: Polished, responsive UI

---

## Quick Start

Prerequisites:
- Node.js 18+ and npm

1) Install dependencies

```bash
npm install
```

2) (Optional, enables AI tips) Create `.env` in project root

```bash
VITE_OPENAI_API_KEY=sk-...your_key...
```

Notes:
- Keys in `VITE_...` variables are exposed to the browser. For production, route OpenAI calls through a server you control.
- AI suggestions work without any other config; if `VITE_OPENAI_API_KEY` is missing or invalid, the app falls back to built-in non-AI tips.

3) Start dev server

```bash
npm run dev
```

Open `http://localhost:5173`.

---

## How It Works

1) **Upload & detect**
- In `UploadPosePage`, a user selects an image. The app converts it to Base64 and runs MediaPipe BlazePose in the browser via a dynamic CDN import (see `src/service/blazePose.ts`).
- 33 keypoints are returned and stored in Redux (`data` slice).

2) **Similarity search**
- The app loads `/data/keypoints.json` (under `public/`) that contains 33-keypoint annotations for reference images in `/data/images`.
- It computes pose similarity with a weighted, body-part-aware metric (see `src/utils/poseComparison.ts`) and picks the top-2 matching reference filenames.

3) **Results & visualization**
- `ResultsPage` renders your photo with a keypoint overlay (`KeypointVisualization` → `drawPoseOnCanvas`), displays quick metrics, and shows two recommended references.

4) **AI suggestions**
- If `VITE_OPENAI_API_KEY` is set and two references exist, `src/service/poseSuggestions.ts` calls OpenAI (`gpt-4o-2024-08-06`) with three images (original + two references) and a structured JSON schema. The response provides improvement bullets and comparisons, rendered on the results page.
- If the call fails or is disabled, the page displays helpful built-in tips instead.

5) **(Experimental) Pose transfer**
- `src/service/imageEdit.ts` contains a utility to call `gpt-image-1` to make image A mimic the pose in image B. This is not wired into the current UI.

Privacy:
- Pose detection and similarity are fully in-browser. If you enable OpenAI, your Base64 images are sent to OpenAI for analysis.

---

## Dataset Tools

This repo includes tools to create and inspect your own reference dataset.

- `public/data/scripts/keypoint_extractor.html`
  - Drag-and-drop images to produce a compatible `keypoints.json` using the same MediaPipe model as the app.
  - Place resulting `keypoints.json` into `public/data/` and the corresponding images into `public/data/images/`.

- `public/data/scripts/keypoint_visualizer.html`
  - Upload an image and a `keypoints.json` to visually verify keypoints and skeleton layout.

Included sample data:
- `public/data/images/` contains sample images.
- `public/data/keypoints.json` contains the matching keypoints for those images.

---

## Project Structure

```
src/
  pages/
    LandingPage.tsx        # Marketing/entry page
    UploadPosePage.tsx     # Upload, style/focus selection, run detection
    ResultsPage.tsx        # Visualization, metrics, recommendations, AI tips
  components/
    CustomPage.tsx         # Theme + IonContent wrapper
    Alert.tsx              # Snackbar alert system
    KeypointVisualization.tsx  # Canvas draw overlay
  service/
    blazePose.ts           # MediaPipe loader and keypoint estimation
    poseSuggestions.ts     # OpenAI GPT-4o vision suggestions (JSON schema)
    imageEdit.ts           # Experimental gpt-image-1 pose transfer
  store/
    slices/data.ts         # Pose data, selections, suggestions
    slices/ui.ts           # Alerts
    store.ts               # Redux + redux-persist setup
  utils/
    poseComparison.ts      # Body-part-weighted similarity
    draw.ts, skeleton.ts   # Canvas drawing helpers
```

Public assets:
- `public/data/images/*` – reference images
- `public/data/keypoints.json` – reference keypoints
- `public/data/scripts/*.html` – dataset tooling

---

## Scripts

```bash
npm run dev       # Start Vite dev server
npm run build     # Type-check + build to dist
npm run preview   # Preview production build
npm run lint      # Run eslint
npm run sync      # Build and capacitor sync (for native platforms)
```

---

## Mobile (Capacitor)

Capacitor config lives in `capacitor.config.ts` (`appId: com.poseai.app`, `webDir: dist`).

1) Build web assets
```bash
npm run build
```

2) Add platforms (first time)
```bash
npx cap add ios
npx cap add android
```

3) Copy/sync
```bash
npx cap copy
npx cap sync
```

4) Open IDE and run
```bash
npx cap open ios      # Xcode (macOS only)
npx cap open android  # Android Studio
```

Notes:
- iOS builds require Xcode on macOS. Android builds require Android Studio + SDKs.
- Because OpenAI calls are made from the client when enabled, consider moving them to a backend for production apps.

---

## Configuration & Environment

Create `.env` in project root for local development:

```bash
VITE_OPENAI_API_KEY=sk-...your_key...
```

Security considerations:
- `VITE_*` env vars are embedded into client bundles. Do not ship real production secrets in the client. Prefer server-side calls.

Model/CDN considerations:
- MediaPipe is loaded via CDN (`@mediapipe/tasks-vision`) at runtime. A network connection is required for first load.

---

## Troubleshooting

- MediaPipe fails to load
  - Ensure network access to `cdn.jsdelivr.net`.
  - Try a hard refresh; some ad-blockers/extensions can block module scripts.

- `Failed to load keypoints dataset`
  - Confirm `public/data/keypoints.json` exists and is valid JSON.
  - Ensure images referenced by `filename` exist in `public/data/images/`.

- OpenAI errors (invalid key, insufficient quota, rate limit)
  - Verify `VITE_OPENAI_API_KEY` and account billing/limits.
  - The app will fall back to built-in tips if AI suggestions fail.

- Performance with large datasets
  - Very large `keypoints.json` can slow startup. Start smaller, or lazy-load subsets.

---

## Tech Stack

- React 18 + Vite 6
- Ionic React 7 + Capacitor 4
- Material UI 5
- Redux Toolkit + redux-persist
- MediaPipe Tasks Vision (Pose Landmarker)
- OpenAI (gpt-4o for analysis; gpt-image-1 for experimental pose transfer)

---

## License

MIT © 2025 Michael, Keyu, Yuheng, Yifan — see `LICENSE` for details.

---

## Assets & Image Licensing

Images under `assets/images/` are used for demo only and should not be redistributed unless otherwise noted.

