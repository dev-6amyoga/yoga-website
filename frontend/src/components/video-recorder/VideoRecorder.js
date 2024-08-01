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
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [mediaChunks, setMediaChunks] = useState([]);
  const [videoBlob, setVideoBlob] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewDone, setPreviewDone] = useState(false);
  const videoRef = useRef(null);
  const prevVideoRef = useRef(null);
  const [stream, setStream] = useState(null);

  const user = useUserStore((state) => state.user);

  useEffect(() => {
    if (showPreviewModal) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (prevVideoRef.current) {
            prevVideoRef.current.srcObject = stream;
            prevVideoRef.current.play();
            setStream(stream);

            const recorder = new MediaRecorder(stream);
            recorder.ondataavailable = (event) => {
              if (event.data.size > 0) {
                setMediaChunks((prevChunks) => [...prevChunks, event.data]);
              }
            };
            recorder.onstop = () => {
              const blob = new Blob(mediaChunks, { type: "video/mp4" });
              setVideoBlob(blob);
              handleResizeAndUpload(URL.createObjectURL(blob), blob);
            };
            setMediaRecorder(recorder);
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

  const handleStartRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "inactive") {
      mediaRecorder.start();
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
    }
  };

  const handleRequestData = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.requestData();
    }
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

      const res = await fetch(`${getBackendDomain()}/r2/upload`, {
        method: "POST",
        body: formdata,
      });
      toast.success("Video Downloaded");
    } catch (error) {
      console.log(error);
      toast.error("Failed to upload video");
    }
  };

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
        <div className="flex flex-row gap-2 items-center">
          {!mediaRecorder || mediaRecorder.state === "inactive" ? (
            <Button onClick={handleStartRecording}>Start Recording</Button>
          ) : mediaRecorder.state === "recording" ? (
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-4 h-4 bg-red-500 rounded-full animate-blink" />
              </div>
              <Button onClick={handleRequestData}>Request Data</Button>
              <Button onClick={handleStopRecording}>Stop Recording</Button>
            </div>
          ) : (
            <Button onClick={handleStartRecording}>Resume Recording</Button>
          )}
        </div>
      )}

      {!previewDone && (
        <Button onClick={() => setShowPreviewModal(true)}>
          Preview Webcam
        </Button>
      )}

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
                setPreviewDone(true);
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
