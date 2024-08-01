import { Box, Button, Modal, Typography } from "@mui/material";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

import Pako from "pako";
import { useEffect, useRef, useState } from "react";
import { ReactMediaRecorder } from "react-media-recorder";
import { toast } from "react-toastify";
import useUserStore from "../../store/UserStore";
import useVideoStore from "../../store/VideoStore";
import { getBackendDomain } from "../../utils/getBackendDomain";
import CustomModal from "./CustomModal";
import { Fetch } from "../../utils/Fetch";

const VideoRecorder = () => {
  const [videoBlob, setVideoBlob] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewDone, setPreviewDone] = useState(false);
  const [stream, setStream] = useState(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [mediaChunks, setMediaChunks] = useState([]);
  const videoRef = useRef();
  const canvasRef = useRef();
  const prevVideoRef = useRef(null);
  const mediaRecorderRef = useRef(null); // Add this ref

  const user = useUserStore((state) => state.user);

  const [
    recordingStart,
    setRecordingStart,
    recordingPlaying,
    setRecordingPlaying,
  ] = useVideoStore((state) => [
    state.recordingStart,
    state.setRecordingStart,
    state.recordingPlaying,
    state.setRecordingPlaying,
  ]);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (recordingStart) {
        event.preventDefault();
        setShowModal(true);
        setTimeout(() => {
          event.returnValue = "";
        }, 500);
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [recordingStart]);

  useEffect(() => {
    let stream;
    const getUserMedia = async () => {
      if (videoRef.current) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
          videoRef.current.srcObject = stream;
        } catch (err) {
          console.error("Error accessing webcam:", err);
        }
      }
    };
    if (showPreviewModal) {
      getUserMedia();
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [showPreviewModal]);

  const handleStopRecording = async (blobUrl) => {
    const combinedBlob = new Blob(mediaChunks, { type: "video/webm" });
    setVideoBlob(combinedBlob);
    setRecordingStart(false);
    setRecordingPlaying(false);
    handleResizeAndUpload(blobUrl, combinedBlob);
  };

  const handleStartRecording = () => {
    setShowPreviewModal(true);
  };

  const handleResizeAndUpload = async (blobUrl, videoBlob) => {
    if (!videoBlob) return;

    let bucket = import.meta.env.VITE_CLOUDFLARE_R2_RECORDINGS_BUCKET;

    if (!bucket) {
      toast.error("No output folder found!");
      return;
    }

    if (!user) {
      toast.error("No user found!");
      return;
    }

    toast("Downloading video, please don't close or move away from this tab!");

    try {
      const blb = new Blob([videoBlob]);

      const url = window.URL.createObjectURL(blb);
      console.log(blobUrl, videoBlob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `video-${new Date().toISOString()}.mp4`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      const compressedBuffer = Pako.gzip(await blb.arrayBuffer(), {
        level: 9,
        memLevel: 9,
      }).buffer;

      let videoBlobFile = new File([compressedBuffer], "file");

      const formdata = new FormData();
      formdata.set("filename", `video-${new Date().toISOString()}.mp4`);
      formdata.set("compressed", true);
      formdata.set("file", videoBlobFile);
      formdata.set("python", false);
      console.log(formdata);

      // const res = await fetch(`${getBackendDomain()}/r2/upload`, {
      //   method: "POST",
      //   body: formdata,
      // });
      toast.success("Video Downloaded");
      setShowUploadDialog(true);
    } catch (error) {
      console.log(error);
      toast.error("Failed to upload video");
    }
  };

  const setPreviewTrue = () => {
    setPreviewDone(true);
  };

  useEffect(() => {
    if (showPreviewModal) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (prevVideoRef.current) {
            prevVideoRef.current.srcObject = stream;
            prevVideoRef.current.play();
            setStream(stream); // Save the stream to stop it later
          }
        })
        .catch((err) => {
          console.error("Error accessing webcam: ", err);
        });
    }
    return () => {
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [showPreviewModal]);

  const handleCancel = () => {
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
    }
    setShowPreviewModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {previewDone && (
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
            mediaRecorder,
          }) => {
            mediaRecorderRef.current = mediaRecorder;
            useEffect(() => {
              console.log(mediaRecorder);
              if (mediaRecorder) {
                mediaRecorder.ondataavailable = (event) => {
                  if (event.data && event.data.size > 0) {
                    setMediaChunks((prevChunks) => [...prevChunks, event.data]);
                  }
                };
              }
            }, [mediaRecorder]);

            return (
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
                        if (mediaRecorderRef.current) {
                          mediaRecorderRef.current.requestData();
                        }
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
                        if (mediaRecorderRef.current) {
                          mediaRecorderRef.current.requestData();
                        }
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
            );
          }}
          onStop={handleStopRecording}
        />
      )}

      {!previewDone && (
        <Button
          onClick={() => {
            setShowPreviewModal(true);
          }}
        >
          Preview Webcam
        </Button>
      )}

      <canvas ref={canvasRef} style={{ display: "none" }} />

      <CustomModal open={showModal} onClose={() => setShowModal(false)} />

      <Modal open={showPreviewModal} onClose={handleCancel}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            borderRadius: 1,
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" component="h2">
            Preview
          </Typography>
          <Box
            sx={{
              mt: 2,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <video
              ref={prevVideoRef}
              width="100%"
              height="auto"
              style={{
                borderRadius: 4,
                border: "1px solid #ddd",
              }}
              autoPlay
            />
          </Box>
          <Box
            sx={{
              mt: 2,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setPreviewTrue();
                setShowPreviewModal(false);
              }}
            >
              Done
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleCancel}
              sx={{ ml: 2 }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default VideoRecorder;
