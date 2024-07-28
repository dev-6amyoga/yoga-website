import { Button } from "@mui/material";
import { useRef, useState, useEffect } from "react";
import { ReactMediaRecorder } from "react-media-recorder";
import { toast } from "react-toastify";
import useUserStore from "../../store/UserStore";
import { getBackendDomain } from "../../utils/getBackendDomain";
import CustomModal from "./CustomModal";

const VideoRecorder = () => {
  const [videoBlob, setVideoBlob] = useState(null);
  const [recordingStart, setRecordingStart] = useState(false);
  const [recordingPlaying, setRecordingPlaying] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const videoRef = useRef();
  const canvasRef = useRef();

  const user = useUserStore((state) => state.user);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (recordingStart) {
        event.preventDefault();
        event.returnValue = ""; // For browsers that respect custom message
        setShowModal(true); // Show custom modal
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [recordingStart]);

  const handleStopRecording = (blobUrl, blob) => {
    setVideoBlob(blob);
    setRecordingStart(false);
    setRecordingPlaying(false);
    handleResizeAndUpload(blob);
  };

  const handleResizeAndUpload = async (videoBlob) => {
    if (!videoBlob) return;

    // upload video
    let bucket = import.meta.env.VITE_CLOUDFLARE_R2_RECORDINGS_BUCKET;

    if (!bucket) {
      toast.error("No output folder found!");
      return;
    }

    if (!user) {
      toast.error("No user found!");
      return;
    }

    try {
      let videoBlobFile = new File([videoBlob], "video.mp4", {
        type: "video/mp4",
      });

      const formdata = new FormData();

      formdata.set("filename", `video-${new Date().toISOString()}.mp4`);
      formdata.set("file", videoBlobFile);

      const res = await fetch(`${getBackendDomain()}/r2/upload`, {
        method: "POST",
        body: formdata,
      });
      toast.success("Video uploaded successfully");
    } catch (error) {
      console.log(error);
      toast.error("Failed to upload video");
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <ReactMediaRecorder
        mediaRecorderOptions={{
          videoBitsPerSecond: 2000000,
          audioBitsPerSecond: 128000,
        }}
        video={{
          aspectRatio: 4 / 3,
          width: 720,
          frameRate: 24,
        }}
        audio={{
          sampleSize: 16,
          channelCount: 2,
        }}
        render={({
          startRecording,
          stopRecording,
          pauseRecording,
          resumeRecording,
          mediaBlobUrl,
        }) => (
          <div className="flex flex-row gap-2 items-center">
            {!recordingStart && (
              <Button
                onClick={() => {
                  startRecording();
                  setRecordingStart(true);
                  setRecordingPlaying(true);
                }}
              >
                Start Recording
              </Button>
            )}
            {recordingStart && recordingPlaying && (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-4 h-4 bg-red-500 rounded-full animate-blink" />
                </div>
                <Button
                  onClick={() => {
                    pauseRecording();
                    setRecordingPlaying(false);
                  }}
                >
                  Pause Recording
                </Button>
                <Button
                  onClick={() => {
                    stopRecording();
                    setRecordingStart(false);
                    setRecordingPlaying(false);
                  }}
                >
                  Stop Recording
                </Button>
              </div>
            )}
            {recordingStart && !recordingPlaying && (
              <div>
                <Button
                  onClick={() => {
                    resumeRecording();
                    setRecordingPlaying(true);
                  }}
                >
                  Resume Recording
                </Button>
                <Button
                  onClick={() => {
                    stopRecording();
                    setRecordingStart(false);
                    setRecordingPlaying(false);
                  }}
                >
                  Stop Recording
                </Button>
              </div>
            )}

            {mediaBlobUrl && (
              <>
                {/* <video
                  src={mediaBlobUrl}
                  controls
                  ref={videoRef}
                /> */}
              </>
            )}
          </div>
        )}
        onStop={handleStopRecording}
      />
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* Render the modal */}
      <CustomModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

export default VideoRecorder;
