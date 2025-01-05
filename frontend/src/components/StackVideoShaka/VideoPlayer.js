import "./StackVideo.css";

import { forwardRef, useCallback, useEffect, useMemo, useRef } from "react";
import usePlaylistStore from "../../store/PlaylistStore";
import useVideoStore, {
	STATE_VIDEO_ERROR,
	STATE_VIDEO_LOADING,
	STATE_VIDEO_PLAY,
} from "../../store/VideoStore";

import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
} from "@mui/material";
import { useState } from "react";
import { SEEK_TYPE_MOVE } from "../../enums/seek_types";
import { VIDEO_PAUSE_MARKER } from "../../enums/video_pause_reasons";
import { VIDEO_VIEW_TEACHING_MODE } from "../../enums/video_view_modes";
import useShakaOfflineStore from "../../store/ShakaOfflineStore";
import useTimeStore from "../../store/TimeStore";
import { STATE_VIDEO_PAUSED } from "../../store/VideoStore";
import StreamStackItem from "./StreamStackItem";

const RecordingStatus = forwardRef(function MyComponent(props, ref) {
	return <div {...props} ref={ref}></div>;
});

function VideoPlayer() {
	const playerVideo = useRef(null);
	const [showDisclaimer, setShowDisclaimer] = useState(false);
	const [showRecordModal, setShowRecordModal] = useState(false);
	const [recordConsent, setRecordConsent] = useState(false);
	const [disclaimerHandled, setDisclaimerHandled] = useState(false);

	const [fullScreen, setFullScreen] = useVideoStore((state) => [
		state.fullScreen,
		state.setFullScreen,
	]);

	const [queue, popFromQueue] = usePlaylistStore((state) => [
		state.queue,
		state.popFromQueue,
		state.queueMetadata,
		state.setQueueMetadata,
	]);

	const [useDownloadedVideo, downloadProgress] = useShakaOfflineStore(
		(state) => [state.useDownloadedVideo, state.downloadProgress]
	);

	const [
		currentVideo,
		setCurrentVideo,
		videoState,
		setVideoState,
		playlistState,
		setPlaylistState,
		addToSeekQueue,
		setPauseReason,
		setCurrentMarkerIdx,
		setVideoStarted,
	] = useVideoStore((state) => [
		state.currentVideo,
		state.setCurrentVideo,
		state.videoState,
		state.setVideoState,
		state.playlistState,
		state.setPlaylistState,
		state.addToSeekQueue,
		state.setPauseReason,
		state.setCurrentMarkerIdx,
		state.setVideoStarted,
	]);

	const [setCurrentTime] = useTimeStore((state) => [state.setCurrentTime]);

	const [
		recordingStart,
		setRecordingStart,
		recordingPlaying,
		setRecordingPlaying,
		addToRecordingControlQueue,
	] = useVideoStore((state) => [
		state.recordingStart,
		state.setRecordingStart,
		state.recordingPlaying,
		state.setRecordingPlaying,
		state.addToRecordingControlQueue,
	]);

	const [videoStateVisible, setVideoStateVisible] = useState(false);

	useEffect(() => {
		setVideoStarted(false);

		if (currentVideo) {
			playerVideo.current = currentVideo;
		} else {
			playerVideo.current = null;
		}
	}, [currentVideo]);

	useEffect(() => {
		if (queue && queue.length > 0 && playlistState) {
			setCurrentVideo(queue[0]);
		} else {
			setCurrentVideo(null);
			setVideoState(STATE_VIDEO_PAUSED);
			setPlaylistState(false);
		}
	}, [
		queue,
		playlistState,
		setCurrentVideo,
		setVideoState,
		setPlaylistState,
	]);

	const handleReset = useCallback(() => {
		setCurrentMarkerIdx(null);
		setPauseReason(null);
		setCurrentTime(0);
		try {
			if (document.fullscreenElement) {
				if (document.exitFullscreen) {
					document
						.exitFullscreen()
						.then(() => {
							console.log("exited fullscreen mode");
						})
						.catch((err) => {
							console.error(err);
							toast.error("Failed to exit fullscreen mode");
						});
				} else if (document.mozCancelFullScreen) {
					document.mozCancelFullScreen();
				} else if (document.webkitExitFullscreen) {
					document.webkitExitFullscreen();
				} else if (document.msExitFullscreen) {
					document.msExitFullscreen();
				}
			}
		} catch (error) {
			console.log("Error exiting fullscreen mode", error);
		}
	}, [setCurrentMarkerIdx, setPauseReason, setCurrentTime]);

	const handleEnd = useCallback(() => {
		const state = useVideoStore.getState();
		let currentMarker =
			state.currentMarkerIdx !== null && state.markers
				? state.markers[state.currentMarkerIdx]
				: null;

		if (state.viewMode === VIDEO_VIEW_TEACHING_MODE) {
			if (currentMarker?.loop) {
				console.log(
					"VIDEO END : TEACHING MODE: moving to ",
					currentMarker
				);
				addToSeekQueue({
					t: currentMarker?.timestamp || 0,
					type: SEEK_TYPE_MOVE,
				});
				return;
			}
			console.log(
				"VIDEO END : TEACHING MODE: popping video, marker null"
			);
			handleReset();
			popFromQueue(0);
		} else {
			console.log("VIDEO END : STUDENT MODE: popping video");
			handleReset();
			popFromQueue(0);
		}
	}, [addToSeekQueue]);

	const handleSetPlay = useCallback(
		(isActive) => {
			if (isActive) {
				let state = useVideoStore.getState();
				let videoState = state.videoState;
				let markersLength = state?.markers?.length || 0;
				let currentMarkerIdx = state.currentMarkerIdx;
				let pauseReason = state.pauseReason;

				if (
					videoState === STATE_VIDEO_PAUSED &&
					pauseReason === VIDEO_PAUSE_MARKER
				) {
					setCurrentMarkerIdx((currentMarkerIdx + 1) % markersLength);
					setPauseReason(null);
				}

				if (videoState !== STATE_VIDEO_PLAY) {
					setVideoState(STATE_VIDEO_PLAY);
				}
			}
		},
		[setVideoState, setCurrentMarkerIdx, setPauseReason]
	);

	const handleSetPause = useCallback(
		(isActive) => {
			if (isActive) {
				setVideoState(STATE_VIDEO_PAUSED);
			}
		},
		[setVideoState]
	);

	const handleLoading = useCallback(
		(loading, isActive) => {
			if (isActive) {
				setVideoState(loading ? STATE_VIDEO_LOADING : STATE_VIDEO_PLAY);
			}
		},
		[handleSetPlay, setVideoState]
	);

	const handlePlaybackError = useCallback(() => {
		if (useVideoStore.getState().isActive) {
			setVideoState(STATE_VIDEO_ERROR);
		}
	}, [setVideoState]);

	const handleStartPlaylist = useCallback(() => {
		if (currentVideo === null && queue.length > 0) {
			setShowDisclaimer(true);
		}
	}, [currentVideo, queue]);

	const scrollToPlaylists = useCallback(() => {
		document
			.getElementById("playlist-section")
			?.scrollIntoView({ behavior: "smooth" });
	}, []);

	const handleConfirmDisclaimer = useCallback(() => {
		setShowDisclaimer(false);
		setDisclaimerHandled(true);
	}, []);

	const handleRejectDisclaimer = useCallback(() => {
		setShowDisclaimer(false);
	}, []);

	const handleConfirmRecord = useCallback(() => {
		setRecordConsent(true);
		setShowRecordModal(false);
		setPlaylistState(true);
		addToRecordingControlQueue("RECORDING_PREVIEW");
	}, [setPlaylistState]);

	const handleRejectRecord = useCallback(() => {
		setRecordConsent(false);
		setShowRecordModal(false);
		setPlaylistState(true);
	}, [setPlaylistState]);

	const handleFullscreen = useCallback(() => {}, []);

	useEffect(() => {
		const handleFs = () => {
			if (document.fullscreenElement) {
				setFullScreen(true);
			} else {
				setFullScreen(false);
			}
		};
		document.body.addEventListener("fullscreenchange", handleFs);

		return () => {
			document.body.removeEventListener("fullscreenchange", handleFs);
		};
	}, []);

	useEffect(() => {
		if (disclaimerHandled && !recordingStart && !recordingPlaying) {
			setShowRecordModal(true);
			setDisclaimerHandled(false);
		} else if (disclaimerHandled && recordingStart && recordingPlaying) {
			// show start video
			setPlaylistState(true);
			setDisclaimerHandled(false);
		}
	}, [disclaimerHandled, recordingStart, recordingPlaying]);

	const handleDialogClose = useCallback(() => setShowRecordModal(false), []);

	const queueItem = useMemo(() => queue[0], [queue]);

	return (
		<div
			className={`hover:cursor-pointer bg-black w-full ${fullScreen ? "h-screen" : "h-auto rounded-xl overflow-hidden"}`}>
			<div
				className={`mx-auto aspect-video ${fullScreen ? "h-full" : ""}`}>
				{currentVideo ? (
					<>
						{videoState === STATE_VIDEO_ERROR ? (
							<div className="flex flex-col items-center justify-center gap-4 text-lg w-full h-full border border-red-500">
								<p>Error : Video playback error</p>
								<Button
									onClick={handleSetPlay}
									variant="contained">
									Refresh
								</Button>
							</div>
						) : (
							<>
								<div className="relative h-full w-full">
									{queue.length > 0 ? (
										<StreamStackItem
											key={queueItem.queue_id}
											updatedAt={
												queueItem?.video?.last_updated
											}
											video={queueItem}
											handleEnd={handleEnd}
											handleLoading={handleLoading}
											handlePlaybackError={
												handlePlaybackError
											}
											isActive={
												currentVideo?.queue_id ===
												queueItem?.queue_id
											}
											setVideoStateVisible={
												setVideoStateVisible
											}
											handleFullscreen={handleFullscreen}
										/>
									) : (
										<></>
									)}

									{fullScreen &&
									recordingStart &&
									recordingPlaying ? (
										<RecordingStatus className="absolute top-8 left-8 bg-red-500 w-4 h-4 rounded-full" />
									) : (
										<></>
									)}

									{useDownloadedVideo &&
									downloadProgress !== 1 ? (
										<div className="bg-red-500 bg-opacity-50 flex items-center justify-center z-[10000] text-white">
											<div className="flex flex-col gap-4">
												<p className="text-white">
													Downloading video...
												</p>
												<p className="text-white">
													{Math.round(
														downloadProgress * 100
													)}
													%
												</p>
											</div>
										</div>
									) : (
										<></>
									)}
								</div>
							</>
						)}
					</>
				) : queue.length > 0 ? (
					<div className="flex flex-col items-center justify-center gap-4 text-lg w-full h-full">
						{showDisclaimer ? (
							<>
								<div className="m-3">
									<p className="text-white">
										Disclaimer: This video is not medical
										advice. Providing accurate diagnosis
										through the website is not possible. So,
										do not use this video to avoid going to
										your own healthcare advisor or doctor.
									</p>
									<br />
									<p className="text-white">
										This video is only intended to show you
										the correct techniques for practising
										yoga and should not be used for
										self-diagnosis or self-treatment. At any
										time if you feel difficulty while
										practising, stop immediately and consult
										with your healthcare professional.
									</p>
								</div>
								<div className="flex flex-row gap-3">
									<Button
										onClick={handleConfirmDisclaimer}
										variant="contained">
										Yes
									</Button>
									<Button
										onClick={handleRejectDisclaimer}
										variant="contained">
										No
									</Button>
								</div>
							</>
						) : (
							<Button
								onClick={handleStartPlaylist}
								variant="contained">
								Start
							</Button>
						)}
					</div>
				) : (
					<div className="flex flex-col items-center justify-center gap-4 text-lg w-full h-full">
						<p className="text-white">Add playlists to practice!</p>
						<Button onClick={scrollToPlaylists} variant="contained">
							View Playlists
						</Button>
					</div>
				)}
			</div>

			<Dialog
				open={showRecordModal && !recordingStart && !recordingPlaying}
				onClose={handleDialogClose}>
				<DialogTitle>Record Yourself?</DialogTitle>
				<DialogContent>
					<p>
						Would you like to record yourself during this yoga
						session?
					</p>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleRejectRecord} color="primary">
						No
					</Button>
					<Button onClick={handleConfirmRecord} color="primary">
						Yes
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
}
export default VideoPlayer;
