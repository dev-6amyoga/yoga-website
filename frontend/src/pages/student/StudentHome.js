import {
  DrawingUtils,
  PoseLandmarker,
  FilesetResolver,
} from "https://cdn.skypack.dev/@mediapipe/tasks-vision@0.10.0";
import { Button, CssBaseline, Typography } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useEffect, useState, useRef } from "react";
import "./MovingText.css";
import Hero from "./components/Hero";
import { toast } from "react-toastify";
import { LifeBuoy } from "lucide-react";

function StudentHome() {
  const [lastVideoTime, setLastVideoTime] = useState(-1);
  const [poseLandmarker, setPoseLandmarker] = useState(null);
  const webcamRunningRef = useRef(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const enableWebcamButtonRef = useRef(null);
  const [globalMessage, setGlobalMessage] = useState(null);

  const LANDMARKS = {
    NOSE: 0,
    LEFT_EYE_INNER: 1,
    LEFT_EYE: 2,
    LEFT_EYE_OUTER: 3,
    RIGHT_EYE_INNER: 4,
    RIGHT_EYE: 5,
    RIGHT_EYE_OUTER: 6,
    LEFT_EAR: 7,
    RIGHT_EAR: 8,
    LEFT_MOUTH: 9,
    RIGHT_MOUTH: 10,
    LEFT_SHOULDER: 11,
    RIGHT_SHOULDER: 12,
    LEFT_ELBOW: 13,
    RIGHT_ELBOW: 14,
    LEFT_WRIST: 15,
    RIGHT_WRIST: 16,
    LEFT_PINKY: 17,
    RIGHT_PINKY: 18,
    LEFT_INDEX: 19,
    RIGHT_INDEX: 20,
    LEFT_THUMB: 21,
    RIGHT_THUMB: 22,
    LEFT_HIP: 23,
    RIGHT_HIP: 24,
    LEFT_KNEE: 25,
    RIGHT_KNEE: 26,
    LEFT_ANKLE: 27,
    RIGHT_ANKLE: 28,
    LEFT_HEEL: 29,
    RIGHT_HEEL: 30,
    LEFT_FOOT_INDEX: 31,
    RIGHT_FOOT_INDEX: 32,
  };

  useEffect(() => {
    const createPoseLandmarker = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
      );

      const landmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numPoses: 2,
      });
      setPoseLandmarker(landmarker);
    };
    createPoseLandmarker();
  }, []);

  const startWebcam = () => {
    const constraints = { video: true };
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      videoRef.current.srcObject = stream;
      videoRef.current.style.display = "block";
      videoRef.current.play();
      videoRef.current.addEventListener("loadeddata", predictWebcam);
    });
  };
  const detectVrikshasana = (landmarks) => {
    function calculateDistance(landmarks) {
      const leftHip = landmarks[LANDMARKS.LEFT_HIP];
      const rightHip = landmarks[LANDMARKS.RIGHT_HIP];
      const midHip = {
        x: (leftHip.x + rightHip.x) / 2,
        y: (leftHip.y + rightHip.y) / 2,
        z: (leftHip.z + rightHip.z) / 2,
      };
      const leftHeel = landmarks[LANDMARKS.LEFT_HEEL];
      const rightHeel = landmarks[LANDMARKS.RIGHT_HEEL];
      const selectedHeel = leftHeel.x > rightHeel.x ? leftHeel : rightHeel;
      return Math.abs(selectedHeel.y - midHip.y);
    }

    const leftHeelY = landmarks[LANDMARKS.LEFT_HEEL].y;
    const rightHeelY = landmarks[LANDMARKS.RIGHT_HEEL].y;
    const rightAnkleY = landmarks[LANDMARKS.RIGHT_ANKLE].y;
    const rightKneeY = landmarks[LANDMARKS.RIGHT_KNEE].y;
    const leftPalmY = landmarks[LANDMARKS.LEFT_WRIST].y;
    const rightPalmY = landmarks[LANDMARKS.RIGHT_WRIST].y;
    const leftPalmX = landmarks[LANDMARKS.LEFT_WRIST].x;
    const rightPalmX = landmarks[LANDMARKS.RIGHT_WRIST].x;
    const leftHipY = landmarks[LANDMARKS.LEFT_HIP].y;
    const rightHipY = landmarks[LANDMARKS.RIGHT_HIP].y;
    const leftShoulderY = landmarks[LANDMARKS.LEFT_SHOULDER].y;
    const rightShoulderY = landmarks[LANDMARKS.RIGHT_SHOULDER].y;
    const leftElbowY = landmarks[LANDMARKS.LEFT_ELBOW].y;
    const rightElbowY = landmarks[LANDMARKS.RIGHT_ELBOW].y;
    const leftEyeY = landmarks[LANDMARKS.LEFT_EYE].y;
    const rightEyeY = landmarks[LANDMARKS.RIGHT_EYE].y;

    // Calculate midpoints
    const midHipY = (leftHipY + rightHipY) / 2;
    const midPalmY = (leftPalmY + rightPalmY) / 2;
    const midShoulderY = (leftShoulderY + rightShoulderY) / 2;
    const midElbowY = (leftElbowY + rightElbowY) / 2;
    const midEyeY = (leftEyeY + rightEyeY) / 2;

    let legPositionMessage = "";
    let marksMessage = "";

    const roundTo = (number, decimals) => {
      return Number(number.toFixed(decimals));
    };
    let nextStep = "";

    if (roundTo(leftHeelY, 1) === roundTo(rightHeelY, 1)) {
      legPositionMessage = "Take left heel to groin!";
    } else if (leftHeelY - rightHeelY > 0.1) {
      legPositionMessage = "Swap Legs!";
    } else {
      nextStep = "Legs correct!";
    }

    if (nextStep === "Legs correct!") {
      if (
        leftHeelY === rightAnkleY ||
        Math.abs(leftHeelY - rightAnkleY) < 0.1
      ) {
        marksMessage = "5 marks";
      } else if (leftHeelY + 0.1 < rightAnkleY && leftHeelY > rightKneeY) {
        marksMessage = "10 marks";
      }
      if (leftHeelY < rightKneeY) {
        const midLength = (midHipY + rightKneeY) / 4;
        if (leftHeelY > midHipY + midLength) {
          marksMessage = "15 marks";
        } else {
          marksMessage = "20 marks";
        }
      }

      if (midPalmY > midHipY) {
        marksMessage += ", Take your arms up";
      } else {
        if (midPalmY < midHipY && midPalmY > midShoulderY) {
          marksMessage += ", 5 marks(Take Palm Up)";
        } else if (
          midPalmY < midHipY &&
          midPalmY < midShoulderY &&
          midElbowY > midShoulderY
        ) {
          marksMessage += ", 10 marks(Take Elbow Up)";
        } else if (
          midPalmY < midHipY &&
          midPalmY < midShoulderY &&
          midElbowY < midShoulderY &&
          midElbowY > midEyeY
        ) {
          marksMessage += ", 15 marks(Lift elbow more!)";
        } else if (
          midPalmY < midHipY &&
          midPalmY < midShoulderY &&
          midElbowY < midShoulderY &&
          midElbowY < midEyeY
        ) {
          if (Math.abs(leftPalmX - rightPalmX) >= 0.05) {
            marksMessage +=
              ", JOIN PALMS" +
              "Left palm x = " +
              String(leftPalmX) +
              ", Right Palm x= " +
              String(rightPalmX);
          } else {
            marksMessage += ", 20 marks";
          }
        }
      }
    }

    setGlobalMessage(
      legPositionMessage + (marksMessage ? ", " + marksMessage : "")
    );
  };

  const predictWebcam = async () => {
    const videoHeight = 360;
    const videoWidth = 480;
    const canvasElement = canvasRef.current;
    const video = videoRef.current;
    const canvasCtx = canvasElement.getContext("2d");
    const drawingUtils = new DrawingUtils(canvasCtx);
    canvasElement.height = videoHeight;
    canvasElement.width = videoWidth;
    video.height = videoHeight;
    video.width = videoWidth;
    if (!poseLandmarker) return;
    await poseLandmarker.setOptions({ runningMode: "VIDEO" });
    const startTimeMs = performance.now();
    if (video.currentTime !== lastVideoTime) {
      setLastVideoTime(video.currentTime);
      poseLandmarker.detectForVideo(video, startTimeMs, (result) => {
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

        for (const landmark of result.landmarks) {
          detectVrikshasana(landmark);
          drawingUtils.drawLandmarks(landmark, {
            radius: (data) => DrawingUtils.lerp(data.from.z, -0.15, 0.1, 5, 1),
          });
          drawingUtils.drawConnectors(
            landmark,
            PoseLandmarker.POSE_CONNECTIONS
          );
        }
        canvasCtx.restore();
      });
    }
    if (webcamRunningRef.current) {
      window.requestAnimationFrame(predictWebcam);
    }
  };

  const enableCam = (event) => {
    if (!poseLandmarker) {
      return;
    }
    if (webcamRunningRef.current) {
      webcamRunningRef.current = false;
      enableWebcamButtonRef.current.innerText = "ENABLE PREDICTIONS";
    } else {
      webcamRunningRef.current = true;
      enableWebcamButtonRef.current.innerText = "DISABLE PREDICTIONS";
      startWebcam();
    }
  };

  const [mode, setMode] = useState("light");

  const defaultTheme = createTheme({ palette: { mode } });

  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <Hero heading="6AM Yoga Player" />
      <div className="max-w-7xl mx-auto py-2 px-1 xl:px-0">
        <div className="border-8 border-gray-950">
          {globalMessage && (
            <Typography
              variant="h2"
              component="div"
              style={{ fontWeight: "bold" }}
            >
              {globalMessage}
            </Typography>
          )}
          <Button ref={enableWebcamButtonRef} onClick={enableCam}>
            ENABLE PREDICTIONS
          </Button>
          <div
            style={{
              position: "relative",
              width: "640px", // Increase width and height for larger webcam
              height: "480px",
            }}
          >
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
      </div>
    </ThemeProvider>
  );
}

export default StudentHome;
