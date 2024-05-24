import { useEffect, useRef, useState } from "react";
import StudentPageWrapper from "../../components/Common/StudentPageWrapper";
import useUserStore from "../../store/UserStore";
import { Fetch } from "../../utils/Fetch";

import {
  DrawingUtils,
  FilesetResolver,
  PoseLandmarker,
} from "https://cdn.skypack.dev/@mediapipe/tasks-vision@0.10.0";

import { Button } from "@geist-ui/core";
import "./MovingText.css";

function StudentHome() {
  let [position, setPosition] = useState(0);
  let [userPlan, setUserPlan] = useState({});
  let [planId, setPlanId] = useState(0);
  // const ReactMySolidComponent = convertToReactComponent(VideoPlayerWrapper);
  let user = useUserStore((state) => state.user);

  const [lastVideoTime, setLastVideoTime] = useState(-1);
  const [poseLandmarker, setPoseLandmarker] = useState(null);
  const webcamRunningRef = useRef(false); // Ref to store webcamRunning state
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const enableWebcamButtonRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition((prevPosition) => (prevPosition + 1) % 100);
    }, 100);

    return () => clearInterval(interval);
  }, []);

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
        runningMode: "IMAGE",
        numPoses: 2,
      });
      setPoseLandmarker(landmarker);
    };
    createPoseLandmarker();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Fetch({
          url: "/user-plan/get-user-plan-by-id",
          method: "POST",
          data: { user_id: user.user_id },
        });
        const data = response.data;
        setUserPlan(data["userPlan"]);
        setPlanId(data["userPlan"]["plan_id"]);
      } catch (error) {
        console.log(error);
      }
    };
    if (user) {
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Fetch({
          url: "/user-plan/get-user-plan-by-id",
          method: "POST",
          data: { user_id: user.user_id },
        });
        const data = response.data;
        setUserPlan(data["userPlan"]);
        setPlanId(data["userPlan"]["plan_id"]);
      } catch (error) {
        console.log(error);
      }
    };
    if (user) {
      fetchData();
    }
  }, [user]);

  const startWebcam = () => {
    const constraints = { video: true };
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      videoRef.current.srcObject = stream;
      videoRef.current.style.display = "block";
      videoRef.current.play(); // Ensure the video starts playing
      videoRef.current.addEventListener("loadeddata", predictWebcam);
    });
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
    await poseLandmarker.setOptions({ runningMode: "VIDEO" });

    const startTimeMs = performance.now();
    if (video.currentTime !== lastVideoTime) {
      console.log("running predict web cam");
      setLastVideoTime(video.currentTime);
      poseLandmarker.detectForVideo(video, startTimeMs, (result) => {
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        for (const landmark of result.landmarks) {
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
    console.log(
      "from predict func, webcam running is : ",
      webcamRunningRef.current
    );
    if (webcamRunningRef.current) {
      console.log("calling : ", predictWebcam);
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
    console.log(
      "Webcam running (inside enableCam): ",
      webcamRunningRef.current
    );
  };

  // return (
  // 	<div className="flex-col justify-center">
  // 		<StudentNavbar />
  // 		{/* <div>Welcome {user.name}!</div> */}
  // 		<br />
  // 		<br />
  // 		<div class="moving-text-bar py-2">
  // 			<div class="moving-text">
  // 				This video is for personal self-practice only and not to be
  // 				used by teachers for taking classes. Any unauthorized use
  // 				may kindly be notified to: +91-9980802351
  // 			</div>
  // 		</div>

  // 		<div className="mx-auto max-w-7xl">
  // 			<div className="my-10">
  // 				{/* <VideoPlayerWrapper /> */}
  // 				<ReactToSolidBridgeProvider>
  // 					<div>
  // 						<h2>React Component</h2>
  // 						<ReactMySolidComponent />
  // 					</div>
  // 				</ReactToSolidBridgeProvider>
  // 				<hr />
  // 				<Playlist />
  // 			</div>
  // 		</div>
  // 	</div>
  // );
  return (
    <StudentPageWrapper heading="Player">
      <div className="border-8 border-gray-950">
        <Button ref={enableWebcamButtonRef} onClick={enableCam}>
          ENABLE PREDICTIONS
        </Button>
        <div
          style={{
            position: "relative",
            width: "480px",
            height: "360px",
          }}
        >
          <video
            id="webcam"
            ref={videoRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
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
    </StudentPageWrapper>
  );
}

export default StudentHome;
