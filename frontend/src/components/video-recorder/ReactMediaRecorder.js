// import { register } from "extendable-media-recorder";
// import { connect } from "extendable-media-recorder-wav-encoder";
import { memo, useCallback, useEffect, useRef, useState } from "react";

export let RecorderErrors;
(function (RecorderErrors) {
	RecorderErrors["AbortError"] = "media_aborted";
	RecorderErrors["NotAllowedError"] = "permission_denied";
	RecorderErrors["NotFoundError"] = "no_specified_media_found";
	RecorderErrors["NotReadableError"] = "media_in_use";
	RecorderErrors["OverconstrainedError"] = "invalid_media_constraints";
	RecorderErrors["TypeError"] = "no_constraints";
	RecorderErrors["NONE"] = "";
	RecorderErrors["NO_RECORDER"] = "recorder_error";
})(RecorderErrors || (RecorderErrors = {}));

export function useReactMediaRecorder({
	audio = true,
	video = false,
	onStop = () => null,
	onStart = () => null,
	onDataAvailable = () => null,
	blobPropertyBag,
	screen = false,
	mediaRecorderOptions = undefined,
	customMediaStream = null,
	stopStreamsOnStop = true,
	askPermissionOnMount = false,
	chosenAudioDevice = null,
	chosenVideoDevice = null,
}) {
	const mediaRecorder = useRef(null);
	const mediaChunks = useRef([]);
	const mediaStream = useRef(null);
	const [status, setStatus] = useState("idle");
	const [isAudioMuted, setIsAudioMuted] = useState(false);
	const [mediaBlobUrl, setMediaBlobUrl] = useState(undefined);

	const videoPreviewStream = useRef(null);
	// const [mediaBlob, setMediaBlob] = useState(undefined);
	const [error, setError] = useState("NONE");

	// useEffect(() => {
	// 	const setup = async () => {
	// 		await register(await connect());
	// 	};
	// 	setup();
	// }, []);

	const getMediaStream = useCallback(async () => {
		setStatus("acquiring_media");
		const requiredMedia = {
			audio: typeof audio === "boolean" ? !!audio : audio,
			video: typeof video === "boolean" ? !!video : video,
		};
		try {
			if (customMediaStream) {
				mediaStream.current = customMediaStream;
			} else if (screen) {
				const stream =
					await window.navigator.mediaDevices.getDisplayMedia({
						video: video || true,
					});
				// console.log("video tracks", stream.getVideoTracks());
				stream.getVideoTracks()[0].addEventListener("ended", () => {
					stopRecording();
				});
				if (audio) {
					const audioStream =
						await window.navigator.mediaDevices.getUserMedia({
							audio,
						});

					audioStream
						.getAudioTracks()
						.forEach((audioTrack) => stream.addTrack(audioTrack));
				}
				mediaStream.current = stream;
			} else {
				const stream =
					await window.navigator.mediaDevices.getUserMedia(
						requiredMedia
					);
				mediaStream.current = stream;
			}

			if (mediaStream.current) {
				// videoPreviewStream.current = new MediaStream(
				// 	mediaStream.current.getVideoTracks()
				// );
			}
			setStatus("idle");
		} catch (error) {
			setError(error.name);
			setStatus("idle");
		}
	}, [audio, video, screen]);

	useEffect(() => {
		if (!window.MediaRecorder) {
			throw new Error("Unsupported Browser");
		}

		if (screen) {
			if (!window.navigator.mediaDevices.getDisplayMedia) {
				throw new Error(
					"This browser doesn't support screen capturing"
				);
			}
		}

		const checkConstraints = (mediaType) => {
			const supportedMediaConstraints =
				navigator.mediaDevices.getSupportedConstraints();
			const unSupportedConstraints = Object.keys(mediaType).filter(
				(constraint) => !supportedMediaConstraints[constraint]
			);

			if (unSupportedConstraints.length > 0) {
				console.error(
					`The constraints ${unSupportedConstraints.join(
						","
					)} doesn't support on this browser. Please check your ReactMediaRecorder component.`
				);
			}
		};

		if (typeof audio === "object") {
			checkConstraints(audio);
		}
		if (typeof video === "object") {
			checkConstraints(video);
		}

		if (mediaRecorderOptions && mediaRecorderOptions.mimeType) {
			if (!MediaRecorder.isTypeSupported(mediaRecorderOptions.mimeType)) {
				console.error(
					`The specified MIME type you supplied for MediaRecorder doesn't support this browser`
				);
			}
		}

		if (!mediaStream.current && askPermissionOnMount) {
			getMediaStream();
		}

		return () => {
			if (mediaStream.current) {
				const tracks = mediaStream.current.getTracks();
				tracks.forEach((track) => track.clone().stop());
			}
		};
	}, [
		audio,
		screen,
		video,
		getMediaStream,
		mediaRecorderOptions,
		askPermissionOnMount,
	]);

	// Media Recorder Handlers

	const startRecording = async () => {
		setError("NONE");
		if (!mediaStream.current) {
			await getMediaStream();
		}
		if (mediaStream.current) {
			const isStreamEnded = mediaStream.current
				.getTracks()
				.some((track) => track.readyState === "ended");
			if (isStreamEnded) {
				await getMediaStream();
			}

			// User blocked the permissions (getMediaStream errored out)
			if (!mediaStream.current.active) {
				return;
			}
			mediaRecorder.current = new MediaRecorder(
				mediaStream.current,
				mediaRecorderOptions || undefined
			);
			mediaRecorder.current.ondataavailable = onRecordingActive;
			mediaRecorder.current.onstop = onRecordingStop;
			mediaRecorder.current.onstart = onRecordingStart;
			mediaRecorder.current.onerror = () => {
				setError("NO_RECORDER");
				setStatus("idle");
			};
			mediaRecorder.current.start();
			setStatus("recording");
		}
	};

	const onRecordingActive = ({ data }) => {
		// mediaChunks.current.push(data);

		const blobProperty = Object.assign(
			{ type: data.type },
			blobPropertyBag ||
				(video ? { type: "video/mp4" } : { type: "audio/wav" })
		);

		// console.log(data, blobProperty);

		const blob = new Blob([data], blobProperty);
		const url = URL.createObjectURL(blob);

		setMediaBlobUrl(() => url);

		console.log("Chunk of data received; Total size: ", data.size, "bytes");
		// console.log("total chunks: ", mediaChunks.current.length);

		onDataAvailable(url, blob);
	};

	const requestData = () => {
		if (mediaRecorder.current) {
			mediaRecorder.current.requestData();
		}
	};

	const onRecordingStart = () => {
		onStart();
	};

	const onRecordingStop = () => {
		// console.log("onRecordingStop", mediaChunks.current.length);
		// // const [chunk] = mediaChunks.current;
		// // console.log("chunk", chunk);
		// const blobProperty = Object.assign(
		// 	// { type: chunk.type },
		// 	blobPropertyBag ||
		// 		(video ? { type: "video/mp4" } : { type: "audio/wav" })
		// );
		// const blob = new Blob(mediaChunks.current, blobProperty);
		// const url = URL.createObjectURL(blob);
		setStatus("stopped");
		// setMediaBlobUrl(url);
		mediaChunks.current = [];
		onStop();
	};

	const muteAudio = (mute) => {
		setIsAudioMuted(mute);
		if (mediaStream.current) {
			mediaStream.current
				.getAudioTracks()
				.forEach((audioTrack) => (audioTrack.enabled = !mute));
		}
	};

	const pauseRecording = () => {
		if (
			mediaRecorder.current &&
			mediaRecorder.current.state === "recording"
		) {
			setStatus("paused");
			mediaRecorder.current.pause();
		}
	};
	const resumeRecording = () => {
		if (mediaRecorder.current && mediaRecorder.current.state === "paused") {
			setStatus("recording");
			mediaRecorder.current.resume();
		}
	};

	const stopRecording = () => {
		if (mediaRecorder.current) {
			if (mediaRecorder.current.state !== "inactive") {
				setStatus("stopping");
				mediaRecorder.current.stop();
				if (stopStreamsOnStop) {
					mediaStream.current &&
						mediaStream.current
							.getTracks()
							.forEach((track) => track.stop());
				}
				// mediaChunks.current = [];
			}
		}
	};

	return {
		error: RecorderErrors[error],
		muteAudio: () => muteAudio(true),
		unMuteAudio: () => muteAudio(false),
		startRecording,
		pauseRecording,
		resumeRecording,
		stopRecording,
		mediaBlobUrl,
		status,
		isAudioMuted,
		previewStream: mediaRecorder.current
			? mediaRecorder.current.stream
			: null,
		clearBlobUrl: () => {
			if (mediaBlobUrl) {
				URL.revokeObjectURL(mediaBlobUrl);
			}
			setMediaBlobUrl(undefined);
			setStatus("idle");
		},
		requestData,
	};
}

export const ReactMediaRecorder = memo((props) =>
	props.render(useReactMediaRecorder(props))
);
