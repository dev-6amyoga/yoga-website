import {
  Box,
  Button,
  MenuItem,
  Modal,
  Select,
  Typography,
} from "@mui/material";
import Pako from "pako";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import useUserStore from "../../store/UserStore";
import useVideoStore from "../../store/VideoStore";
import { Fetch } from "../../utils/Fetch";
import CustomModal from "./CustomModal";
import { ReactMediaRecorder } from "./ReactMediaRecorder";

const VideoPreview = ({ stream }) => {
  const videoRef = useRef(null);
  const fullScreen = useVideoStore((state) => state.fullScreen);

  useEffect(() => {
    console.log("stream changed", stream);
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <video
      ref={videoRef}
      className={`aspect-video bg-black w-64 rounded-md ${fullScreen ? "absolute top-4 left-4 z-[100000] border border-red-500" : ""}`}
      autoPlay
      disablePictureInPicture
      disableRemotePlayback
      muted
    />
  );
};

const Recorder = ({
  startRecording,
  stopRecording,
  pauseRecording,
  resumeRecording,
  mediaBlobUrl,
  requestData,
  uploadData = () => {},
  recordingStart,
  setRecordingStart,
  recordingPlaying,
  setRecordingPlaying,
  showPreviewModal,
  setShowPreviewModal,
  previewDone,
  setPreviewDone,
  setupBeforeRecordingStart,
  previewStream,
}) => {
  const [recordingControlQueue, popFromRecordingControlQueue] = useVideoStore(
    (state) => [state.recordingControlQueue, state.popFromRecordingControlQueue]
  );

  useEffect(() => {
    let interval = null;
    if (recordingStart && recordingPlaying) {
      console.log("[requestData Interval] : Setting interval");
      interval = setInterval(
        () => {
          if (requestData) {
            console.log("[requestData Interval] : Requesting data");
            requestData();
          }
        },
        1000 * 2 * 60
      );
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [recordingStart, recordingPlaying]);

  useEffect(() => {
    if (recordingControlQueue.length > 0) {
      const controlEvent = recordingControlQueue[0];
      switch (controlEvent) {
        case "RECORDING_START":
          setupBeforeRecordingStart();
          startRecording();
          setRecordingStart(true);
          setRecordingPlaying(true);
          popFromRecordingControlQueue(0);
          break;
        default:
          break;
      }
    }
  }, [recordingControlQueue]);

  return (
    <div className="flex flex-row justify-between items-center">
      <div className="flex flex-row gap-2 items-center">
        {!recordingStart && (
          <Button
            onClick={() => {
              setupBeforeRecordingStart();
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
      </div>
      {previewStream ? <VideoPreview stream={previewStream} /> : <></>}
    </div>
  );
};

const VideoRecorder = () => {
  const [showModal, setShowModal] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = useRef();
  const canvasRef = useRef();
  const prevVideoRef = useRef(null);

  const user = useUserStore((state) => state.user);
  const videoSessionTimeRef = useRef(new Date().toISOString());
  const videoSessionCountRef = useRef(0);

  const [videoName, setVideoName] = useState(null);

  const [chosenVideoDevice, setChosenVideoDevice] = useState(null);
  const [chosenAudioDevice, setChosenAudioDevice] = useState(null);

  const [devices, setDevices] = useState(null);

  const [
    recordingStart,
    setRecordingStart,
    recordingPlaying,
    setRecordingPlaying,
    previewDone,
    setPreviewDone,
    showPreviewModal,
    setShowPreviewModal,
    recordingControlQueue,
    addToRecordingControlQueue,
    popFromRecordingControlQueue,
  ] = useVideoStore((state) => [
    state.recordingStart,
    state.setRecordingStart,
    state.recordingPlaying,
    state.setRecordingPlaying,
    state.previewDone,
    state.setPreviewDone,
    state.showPreviewModal,
    state.setShowPreviewModal,
    state.recordingControlQueue,
    state.addToRecordingControlQueue,
    state.popFromRecordingControlQueue,
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
    if (recordingControlQueue.length > 0) {
      const controlEvent = recordingControlQueue[0];
      switch (controlEvent) {
        case "RECORDING_PREVIEW":
          setShowPreviewModal(true);
          popFromRecordingControlQueue(0);
          break;
        default:
          break;
      }
    }
  }, [recordingControlQueue]);

  useEffect(() => {
    let stream;
    const getUserMedia = async () => {
      if (videoRef.current) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
          videoRef.current.srcObject = stream;
          canvasRef.current.srcObject = stream;
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

  const handleStopRecording = async () => {
    setRecordingStart(false);
    setRecordingPlaying(false);
    setPreviewDone(false);
    toast.success("Recording uploaded successfully!");

    // let user_id = user?.user_id ?? "XXX";
    // let user_name = user?.name ?? "XXX";
    // let recording_video_name = `user_${user_id}_video_${videoSessionTimeRef.current}`;
    // let creation_date = new Date().toISOString();
    // const videoData = {
    // 	user_id,
    // 	user_name,
    // 	recording_video_name,
    // 	creation_date,
    // };
    // try {
    // 	const response = await Fetch({
    // 		url: "/video-rec/addVideoRecording",
    // 		method: "POST",
    // 		data: videoData,
    // 		headers: {
    // 			"Content-Type": "application/json",
    // 		},
    // 	});
    // 	if (response.status === 200) {
    // 		toast.success("Video recording saved successfully!");
    // 	} else {
    // 		toast.error("Failed to save video recording");
    // 	}
    // } catch (error) {
    // 	console.error("Error sending video recording data:", error);
    // }
  };

  const handleStartRecording = () => {
    setShowPreviewModal(true);
  };

  // DEPRECATED
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

      // const compressedBlob = blb
      // 	.stream()
      // 	.pipeThrough(new CompressionStream("gzip"));

      // const compressedBuffer = Pako.gzip(await blb.arrayBuffer(), {
      // 	level: 5,
      // 	memLevel: 6,
      // }).buffer;

      const compressedBuffer = Pako.gzip(await blb.arrayBuffer(), {
        level: 9,
        memLevel: 9,
      }).buffer;

      // console.log(compressedBuffer.byteLength);

      // compressed.getReader().read()

      let videoBlobFile = new File([compressedBuffer], "file");

      // let videoBlobFile = new File([await blb.arrayBuffer()], "file");

      const formdata = new FormData();

      // const cBlob = new Blob([compressedBlob]);

      formdata.set(
        "filename",
        `video_${videoSessionTimeRef.current}_${videoSessionCountRef.current}`
      );
      formdata.set("compressed", true);
      // formdata.set("body", cBlob);
      formdata.set("file", videoBlobFile);
      formdata.set("python", false);
      formdata.set("content_type", "application/octet-stream");

      // const res = await fetch(`${getBackendDomain()}/r2/upload`, {
      // 	method: "POST",
      // 	body: formdata,
      // });

      const res = await Fetch({
        url: `/r2/upload`,
        method: "POST",
        data: formdata,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      // toast.success("Video Downloaded");
    } catch (error) {
      console.log(error);
      toast.error("Failed to upload video");
    }
  };

  useEffect(() => {
    if (!chosenAudioDevice || !chosenVideoDevice) {
      return;
    }

    if (showPreviewModal) {
      navigator.mediaDevices
        .getUserMedia({
          video: {
            deviceId: {
              exact: chosenVideoDevice,
            },
          },
          audio: {
            deviceId: {
              exact: chosenAudioDevice,
            },
          },
        })
        .then((stream) => {
          if (prevVideoRef.current) {
            prevVideoRef.current.srcObject = stream;
            prevVideoRef.current.play();
            setStream(stream); // Save the stream to stop it later
          }
        })
        .catch((err) => {
          console.error("Error accessing webcam: ", err);
          toast.error(
            "Error accessing webcam/mic; Please try a different combination of devices."
          );
        });
    }
    return () => {
      // Clean up stream when the component unmounts
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [showPreviewModal, chosenAudioDevice, chosenVideoDevice]);

  const handleCancel = () => {
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
    }
    setShowPreviewModal(false);
    setRecordingStart(false);
    setRecordingPlaying(false);
    setPreviewDone(false);
  };

  const setupBeforeRecordingStart = () => {
    videoSessionTimeRef.current = new Date().toISOString();
    videoSessionCountRef.current = 0;
  };

  const uploadData = async (blobUrl, blob) => {
    try {
      let videoBlobFile = new File([blob], "file");
      const formdata = new FormData();
      const user_id = user?.user_id ?? "XXX";

      formdata.set("user_id", user_id);

      formdata.set(
        "file_name",
        `user_${user_id}_video_${videoSessionTimeRef.current}_${videoSessionCountRef.current}`
      );

      formdata.set(
        "folder_name",
        `user_${user_id}_video_${videoSessionTimeRef.current}`
      );

      let vid_name = `user_${user_id}_video_${videoSessionTimeRef.current}`;

      setVideoName(vid_name);

      formdata.set("compressed", false);
      formdata.set("file", videoBlobFile);
      formdata.set("python", false);
      formdata.set("content_type", "application/octet-stream");
      const res = await Fetch({
        url: `/r2/upload`,
        method: "POST",
        data: formdata,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      videoSessionCountRef.current += 1;
    } catch (error) {
      console.log(error);
      toast.error("Failed to upload video");
    }
  };

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      devices.forEach((device) => {
        console.log(
          device.kind + ": " + device.label + " id = " + device.deviceId
        );
      });
    });
  }, []);

  const getAllAudioVideoDevices = (successCallback, failureCallback) => {
    console.log("[] 1");

    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      // Firefox 38+, Microsoft Edge, and Chrome 44+ seems having support of enumerateDevices
      console.log("[] 1.1");
      navigator.enumerateDevices = function (callback) {
        navigator.mediaDevices.enumerateDevices().then(callback);
      };
    }

    if (
      !navigator.enumerateDevices &&
      window.MediaStreamTrack &&
      window.MediaStreamTrack.getSources
    ) {
      console.log("[] 2");
      navigator.enumerateDevices = window.MediaStreamTrack.getSources.bind(
        window.MediaStreamTrack
      );
    }

    if (
      !navigator.enumerateDevices &&
      navigator.mediaDevices.enumerateDevices
    ) {
      console.log("[] 3");
      navigator.enumerateDevices =
        navigator.mediaDevices.enumerateDevices.bind(navigator);
    }

    if (!navigator.enumerateDevices) {
      console.log("[] 4 fail");
      failureCallback(
        null,
        "Neither navigator.mediaDevices.enumerateDevices NOR MediaStreamTrack.getSources are available."
      );
      return;
    }

    // var allMdiaDevices = [];
    // var allAudioDevices = [];
    // var allVideoDevices = [];

    var audioInputDevices = [];
    var videoInputDevices = [];

    navigator.enumerateDevices(function (devices) {
      devices.forEach(function (_device) {
        var device = {};
        for (var d in _device) {
          device[d] = _device[d];
        }

        // if it is MediaStreamTrack.getSources
        if (device.kind === "audio") {
          device.kind = "audioinput";
        }

        if (device.kind === "video") {
          device.kind = "videoinput";
        }

        if (!device.deviceId) {
          device.deviceId = device.id;
        }

        if (!device.id) {
          device.id = device.deviceId;
        }

        if (!device.label) {
          device.label = "Please invoke getUserMedia once.";
        }

        if (device.kind === "audioinput" || device.kind === "audio") {
          if (audioInputDevices.find((d) => d.groupId === device.groupId)) {
            return;
          }

          audioInputDevices.push(device);
        }

        if (device.kind === "videoinput" || device.kind === "video") {
          if (videoInputDevices.find((d) => d.groupId === device.groupId)) {
            return;
          }
          videoInputDevices.push(device);
        }
      });

      console.log("[] 5");
      // console.log({
      // 	videoInputDevices,
      // 	audioInputDevices,
      // });
      return successCallback({
        videoInputDevices: videoInputDevices,
        audioInputDevices: audioInputDevices,
      });
    });
  };

  useEffect(() => {
    getAllAudioVideoDevices(
      (d) => {
        console.log(d);
        setDevices(d);
        console.log(
          d.audioInputDevices.find((d) =>
            String(d.label).toLowerCase().includes("default")
          )
        );
        setChosenAudioDevice(
          d.audioInputDevices.length > 0
            ? d?.audioInputDevices?.find((div) =>
                String(div?.label).toLowerCase().includes("default")
              )?.deviceId ?? d?.audioInputDevices[0]?.deviceId
            : null
        );

        setChosenVideoDevice(
          d?.videoInputDevices.length > 0
            ? d?.videoInputDevices?.find((div) =>
                String(div?.label).toLowerCase().includes("default")
              )?.deviceId ?? d?.videoInputDevices[0]?.deviceId
            : null
        );
      },
      (error) => {
        console.error(error);
      }
    );
  }, []);

  return (
    <div className="max-w-7xl mx-auto h-auto p-4">
      {previewDone && chosenVideoDevice && chosenAudioDevice && (
        <ReactMediaRecorder
          mediaRecorderOptions={{}}
          video={{
            aspectRatio: 4 / 3,
            width: 720,
            frameRate: 24,
            deviceId: {
              exact: chosenVideoDevice,
            },
          }}
          audio={{
            sampleSize: 16,
            channelCount: 2,
            deviceId: {
              exact: chosenAudioDevice,
            },
          }}
          render={(props) => (
            <Recorder
              {...props}
              uploadData={uploadData}
              recordingStart={recordingStart}
              setRecordingStart={setRecordingStart}
              recordingPlaying={recordingPlaying}
              setRecordingPlaying={setRecordingPlaying}
              showPreviewModal={showPreviewModal}
              setShowPreviewModal={setShowPreviewModal}
              previewDone={previewDone}
              setPreviewDone={setPreviewDone}
              setupBeforeRecordingStart={setupBeforeRecordingStart}
              previewStream={props.previewStream}
            />
          )}
          onStop={handleStopRecording}
          onDataAvailable={uploadData}
        />
      )}

      {!previewDone && (
        <Button
          onClick={() => {
            setShowPreviewModal(true);
            getAllAudioVideoDevices(
              (devices) => {
                setDevices(devices);
              },
              (err) => {
                console.error(err);
              }
            );
          }}
        >
          Preview Webcam
        </Button>
      )}

      {/* <canvas ref={canvasRef} /> */}

      <CustomModal open={showModal} onClose={() => setShowModal(false)} />

      <Modal open={showPreviewModal} onClose={handleCancel}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            bgcolor: "background.paper",
            borderRadius: 1,
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" component="h2">
            Preview
          </Typography>
          <p>Choose Audio Input</p>
          <Select
            fullWidth
            label="Audio Device"
            defaultValue={chosenAudioDevice}
            onChange={(e) => {
              console.log("audio device", e.target.value);
              setChosenAudioDevice(e.target.value);
            }}
          >
            {devices?.audioInputDevices.map((device) => (
              <MenuItem
                key={device.deviceId || device.id}
                value={device.deviceId || device.id}
              >
                {device.label}
              </MenuItem>
            ))}
          </Select>
          <p>Choose Video Input</p>
          <Select
            fullWidth
            label="Video Device"
            defaultValue={chosenVideoDevice}
            onChange={(e) => {
              console.log("video device", e.target.value);
              setChosenVideoDevice(e.target.value);
            }}
          >
            {devices?.videoInputDevices.map((device) => (
              <MenuItem
                key={device.deviceId || device.id}
                value={device.deviceId || device.id}
              >
                {device.label}
              </MenuItem>
            ))}
          </Select>
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
              muted
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
                addToRecordingControlQueue("RECORDING_START");
              }}
            >
              Click here to start
            </Button>
            {/* <Button
              variant="outlined"
              color="secondary"
              onClick={handleCancel}
              sx={{ ml: 2 }}
            >
              Cancel
            </Button> */}
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default VideoRecorder;
