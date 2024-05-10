import React, { useRef, useEffect } from "react";
import * as posenet from "@tensorflow-models/posenet";
import { drawKeypoints, drawSkeleton } from "./utilities";
// import "@tensorflow/tfjs-backend-webgl";

const WebcamComponent = ({ width = 640, height = 480 }) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const runPosenet = async () => {
    const net = await posenet.load({
      architecture: "MobileNetV1",
      outputStride: 16,
      inputResolution: { width, height },
      multiplier: 0.75,
    });

    setInterval(() => {
      detect(net);
    }, 100);
  };

  const detect = async (net) => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      const video = webcamRef.current.video;

      video.width = width;
      video.height = height;

      const pose = await net.estimateSinglePose(video);

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      canvas.width = width;
      canvas.height = height;

      drawKeypoints(pose.keypoints, 0.5, ctx);
      drawSkeleton(pose.keypoints, 0.5, ctx);
    }
  };

  useEffect(() => {
    runPosenet();
  }, []);

  return (
    <div>
      <video ref={webcamRef} style={{ display: "none" }} autoPlay muted />
      <canvas ref={canvasRef} style={{ width, height }} />
    </div>
  );
};

export default WebcamComponent;
