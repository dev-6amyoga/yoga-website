import { Button } from "@mui/material";
import { useRef, useState } from "react";
import { ReactMediaRecorder } from "react-media-recorder";
import { toast } from "react-toastify";
import useUserStore from "../../store/UserStore";
import { getBackendDomain } from "../../utils/getBackendDomain";

const VideoRecorder = () => {
	const [videoBlob, setVideoBlob] = useState(null);
	const videoRef = useRef();
	const canvasRef = useRef();

	const user = useUserStore((state) => state.user);

	const handleStopRecording = (blobUrl, blob) => {
		setVideoBlob(blob);
	};

	const handleResizeAndUpload = async () => {
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

			// let buffer = await videoBlobFile.text();

			// const res = await cloudflareAddFile(
			// 	bucket,
			// 	`video-${new Date().toISOString()}.webm`,
			// 	buffer
			// );

			const formdata = new FormData();

			formdata.set("filename", `video-${new Date().toISOString()}.mp4`);
			formdata.set("file", videoBlobFile);

			const res = await fetch(`${getBackendDomain()}/r2/upload`, {
				method: "POST",
				body: formdata,
			});

			// console.log(res);
			toast.success("Video uploaded successfully");
		} catch (error) {
			console.log(error);
			toast.error("Failed to upload video");
		}
	};

	return (
		<div>
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
					status,
					startRecording,
					stopRecording,
					pauseRecording,
					resumeRecording,

					muteAudio,
					unMuteAudio,
					isAudioMuted,
					mediaBlobUrl,
				}) => (
					<div>
						<p>{status}</p>
						<Button onClick={startRecording}>
							Start Recording
						</Button>
						<Button onClick={pauseRecording}>
							Pause Recording
						</Button>
						<Button onClick={resumeRecording}>
							Resume Recording
						</Button>
						<Button onClick={stopRecording}>Stop Recording</Button>
						<Button onClick={muteAudio} disabled={isAudioMuted}>
							Mute Audio
						</Button>
						<Button onClick={unMuteAudio} disabled={!isAudioMuted}>
							Unmute Audio
						</Button>
						{mediaBlobUrl && (
							<>
								{/* <video
									src={mediaBlobUrl}
									controls
									ref={videoRef}
								/> */}
								<Button onClick={handleResizeAndUpload}>
									Upload Video
								</Button>
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
