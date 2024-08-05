import { Box, Button, Modal, Typography } from "@mui/material";
import Pako from "pako";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import useUserStore from "../../store/UserStore";
import useVideoStore from "../../store/VideoStore";
import { Fetch } from "../../utils/Fetch";
import CustomModal from "./CustomModal";
import { ReactMediaRecorder } from "./ReactMediaRecorder";

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
}) => {
	const [recordingControlQueue, popFromRecordingControlQueue] = useVideoStore(
		(state) => [
			state.recordingControlQueue,
			state.popFromRecordingControlQueue,
		]
	);

	useEffect(() => {
		// setup interval to request data for every 20s
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

	// to start recording after the user consents to recording the session
	useEffect(() => {
		console.log("[recordingControlQueue] : CHANGED");
		if (recordingControlQueue.length > 0) {
			const controlEvent = recordingControlQueue[0];

			console.log("[recordingControlQueue] : ", controlEvent);

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

	// console.log("[recordingControlQueue] : ", recordingControlQueue);

	return (
		<div className="flex flex-row gap-2 items-center">
			{!recordingStart && (
				<Button
					onClick={() => {
						setupBeforeRecordingStart();
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
					{/* <Button
						onClick={() => {
							if (requestData) requestData();
							else console.log("Cannot call requestData;");
						}}>
						Request Data
					</Button> */}
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
	);
};

const VideoRecorder = () => {
	// const [videoBlob, setVideoBlob] = useState(null);
	const [showModal, setShowModal] = useState(false);
	// const [showPreviewModal, setShowPreviewModal] = useState(false);
	const [stream, setStream] = useState(null);

	const videoRef = useRef();
	const canvasRef = useRef();
	const prevVideoRef = useRef(null);

	const user = useUserStore((state) => state.user);

	const videoSessionTimeRef = useRef(new Date().toISOString());
	const videoSessionCountRef = useRef(0);

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
		console.log("[recordingControlQueue] : CHANGED");
		if (recordingControlQueue.length > 0) {
			const controlEvent = recordingControlQueue[0];

			console.log("[recordingControlQueue] : ", controlEvent);

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

	const handleStopRecording = () => {
		console.log("Stopped video recording.");
		// setVideoBlob(blob);
		setRecordingStart(false);
		setRecordingPlaying(false);
		// handleResizeAndUpload(blobUrl, blob);
		toast.success("Recording uploaded successfully!");
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

		toast(
			"Downloading video, please don't close or move away from this tab!"
		);

		try {
			const blb = new Blob([videoBlob]);

			const url = window.URL.createObjectURL(blb);
			console.log(blobUrl, videoBlob);
			const link = document.createElement("a");
			link.href = url;
			link.setAttribute(
				"download",
				`video-${new Date().toISOString()}.mp4`
			);
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
					toast.error("Error accessing webcam");
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
		setRecordingStart(false);
		setRecordingPlaying(false);
		setPreviewDone(false);
	};

	const setupBeforeRecordingStart = () => {
		videoSessionTimeRef.current = new Date().toISOString();
		videoSessionCountRef.current = 0;
	};

	const uploadData = async (blobUrl, blob) => {
		console.log("uploadData");

		// const link = document.createElement("a");
		// link.href = blobUrl;
		// link.setAttribute("download", `video-${new Date().toISOString()}.mp4`);
		// document.body.appendChild(link);
		// link.click();
		// link.parentNode.removeChild(link);
		// window.URL.revokeObjectURL(blobUrl);

		// const blb = new Blob([blob]);

		// const compressedBuffer = Pako.gzip(await blb.arrayBuffer(), {
		// 	level: 9,
		// 	memLevel: 9,
		// }).buffer;

		// console.log(compressedBuffer.byteLength);

		// compressed.getReader().read()

		// let videoBlobFile = new File([compressedBuffer], "file");
		try {
			// if (!user || user?.user_id === undefined) {
			// 	return;
			// }
			// const buff = await blob.arrayBuffer();
			// console.log(blob, buff, buff.byteLength);
			let videoBlobFile = new File([blob], "file");

			const formdata = new FormData();

			const user_id = user?.user_id ?? "XXX";

			// const cBlob = new Blob([compressedBlob]);

			formdata.set(
				"filename",
				`user_${user_id}_video_${videoSessionTimeRef.current}_${videoSessionCountRef.current}`
			);
			formdata.set(
				"foldername",
				`user_${user_id}_video_${videoSessionTimeRef.current}`
			);
			formdata.set("compressed", false);
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

			videoSessionCountRef.current += 1;
		} catch (error) {
			console.log(error);
			toast.error("Failed to upload video");
		}
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
							setupBeforeRecordingStart={
								setupBeforeRecordingStart
							}
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
								setPreviewDone(true);
								setShowPreviewModal(false);
								addToRecordingControlQueue("RECORDING_START");
							}}>
							Start
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
