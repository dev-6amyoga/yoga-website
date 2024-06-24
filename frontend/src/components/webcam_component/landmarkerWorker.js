// poseWorker.js
import {
  FilesetResolver,
  PoseLandmarker,
  DrawingUtils,
} from "https://cdn.skypack.dev/@mediapipe/tasks-vision@0.10.0";

let poseLandmarker;

self.onmessage = async (event) => {
  const { type, data } = event.data;

  if (type === "init") {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
    );

    poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
        delegate: "GPU",
      },
      runningMode: "IMAGE",
      numPoses: 2,
    });

    self.postMessage({ type: "init-complete" });
  }

  if (type === "predict") {
    const { imageData, width, height } = data;
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext("2d");
    const imageBitmap = await createImageBitmap(
      new ImageData(imageData, width, height)
    );
    ctx.drawImage(imageBitmap, 0, 0, width, height);

    const result = await poseLandmarker.detect(canvas);
    self.postMessage({ type: "result", result });
  }
};
