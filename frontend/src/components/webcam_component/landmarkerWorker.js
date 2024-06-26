// landmarkerWorker.ts

/* eslint-disable no-restricted-globals */

// import {
//   DrawingUtils,
//   FilesetResolver,
//   PoseLandmarker,
// } from "https://cdn.skypack.dev/@mediapipe/tasks-vision@0.10.0";

let poseLandmarker;
let module;

self.onmessage = async (event) => {
  // console.log("worker in on message");
  const { type, data } = event;
  // console.log("worker", type, data);
  if (data.type === "init") {
    console.log("[LANDMARKER] received init");

    const [m1] = await Promise.all([
      import("https://cdn.skypack.dev/@mediapipe/tasks-vision@0.10.0"),
    ]);

    module = m1;

    const vision = await module.FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
    );

    poseLandmarker = await module.PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
        delegate: "GPU",
      },
      runningMode: "IMAGE",
      numPoses: 2,
    });
    console.log("[LANDMARKER] finished init");

    self.postMessage({ type: "init-complete" });
  }

  // if (data.type === "predict") {
  //   console.log("[LANDMARKER] received predict");
  //   // console.log("worker data:", data);
  //   const { imageData, width, height } = data.data;
  //   console.log("worker :", imageData);
  //   const canvas = new OffscreenCanvas(width, height);
  //   const ctx = canvas.getContext("2d");
  //   const imageBitmap = await createImageBitmap(
  //     new ImageData({ imageData, width, height })
  //   );
  //   console.log(imageBitmap);
  //   // ctx.drawImage(imageBitmap, 0, 0, width, height);

  //   // const result = await poseLandmarker.detect(canvas);
  //   // console.log("[LANDMARKER] result :", result);
  //   self.postMessage({ type: "result", data: result });
  // }

  if (data.type === "predict") {
    // console.log("[LANDMARKER] received predict");
    const { imageData, width, height } = data.data;
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext("2d");
    const imgData = new ImageData(imageData, width, height);
    const imageBitmap = await createImageBitmap(imgData);
    // console.log(imageData);
    ctx.drawImage(imageBitmap, 0, 0, width, height);

    const result = await poseLandmarker.detect(canvas);
    // console.log(result.landmarks);
    self.postMessage({ type: "result", data: result });

    // Corrected ImageData constructor
    // const imageBitmap = await createImageBitmap(
    //   new ImageData(new Uint8ClampedArray(imageData), width, height)
    // );

    // console.log(imageBitmap);
    // ctx.drawImage(imageBitmap, 0, 0, width, height);

    // const result = await poseLandmarker.detect(canvas);
    // console.log("[LANDMARKER] result :", result);
    // self.postMessage({ type: "result", data: result });
  }
};

self.onerror = function (err) {
  console.log(err);
};

// export {};
