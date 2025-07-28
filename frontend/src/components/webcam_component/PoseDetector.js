import { Spacer } from "@geist-ui/core";
import { Card, CardContent, Typography } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import useVideoStore from "../../store/VideoStore";
import ScoreCircle from "./ScoreCircle";
import "./ScoreCircle.css";

export default function PoseDetector() {
  const webcamRunningRef = useRef(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [globalMessage, setGlobalMessage] = useState(null);
  const [globalScore, setGlobalScore] = useState(0);
  const workerRef = useRef(null);
  const enableScore = useRef(false);
  const [videoStarted, currentVideo] = useVideoStore((state) => [
    state.videoStarted,
    state.currentVideo,
  ]);

  useEffect(() => {
    enableCam();
  }, []);
  useEffect(() => {
    console.log("currentVideo", currentVideo?.video?._id);
    if (
      currentVideo &&
      currentVideo?.video?._id === "66784b0997a55a067a4c2f2e"
    ) {
      console.log("enable score");
      enableScore.current = true;
    } else {
      enableScore.current = false;
    }
  }, [currentVideo]);

  const setScoreTimeout = useRef(null);

  useEffect(() => {
    if (!workerRef.current) {
      console.log("Worker setup");
      workerRef.current = new Worker(
        new URL("./landmarkerWorker.js", import.meta.url)
      );
      workerRef.current.onmessage = (message) => {
        const { type, data, score, message: revMsg } = message.data;
        if (type === "result") {
          try {
            if (useVideoStore.getState().videoStarted) {
              if (setScoreTimeout.current === 20 && enableScore.current) {
                setGlobalScore(score);
                setGlobalMessage(revMsg);
                setScoreTimeout.current = 0;
              }
              setScoreTimeout.current += 1;
            } else {
              setGlobalScore(0);
              setGlobalMessage("---");
            }
          } catch (error) {
            console.error("Error in worker message:", error);
          }
        } else if (type === "init-complete") {
          console.log("[POSE DETECTOR] init complete");
        }
      };
      const offscreen = canvasRef.current.transferControlToOffscreen();
      workerRef.current.postMessage(
        {
          type: "init",
          canvas: offscreen,
        },
        [offscreen]
      );
    }

    return () => workerRef.current?.terminate();
  }, []);

  const startWebcam = () => {
    const constraints = { video: true };
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      videoRef.current.srcObject = stream;
      videoRef.current.style.display = "block";
      videoRef.current.play();
    });
  };

  const sendFrameToWorkerInterval = useRef(null);
  const poseSide = useRef(0);

  useEffect(() => {
    if (!videoStarted) {
      poseSide.current = 0;
    }
  }, []);

  useEffect(() => {
    const sendFrameToWorker = () => {
      if (poseSide.current === null) {
        poseSide.current = 0;
      }
      const w = 640;
      const h = 480;
      if (webcamRunningRef.current && w !== 0 && h !== 0) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(videoRef.current, 0, 0, w, h);
        const frame = ctx.getImageData(0, 0, w, h);
        if (!workerRef.current) return;
        workerRef.current.postMessage({
          type: "predict",
          data: {
            imageData: frame.data,
            width: w,
            height: h,
            side:
              poseSide.current < 46000
                ? "left"
                : poseSide.current > 55000 && poseSide.current < 90000
                  ? "right"
                  : "center",
          },
        });

        if (useVideoStore.getState().videoStarted) {
          poseSide.current = poseSide.current + 100;
        }
      }
    };

    sendFrameToWorkerInterval.current = setInterval(sendFrameToWorker, 100);

    return () => {
      if (sendFrameToWorkerInterval.current) {
        clearInterval(sendFrameToWorkerInterval.current);
      }
    };
  }, []);

  const speakMessage = useCallback((message) => {
    const utterance = new SpeechSynthesisUtterance(message);
    window.speechSynthesis.speak(utterance);
  }, []);

  const enableCam = (event) => {
    if (webcamRunningRef.current) {
      webcamRunningRef.current = false;
    } else {
      webcamRunningRef.current = true;
      startWebcam();
    }
  };

  return (
    <>
      <Card
        sx={{
          border: "1px solid",
          borderColor: "primary.main",
          background: "linear-gradient(#033363, #021F3B)",
          borderRadius: "1rem",
          color: "white",
        }}
      >
        <CardContent>
          <div className="grid grid-cols-2">
            <div className="flex flex-col gap-2  p-4">
              <h6 className="uppercase">Score</h6>
              <ScoreCircle globalScore={globalScore} />
            </div>
            <div className="flex flex-col gap-2 items-start p-4">
              <h6 className="uppercase">Message</h6>
              <Typography variant="p" component="div">
                {globalMessage ? globalMessage : "---"}
              </Typography>
            </div>
          </div>
        </CardContent>
      </Card>

      <Spacer />

      <div className="border-2 border-gray-950 rounded-lg">
        <div className="relative w-full min-h-72">
          <video
            id="webcam"
            ref={videoRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%", // Maintain 100% to fill parent container
              height: "100%", // Maintain 100% to fill parent container
            }}
            autoPlay
            muted
          ></video>
          <canvas
            id="output_canvas"
            ref={canvasRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
          ></canvas>
        </div>
      </div>
    </>
  );
}
