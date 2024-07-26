import React, { useState, useRef } from "react";
import { ReactMediaRecorder } from "react-media-recorder";

const VideoRecorder = () => {
  const [videoBlob, setVideoBlob] = useState(null);
  const videoRef = useRef();
  const canvasRef = useRef();

  const handleStopRecording = (blobUrl, blob) => {
    setVideoBlob(blob);
  };

  const handleResizeAndUpload = async () => {
    if (!videoBlob) return;

    const video = document.createElement("video");
    video.src = URL.createObjectURL(videoBlob);

    video.onloadedmetadata = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const width = 640;
      const height = 360;
      canvas.width = width;
      canvas.height = height;

      video.onplay = () => {
        ctx.drawImage(video, 0, 0, width, height);
        canvas.toBlob(async (blob) => {
          const formData = new FormData();
          console.log(blob);
          formData.append("file", blob, "resized_recording.mp4");
          console.log(formData);
          //   upload to r2!!
        }, "video/mp4");
      };
      video.play();
    };
  };

  return (
    <div>
      <ReactMediaRecorder
        video
        audio
        render={({ status, startRecording, stopRecording, mediaBlobUrl }) => (
          <div>
            <p>{status}</p>
            <button onClick={startRecording}>Start Recording</button>
            <button onClick={stopRecording}>Stop Recording</button>
            {mediaBlobUrl && (
              <>
                <video src={mediaBlobUrl} controls ref={videoRef} />
                <button onClick={handleResizeAndUpload}>Upload Video</button>
              </>
            )}
          </div>
        )}
        onStop={handleStopRecording}
      />
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
};

export default VideoRecorder;
