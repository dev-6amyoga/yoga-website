import { useCallback, useEffect, useRef, useState } from "react";
import shaka from "shaka-player/dist/shaka-player.ui";
import useVideoStore, {
	STATE_VIDEO_ERROR,
	STATE_VIDEO_PAUSED,
	STATE_VIDEO_PLAY,
} from "../../store/VideoStore";
import { isMobileTablet } from "../../utils/isMobileOrTablet";
import ShakaPlayer from "./ShakaPlayer";

import "shaka-player/dist/controls.css";
import {
	ShakaPlayerCustomPlayPause,
	ShakaPlayerFullscreen,
	ShakaPlayerGoNext,
	ShakaPlayerGoPrev,
	ShakaPlayerGoSeekBackward,
	ShakaPlayerGoSeekForward,
	ShakaPlayerNextMarker,
	ShakaPlayerPrevMarker,
	ShakaPlayerToggleMode,
	shakaClassModeUIConfig,
	shakaStreamConfig,
} from "../../lib/shaka-controls";
import usePlaylistStore from "../../store/PlaylistStore";
import { Fetch } from "../../utils/Fetch";

const emptyFn = () => {};

export default function ShakaPlayerWrapper({
	src,
	isDrm,
	handlePlayerLoaded = emptyFn,
	handlePlayerLoading = emptyFn,
	handleVideoSeeking = emptyFn,
	handleVideoSeeked = emptyFn,
	handleVideoVolumeChange = emptyFn,
	handleVideoCanPlayThrough = emptyFn,
	handleEnd = emptyFn,
	handleFullscreen = emptyFn,
	handleLoading = emptyFn,
	timingObjRef = { current: null },
}) {
	const playerRef = useRef(null);

	const isActiveRef = useRef(true);

	const [videoState, setVideoState, addToSeekQueue, setPauseReason] =
		useVideoStore((state) => [
			state.videoState,
			state.setVideoState,
			state.addToSeekQueue,
			state.setPauseReason,
		]);

	const [popFromQueue, popFromArchive] = usePlaylistStore((state) => [
		state.popFromQueue,
		state.popFromArchive,
	]);

	const [playerLoaded, setPlayerLoaded] = useState(false);
	const [metadataLoaded, setMetadataLoaded] = useState(false);

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

	const playerOnError = useCallback(
		(e) => {
			console.log("[StreamStackItem:error] Error playing video", e);
			setVideoState(STATE_VIDEO_ERROR);
			// alert(JSON.stringify({ err: e }));
		},
		[setVideoState]
	);

	useEffect(() => {
		console.log("VIDEO STATE", videoState);
		switch (videoState) {
			case STATE_VIDEO_PLAY:
				if (playerRef.current) {
					playerRef.current.videoElement.play();

					if (timingObjRef.current) {
						timingObjRef.current.update({ velocity: 1 });
					}
				}
				break;

			case STATE_VIDEO_PAUSED:
				if (playerRef.current) {
					playerRef.current.videoElement.pause();
					if (timingObjRef.current) {
						timingObjRef.current.update({ velocity: 0 });
					}
				}
				break;

			default:
				break;
		}
	}, [videoState]);

	const playerInit = useCallback(
		(ref) => {
			console.log("player init called", ref);
			if (ref != null) {
				// console.log("Player init, setting loading to true", video?.idx);
				// setVideoState(STATE_VIDEO_LOADING);
				playerRef.current = ref;

				// setPlayerRefSet({ done: true, ts: Date.now() });
				// player events

				const check = isMobileTablet();
				const isMobile = { done: true, check: check };
				console.log("Checking for isMobile", isMobile);

				if (playerRef.current.ui) {
					console.log("Setting up UI");
					shaka.ui.Controls.registerElement(
						"custom_play_pause",
						new ShakaPlayerCustomPlayPause.Factory()
					);
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
					shaka.ui.Controls.registerElement(
						"custom_fullscreen",
						new ShakaPlayerFullscreen.Factory(handleFullscreen)
					);

					playerRef.current.ui.configure(shakaClassModeUIConfig);
				}

				if (playerRef.current.videoElement) {
					console.log("Setting up videoElement events");
					playerRef.current.videoElement.addEventListener(
						"seeking",
						handleVideoSeeking
					);
					playerRef.current.videoElement.addEventListener(
						"seeked",
						handleVideoSeeked
					);

					playerRef.current.videoElement.addEventListener(
						"volumechange",
						handleVideoVolumeChange
					);

					playerRef.current.videoElement.addEventListener(
						"canplaythrough",
						handleVideoCanPlayThrough
					);

					playerRef.current.videoElement.addEventListener(
						"ended",
						handleEnd
					);
				}

				if (playerRef.current.player) {
					console.log("Setting up player events");
					playerRef.current.player.addEventListener(
						"loading",
						handlePlayerLoading
					);

					playerRef.current.player.addEventListener(
						"loaded",
						handlePlayerLoaded
					);

					playerRef.current.player.addEventListener(
						"statechange",
						(e) => {
							console.log(
								"State Change",
								e.newstate,
								isActiveRef.current === null
									? "null"
									: isActiveRef.current
							);
							if (isActiveRef.current) {
								switch (e.newstate) {
									case "buffering":
										handleLoading(
											true,
											isActiveRef.current
										);
										break;

									case "playing":
										// if (useVideoStore.getState().pauseReason === VIDEO_PAUSE_MARKER) {
										// 	setPauseReason(null);
										// }
										// setVideoState(STATE_VIDEO_PLAY);

										break;

									case "paused":
										// setVideoState(STATE_VIDEO_PAUSED);
										break;

									default:
										break;
								}
							}
						}
					);

					// playerRef.current.player.configure(
					// 	"manifest.dash.ignoreMinBufferTime",
					// 	true
					// );

					// stream settings
					playerRef.current.player.configure(shakaStreamConfig);

					//console.log("Fetching DRM Info");
					//fetch only if it is not a transition video

					if (isDrm) {
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
											.load(src)
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
							console.log("Fetching Playready Token");
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
											.load(src)
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
						console.log("no drm");
						playerRef.current.player
							.preload(src)
							.then((preloadManager) => {
								playerRef.current.player
									.load(preloadManager)
									.then(() => {
										//console.log("Video Loaded");
										setMetadataLoaded(true);
									})
									.catch(playerOnError);
							})
							.catch(playerOnError);
					}
				}

				setPlayerLoaded(true);
			}
		},
		[
			src,
			handleNextVideo,
			handlePrevVideo,
			handleSeekFoward,
			handleSeekBackward,
			playerOnError,
			handlePlayerLoaded,
			handlePlayerLoading,
			handleVideoSeeking,
			handleVideoSeeked,
			handleVideoVolumeChange,
			handleVideoCanPlayThrough,
			handleEnd,
			handleFullscreen,
			handleLoading,
			setVideoState,
		]
	);

	return <ShakaPlayer ref={playerInit} timingObjRef={timingObjRef} />;
}
