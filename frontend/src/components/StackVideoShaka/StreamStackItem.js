import { Box, Button, Modal, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "shaka-player/dist/controls.css";
import {
	SEEK_TYPE_MARKER,
	SEEK_TYPE_MOVE,
	SEEK_TYPE_SEEK,
} from "../../enums/seek_types";

import {
	ShakaPlayerFullscreen,
	ShakaPlayerGoNext,
	ShakaPlayerGoPrev,
	ShakaPlayerGoSeekBackward,
	ShakaPlayerGoSeekForward,
	ShakaPlayerNextMarker,
	ShakaPlayerPrevMarker,
	ShakaPlayerToggleMode,
	shakaStreamConfig,
	shakaUIConfig,
} from "../../lib/shaka-controls";
import usePlaylistStore from "../../store/PlaylistStore";
import useUserStore from "../../store/UserStore";
import useVideoStore, {
	STATE_VIDEO_ERROR,
	STATE_VIDEO_LOADING,
	STATE_VIDEO_PAUSED,
	STATE_VIDEO_PLAY,
} from "../../store/VideoStore";
import useWatchHistoryStore from "../../store/WatchHistoryStore";
import { Fetch } from "../../utils/Fetch";
import { isMobileTablet } from "../../utils/isMobileOrTablet";
import ShakaPlayer from "./ShakaPlayer";

import shaka from "shaka-player/dist/shaka-player.ui";

// import shakaLog from "shaka-player/dist/shaka-player"
import { VIDEO_EVENT_PLAY_INACTIVE } from "../../enums/video_event";
import { VIDEO_PAUSE_MARKER } from "../../enums/video_pause_reasons";
import { VIDEO_VIEW_STUDENT_MODE } from "../../enums/video_view_modes";
import useShakaOfflineStore from "../../store/ShakaOfflineStore";
import useTimeStore from "../../store/TimeStore";

// shakaL.log.setLogLevel(shaka.log.Level.V1);

function StreamStackItem({
	video,
	updatedAt,
	isActive,
	handleEnd,
	handleLoading,
	handlePlaybackError,
	setDuration,
	setVideoStateVisible,
	handleFullscreen,
}) {
	const playerRef = useRef(null);
	const storageRef = useRef(null);
	const user = useUserStore((state) => state.user);
	const commitTimeInterval = useRef(null);
	const flushTimeInterval = useRef(null);
	const [metadataLoaded, setMetadataLoaded] = useState(false);
	const [autoplayInitialized, setAutoplayInitialized] = useState(false);
	const [playerLoaded, setPlayerLoaded] = useState(false);
	const [drmConfig1, setDrmConfig] = useState({});
	const shakaOfflineStore = useShakaOfflineStore(
		(state) => state.shakaOfflineStore
	);

	const [open, setOpen] = useState(false);

	// Function to close the modal
	const handleClose = () => setOpen(false);

	// useEffect(() => {
	// 	if (!playerRef.current) return;
	// 	storageRef.current = new shaka.offline.Storage(
	// 		playerRef.current.player
	// 	);
	// 	console.log("[OFFLINE] storage setup");
	// 	return () => {
	// 		if (storageRef.current) {
	// 			storageRef.current.destroy();
	// 			storageRef.current = null;
	// 		}
	// 	};
	// }, []);

	const videoUrl = useMemo(() => {
		return (
			(video?.video?.asana_dash_url ||
				video?.video?.transition_dash_url ||
				video?.video?.playlist_dash_url) ??
			""
		);
	}, [video]);

	const videoTitle = useMemo(() => {
		return (
			(video?.video?.asana_name ||
				video?.video?.transition_video_name ||
				video?.video?.playlist_name) ??
			""
		);
	}, [video]);

	const isActiveRef = useRef(isActive);

	useEffect(() => {
		isActiveRef.current = isActive;
		if (isActive) {
			console.log(
				"IS ACTIVE",
				video?.idx,
				playerRef.current.videoElement.currentTime
			);
		}
		console.log({
			isActive,
			videoidx: video?.idx,
			isActiveRef: isActiveRef.current,
		});
	}, [isActive, video]);

	useEffect(() => {
		return () => {
			if (playerRef.current.player) {
				console.log("Unloading video");
				playerRef.current.player.unload();
			}
		};
	}, []);

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
		// volume
		volume,
		setVolume,
		// autoplay initialized
		// autoplayInitialized,
		// setAutoplayInitialized,
		// video event
		videoEvent,
		setVideoEvent,
		clearVideoEvent,
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
		// devmode
		devMode,
		// fullScreen
		fullScreen,

		// videoStarted
		videoStarted,
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
		state.volume,
		state.setVolume,
		//
		// state.autoplayInitialized,
		// state.setAutoplayInitialized,
		//
		state.videoEvent,
		state.setVideoEvent,
		state.clearVideoEvent,
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
		//
		state.devMode,
		//
		state.fullScreen,

		//
		state.videoStarted,
	]);

	const [popFromQueue, popFromArchive] = usePlaylistStore((state) => [
		state.popFromQueue,
		state.popFromArchive,
	]);

	const [setCurrentTime] = useTimeStore((state) => [state.setCurrentTime]);

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

	const tryToPlay = useCallback(() => {
		// toast(`Try to play called : ${isActiveRef.current}`, { type: "info" });
		if (!isActiveRef.current) return;

		console.log("Try to play called", video.idx, Date.now());
		playerRef.current.videoElement
			.play()
			.then((res) => {
				console.log("Autoplay initialized", video.idx);
				if (volume === 0 && !autoplayInitialized) {
					console.log("Setting volume to 0.5");
					playerRef.current.videoElement.muted = false;
					playerRef.current.videoElement.volume = 1;
					setAutoplayInitialized(true);
				} else {
					console.log("Setting volume to ", volume);
					playerRef.current.videoElement.muted = false;
					// playerRef.current.videoElement.volume = volume;
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
								console.log("Setting volume to 1");
								playerRef.current.videoElement.muted = false;
								playerRef.current.videoElement.volume = 1;
								setAutoplayInitialized(true);
							} else {
								console.log("Setting volume to ", volume);
								playerRef.current.videoElement.muted = false;
								// playerRef.current.videoElement.volume = volume;
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
	}, [autoplayInitialized, setAutoplayInitialized, video]);

	// pause and reset the video when its not active
	useEffect(() => {
		const pr = playerRef.current.videoElement;
		if (!isActive && pr && pr.currentTime > 0) {
			//console.log("PAUSE AND RESET ----------------------------->", video.idx);
			pr.muted = true;
			setVolume(0);
			// pr.currentTime = 0.04;
			pr.pause();
			// pr.currentTime = 0;
		}

		return () => {
			if (pr && !isActive) {
				// pr.currentTime = 0;
			}
			pr?.pause();
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
			if (playerRef.current.videoElement.currentTime > 0.0) {
				playerRef.current.videoElement.currentTime = 0.0;
				setCommitSeekTime(0.0);
			}
		}
	}, [
		isActive,
		setDuration,
		metadataLoaded,
		video,
		playerLoaded,
		setCommitSeekTime,
	]);

	// change play/pause based on video state
	useEffect(() => {
		console.log("VIDEO_STATE_CHANGE", {
			videoState,
			isActive,
			metadataLoaded,
			autoplayInitialized,
			idx: video.idx,
		});
		// console.trace();
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

	// pop from seek queue and update the time
	useEffect(() => {
		if (isActive && seekQueue.length > 0) {
			const seekEvent = seekQueue[0];
			console.log("SEEKING --->", seekEvent);
			// setVideoState(STATE_VIDEO_PLAY)
			// setPauseReason(null)
			if (seekEvent && playerRef.current) {
				switch (seekEvent.type) {
					case SEEK_TYPE_SEEK:
						let ct =
							playerRef.current.videoElement.currentTime +
							seekEvent.t;
						if (ct > playerRef.current.videoElement.duration) {
							handleEnd();
							popFromSeekQueue(0);
							return;
						}
						if (ct < 0) ct = 0;

						playerRef.current.videoElement.currentTime = ct;
						// console.log(
						//   "SEEKING ----------------------------->",
						//   playerRef.current.videoElement.currentTime
						// );
						setCommitSeekTime(ct);
						// autoSetCurrentMarkerIdx(playerRef.current?.currentTime)
						// popFromSeekQueue(0)
						break;
					case SEEK_TYPE_MOVE:
						let st = seekEvent.t < 0 ? 0 : seekEvent.t;
						if (st > playerRef.current.videoElement.duration) {
							handleEnd();
							popFromSeekQueue(0);
							return;
						}

						playerRef.current.videoElement.currentTime = st;
						// console.log(
						//   "SEEKING ----------------------------->",
						//   playerRef.current.videoElement.currentTime
						// );
						setCommitSeekTime(st);
						// autoSetCurrentMarkerIdx(playerRef.current?.currentTime)
						// popFromSeekQueue(0)
						break;
					case SEEK_TYPE_MARKER:
						if (
							seekEvent.t >
							playerRef.current.videoElement.duration
						) {
							handleEnd();
							popFromSeekQueue(0);
							return;
						}

						playerRef.current.videoElement.currentTime =
							seekEvent.t;
						// popFromSeekQueue(0)
						setCommitSeekTime(seekEvent.t);
						break;
					default:
						break;
				}
				addToCommittedTs(playerRef.current?.videoElement.currentTime);
			}
		}
	}, [
		isActive,
		seekQueue,
		popFromSeekQueue,
		addToCommittedTs,
		setVideoEvent,
		setCurrentMarkerIdx,
		autoSetCurrentMarkerIdx,
		setCommitSeekTime,
		setVideoState,
		setPauseReason,
		popFromQueue,
		handleEnd,
	]);

	// poll to update the current time, every 20ms, clear the timeout on unmount
	useEffect(() => {
		const checkSeek = (ct) => {
			// check if seekQueue length is greater than 0,
			// check if the current time is === to the marker time
			// console.log("Checking seek", ct, commitSeekTime, seekQueue.length);
			if (
				seekQueue.length > 0 &&
				commitSeekTime.toFixed(0) === ct.toFixed(0)
			) {
				if (isActive) handleLoading(false, isActive);
				autoSetCurrentMarkerIdx(commitSeekTime);
				return true;
			} else {
				return false;
			}
		};

		const checkPauseOrLoop = (ct) => {
			// console.log("checkPauseOrLoop : ", ct, viewMode);
			if (viewMode === VIDEO_VIEW_STUDENT_MODE) {
				// console.log("STUDENT --------->");
				return false;
			} else {
				// console.log("TEACHER --------->");
				// either pause or loop
				let currentMarker = markers[currentMarkerIdx];

				if (currentMarkerIdx === markers.length - 1) {
					return false;
				} else if (ct > markers[currentMarkerIdx + 1]?.timestamp) {
					if (currentMarker.loop) {
						console.log("LOOPING CUZ OF MARKER");
						addToSeekQueue({
							type: SEEK_TYPE_MARKER,
							t: currentMarker.timestamp,
						});
						return true;
					} else {
						console.log("PAUSING CUZ OF MARKER");
						setVideoState(STATE_VIDEO_PAUSED);
						setPauseReason(VIDEO_PAUSE_MARKER);
						return true;
					}
				}
			}
		};

		const int = setInterval(() => {
			if (playerRef.current?.videoElement?.currentTime && isActive) {
				if (checkSeek(playerRef.current?.videoElement?.currentTime)) {
					popFromSeekQueue(0);
					setVideoState(STATE_VIDEO_PLAY);
					return;
				}

				// pause if currenttime is greater than the timestamp of next?
				if (
					videoState !== STATE_VIDEO_LOADING &&
					checkPauseOrLoop(
						playerRef.current?.videoElement?.currentTime
					)
				) {
					return;
				}

				if (
					videoState !== STATE_VIDEO_LOADING ||
					videoState !== STATE_VIDEO_ERROR ||
					videoState !== STATE_VIDEO_PAUSED
				) {
					autoSetCurrentMarkerIdx(
						playerRef.current?.videoElement?.currentTime
					);
				}

				// before 0.05 seconds of video end, add a video event
				// to play the inactive video
				// console.log(
				// 	"VIDEO_EVENT_PLAY_INACTIVE : ",
				// 	playerRef.current?.videoElement?.currentTime -
				// 		playerRef.current?.videoElement?.duration
				// );
				if (
					viewMode === VIDEO_VIEW_STUDENT_MODE &&
					playerRef.current?.videoElement?.duration -
						playerRef.current?.videoElement?.currentTime <
						0.1
				) {
					console.log("VIDEO_EVENT_PLAY_INACTIVE");
					if (videoEvent.length === 0) {
						console.log(
							"[StreamStackItem] Video event play inactive",
							{
								currentTime:
									playerRef.current?.videoElement
										?.currentTime,
								duration:
									playerRef.current?.videoElement?.duration,
							}
						);
						setVideoEvent({
							t: VIDEO_EVENT_PLAY_INACTIVE,
						});
					}
				}

				setCurrentTime(playerRef.current?.videoElement?.currentTime);
				setVolume(playerRef.current?.videoElement?.volume);
			}
		}, 50);

		return () => {
			// console.log('CLEANING INTERVAL --------------------------------------->')
			clearInterval(int);
		};
	}, [
		currentVideo,
		isActive,
		setCurrentTime,
		videoState,
		popFromSeekQueue,
		autoSetCurrentMarkerIdx,
		seekQueue,
		setVideoEvent,
		setCurrentMarkerIdx,
		markers,
		viewMode,
		currentMarkerIdx,
		setVideoState,
		addToSeekQueue,
		commitSeekTime,
		setPauseReason,
		handleLoading,
		setVolume,
		videoEvent,
	]);

	const flushWatchTimeBufferE = useCallback(
		(user_id) => {
			const watch_time_logs = [...watchTimeBuffer];

			// console.log({ watch_time_logs });
			if (watch_time_logs.length === 0) {
				return;
			}

			Fetch({
				url: "/watch-time/update",
				method: "POST",
				token: true,
				data: {
					user_id: user_id,
					watch_time_logs,
					institute_id: null,
				},
			})
				.then((res) => {
					if (res.status === 200) {
						console.log("watch time buffer flushed");
					}
				})
				.catch((err) => {
					console.log(err);
					localStorage.setItem(
						"6amyoga_watch_time_logs",
						JSON.stringify(watch_time_logs)
					);
					appendToWatchTimeBuffer(watch_time_logs);
				});

			setWatchTimeBuffer([]);
		},
		[appendToWatchTimeBuffer, watchTimeBuffer, setWatchTimeBuffer]
	);

	useEffect(() => {
		console.log("Watch time useEffect : ", enableWatchHistory);
		if (isActive && enableWatchHistory && user && video) {
			console.log("setting up stuff");
			// console.log('CURRENT VIDEO', video)
			// flushing
			flushWatchTimeBuffer(user?.user_id);

			// resetting committedTs
			// setCommittedTs(0);

			// clearing previous interval to flush
			if (flushTimeInterval.current) {
				clearInterval(flushTimeInterval.current);
			}

			// clearing previous commitTimeInterval
			if (commitTimeInterval.current) {
				clearInterval(commitTimeInterval.current);
			}

			// TODO : send to watch history
			// Fetch({
			// 	url: "/watch-history/create",
			// 	method: "POST",
			// 	// TODO : fix thiss
			// 	data: {
			// 		user_id: user?.user_id,
			// 		asana_id: video?.video?.id,
			// 		playlist_id: video?.video?.playlist_id,
			// 	},
			// })
			// 	.then((res) => {
			// 		console.log("watch history created", res.data);
			// 	})
			// 	.catch((err) => {
			// 		console.log(err);
			// 	});
			console.log("Starting watch time intervals!");
			// starting interval timer to flush watch duration buffer
			flushTimeInterval.current = setInterval(() => {
				flushWatchTimeBuffer(user?.user_id, video?.video?.playlist_id);
				// flushWatchTimeBufferE(user?.user_id);
			}, 7000);

			// starting interval timer to commit time
			commitTimeInterval.current = setInterval(() => {
				// TODO : fix this
				updateWatchTimeBuffer({
					user_id: user?.user_id,
					asana_id: video?.video?.id,
					playlist_id: video?.video?.playlist_id,
					currentTime: playerRef?.current?.videoElement?.currentTime,
				});
				console.log(
					"WATCH HISTORY ct : ",
					playerRef?.current?.videoElement?.currentTime
				);
				addToCommittedTs(
					playerRef?.current?.videoElement?.currentTime ?? 0
				);
			}, 3500);
		} else {
			if (flushTimeInterval.current) {
				clearInterval(flushTimeInterval.current);
			}

			if (commitTimeInterval.current) {
				clearInterval(commitTimeInterval.current);
			}
		}

		return () => {
			console.log("Clearing watch time intervals!");
			if (flushTimeInterval.current) {
				clearInterval(flushTimeInterval.current);
			}

			if (commitTimeInterval.current) {
				clearInterval(commitTimeInterval.current);
			}
		};
	}, [
		isActive,
		enableWatchHistory,
		user,
		video,
		updateWatchTimeBuffer,
		addToCommittedTs,
		setCommittedTs,
		flushWatchTimeBuffer,
	]);

	// video events to play inactive video
	useEffect(() => {
		if (videoEvent.length > 0 && !isActive) {
			const event = videoEvent[0];
			if (event?.t === VIDEO_EVENT_PLAY_INACTIVE) {
				console.log("[DASH PLAYER] : [INACTIVE] play event received");
				// play the video
				playerRef?.current?.videoElement.play();
			}
			clearVideoEvent();
		}
	}, [videoEvent, isActive, clearVideoEvent, setVideoState]);

	const handlePlayerLoading = useCallback(
		(e) => {
			handleLoading(true, isActiveRef.current);
		},
		[handleLoading]
	);

	const handlePlayerLoaded = useCallback(
		(e) => {
			handleLoading(false, isActiveRef.current);
		},
		[handleLoading]
	);

	const handlePlayerStateChange = useCallback(
		(e) => {
			console.log(
				"State Change",
				e.newstate,
				isActiveRef.current === null ? "null" : isActiveRef.current
			);
			if (isActiveRef.current) {
				switch (e.newstate) {
					case "buffering":
						handleLoading(true, isActiveRef.current);
						break;

					case "playing":
						// if (useVideoStore.getState().pauseReason === VIDEO_PAUSE_MARKER) {
						// 	setPauseReason(null);
						// }
						setVideoState(STATE_VIDEO_PLAY);
						break;

					case "paused":
						// setVideoState(STATE_VIDEO_PAUSED);
						break;

					default:
						break;
				}
			}
		},
		[handleLoading, setVideoState]
	);

	// video events
	const handleVideoSeeking = useCallback(
		(e) => {
			console.log("Seeking...", e.target.currentTime); // Log current time and seek reason
			handleLoading(true, isActiveRef.current);
		},
		[handleLoading]
	);

	const handleVideoSeeked = useCallback(
		(e) => {
			console.log("Seeked...");
			setVideoState(STATE_VIDEO_PLAY);
		},
		[setVideoState]
	);

	const handleVideoCanPlayThrough = useCallback((e) => {
		const state = useVideoStore.getState();
		console.log("Can play through...", state.videoState);
		// tryToPlay();

		if (!state.videoStarted) state.setVideoStarted(true);
	}, []);

	// set the volume
	const handleVideoVolumeChange = useCallback(() => {
		if (playerRef.current !== null && playerRef.current.videoElement) {
			setVolume(playerRef.current.videoElement.volume || 0);
		}
	}, [setVolume]);

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

	const loadVideo = useCallback(
		async (isDrm, lastUpdated) => {
			try {
				let offlineRecord = await shakaOfflineStore.get(videoUrl);
				let offlineUri = offlineRecord?.offlineUri;
				const savedTimestamp = await showAllRecords(videoUrl);
				console.log(isDrm, lastUpdated, savedTimestamp);

				const unixDate = new Date(savedTimestamp);

				const isoDate = new Date(lastUpdated);

				if (
					savedTimestamp &&
					lastUpdated &&
					isoDate.getTime() > unixDate.getTime()
				) {
					console.log(
						"[StreamStackItem:loadVideo] Video is outdated. Redownloading..."
					);
					offlineUri = null;
				}

				if (!offlineUri) {
					setOpen(true);
					if (isDrm) {
						console.log(
							"[StreamStackItem:loadVideo] DRM video detected. Processing..."
						);
						offlineUri = await handleDrmDownload(
							videoUrl,
							videoTitle
						);
					} else {
						console.log(
							"[StreamStackItem:loadVideo] Non-DRM video detected. Downloading..."
						);
						offlineUri = await handleNonDrmDownload(
							videoUrl,
							videoTitle
						);
					}

					if (offlineUri) {
						await saveDownloadTimestamp(videoUrl, Date.now());
					}
				}

				if (offlineUri) {
					console.log(
						"[StreamStackItem:loadVideo] Loading offline URI:",
						offlineUri
					);
					await playerRef.current.player.load(offlineUri);
				} else {
					console.warn(
						"[StreamStackItem:loadVideo] No offline URI. Falling back to online URL."
					);
					await playerRef.current.player.load(videoUrl);
				}

				setMetadataLoaded(true);
				console.log(
					"[StreamStackItem:loadVideo] Video loaded successfully."
				);
			} catch (error) {
				console.error(
					"[StreamStackItem:loadVideo] Error loading video:",
					error
				);
				playerOnError(error);
			}
		},
		[
			playerOnError,
			videoUrl,
			videoTitle,
			shakaOfflineStore,
			setMetadataLoaded,
		]
	);

	const handleDrmDownload = async (videoUrl, videoTitle) => {
		try {
			const drmResponse = await Fetch({
				url: "/playback/get-widevine-token",
				method: "POST",
				token: false,
			});
			const drmConfig = drmResponse.data;
			const offlineVideo = await shakaOfflineStore.store(
				videoUrl,
				videoTitle,
				drmConfig
			);
			if (offlineVideo?.offlineUri) {
				await saveDownloadTimestamp(videoUrl, Date.now());
			}
			return offlineVideo?.offlineUri;
		} catch (error) {
			console.error(
				"[handleDrmDownload] Error fetching DRM info:",
				error
			);
			throw error;
		}
	};

	const handleNonDrmDownload = async (videoUrl, videoTitle) => {
		try {
			const offlineVideo = await shakaOfflineStore.store(
				videoUrl,
				videoTitle
			);
			if (offlineVideo?.offlineUri) {
				await saveDownloadTimestamp(videoUrl, Date.now());
			}
			return offlineVideo?.offlineUri;
		} catch (error) {
			console.error(
				"[handleNonDrmDownload] Error downloading video:",
				error
			);
			throw error;
		}
	};

	const saveDownloadTimestamp = async (videoUrl, timestamp) => {
		const db = await openDatabase();
		const transaction = db.transaction("video_metadata", "readwrite");
		const store = transaction.objectStore("video_metadata");
		store.put({ videoUrl, downloadedAt: timestamp });
		await transaction.complete;
	};

	const showAllRecords = async (videoUrl) => {
		try {
			const db = await openDatabase();
			const transaction = db.transaction("video_metadata", "readonly");
			const store = transaction.objectStore("video_metadata");

			return new Promise((resolve, reject) => {
				const cursorRequest = store.openCursor();

				cursorRequest.onsuccess = (event) => {
					const cursor = event.target.result;
					if (cursor) {
						records.push(cursor.value);
						cursor.continue();
					} else {
						for (let i = 0; i < records.length; i++) {
							if (records[i].videoUrl === videoUrl) {
								resolve(records[i].downloadedAt);
								return;
							}
						}
						resolve(null);
					}
				};

				cursorRequest.onerror = (event) => {
					reject("Error fetching records: " + event.target.error);
				};
			});
		} catch (error) {
			console.error("Error opening database or fetching records:", error);
			return null;
		}
	};

	const openDatabase = () => {
		return new Promise((resolve, reject) => {
			const request = indexedDB.open("VideoStoreDB", 1);
			request.onupgradeneeded = (event) => {
				const db = event.target.result;
				if (!db.objectStoreNames.contains("video_metadata")) {
					db.createObjectStore("video_metadata", {
						keyPath: "videoUrl",
					});
				}
			};
			request.onsuccess = (event) => resolve(event.target.result);
			request.onerror = (event) => reject(event.target.error);
		});
	};

	const setupUI = useCallback(() => {
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
			new ShakaPlayerGoSeekBackward.Factory(handleSeekBackward)
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
	}, [
		handleFullscreen,
		handleNextVideo,
		handlePrevVideo,
		handleSeekBackward,
		handleSeekFoward,
	]);

	const setupVideoElement = useCallback(() => {
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

		playerRef.current.videoElement.addEventListener("ended", handleEnd);
	}, [
		handleVideoSeeking,
		handleVideoSeeked,
		handleVideoVolumeChange,
		handleVideoCanPlayThrough,
		handleEnd,
	]);

	const setupEventListeners = useCallback(() => {
		playerRef.current.player.addEventListener(
			"loading",
			handlePlayerLoading
		);

		playerRef.current.player.addEventListener("loaded", handlePlayerLoaded);

		playerRef.current.player.addEventListener(
			"statechange",
			handlePlayerStateChange
		);
	}, [handlePlayerLoading, handlePlayerLoaded, handleLoading, setVideoState]);

	const playerInit = useCallback(
		async (ref) => {
			console.log("player init called", ref);
			if (ref != null) {
				playerRef.current = ref;
				const check = isMobileTablet();
				const isMobile = { done: true, check: check };
				console.log("Checking for isMobile", isMobile);
				if (playerRef.current.ui) {
					console.log("Setting up UI");
					setupUI();

					playerRef.current.ui.configure(shakaUIConfig);
				}

				if (playerRef.current.videoElement) {
					console.log("Setting up videoElement events");
					setupVideoElement();
				}

				if (playerRef.current.player) {
					console.log("Setting up player events");
					setupEventListeners();

					// playerRef.current.player.configure(
					// 	"manifest.dash.ignoreMinBufferTime",
					// 	true
					// );

					// stream settings
					playerRef.current.player.configure(shakaStreamConfig);

					//console.log("Fetching DRM Info");
					//fetch only if it is not a transition video

					if (
						(!isNaN(video?.video?.id) &&
							typeof video?.video?.id === "number" &&
							video?.video?.drm_video) ||
						String(video?.video?.transition_video_name)
							.toLowerCase()
							.search(/(drm)/) !== -1 ||
						video?.video?.drm_playlist
					) {
						//   if (!isNaN(video.video.id) && typeof video.video.id !== "number") {
						// TODO : defaults to widevine here right now
						if (!isMobile.check) {
							loadVideo(true, updatedAt);
							console.log(
								"[StreamStackItem:playerInit] Fetching Widevine Token"
							);
							Fetch({
								url: "/playback/get-widevine-token",
								method: "POST",
								token: false,
							})
								.then(async (res) => {
									const data = res.data;
									console.log(data);
									setDrmConfig(data);
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
									}
								})
								.catch((err) => {
									console.log(
										"Error fetching DRM info :",
										err
									);
								});
						} else {
							console.log(
								"[StreamStackItem:playerInit] Fetching Playready Token"
							);
							Fetch({
								url: "/playback/get-playready-token",
								method: "POST",
								token: false,
							})
								.then(async (res) => {
									const data = res.data;
									console.log(data);
									if (
										data &&
										data.licenseAcquisitionUrl &&
										data.token
									) {
										// Non Mobile
										const drmConfig = {
											licenseAcquisitionUrl:
												data.licenseAcquisitionUrl,
											token: data.token,
										};
										console.log(
											"[StreamStackItem:playerInit] setting drm config:",
											drmConfig
										);
										useShakaOfflineStore
											.getState()
											.setDrmConfig(drmConfig);
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

										loadVideo(true, updatedAt);
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
						/*
						console.log("[OFFLINE] getting ready for download");
						const offlineUri = await downloadVideo(videoUrl, "new");
						if (offlineUri) {
							console.log(offlineUri);
						}
            */
						loadVideo(false, updatedAt);
					}
				}
				setPlayerLoaded(true);
			}
		},
		[
			video,
			videoUrl,
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
			shakaOfflineStore,
		]
	);

	return (
		<div
			className={`relative h-full w-full ${isActive ? "block" : "invisible"}`}>
			<Modal
				open={open}
				onClose={handleClose}
				aria-labelledby="modal-title"
				aria-describedby="modal-description">
				<Box
					sx={{
						position: "absolute",
						top: "50%",
						left: "50%",
						transform: "translate(-50%, -50%)",
						width: 400,
						bgcolor: "background.paper",
						border: "2px solid #000",
						boxShadow: 24,
						p: 4,
						borderRadius: 2,
					}}>
					<Typography
						id="modal-title"
						variant="h6"
						component="h2"
						mb={2}>
						Downloading Video
					</Typography>
					<Typography id="modal-description" variant="body1" mb={3}>
						Initializing the player for the first time may take
						around 5 minutes!
					</Typography>
					<Button
						variant="contained"
						color="primary"
						onClick={handleClose}
						fullWidth>
						Okay
					</Button>
				</Box>
			</Modal>

			<ShakaPlayer
				ref={playerInit}
				className="custom-shaka w-full h-full"
			/>
		</div>
	);
}

export default StreamStackItem;
