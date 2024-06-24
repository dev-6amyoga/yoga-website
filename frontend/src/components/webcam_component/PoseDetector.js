import { useCallback, useEffect, useRef, useState } from "react";
import { Spacer } from "@geist-ui/core";
import { Card, CardContent, Typography } from "@mui/material";
import { toast } from "react-toastify";
import useVideoStore from "../../store/VideoStore";

export default function PoseDetector() {
  const [globalScore, setGlobalScore] = useState(0);
  const [globalMessage, setGlobalMessage] = useState(null);
  const [startDetector, setStartDetector] = useState(false);
  const videoRef = useRef(null);
  const [videoStarted] = useVideoStore((state) => [state.videoStarted]);
  const canvasRef = useRef(null);

  useEffect(() => {
    videoStarted ? toast("video started") : toast("video not started");

    if (videoStarted) {
      enableCam();
      const timeoutId = setTimeout(() => {
        setStartDetector(true);
        toast("vrikshasana corrector start!");
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [videoStarted]);

  useEffect(() => {
    if (startDetector) {
      toast("prediction starting!");
      startPrediction();
    }
  }, [startDetector]);

  const startWebcam = () => {
    const constraints = { video: true };
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      videoRef.current.srcObject = stream;
      videoRef.current.style.display = "block";
      videoRef.current.play();
    });
  };

  const enableCam = (event) => {
    startWebcam();
  };

  //   const startPrediction = async () => {
  //     toast("in start prediction");
  //     const canvas = canvasRef.current;
  //     const video = videoRef.current;
  //     const context = canvas.getContext("2d");
  //     canvas.width = video.videoWidth;
  //     canvas.height = video.videoHeight;
  //     setInterval(() => {
  //       toast("in set internval");
  //       context.drawImage(video, 0, 0, canvas.width, canvas.height);
  //       const imageData = canvas.toDataURL("image/jpeg");
  //       console.log("image data :", imageData);
  //       Fetch({
  //         url: "/user/pose-detection",
  //         method: "POST",
  //         token: true,
  //         data: JSON.stringify({ image: imageData }),
  //       })
  //         .then((res) => {
  //           if (res.status === 200) {
  //             console.log(res);
  //             setGlobalScore(res.data.score);
  //             setGlobalMessage(res.data.message);
  //           }
  //         })
  //         .catch((err) => {
  //           console.log(err);
  //         });
  //     }, 1000);
  //   };

  const startPrediction = async () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    while (true) {
      // Replace with a condition if needed
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL("image/jpeg");
      console.log("image data :", imageData);
      try {
        const res = await Fetch({
          url: "/user/pose-detection",
          method: "POST",
          token: true,
          data: JSON.stringify({ image: imageData }),
        });
        if (res.status === 200) {
          console.log(res);
          setGlobalScore(res.data.score);
          setGlobalMessage(res.data.message);
        }
      } catch (err) {
        console.log(err);
      }

      // Adjust interval as needed (outside the loop)
      await new Promise((resolve) => setTimeout(resolve, 1000));
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
              <Typography variant="h5" component="div">
                {globalScore.toFixed(2)}
              </Typography>
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
