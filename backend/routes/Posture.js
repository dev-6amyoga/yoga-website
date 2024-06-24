const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const {
  DrawingUtils,
  FilesetResolver,
  PoseLandmarker,
} = require("@mediapipe/tasks-vision");
const {
  HTTP_BAD_REQUEST,
  HTTP_OK,
  HTTP_INTERNAL_SERVER_ERROR,
} = require("../utils/http_status_codes");
const router = express.Router();

router.post("/pose-detection", async (req, res) => {
  console.log("in pose detect");
  const { image } = req.body;
  try {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
    );
    const landmarker = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
        delegate: "GPU",
      },
      runningMode: "IMAGE",
      numPoses: 2,
    });
    const imageBuffer = Buffer.from(image.split(",")[1], "base64");
    const landmarks = await landmarker.detect(imageBuffer);
    const { score, message } = detectVrikshasana(landmarks);
    res.json({ score, message });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to process image" });
  }
});

const detectVrikshasana = (landmarks) => {
  // Pose detection logic here
  let score = 0;
  let message = "Posture detected";

  return { score, message };
};

module.exports = router;
