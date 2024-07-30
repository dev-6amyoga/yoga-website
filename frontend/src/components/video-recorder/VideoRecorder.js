import { Box, Button, Modal, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
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
	const [showPreviewModal, setShowPreviewModal] = useState(false);
	const [previewDone, setPreviewDone] = useState(false);
	const videoRef = useRef();
	const canvasRef = useRef();
	const user = useUserStore((state) => state.user);
	const prevVideoRef = useRef(null);
	const [stream, setStream] = useState(null);

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

	const handleStopRecording = (blobUrl, blob) => {
		setVideoBlob(blob);
		setRecordingStart(false);
		setRecordingPlaying(false);
		handleResizeAndUpload(blob);
	};

	const handleStartRecording = () => {
		setShowPreviewModal(true);
	};

	const handleResizeAndUpload = async (videoBlob) => {
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

		toast(
			"Uploading video, please don't close or move away from this tab!"
		);

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
			// Clean up stream when the component unmounts
			if (stream) {
				const tracks = stream.getTracks();
				tracks.forEach((track) => track.stop());
			}
		};
	}, [showPreviewModal]);

	const handleCancel = () => {
		if (stream) {
			const tracks = stream.getTracks();
			tracks.forEach((track) => track.stop()); // Stop all tracks of the stream
		}
		setShowPreviewModal(false);
	};

	// useEffect(() => {
	//   toast(recordingStart ? "rec start" : "rec no start");
	//   toast(recordingPlaying ? "rec play" : "rec no play");
	// }, [recordingStart, recordingPlaying]);

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
					}) => (
						<div className="flex flex-row gap-2 items-center">
							{!recordingStart && (
								<Button
									onClick={() => {
										startRecording();
										setRecordingStart(true);
										setRecordingPlaying(true);
									}}>
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
										}}>
										Pause Recording
									</Button>
									<Button
										onClick={() => {
											stopRecording();
											setRecordingStart(false);
											setRecordingPlaying(false);
										}}>
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
										}}>
										Resume Recording
									</Button>
									<Button
										onClick={() => {
											stopRecording();
											setRecordingStart(false);
											setRecordingPlaying(false);
										}}>
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
			)}

			{!previewDone && (
				<Button
					onClick={() => {
						setShowPreviewModal(true);
					}}>
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
					}}>
					<Typography variant="h6" component="h2">
						Preview
					</Typography>
					<Box
						sx={{
							mt: 2,
							display: "flex",
							justifyContent: "center",
						}}>
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
						}}>
						<Button
							variant="contained"
							color="primary"
							onClick={() => {
								setPreviewTrue();
								setShowPreviewModal(false);
							}}>
							Done
						</Button>
						<Button
							variant="outlined"
							color="secondary"
							onClick={handleCancel}
							sx={{ ml: 2 }}>
							Cancel
						</Button>
					</Box>
				</Box>
			</Modal>
		</div>
	);
};

export default VideoRecorder;
