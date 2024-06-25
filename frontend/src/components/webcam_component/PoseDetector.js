// import { Spacer } from "@geist-ui/core";
// import { Card, CardContent, Typography } from "@mui/material";
// import { useState, useRef, useEffect, useCallback } from "react";
// import { toast } from "react-toastify";
// import useVideoStore from "../../store/VideoStore";

// const LANDMARKS = {
//   NOSE: 0,
//   LEFT_EYE_INNER: 1,
//   LEFT_EYE: 2,
//   LEFT_EYE_OUTER: 3,
//   RIGHT_EYE_INNER: 4,
//   RIGHT_EYE: 5,
//   RIGHT_EYE_OUTER: 6,
//   LEFT_EAR: 7,
//   RIGHT_EAR: 8,
//   LEFT_MOUTH: 9,
//   RIGHT_MOUTH: 10,
//   LEFT_SHOULDER: 11,
//   RIGHT_SHOULDER: 12,
//   LEFT_ELBOW: 13,
//   RIGHT_ELBOW: 14,
//   LEFT_WRIST: 15,
//   RIGHT_WRIST: 16,
//   LEFT_PINKY: 17,
//   RIGHT_PINKY: 18,
//   LEFT_INDEX: 19,
//   RIGHT_INDEX: 20,
//   LEFT_THUMB: 21,
//   RIGHT_THUMB: 22,
//   LEFT_HIP: 23,
//   RIGHT_HIP: 24,
//   LEFT_KNEE: 25,
//   RIGHT_KNEE: 26,
//   LEFT_ANKLE: 27,
//   RIGHT_ANKLE: 28,
//   LEFT_HEEL: 29,
//   RIGHT_HEEL: 30,
//   LEFT_FOOT_INDEX: 31,
//   RIGHT_FOOT_INDEX: 32,
// };
// export default function PoseDetector() {
//   const [lastVideoTime, setLastVideoTime] = useState(-1);
//   const [poseLandmarker, setPoseLandmarker] = useState(null);
//   const webcamRunningRef = useRef(false);
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const canvasCtxRef = useRef(null);

//   const enableWebcamButtonRef = useRef(null);
//   const [globalMessage, setGlobalMessage] = useState(null);
//   const [globalScore, setGlobalScore] = useState(0);
//   const [startDetector, setStartDetector] = useState(false);

//   const handleScoreUpdate = (value) => {
//     setGlobalScore((prevScore) => prevScore + value);
//   };
//   const [videoStarted] = useVideoStore((state) => [state.videoStarted]);

//   useEffect(() => {
//     videoStarted ? toast("video started") : toast("video not started");

//     if (videoStarted) {
//       enableCam();
//       const timeoutId = setTimeout(() => {
//         setStartDetector(true);
//         toast("vrikshasana corrector start!");
//       }, 1000); // 1 second

//       return () => clearTimeout(timeoutId);
//     }
//   }, [videoStarted]);

//   // Worker setup
//   const workerRef = useRef(null);
//   useEffect(() => {
//     if (!workerRef.current) {
//       workerRef.current = nbu
//       workerRef.current.onmessage = (message) => {
//         const { landmarks, message: messageFromWorker } = message.data;
//         detectVrikshasana(landmarks);
//         setGlobalMessage(messageFromWorker);
//       };
//     }
//     return () => workerRef.current?.terminate();
//   }, []);

//   const startWebcam = () => {
//     const constraints = { video: true };
//     navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
//       videoRef.current.srcObject = stream;
//       videoRef.current.style.display = "block";
//       videoRef.current.play();
//     });
//   };

//   useEffect(() => {
//     if (
//       startDetector &&
//       videoRef.current &&
//       videoRef.current.readyState === 4
//     ) {
//       // Send video frame to worker for processing when ready
//       const sendFrameToWorker = () => {
//         if (webcamRunningRef.current) {
//           const canvas = document.createElement("canvas");
//           const ctx = canvas.getContext("2d");
//           canvas.width = videoRef.current.videoWidth;
//           canvas.height = videoRef.current.videoHeight;
//           ctx.drawImage(videoRef.current, 0, 0);
//           const frame = canvas.toDataURL("image/jpeg", 0.5); // Adjust compression quality as needed
//           workerRef.current.postMessage({ frame });
//           window.requestAnimationFrame(sendFrameToWorker);
//         }
//       };
//       sendFrameToWorker();
//     }
//   }, [startDetector, videoRef]);

//   const detectVrikshasana = (landmarks) => {
//     const leftHeelY = landmarks[LANDMARKS.LEFT_HEEL].y;
//     const rightHeelY = landmarks[LANDMARKS.RIGHT_HEEL].y;
//     const rightAnkleY = landmarks[LANDMARKS.RIGHT_ANKLE].y;
//     const rightKneeY = landmarks[LANDMARKS.RIGHT_KNEE].y;
//     const leftPalmY = landmarks[LANDMARKS.LEFT_WRIST].y;
//     const rightPalmY = landmarks[LANDMARKS.RIGHT_WRIST].y;
//     const leftPalmX = landmarks[LANDMARKS.LEFT_WRIST].x;
//     const rightPalmX = landmarks[LANDMARKS.RIGHT_WRIST].x;
//     const leftHipY = landmarks[LANDMARKS.LEFT_HIP].y;
//     const rightHipY = landmarks[LANDMARKS.RIGHT_HIP].y;
//     const leftShoulderY = landmarks[LANDMARKS.LEFT_SHOULDER].y;
//     const rightShoulderY = landmarks[LANDMARKS.RIGHT_SHOULDER].y;
//     const leftElbowY = landmarks[LANDMARKS.LEFT_ELBOW].y;
//     const rightElbowY = landmarks[LANDMARKS.RIGHT_ELBOW].y;
//     const leftEyeY = landmarks[LANDMARKS.LEFT_EYE].y;
//     const rightEyeY = landmarks[LANDMARKS.RIGHT_EYE].y;

//     // Calculate midpoints
//     const midHipY = (leftHipY + rightHipY) / 2;
//     const midPalmY = (leftPalmY + rightPalmY) / 2;
//     const midShoulderY = (leftShoulderY + rightShoulderY) / 2;
//     const midElbowY = (leftElbowY + rightElbowY) / 2;
//     const midEyeY = (leftEyeY + rightEyeY) / 2;

//     let legPositionMessage = "";
//     let marksMessage = "";

//     const roundTo = (number, decimals) => {
//       return Number(number.toFixed(decimals));
//     };
//     let nextStep = "";
//     let leg_score = 0;
//     let hand_score = 0;
//     let base_score = 0;

//     if (roundTo(leftHeelY, 1) === roundTo(rightHeelY, 1)) {
//       nextStep = "";
//       legPositionMessage = "Take left heel to groin!";
//       base_score = 0;
//     } else if (leftHeelY - rightHeelY > 0.1) {
//       nextStep = "";
//       legPositionMessage = "Swap Legs!";
//       base_score = 0;
//     } else {
//       base_score = 30;
//       nextStep = "Legs correct!";
//     }
//     if (base_score === 30) {
//       if (
//         leftHeelY === rightAnkleY ||
//         Math.abs(leftHeelY - rightAnkleY) < 0.1
//       ) {
//         leg_score = 8.75;
//       } else if (leftHeelY + 0.1 < rightAnkleY && leftHeelY > rightKneeY) {
//         leg_score = 17.5;
//       }
//       if (leftHeelY < rightKneeY) {
//         const midLength = (midHipY + rightKneeY) / 4;
//         if (leftHeelY > midHipY + midLength) {
//           leg_score = 26.25;
//         } else {
//           leg_score = 35;
//         }
//       }

//       if (midPalmY > midHipY) {
//         marksMessage += ", Take your arms up";
//       } else {
//         if (midPalmY < midHipY && midPalmY > midShoulderY) {
//           hand_score = 8.75;
//         } else if (
//           midPalmY < midHipY &&
//           midPalmY < midShoulderY &&
//           midElbowY > midShoulderY
//         ) {
//           hand_score = 17.5;
//         } else if (
//           midPalmY < midHipY &&
//           midPalmY < midShoulderY &&
//           midElbowY < midShoulderY &&
//           midElbowY > midEyeY
//         ) {
//           hand_score = 26.25;
//         } else if (
//           midPalmY < midHipY &&
//           midPalmY < midShoulderY &&
//           midElbowY < midShoulderY &&
//           midElbowY < midEyeY
//         ) {
//           if (Math.abs(leftPalmX - rightPalmX) >= 0.05) {
//             hand_score = 26.25;
//           } else {
//             hand_score = 35;
//           }
//         }
//       }
//     }
//     setGlobalScore(base_score + leg_score + hand_score);

//     // setGlobalMessage(
//     //   legPositionMessage + (marksMessage ? ", " + marksMessage : "")
//     // );
//     // speakMessage(
//     //   legPositionMessage + (marksMessage ? ", " + marksMessage : "")
//     // );
//   };

//   const speakMessage = useCallback((message) => {
//     const utterance = new SpeechSynthesisUtterance(message);
//     window.speechSynthesis.speak(utterance);
//   }, []);

//   const enableCam = (event) => {
//     if (webcamRunningRef.current) {
//       webcamRunningRef.current = false;
//     } else {
//       webcamRunningRef.current = true;
//       startWebcam();
//     }
//   };

//   return (
//     <>
//       <Card
//         sx={{
//           border: "1px solid",
//           borderColor: "primary.main",
//           background: "linear-gradient(#033363, #021F3B)",
//           borderRadius: "1rem",
//           color: "white",
//         }}
//       >
//         <CardContent>
//           <div className="grid grid-cols-2">
//             <div className="flex flex-col gap-2  p-4">
//               <h6 className="uppercase">Score</h6>
//               <Typography variant="h5" component="div">
//                 {globalScore.toFixed(2)}
//               </Typography>
//             </div>
//             <div className="flex flex-col gap-2 items-start  p-4">
//               <h6 className="uppercase">Message</h6>
//               <Typography variant="p" component="div">
//                 {globalMessage ? globalMessage : "---"}
//               </Typography>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       <Spacer />

//       <div className="border-2 border-gray-950 rounded-lg">
//         <div className="relative w-full min-h-72">
//           <video
//             id="webcam"
//             ref={videoRef}
//             style={{
//               position: "absolute",
//               top: 0,
//               left: 0,
//               width: "100%", // Maintain 100% to fill parent container
//               height: "100%", // Maintain 100% to fill parent container
//             }}
//             autoPlay
//             muted
//           ></video>
//           <canvas
//             id="output_canvas"
//             ref={canvasRef}
//             style={{
//               position: "absolute",
//               top: 0,
//               left: 0,
//               width: "100%",
//               height: "100%",
//             }}
//           ></canvas>
//         </div>
//       </div>
//     </>
//   );
// }

import { Spacer } from "@geist-ui/core";
import { Card, CardContent, Typography } from "@mui/material";
import {
  DrawingUtils,
  FilesetResolver,
  PoseLandmarker,
} from "https://cdn.skypack.dev/@mediapipe/tasks-vision@0.10.0";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import useVideoStore from "../../store/VideoStore";
import ScoreCircle from "./ScoreCircle";
import "./ScoreCircle.css";

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

export default function PoseDetector() {
  const [lastVideoTime, setLastVideoTime] = useState(-1);
  const [poseLandmarker, setPoseLandmarker] = useState(null);
  const webcamRunningRef = useRef(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const canvasCtxRef = useRef(null);

  const enableWebcamButtonRef = useRef(null);
  const [globalMessage, setGlobalMessage] = useState(null);
  const [globalScore, setGlobalScore] = useState(0);
  const [startDetector, setStartDetector] = useState(false);

  const handleScoreUpdate = (value) => {
    setGlobalScore((prevScore) => prevScore + value);
  };
  const [videoStarted] = useVideoStore((state) => [state.videoStarted]);

  useEffect(() => {
    videoStarted ? toast("video started") : toast("video not started");

    if (videoStarted) {
      enableCam();
      const timeoutId = setTimeout(() => {
        setStartDetector(true);
        toast("vrikshasana corrector start!");
      }, 1000); // 12000 milliseconds = 12 seconds

      return () => clearTimeout(timeoutId);
    }
  }, [videoStarted]);

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
      // videoRef.current.addEventListener("loadeddata", () => {
      //   if (startDetector) {
      //     toast("prediction startin!");
      //     predictWebcam();
      //   }
      // });
    });
  };

  useEffect(() => {
    if (startDetector) {
      toast("prediction startin!");
      predictWebcam();
    }
  }, [startDetector]);

  const detectVrikshasana = (landmarks) => {
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
    let leg_score = 0;
    let hand_score = 0;
    let base_score = 0;

    if (roundTo(leftHeelY, 1) === roundTo(rightHeelY, 1)) {
      nextStep = "";
      legPositionMessage = "Take left heel to groin!";
      base_score = 0;
    } else if (leftHeelY - rightHeelY > 0.1) {
      nextStep = "";
      legPositionMessage = "Swap Legs!";
      base_score = 0;
    } else {
      base_score = 10;
      nextStep = "Legs correct!";
    }
    if (base_score === 10) {
      if (
        leftHeelY === rightAnkleY ||
        Math.abs(leftHeelY - rightAnkleY) < 0.1
      ) {
        leg_score = 20;
      } else if (leftHeelY + 0.1 < rightAnkleY && leftHeelY > rightKneeY) {
        leg_score = 40;
      }
      if (leftHeelY < rightKneeY) {
        const midLength = (midHipY + rightKneeY) / 4;
        if (leftHeelY > midHipY + midLength) {
          leg_score = 60;
        } else {
          leg_score = 60;
        }
      }

      if (midPalmY > midHipY) {
        marksMessage += ", Take your arms up";
      } else {
        if (midPalmY < midHipY && midPalmY > midShoulderY) {
          hand_score = 10;
        } else if (
          midPalmY < midHipY &&
          midPalmY < midShoulderY &&
          midElbowY > midShoulderY
        ) {
          hand_score = 20;
        } else if (
          midPalmY < midHipY &&
          midPalmY < midShoulderY &&
          midElbowY < midShoulderY &&
          midElbowY > midEyeY
        ) {
          hand_score = 25;
        } else if (
          midPalmY < midHipY &&
          midPalmY < midShoulderY &&
          midElbowY < midShoulderY &&
          midElbowY < midEyeY
        ) {
          if (Math.abs(leftPalmX - rightPalmX) >= 0.05) {
            hand_score = 30;
          } else {
            hand_score = 40;
          }
        }
      }
    }
    setGlobalScore(leg_score + hand_score);

    // setGlobalMessage(
    //   legPositionMessage + (marksMessage ? ", " + marksMessage : "")
    // );
    // speakMessage(
    //   legPositionMessage + (marksMessage ? ", " + marksMessage : "")
    // );
  };

  const speakMessage = useCallback((message) => {
    const utterance = new SpeechSynthesisUtterance(message);
    window.speechSynthesis.speak(utterance);
  }, []);

  const predictWebcam = async () => {
    console.log("predictWebcam called");
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
              {/* <Typography variant="h5" component="div">
                {globalScore.toFixed(2)}
              </Typography> */}
              <ScoreCircle globalScore={globalScore} />
            </div>
            <div className="flex flex-col gap-2 items-start  p-4">
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
