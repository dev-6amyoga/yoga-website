import {
	SEEK_TYPE_MARKER,
	SEEK_TYPE_MOVE,
	SEEK_TYPE_SEEK,
} from "../../enums/seek_types";
import { usePlaylistStoreContext } from "../../store/PlaylistStore";
import useVideoStore, {
	STATE_VIDEO_ERROR,
	STATE_VIDEO_LOADING,
	STATE_VIDEO_PAUSED,
	STATE_VIDEO_PLAY,
	useVideoStoreContext,
} from "../../store/VideoStore";

import { createMemo, createSignal } from "solid-js";
import { VIDEO_PAUSE_MARKER } from "../../enums/video_pause_reasons";
import { VIDEO_VIEW_STUDENT_MODE } from "../../enums/video_view_modes";
import DashPlayer from "./DashPlayer";

// {
// 	props.video,
// 	props.isActive,
// 	handleEnd,
// 	handleLoading,
// 	handlePlaybackError,
// 	setDuration,
// 	setVideoStateVisible,
// 	handleFullscreen,
// }

function StreamStackItem(props) {
	// const user = useUserStore((state) => state.user);
	const [playerRef, setPlayerRef] = createSignal({
		current: { player: null, videoElement: null },
	});
	const commitTimeInterval = null;
	const flushTimeInterval = null;

	const [metadataLoaded, setMetadataLoaded] = createSignal(false);
	const [autoplayInitialized, setAutoplayInitialized] = createSignal(false);
	const [playerLoaded, setPlayerLoaded] = createSignal(false);

	// parse the props.video url from props.video object
	const videoUrl = createMemo(
		on([() => props.video], () => {
			console.log("VIDEO URL", props.video);
			return (
				(props.video?.asana_dash_url ||
					props.video?.transition_dash_url) ??
				""
			);
		})
	);

	// const isActiveRef = useRef(props.isActive);

	// keep the isActiveRef updated
	// useEffect(() => {
	// 	isActive = props.isActive;
	// 	if (props.isActive) {
	// 		console.log(
	// 			"IS ACTIVE",
	// 			props.video?.idx,
	// 			playerRef.current.videoElement.currentTime
	// 		);
	// 	}
	// 	console.log({
	// 		props.isActive,
	// 		videoidx: props.video?.idx,
	// 		isActiveRef: isActive,
	// 	});
	// }, [props.isActive, props.video]);

	createEffect(
		on([() => props.isActive, () => props.video], () => {
			isActive = props.isActive();
			if (props.isActive()) {
				console.log(
					"IS ACTIVE",
					props.video()?.idx,
					playerRef.current.videoElement.currentTime
				);
			}
			console.log({
				propsIsActive: props.isActive(),
				videoidx: props.video()?.idx,
				isActiveRef: isActive,
			});
		})
	);

	const [
		videoStore,
		{
			popFromSeekQueue,
			addToSeekQueue,
			setVideoState,
			setCurrentTime,
			setVolume,
			setVideoEvent,
			setCurrentMarkerIdx,
			autoSetCurrentMarkerIdx,
			setViewMode,
			setPauseReason,
			setCommitSeekTime,
		},
	] = useVideoStoreContext();

	const [playlistStore, { popFromQueue, popFromArchive }] =
		usePlaylistStoreContext();

	// let [
	// 	enableWatchHistory,
	// 	setCommittedTs,
	// 	addToCommittedTs,
	// 	updateWatchTimeBuffer,
	// 	watchTimeBuffer,
	// 	appendToWatchTimeBuffer,
	// 	setWatchTimeBuffer,
	// 	flushWatchTimeBuffer,
	// ] = useWatchHistoryStore((state) => [
	// 	state.enableWatchHistory,
	// 	state.setCommittedTs,
	// 	state.addToCommittedTs,
	// 	state.updateWatchTimeBuffer,
	// 	state.watchTimeBuffer,
	// 	state.appendToWatchTimeBuffer,
	// 	state.setWatchTimeBuffer,
	// 	state.flushWatchTimeBuffer,
	// ]);

	const handleNextVideo = () => {
		popFromQueue(0);
	};

	const playerOnError = (e) => {
		//console.log("[StreamStackItem:error] Error playing props.video", e);
		setVideoState(STATE_VIDEO_ERROR);
		// alert(JSON.stringify({ err: e }));
	};

	const tryToPlay = () => {
		console.log(`Try to play called : ${isActive}`);
		if (!isActive) return;

		console.log("Try to play called", props.video.idx, Date.now());
		playerRef.current.player.play();

		if (!autoplayInitialized()) {
			setAutoplayInitialized(true);
		}
	};

	// pause and reset the props.video when its not active
	// useEffect(() => {
	// 	const pr = playerRef.current.videoElement;
	// 	if (!props.isActive && pr && pr.currentTime > 0) {
	// 		console.log(
	// 			"PAUSE AND RESET ----------------------------->",
	// 			props.video.idx
	// 		);
	// 		pr.muted = true;
	// 		setVolume(0);
	// 		pr.pause();
	// 		// pr.currentTime = 0;
	// 	}

	// 	return () => {
	// 		if (pr && !props.isActive) {
	// 			// pr.currentTime = 0;
	// 		}
	// 		pr?.pause();
	// 	};
	// }, [props.isActive, props.video.queue_id, setVolume]);

	createEffect(
		on([props.isActive, props.video.queue_id, setVolume], () => {
			const pr = playerRef.current.videoElement;
			if (!props.isActive() && pr && pr.currentTime > 0) {
				console.log(
					"PAUSE AND RESET ----------------------------->",
					props.video.idx
				);
				pr.muted = true;
				setVolume(0);
				pr.pause();
				// pr.currentTime = 0;
			}
			onCleanup(() => {
				if (pr && !props.isActive()) {
					// pr.currentTime = 0;
				}
				pr?.pause();
			});
		})
	);

	// if its active, set the duration
	// useEffect(() => {
	// 	if (props.isActive && metadataLoaded()() && playerLoaded()) {
	// 		console.log(
	// 			"PLAYING ----------------------------->",
	// 			props.video,
	// 			props.video.props.video.id,
	// 			playerRef?.current.videoElement
	// 		);
	// 		if (playerRef.current.videoElement.currentTime > 0.0) {
	// 			// console.log("SEEKING TO 0", props.video.idx);
	// 			// playerRef.current.videoElement.currentTime = 0.0;
	// 			// setCommitSeekTime(0.0);
	// 		}
	// 	}
	// }, [
	// 	props.isActive,
	// 	setDuration,
	// 	metadataLoaded(),
	// 	props.video,
	// 	playerLoaded(),
	// 	setCommitSeekTime,
	// ]);

	createEffect(
		on(
			[
				props.isActive,
				setDuration,
				metadataLoaded,
				props.video,
				playerLoaded,
				setCommitSeekTime,
			],
			() => {
				if (props.isActive() && metadataLoaded() && playerLoaded()) {
					console.log(
						"PLAYING ----------------------------->",
						props.video,
						props.video.props.video.id,
						playerRef?.current.videoElement
					);

					if (playerRef.current.videoElement.currentTime > 0.0) {
						// console.log("SEEKING TO 0", props.video.idx);
						// playerRef.current.videoElement.currentTime = 0.0;
						// setCommitSeekTime(0.0);
					}
				}
			}
		)
	);

	// change play/pause based on props.video state
	// useEffect(() => {
	// 	// console.trace();
	// 	if (
	// 		props.isActive &&
	// 		metadataLoaded() &&
	// 		playerRef.current !== null &&
	// 		playerRef.current !== undefined
	// 	) {
	// 		setPauseReason(null);
	// 		if (videoStore.videoState.value === STATE_VIDEO_PAUSED) {
	// 			console.log("useEffect : changing to pause", props.video.idx);
	// 			if (isActive) {
	// 				playerRef.current.player.pause();
	// 			}
	// 		} else if (videoStore.videoState.value === STATE_VIDEO_PLAY) {
	// 			console.log("useEffect : changing to play", props.video.idx);
	// 			if (isActive) {
	// 				playerRef.current.player.play();
	// 			}
	// 		}
	// 	}
	// }, [
	// 	props.video,
	// 	metadataLoaded(),
	// 	videoStore.videoState.value,
	// 	props.isActive,
	// 	autoplayInitialized(),
	// 	setAutoplayInitialized,
	// 	setPauseReason,
	// 	setVolume,
	// 	tryToPlay,
	// ]);

	createEffect(
		on(
			[
				props.video,
				metadataLoaded,
				videoStore.videoState.value,
				props.isActive,
				autoplayInitialized,
				setAutoplayInitialized,
				setPauseReason,
				setVolume,
				tryToPlay,
			],
			() => {
				if (
					props.isActive() &&
					metadataLoaded() &&
					playerRef.current !== null &&
					playerRef.current !== undefined
				) {
					setPauseReason(null);

					if (videoStore.videoState.value === STATE_VIDEO_PAUSED) {
						console.log(
							"createEffect : changing to pause",
							props.video.idx
						);
						if (isActive) {
							playerRef.current.player.pause();
						}
					} else if (
						videoStore.videoState.value === STATE_VIDEO_PLAY
					) {
						console.log(
							"createEffect : changing to play",
							props.video.idx
						);
						if (isActive) {
							playerRef.current.player.play();
						}
					}
				}
			}
		)
	);

	// pop from seek queue and update the time
	// useEffect(() => {
	// 	if (props.isActive && videoStore.seekQueue.length > 0) {
	// 		const seekEvent = videoStore.seekQueue[0];
	// 		console.log("SEEKING --->", seekEvent);
	// 		if (seekEvent && playerRef.current) {
	// 			switch (seekEvent.type) {
	// 				case SEEK_TYPE_SEEK:
	// 					let ct =
	// 						playerRef.current.videoElement.currentTime +
	// 						seekEvent.t;
	// 					if (ct > playerRef.current.videoElement.duration) {
	// 						handleEnd();
	// 						popFromSeekQueue(0);
	// 						return;
	// 					}
	// 					if (ct < 0) ct = 0;

	// 					playerRef.current.videoElement.currentTime = ct;
	// 					setCommitSeekTime(ct);
	// 					// autoSetCurrentMarkerIdx(playerRef.current?.currentTime)
	// 					// popFromSeekQueue(0)
	// 					break;
	// 				case SEEK_TYPE_MOVE:
	// 					let st = seekEvent.t < 0 ? 0 : seekEvent.t;
	// 					if (st > playerRef.current.videoElement.duration) {
	// 						handleEnd();
	// 						popFromSeekQueue(0);
	// 						return;
	// 					}
	// 					playerRef.current.videoElement.currentTime = st;
	// 					setCommitSeekTime(st);
	// 					break;
	// 				case SEEK_TYPE_MARKER:
	// 					if (
	// 						seekEvent.t >
	// 						playerRef.current.videoElement.duration
	// 					) {
	// 						handleEnd();
	// 						popFromSeekQueue(0);
	// 						return;
	// 					}

	// 					playerRef.current.videoElement.currentTime =
	// 						seekEvent.t;
	// 					// popFromSeekQueue(0)
	// 					setCommitSeekTime(seekEvent.t);
	// 					break;
	// 				default:
	// 					break;
	// 			}
	// 			addToCommittedTs(playerRef.current?.videoElement.currentTime);
	// 		}
	// 	}
	// }, [
	// 	props.isActive,
	// 	videoStore.seekQueue,
	// 	popFromSeekQueue,
	// 	addToCommittedTs,
	// 	setVideoEvent,
	// 	setCurrentMarkerIdx,
	// 	autoSetCurrentMarkerIdx,
	// 	setCommitSeekTime,
	// 	setVideoState,
	// 	setPauseReason,
	// 	popFromQueue,
	// 	handleEnd,
	// ]);

	createEffect(
		on(
			[
				props.isActive,
				videoStore.seekQueue,
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
			],
			() => {
				if (props.isActive() && videoStore.seekQueue.length > 0) {
					const seekEvent = videoStore.seekQueue[0];
					console.log("SEEKING --->", seekEvent);
					if (seekEvent && playerRef.current) {
						switch (seekEvent.type) {
							case SEEK_TYPE_SEEK: {
								let ct =
									playerRef.current.videoElement.currentTime +
									seekEvent.t;
								if (
									ct > playerRef.current.videoElement.duration
								) {
									handleEnd();
									popFromSeekQueue(0);
									return;
								}
								if (ct < 0) ct = 0;

								playerRef.current.videoElement.currentTime = ct;
								setCommitSeekTime(ct);
								break;
							}
							case SEEK_TYPE_MOVE: {
								let st = seekEvent.t < 0 ? 0 : seekEvent.t;
								if (
									st > playerRef.current.videoElement.duration
								) {
									handleEnd();
									popFromSeekQueue(0);
									return;
								}
								playerRef.current.videoElement.currentTime = st;
								setCommitSeekTime(st);
								break;
							}
							case SEEK_TYPE_MARKER: {
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
								setCommitSeekTime(seekEvent.t);
								break;
							}
							default:
								break;
						}

						// addToCommittedTs(
						// 	playerRef.current?.videoElement.currentTime
						// );
					}
				}
			}
		)
	);

	// poll to update the current time, every 20ms, clear the timeout on unmount
	// useEffect(() => {
	// 	const checkSeek = (ct) => {
	// 		if (
	// 			videoStore.seekQueue.length > 0 &&
	// 			videoStore.commitSeekTime.value.toFixed(0) === ct.toFixed(0)
	// 		) {
	// 			if (props.isActive) handleLoading(false, props.isActive);
	// 			autoSetCurrentMarkerIdx(videoStore.commitSeekTime.value);
	// 			return true;
	// 		} else {
	// 			return false;
	// 		}
	// 	};
	// 	const checkPauseOrLoop = (ct) => {
	// 		if (videoStore.viewMode.value === VIDEO_VIEW_STUDENT_MODE) {
	// 			return false;
	// 		} else {
	// 			let currentMarker = videoStore.markers[videoStore.currentMarkerIdx.value];
	// 			if (videoStore.currentMarkerIdx.value === videoStore.markers.length - 1) {
	// 				return false;
	// 			} else if (
	// 				ct > videoStore.markers[videoStore.currentMarkerIdx.value + 1]?.timestamp
	// 			) {
	// 				if (currentMarker.loop) {
	// 					console.log("LOOPING CUZ OF MARKER");
	// 					addToSeekQueue({
	// 						type: SEEK_TYPE_MARKER,
	// 						t: currentMarker.timestamp,
	// 					});
	// 					return true;
	// 				} else {
	// 					console.log("PAUSING CUZ OF MARKER");
	// 					setVideoState(STATE_VIDEO_PAUSED);
	// 					setPauseReason(VIDEO_PAUSE_MARKER);
	// 					return true;
	// 				}
	// 			}
	// 		}
	// 	};

	// 	const int = setInterval(() => {
	// 		if (playerRef.current?.videoElement?.currentTime && props.isActive) {
	// 			if (checkSeek(playerRef.current?.videoElement?.currentTime)) {
	// 				popFromSeekQueue(0);
	// 				setVideoState(STATE_VIDEO_PLAY);
	// 				return;
	// 			}
	// 			if (
	// 				videoStore.videoState.value !== STATE_VIDEO_LOADING &&
	// 				checkPauseOrLoop(
	// 					playerRef.current?.videoElement?.currentTime
	// 				)
	// 			) {
	// 				return;
	// 			}

	// 			if (
	// 				videoStore.videoState.value !== STATE_VIDEO_LOADING ||
	// 				videoStore.videoState.value !== STATE_VIDEO_ERROR ||
	// 				videoStore.videoState.value !== STATE_VIDEO_PAUSED
	// 			) {
	// 				autoSetCurrentMarkerIdx(
	// 					playerRef.current?.videoElement?.currentTime
	// 				);
	// 			}
	// 			setCurrentTime(playerRef.current?.videoElement?.currentTime);
	// 			setVolume(playerRef.current?.videoElement?.videoStore.volume);
	// 		}
	// 	}, 16.67);

	// 	return () => {
	// 		clearInterval(int);
	// 	};
	// }, [
	// 	videoStore.currentVideo,
	// 	props.isActive,
	// 	setCurrentTime,
	// 	videoStore.videoState.value,
	// 	popFromSeekQueue,
	// 	autoSetCurrentMarkerIdx,
	// 	videoStore.seekQueue,
	// 	setVideoEvent,
	// 	setCurrentMarkerIdx,
	// 	videoStore.markers,
	// 	videoStore.viewMode.value,
	// 	videoStore.currentMarkerIdx.value,
	// 	setVideoState,
	// 	addToSeekQueue,
	// 	videoStore.commitSeekTime.value,
	// 	setPauseReason,
	// 	handleLoading,
	// 	setVolume,
	// ]);

	createEffect(
		on(
			[
				props.isActive,
				videoStore.seekQueue,
				videoStore.commitSeekTime,
				autoSetCurrentMarkerIdx,
				handleLoading,
				videoStore.viewMode,
				videoStore.markers,
				videoStore.currentMarkerIdx,
				setCurrentMarkerIdx,
				addToSeekQueue,
				popFromSeekQueue,
				setVideoEvent,
				videoStore.currentVideo,
				setVideoState,
				setPauseReason,
				videoStore.videoState,
				setCurrentTime,
				setVolume,
			],
			() => {
				const checkSeek = (ct) => {
					if (
						videoStore.seekQueue.length > 0 &&
						videoStore.commitSeekTime.value.toFixed(0) ===
							ct.toFixed(0)
					) {
						if (props.isActive)
							handleLoading(false, props.isActive);
						autoSetCurrentMarkerIdx(
							videoStore.commitSeekTime.value
						);
						return true;
					} else {
						return false;
					}
				};

				const checkPauseOrLoop = (ct) => {
					if (videoStore.viewMode.value === VIDEO_VIEW_STUDENT_MODE) {
						return false;
					} else {
						let currentMarker =
							videoStore.markers[
								videoStore.currentMarkerIdx.value
							];
						if (
							videoStore.currentMarkerIdx.value ===
							videoStore.markers.length - 1
						) {
							return false;
						} else if (
							ct >
							videoStore.markers[
								videoStore.currentMarkerIdx.value + 1
							]?.timestamp
						) {
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
					if (playerRef.current?.videoElement && props.isActive()) {
						if (
							checkSeek(
								playerRef.current?.videoElement?.currentTime
							)
						) {
							popFromSeekQueue(0);
							setVideoState(STATE_VIDEO_PLAY);
							return;
						}
						if (
							videoStore.videoState.value !==
								STATE_VIDEO_LOADING &&
							checkPauseOrLoop(
								playerRef.current?.videoElement?.currentTime
							)
						) {
							return;
						}
						if (
							videoStore.videoState.value !==
								STATE_VIDEO_LOADING ||
							videoStore.videoState.value !== STATE_VIDEO_ERROR ||
							videoStore.videoState.value !== STATE_VIDEO_PAUSED
						) {
							autoSetCurrentMarkerIdx(
								playerRef.current?.videoElement?.currentTime
							);
						}
						setCurrentTime(
							playerRef.current?.videoElement?.currentTime
						);
						setVolume(
							playerRef.current?.videoElement?.videoStore.volume
						);
					}
				}, 16.67);

				onCleanup(() => clearInterval(int));
			}
		)
	);

	// const flushWatchTimeBufferE =
	// 	(user_id) => {
	// 		const watch_time_logs = [...watchTimeBuffer];

	// 		// console.log({ watch_time_logs });
	// 		if (watch_time_logs.length === 0) {
	// 			return;
	// 		}

	// 		Fetch({
	// 			url: "/watch-time/update",
	// 			method: "POST",
	// 			token: true,
	// 			data: {
	// 				user_id: user_id,
	// 				watch_time_logs,
	// 				institute_id: null,
	// 			},
	// 		})
	// 			.then((res) => {
	// 				if (res.status === 200) {
	// 					console.log("watch time buffer flushed");
	// 				}
	// 			})
	// 			.catch((err) => {
	// 				//console.log(err);
	// 				// localStorage.setItem(
	// 				// 	"6amyoga_watch_time_logs",
	// 				// 	JSON.stringify(watch_time_logs)
	// 				// );
	// 				appendToWatchTimeBuffer(watch_time_logs);
	// 			});

	// 		setWatchTimeBuffer([]);
	// 	}

	/* 
		when props.video changes
		- flush 
		- reset committedTs
		- clear previous interval to flush 
		- start interval timer to flush	watch duration buffer  [10s]
		- clear previous interval to commit time
		- start interval timer to commit time [5s]
	*/

	/*
	useEffect(() => {
		console.log("Watch time useEffect : ", enableWatchHistory);
		if (props.isActive && enableWatchHistory && user && props.video) {
			console.log("setting up stuff");
			// console.log('CURRENT VIDEO', props.video)
			// flushing
			flushWatchTimeBuffer(user?.user_id);

			// resetting committedTs
			setCommittedTs(0);

			// clearing previous interval to flush
			if (flushTimeInterval.current) {
				clearInterval(flushTimeInterval.current);
			}

			// clearing previous commitTimeInterval
			if (commitTimeInterval.current) {
				clearInterval(commitTimeInterval.current);
			}

			// TODO : send to watch history
			Fetch({
				url: "/watch-history/create",
				method: "POST",
				// TODO : fix thiss
				data: {
					user_id: user?.user_id,
					asana_id: props.video?.props.video?.id,
					playlist_id: null,
				},
			})
				.then((res) => {
					console.log("watch history created", res.data);
				})
				.catch((err) => {
					console.log(err);
				});

			// starting interval timer to flush watch duration buffer
			flushTimeInterval.current = setInterval(() => {
				// flushWatchTimeBuffer(user?.user_id);
				flushWatchTimeBufferE(user?.user_id);
			}, 10000);

			// starting interval timer to commit time
			commitTimeInterval.current = setInterval(() => {
				// TODO : fix this
				updateWatchTimeBuffer({
					user_id: user?.user_id,
					asana_id: props.video?.props.video?.id,
					playlist_id: null,
					currentTime: playerRef.current.currentTime,
				});
				addToCommittedTs(playerRef.current?.currentTime);
			}, 5000);
		} else {
			if (flushTimeInterval.current) {
				clearInterval(flushTimeInterval.current);
			}

			if (commitTimeInterval.current) {
				clearInterval(commitTimeInterval.current);
			}
		}
	}, [
		props.isActive,
		enableWatchHistory,
		user,
		props.video,
		flushWatchTimeBufferE,
		updateWatchTimeBuffer,
		addToCommittedTs,
		setCommittedTs,
		flushWatchTimeBuffer,
	]);
	*/

	const handlePlayerLoading = (e) => {
		handleLoading(true, isActive);
	};

	const handlePlayerLoaded = (e) => {
		handleLoading(false, isActive);
	};

	// props.video events
	const handleVideoSeeking = (e) => {
		console.log("Seeking...");
		handleLoading(true, isActive);
	};

	const handleVideoSeeked = (e) => {
		console.log("Seeked...");
		setVideoState(STATE_VIDEO_PLAY);
	};

	const handleVideoCanPlayThrough = (e) => {
		setMetadataLoaded(true);
		const state = useVideoStore.getState();
		console.log("Can play through...", state.videoStore.videoState.value);
		// tryToPlay();
		setVideoState(STATE_VIDEO_PLAY);
	};

	// set the videoStore.volume
	const handleVideoVolumeChange = () => {
		if (playerRef.current !== null && playerRef.current.videoElement) {
			setVolume(playerRef.current.videoElement.videoStore.volume || 0);
		}
	};

	const handlePlay = () => {
		if (props.isActive) {
			const state = useVideoStore.getState();
			if (state.videoStore.videoState.value !== STATE_VIDEO_PLAY) {
				console.log(
					"PLAYING ----------------------------->",
					props.video.idx
				);
				// setVideoState(STATE_VIDEO_PLAY);
			}
		} else {
			playerRef.current.player.pause();
		}
	};

	const handlePause = () => {
		if (props.isActive) {
			const state = useVideoStore.getState();
			if (state.videoStore.videoState.value !== STATE_VIDEO_PAUSED) {
				console.log(
					"PAUSING ----------------------------->",
					props.video.idx
				);
				// setVideoState(STATE_VIDEO_PAUSED);
			}
		}
	};

	const playerInit = (ref) => {
		console.log("player init called", ref);
		if (ref != null) {
			setPlayerRef({ current: ref });
			setPlayerLoaded(true);
		}
	};

	return (
		<div
			class={`relative h-full w-full ${
				props.isActive ? "block" : "block"
			}`}>
			<DashPlayer
				ref={playerInit}
				src={videoUrl}
				isAsanaVideo={
					!isNaN(props.video?.props.video?.id) &&
					typeof props.video?.props.video?.id === "number"
				}
				isActive={props.isActive}
				onError={playerOnError}
				onCanPlayThrough={handleVideoCanPlayThrough}
				onVolumeChange={handleVideoVolumeChange}
				onEnded={handleEnd}
				onPlay={handlePlay}
				onPause={handlePause}
				onLoading={handlePlayerLoading}
				onLoaded={handlePlayerLoaded}
				onSeeking={handleVideoSeeking}
				onSeeked={handleVideoSeeked}
				setDuration={setDuration}
				class="dashjs-player w-full h-full"
			/>

			{videoStore.devMode ? (
				<div class="absolute bg-white left-4 top-4 p-2 text-sm flex flex-col">
					<p>
						props.isActive: {String(props.isActive)} ||{" "}
						{String(isActive)}
					</p>
					<p>Video IDX : {props.video?.idx}</p>
					<p>
						videoStore.videoState.value:{" "}
						{videoStore.videoState.value}
					</p>
					<p>videoStore.pauseReason: {videoStore.pauseReason}</p>
					<p>
						videoStore.viewMode.value: {videoStore.viewMode.value}
					</p>
					<p>
						videoStore.currentMarkerIdx.value:{" "}
						{videoStore.currentMarkerIdx.value}
					</p>
					<p>metadataLoaded(): {String(metadataLoaded())}</p>
					<p>
						autoplayInitialized(): {String(autoplayInitialized())}
					</p>
					<p>playerLoaded(): {String(playerLoaded())}</p>
					<p>
						videoStore.commitSeekTime.value:{" "}
						{videoStore.commitSeekTime.value}
					</p>
					<p>videoStore.volume: {videoStore.volume}</p>
					<p>
						videoStore.fullScreen: {String(videoStore.fullScreen)}
					</p>
					<div>
						Buffer :{" "}
						{playerRef.current && playerRef.current.videoElement ? (
							<>
								{Array.from(
									Array(
										playerRef.current.videoElement.buffered
											.length
									).keys()
								).map((i) => {
									return (
										<span>
											{playerRef.current.videoElement.buffered.start(
												i
											)}{" "}
											-{" "}
											{playerRef.current.videoElement.buffered.end(
												i
											)}
										</span>
									);
								})}{" "}
								| props.video :{" "}
								{playerRef.current.player.getBufferLength(
									"props.video"
								)}{" "}
								| audio :{" "}
								{playerRef.current.player.getBufferLength(
									"audio"
								)}
							</>
						) : (
							"nil"
						)}
					</div>
				</div>
			) : (
				<></>
			)}
		</div>
	);
}

export default StreamStackItem;
