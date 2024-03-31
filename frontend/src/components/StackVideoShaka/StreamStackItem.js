import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "shaka-player/dist/controls.css";
import {
	ShakaPlayerGoNext,
	ShakaPlayerGoPrev,
	ShakaPlayerGoSeekBackward,
	ShakaPlayerGoSeekForward,
	ShakaPlayerNextMarker,
	ShakaPlayerPrevMarker,
	ShakaPlayerToggleMode,
} from "../../lib/shaka-controls";
import usePlaylistStore from "../../store/PlaylistStore";
import useUserStore from "../../store/UserStore";
import useVideoStore, {
	STATE_VIDEO_ERROR,
	STATE_VIDEO_PAUSED,
	STATE_VIDEO_PLAY,
} from "../../store/VideoStore";
import useWatchHistoryStore from "../../store/WatchHistoryStore";
import { Fetch } from "../../utils/Fetch";
import { isMobileTablet } from "../../utils/isMobileOrTablet";
import ShakaPlayer from "./ShakaPlayer";

import shaka from "shaka-player/dist/shaka-player.ui";

function StreamStackItem({
	video,
	isActive,
	handleEnd,
	handleLoading,
	handlePlaybackError,
	setDuration,
	setVideoStateVisible,
}) {
	const playerRef = useRef(null);
	const user = useUserStore((state) => state.user);
	const commitTimeInterval = useRef(null);
	const flushTimeInterval = useRef(null);
	const [metadataLoaded, setMetadataLoaded] = useState(false);
	const [autoplayInitialized, setAutoplayInitialized] = useState(false);
	const [playerLoaded, setPlayerLoaded] = useState(false);

	const isActiveRef = useRef(isActive);

	useEffect(() => {
		isActiveRef.current = isActive;
		console.log({
			isActive,
			videoidx: video?.idx,
			isActiveRef: isActiveRef.current,
		});
	}, [isActive, video]);

	const [
		// seek queue
		seekQueue,
		popFromSeekQueue,
		addToSeekQueue,
		// current video
		currentVideo,
		// video state
		videoState,
		setVideoState,
		// current time
		setCurrentTime,
		// volume
		volume,
		setVolume,
		// autoplay initialized
		// autoplayInitialized,
		// setAutoplayInitialized,
		// video event
		videoEvent,
		setVideoEvent,
		// markers
		currentMarkerIdx,
		setCurrentMarkerIdx,
		autoSetCurrentMarkerIdx,
		markers,
		// view mode
		viewMode,
		setViewMode,
		// pause reason
		pauseReason,
		setPauseReason,
		// commitSeekTime
		commitSeekTime,
		setCommitSeekTime,
	] = useVideoStore((state) => [
		//
		state.seekQueue,
		state.popFromSeekQueue,
		state.addToSeekQueue,
		//
		state.currentVideo,
		//
		state.videoState,
		state.setVideoState,
		//
		state.setCurrentTime,
		//
		state.volume,
		state.setVolume,
		//
		// state.autoplayInitialized,
		// state.setAutoplayInitialized,
		//
		state.videoEvent,
		state.setVideoEvent,
		//
		state.currentMarkerIdx,
		state.setCurrentMarkerIdx,
		state.autoSetCurrentMarkerIdx,
		state.markers,
		//
		state.viewMode,
		state.setViewMode,
		//
		state.pauseReason,
		state.setPauseReason,
		//
		state.commitSeekTime,
		state.setCommitSeekTime,
	]);

	const [popFromQueue, popFromArchive] = usePlaylistStore((state) => [
		state.popFromQueue,
		state.popFromArchive,
	]);

	let [
		enableWatchHistory,
		setCommittedTs,
		addToCommittedTs,
		updateWatchTimeBuffer,
		watchTimeBuffer,
		appendToWatchTimeBuffer,
		setWatchTimeBuffer,
		flushWatchTimeBuffer,
	] = useWatchHistoryStore((state) => [
		state.enableWatchHistory,
		state.setCommittedTs,
		state.addToCommittedTs,
		state.updateWatchTimeBuffer,
		state.watchTimeBuffer,
		state.appendToWatchTimeBuffer,
		state.setWatchTimeBuffer,
		state.flushWatchTimeBuffer,
	]);

	const handleNextVideo = useCallback(() => {
		popFromQueue(0);
	}, [popFromQueue]);

	const handlePrevVideo = useCallback(() => {
		popFromArchive(-1);
	}, [popFromArchive]);

	const handleSeekFoward = useCallback(() => {
		addToSeekQueue({ t: 5, type: "seek" });
	}, [addToSeekQueue]);

	const handleSeekBackward = useCallback(() => {
		addToSeekQueue({ t: -5, type: "seek" });
	}, [addToSeekQueue]);

	const videoUrl = useMemo(() => {
		return (
			(video?.video?.asana_dash_url ||
				video?.video?.transition_dash_url) ??
			""
		);
	}, [video]);

	const playerOnError = useCallback(
		(e) => {
			//console.log("[StreamStackItem:error] Error playing video", e);
			setVideoState(STATE_VIDEO_ERROR);
			// alert(JSON.stringify({ err: e }));
		},
		[setVideoState]
	);

	const tryToPlay = useCallback(() => {
		if (!isActiveRef.current) return;

		console.log("Try to play called", video.idx);
		playerRef.current.videoElement
			.play()
			.then((res) => {
				console.log("Autoplay initialized", video.idx);
				if (volume === 0 && !autoplayInitialized) {
					//console.log("Setting volume to 0.5");
					setVolume(1);
					setAutoplayInitialized(true);
				}
			})
			.catch((err) => {
				console.error("Error autoplay : ", err, video.idx);
				// toast("Error playing video", { type: "error" });
				if (
					playerRef.current.videoElement !== null &&
					playerRef.current.videoElement !== undefined
				) {
					console.log("Trying to play using mute", video.idx);
					playerRef.current.videoElement.muted = true;
					playerRef.current.videoElement
						.play()
						.then((res) => {
							console.log(
								"Autoplay initialized after muting",
								video.idx
							);
							playerRef.current.videoElement.muted = false;
							if (volume === 0 && !autoplayInitialized) {
								setVolume(1);
								setAutoplayInitialized(true);
							}
						})
						.catch((err) => {
							console.error(
								"Error autoplay (with mute)",
								err,
								video.idx
							);
						});
				}
			});
	}, [autoplayInitialized, setAutoplayInitialized, setVolume, video, volume]);

	// pause and reset the video when its not active
	useEffect(() => {
		const pr = playerRef.current.videoElement;
		if (!isActive && pr && pr.currentTime > 0) {
			//console.log("PAUSE AND RESET ----------------------------->", video.idx);
			pr.muted = true;
			setVolume(0);
			pr?.pause();
			pr.currentTime = 0;
		}

		return () => {
			if (pr) {
				pr?.pause();
				pr.currentTime = 0;
			}
		};
	}, [isActive, video.queue_id, setVolume]);

	// if its active, set the duration
	useEffect(() => {
		if (isActive && metadataLoaded && playerLoaded) {
			console.log(
				"PLAYING ----------------------------->",
				video,
				video.video.id,
				playerRef?.current.videoElement
			);
		}
	}, [isActive, setDuration, metadataLoaded, video, playerLoaded]);

	// change play/pause based on video state
	useEffect(() => {
		console.log("VIDEO_STATE_CHANGE", {
			videoState,
			isActive,
			metadataLoaded,
			autoplayInitialized,
			idx: video.idx,
		});
		console.trace();
		if (
			isActive &&
			metadataLoaded &&
			playerRef.current !== null &&
			playerRef.current !== undefined
		) {
			setPauseReason(null);
			if (videoState === STATE_VIDEO_PAUSED) {
				console.log("useEffect : changing to pause", video.idx);
				playerRef.current.videoElement.pause();
			} else if (videoState === STATE_VIDEO_PLAY) {
				console.log("useEffect : changing to play", video.idx);
				tryToPlay();
			}
		}
	}, [
		video,
		metadataLoaded,
		videoState,
		isActive,
		autoplayInitialized,
		setAutoplayInitialized,
		setPauseReason,
		setVolume,
		tryToPlay,
	]);

	const playerInit = useCallback(
		(ref) => {
			if (ref !== null) {
				const check = isMobileTablet();
				const isMobile = { done: true, check: check };
				// console.log("Player init, setting loading to true", video?.idx);
				// setVideoState(STATE_VIDEO_LOADING);
				playerRef.current = ref;
				if (ref.ui) {
					shaka.ui.Controls.registerElement(
						"next",
						new ShakaPlayerGoNext.Factory(handleNextVideo)
					);

					shaka.ui.Controls.registerElement(
						"prev",
						new ShakaPlayerGoPrev.Factory(handlePrevVideo)
					);

					shaka.ui.Controls.registerElement(
						"seek_forward",
						new ShakaPlayerGoSeekForward.Factory(handleSeekFoward)
					);

					shaka.ui.Controls.registerElement(
						"seek_backward",
						new ShakaPlayerGoSeekBackward.Factory(
							handleSeekBackward
						)
					);

					shaka.ui.Controls.registerElement(
						"toggle_mode",
						new ShakaPlayerToggleMode.Factory()
					);

					shaka.ui.Controls.registerElement(
						"prev_marker",
						new ShakaPlayerPrevMarker.Factory()
					);

					shaka.ui.Controls.registerElement(
						"next_marker",
						new ShakaPlayerNextMarker.Factory()
					);

					playerRef.current.ui.configure({
						enableTooltips: true,
						doubleClickForFullscreen: true,
						seekOnTaps: true,
						tapSeekDistance: 5,
						enableKeyboardPlaybackControls: true,
						enableFullscreenOnRotation: true,
						keyboardSeekDistance: 5,
						controlPanelElements: [
							"prev",
							"prev_marker",
							"seek_backward",
							"play_pause",
							"seek_forward",
							"next_marker",
							"next",
							"spacer",
							"mute",
							"volume",
							"time_and_duration",
							"toggle_mode",
							"fullscreen",
						],
						seekBarColors: {
							base: "#FFFFFF",
							buffered: "#DDDDDD",
							played: "#FFBF00",
						},
						fastForwardRates: [2, 4, 8, 1],
						rewindRates: [-1, -2, -4, -8],
					});
				}

				if (ref.videoElement) {
					playerRef.current.videoElement.addEventListener(
						"seeking",
						(e) => {
							console.log("Seeking...");
							handleLoading(true);
						}
					);
					playerRef.current.videoElement.addEventListener(
						"seeked",
						(e) => {
							console.log("Seeked...");
							setVideoState(STATE_VIDEO_PLAY);
						}
					);

					playerRef.current.videoElement.addEventListener(
						"canplaythrough",
						(e) => {
							const state = useVideoStore.getState();
							console.log(
								"Can play through...",
								state.videoState
							);
							tryToPlay();
						}
					);

					playerRef.current.videoElement.addEventListener(
						"ended",
						handleEnd
					);
				}

				if (ref.player) {
					// events
					// playerRef.current.player.addEventListener(
					// 	"error",
					// 	playerOnError
					// );
					// playerRef.current.player.addEventListener(
					// 	"statechanged",
					// 	handleVideoStateChange
					// );
					playerRef.current.player.addEventListener("loading", () => {
						handleLoading(true);
					});

					playerRef.current.player.addEventListener("loaded", () => {
						handleLoading(false);
					});

					playerRef.current.player.configure(
						"manifest.dash.ignoreMinBufferTime",
						true
					);

					// stream settings
					playerRef.current.player.configure({
						streaming: {
							maxDisabledTime: 0,
							inaccurateManifestTolerance: 0,
							lowLatencyMode: true,
							bufferingGoal: 10,
							bufferBehind: 20,
							rebufferingGoal: 4,
							ignoreTextStreamFailures: true,
							stallThreshold: 3,
							segmentPrefetchLimit: 3,
							retryParameters: {
								maxAttempts: 3,
								timeout: 30000,
								connectionTimeout: 30000,
								stallTimeout: 15000,
							},
						},
					});

					//console.log("Fetching DRM Info");
					//fetch only if it is not a transition video
					if (
						!isNaN(video?.video?.id) &&
						typeof video?.video?.id === "number"
					) {
						//   if (!isNaN(video.video.id) && typeof video.video.id !== "number") {
						if (isMobile.check) {
							Fetch({
								url: "/playback/get-widevine-token",
								method: "POST",
								token: false,
							})
								.then((res) => {
									const data = res.data;
									// console.log(data);

									if (data && data.licenseAcquisitionUrl) {
										//console.log("DRM Info Received");
										// toast("DRM Info Received");
										// Mobile
										playerRef.current.player.configure({
											drm: {
												servers: {
													"com.widevine.alpha":
														data.licenseAcquisitionUrl,
												},
											},
										});

										//console.log("Trying to load video");
										playerRef.current.player
											.load(videoUrl)
											.then((res) => {
												//console.log("Video Loaded");
												setMetadataLoaded(true);
											})
											.catch((err) => {
												playerOnError(err);
											});
									}
								})
								.catch((err) => {
									console.log(
										"Error fetching DRM info :",
										err
									);
								});
						} else {
							Fetch({
								url: "/playback/get-playready-token",
								method: "POST",
								token: false,
							})
								.then((res) => {
									const data = res.data;
									if (
										data &&
										data.licenseAcquisitionUrl &&
										data.token
									) {
										// Non Mobile
										playerRef.current.player.configure({
											drm: {
												servers: {
													"com.microsoft.playready":
														data.licenseAcquisitionUrl +
														"?ExpressPlayToken=" +
														data.token,
												},
											},
										});

										playerRef.current.player
											.load(videoUrl)
											.then((res) => {
												setMetadataLoaded(true);
											})
											.catch((err) => {
												playerOnError(err);
											});
									}
								})
								.catch((err) => {
									console.log(
										"Error fetching DRM info :",
										err
									);
								});
						}
					} else {
						//console.log("no drm");
						playerRef.current.player
							.load(videoUrl)
							.then(() => {
								//console.log("Video Loaded");
								// setMetadataLoaded(true);
							})
							.catch(playerOnError);
					}
				}
			}

			setPlayerLoaded(true);
		},
		[
			video,
			videoUrl,
			handleNextVideo,
			handlePrevVideo,
			handleSeekFoward,
			handleSeekBackward,
			setVideoState,
			playerOnError,
		]
	);

	return (
		<div className={`h-full w-full ${isActive ? "block" : "hidden"}`}>
			<ShakaPlayer
				ref={playerInit}
				width="100%"
				height="100%"
				className="custom-shaka"
			/>
		</div>
	);
}

export default StreamStackItem;
