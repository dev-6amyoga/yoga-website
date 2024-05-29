import dashjs from "dashjs";
import { createEffect, createSignal, on, onCleanup } from "solid-js";
import { VIDEO_EVENT_PLAY_INACTIVE } from "../../enums/video_event";
import { dashSettings } from "../../lib/dashjs-settings";
import {
	STATE_VIDEO_LOADING,
	STATE_VIDEO_PAUSED,
	STATE_VIDEO_PLAY,
	useVideoStoreContext,
} from "../../store/VideoStore";
import { Fetch } from "../../utils/Fetch";
import { isMobileTablet } from "../../utils/isMobileOrTablet";

function DashPlayer(props) {
	let videoRef = { current: null };
	const [playerRef, setPlayerRef] = createSignal(null);
	const [playerRefSet, setPlayerRefSet] = createSignal(false);
	const [metadataLoaded, setMetadataLoaded] = createSignal(false);
	const [streamInitialized, setStreamInitialized] = createSignal(false);
	const [drmSet, setDrmSet] = createSignal(false);
	const [playInActive, setPlayInActive] = createSignal(false);
	const [metrics, setMetrics] = createSignal({ bitrate: 0, bufferLevel: 0 });
	const [seekedToZero, setSeekedToZero] = createSignal(false);
	// let playInActiveTimer = null;

	console.log("dashplayer! >>>>");

	const [
		videoStore,
		{ setPlayreadyKeyUrl, clearVideoEvents, setVideoState, setVolume },
	] = useVideoStoreContext();

	createEffect(
		on([() => videoStore.videoEvents, () => props.isActive], () => {
			if (videoStore.videoEvents.length > 0 && !props.isActive) {
				const event = videoStore.videoEvents[0];
				if (event?.t === VIDEO_EVENT_PLAY_INACTIVE) {
					console.log(
						"[DASH PLAYER] : [INACTIVE] play event received"
					);
					setPlayInActive(true);
				}
				clearVideoEvents();
			}
		})
	);

	createEffect(
		on([() => props.src], () => {
			console.log("[DASH PLAYER] : setup", { src: props.src });
			let p = null;
			if (props.src) {
				p = dashjs.MediaPlayer().create();
				setPlayerRef(p);
				p.updateSettings(dashSettings);
				// p.initialize(null, props.src, false, 0.0);
				p.initialize(null, props.src, true, { autoplay: true, muted: true });
				p.attachView(videoRef.current);
				p.preload();
				p.play();
				setPlayerRefSet(true);
				console.log("[DASH PLAYER] : player created");
			}
			onCleanup(() => {
				console.log("[DASH PLAYER] Cleanup, player reset");
				if (playerRef()) {
					playerRef().destroy();
				}
			});
		})
	);

	// 	createEffect(() => {
	//     return () => {
	//         if (playerRef()) {
	//             playerRef().reset();
	//             playerRef().destroy();
	//             setPlayerRef(null);
	//         }
	//     };
	// }, [props.src]);
	// createEffect(() => {
	//     if (props.src) {
	//         console.log("[DASH PLAYER] : setup", { src: props.src });
	//         initializePlayer(props.src);
	//     }

	//     return () => {
	//         cleanupPlayer();
	//     };
	// }, [props.src]);

	createEffect(
		on(
			[
				() => props.isActive,
				() => videoStore.volume,
				metadataLoaded,
				playerRef,
			],
			() => {
				if (playerRef() && props.isActive && metadataLoaded()) {
					playerRef().setVolume(videoStore.volume);
				} else if (playerRef() && !props.isActive && metadataLoaded()) {
					console.log("[DASH PLAYER] : pausing !isActive video");
					playerRef().pause();
					if (videoRef.current) {
						videoRef.current.currentTime = 0;
					}
				}
			}
		)
	);

	createEffect(
		on([() => props.isActive, () => videoStore.videoState], () => {
			if (props.isActive) {
				if (videoStore.videoState === STATE_VIDEO_PLAY) {
					console.log("[DASH PLAYER] Switch state : play", {
						idx: props.video.idx,
						ct: videoRef.current.currentTime,
					});
					playerRef().play();
				} else if (videoStore.videoState === STATE_VIDEO_PAUSED) {
					console.log("[DASH PLAYER] Switch state : pause", {
						idx: props.video.idx,
						ct: videoRef.current.currentTime,
					});
					playerRef().pause();
				}
			}
		})
	);

	createEffect(
		on(
			[
				playerRefSet,
				() => props.src,
				metadataLoaded,
				streamInitialized,
				() => props.isActive,
				playInActive,
			],
			() => {
				if (
					playerRefSet() &&
					props.src &&
					metadataLoaded() &&
					streamInitialized() &&
					(props.isActive || playInActive())
				) {
					console.log(
						"[DASH PLAYER] : play video effect event",
						props.src,
						props.isActive,
						playInActive()
					);
					// if not active and playInActive (or) active and not playInActive
					if (
						(!props.isActive && playInActive()) ||
						(props.isActive && !playInActive())
					) {
						videoRef.current
							.play()
							.then(() => {
								console.log(
									"[DASH PLAYER] : Video play event success from create hahahah"
								);
							})
							.catch((err) => {
								console.log(
									"[DASH PLAYER] : Video play event failed",
									err
								);
							});
					}

					if (!props.isActive) {
						const currentTime = playerRef().time();
						const duration = playerRef().duration();
						const remainingTime = duration - currentTime;
						const inactiveVideoDuration = remainingTime - 0.1;
						console.log(
							"[DASH PLAYER IS NOT ACTIVE] starting event timer for playing inactive : currentTime = ",
							currentTime,
							"duration",
							duration,
							"remainingTime",
							remainingTime,
							"inactiveVideoDuration",
							inactiveVideoDuration
						);
						console.log(
							"[DASH PLAYER] starting event timer for playing inactive @ ",
							inactiveVideoDuration,
							props.isActive,
							props.video.idx
						);
					}
				}
			}
		)
	);

	// DRM Info
	createEffect(
		on([playerRefSet, () => props.src, () => props.isAsanaVideo], () => {
			if (playerRefSet && props.src && videoRef.current) {
				console.log("[DASH PLAYER] : setting DRM Info");
				const check = isMobileTablet();
				const isMobile = { done: true, check: check };
				console.log("Checking for isMobile", isMobile);
				var playreadyKeyUrl;
				playreadyKeyUrl = videoStore.playreadyKeyUrl ?? undefined;
				console.log("[DASH PLAYER] : isAsanaVideo", props.isAsanaVideo);

				if (props.isAsanaVideo) {
					if (isMobile.check) {
						Fetch({
							url: "/playback/get-widevine-token",
							method: "POST",
							token: false,
						})
							.then((res) => {
								const data = res.data;
								console.log("[DASH PLAYER] : widevine token");

								if (data && data.licenseAcquisitionUrl) {
									playerRef().setProtectionData({
										"com.widevine.alpha": {
											serverURL:
												data.licenseAcquisitionUrl,
										},
									});
									setDrmSet(true);
								}
							})
							.catch((err) => {
								console.log("Error fetching DRM info :", err);
								props.onError();
							});
					} else {
						// Non Mobile
						if (playreadyKeyUrl) {
							console.log(
								"[DASH PLAYER] : playready token cached"
							);
							playerRef().setProtectionData({
								"com.microsoft.playready": {
									serverURL: playreadyKeyUrl,
								},
							});
							setDrmSet(true);
						} else {
							Fetch({
								url: "/playback/get-playready-token",
								method: "POST",
								token: false,
							})
								.then((res) => {
									const data = res.data;
									console.log(
										"[DASH PLAYER] : playready token"
									);
									if (
										data &&
										data.licenseAcquisitionUrl &&
										data.token
									) {
										playerRef().setProtectionData({
											"com.microsoft.playready": {
												serverURL:
													data.licenseAcquisitionUrl +
													"?ExpressPlayToken=" +
													data.token,
											},
										});
										console.log(
											"[DASH PLAYER] : playready token caching now!"
										);
										setPlayreadyKeyUrl(
											data.licenseAcquisitionUrl +
												"?ExpressPlayToken=" +
												data.token
										);
										setDrmSet(true);
									}
								})
								.catch((err) => {
									console.log(
										"Error fetching DRM info :",
										err
									);
									props.onError();
								});
						}
					}
				} else {
					console.log("[DASH PLAYER] : transition video");
					setDrmSet(true);
				}
			}
		})
	);

	const onMetadataLoaded = () => {
		console.log("[DASH PLAYER] : metadata loaded event");
		console.log(
			"[DASH PLAYER] : metadata event setting duration : ",
			playerRef().duration(),
			videoRef.current.duration
		);
		setMetadataLoaded(true);
		props.setDuration(playerRef().duration());
	};

	const onPlaybackNotAllowed = () => {
		if (playerRef() && props.isActive) {
			console.log("[DASH PLAYER] : playback not allowed");
			playerRef().setMute(true);
			playerRef().initialize(videoRef.current, props.src, true, 0.0);
			playerRef().setMute(false);
		}
	};

	// const onStreamInitialized = () => {
	// 	console.log("[DASH PLAYER] : stream initialized");
	// 	setStreamInitialized(true);
	// };

	const onStreamInitialized = () => {
		console.log("[DASH PLAYER] : stream initialized");
		setStreamInitialized(true);
		if (!seekedToZero()) {
			console.log("[DASH PLAYER] : seeked to zero");
			videoRef.current.currentTime = 0;
			setSeekedToZero(true);
		}
	};

	const onCanPlay = () => {
		if (!props.isActive) {
			console.log("[DASH PLAYER] : onCanPlay event");
			playerRef().pause();
		}

		if (props.isActive) {
			setVolume(1.0);
		}
	};

	// 	const onCanPlay = () => {
	//   if (!props.isActive) {
	//     playerRef().pause();
	//   }

	//   if (props.isActive) {
	//     setVolume(1.0);

	//     if (buffering()) { // Check if buffering is in progress
	//       videoRef.current.play().then(() => {
	//         console.log("[DASH PLAYER]: Video play event success from CAN_PLAY");
	//         setBuffering(false);  // Mark buffering as complete
	//       }).catch((err) => {
	//         console.log("[DASH PLAYER]: Video play event failed", err);
	//       });
	//     }
	//   }
	// };

	const onPlay = () => {
		console.log(
			"[DASH PLAYER] handlePlay event called",
			props.isActive,
			props.video.idx
		);

		if (props.isActive) {
			if (videoStore.videoState !== STATE_VIDEO_PLAY) {
				console.log(
					"PLAYING ----------------------------->",
					props.video.idx
				);
			}
			const currentTime = playerRef().time();
			const duration = playerRef().duration();
			const remainingTime = duration - currentTime;
			const inactiveVideoDuration = remainingTime - 0.1;

			console.log(
				"[DASH PLAYER IS ACTIVE] starting event timer for playing inactive : currentTime = ",
				currentTime,
				"duration",
				duration,
				"remainingTime",
				remainingTime,
				"inactiveVideoDuration",
				inactiveVideoDuration
			);
			console.log(
				"[DASH PLAYER] starting event timer for playing inactive @ ",
				inactiveVideoDuration,
				props.isActive,
				props.video.idx
			);
		}
	};

	const onPause = () => {
		if (props.isActive) {
			if (videoStore.videoState !== STATE_VIDEO_PAUSED) {
				console.log(
					"PAUSING ----------------------------->",
					props.video.idx
				);
			}
			clearVideoEvents();
		}
	};

	const onWaiting = () => {
		console.log("[DASH PLAYER] : onWaiting event");

		if (props.isActive) {
			setVideoState(STATE_VIDEO_LOADING);
		}
	};

	const onPlaybackLoadedData = () => {
		// if (!seekedToZero()) {
		// console.log("[DASH PLAYER] : seeked to zero");
		// videoRef.current.currentTime = 0;
		// setSeekedToZero(true);
		// }
	};

	// Setting event listeners
	createEffect(
		on(
			[
				playerRefSet,
				() => props.src,
				() => onMetadataLoaded,
				() => props.onCanPlayThrough,
				() => props.onEnded,
				() => onPlaybackNotAllowed,
				() => props.onError,
				() => onPlay,
				() => onPause,
				() => props.onVolumeChange,
				() => props.onSeeked,
				() => props.onSeeking,
				() => onWaiting,
			],
			() => {
				if (playerRefSet() && props.src && videoRef.current) {
					console.log("[DASH PLAYER] : setting up event listeners");
					playerRef().on(
						dashjs.MediaPlayer.events.CAN_PLAY_THROUGH,
						props.onCanPlayThrough
					);
					playerRef().on(
						dashjs.MediaPlayer.events.PLAYBACK_LOADED_DATA,
						onPlaybackLoadedData
					);
					playerRef().on(
						dashjs.MediaPlayer.events.CAN_PLAY,
						onCanPlay
					);
					playerRef().on(
						dashjs.MediaPlayer.events.ERROR,
						props.onError
					);
					playerRef().on(
						dashjs.MediaPlayer.events.PLAYBACK_ENDED,
						props.onEnded
					);
					playerRef().on(
						dashjs.MediaPlayer.events.PLAYBACK_SEEKED,
						props.onSeeked
					);
					playerRef().on(
						dashjs.MediaPlayer.events.PLAYBACK_SEEKING,
						props.onSeeking
					);
					playerRef().on(
						dashjs.MediaPlayer.events.PLAYBACK_NOT_ALLOWED,
						onPlaybackNotAllowed
					);

					playerRef().on(
						dashjs.MediaPlayer.events.PLAYBACK_PAUSED,
						onPause
					);
					playerRef().on(
						dashjs.MediaPlayer.events.PLAYBACK_PLAYING,
						onPlay
					);
					playerRef().on(
						dashjs.MediaPlayer.events.PLAYBACK_VOLUME_CHANGED,
						props.onVolumeChange
					);
					playerRef().on(
						dashjs.MediaPlayer.events.PLAYBACK_METADATA_LOADED,
						onMetadataLoaded
					);
					playerRef().on(
						dashjs.MediaPlayer.events.STREAM_INITIALIZED,
						onStreamInitialized
					);
				}

				return () => {
					console.log("[DASH PLAYER] switching off event listeners");
					playerRef().off(
						dashjs.MediaPlayer.events.CAN_PLAY_THROUGH,
						props.onCanPlayThrough
					);
					playerRef().on(
						dashjs.MediaPlayer.events.PLAYBACK_LOADED_DATA,
						onPlaybackLoadedData
					);
					playerRef().off(
						dashjs.MediaPlayer.events.CAN_PLAY,
						onCanPlay
					);
					playerRef().off(
						dashjs.MediaPlayer.events.ERROR,
						props.onError
					);
					playerRef().off(
						dashjs.MediaPlayer.events.PLAYBACK_ENDED,
						props.onEnded
					);
					playerRef().off(
						dashjs.MediaPlayer.events.PLAYBACK_SEEKED,
						props.onSeeked
					);
					playerRef().off(
						dashjs.MediaPlayer.events.PLAYBACK_SEEKING,
						props.onSeeking
					);
					playerRef().off(
						dashjs.MediaPlayer.events.PLAYBACK_NOT_ALLOWED,
						onPlaybackNotAllowed
					);
					playerRef().off(
						dashjs.MediaPlayer.events.PLAYBACK_PAUSED,
						onPause
					);
					playerRef().off(
						dashjs.MediaPlayer.events.PLAYBACK_PLAYING,
						onPlay
					);
					playerRef().off(
						dashjs.MediaPlayer.events.PLAYBACK_VOLUME_CHANGED,
						props.onVolumeChange
					);
					playerRef().off(
						dashjs.MediaPlayer.events.PLAYBACK_METADATA_LOADED,
						onMetadataLoaded
					);
					playerRef().off(
						dashjs.MediaPlayer.events.STREAM_INITIALIZED,
						onStreamInitialized
					);
				};
			}
		)
	);

	const setVideoRef = (element) => {
		console.log("[DASH PLAYER] SETTING REF >>>>>>>>>>>>>");
		videoRef.current = element;
	};

	createEffect(
		on([playerRefSet, playerRef], () => {
			console.log("[DASH PLAYER] : platyerRefChanged", playerRefSet());
			if (playerRefSet()) {
				props.ref({
					player: playerRef(),
					videoElement: videoRef.current,
				});
			}
		})
	);

	createEffect(
		on([playerRef], () => {
			console.log("[DASH PLAYER] : setting up metrics thingy");
			var eventPoller = setInterval(function () {
				let p = playerRef();
				var streamInfo = p.getActiveStream().getStreamInfo();
				var dashMetrics = p.getDashMetrics();
				var dashAdapter = p.getDashAdapter();

				if (dashMetrics && streamInfo) {
					const periodIdx = streamInfo.index;
					var repSwitch = dashMetrics.getCurrentRepresentationSwitch(
						"video",
						true
					);
					var bufferLevel = dashMetrics.getCurrentBufferLevel(
						"video",
						true
					);
					var bitrate = repSwitch
						? Math.round(
								dashAdapter.getBandwidthForRepresentation(
									repSwitch.to,
									periodIdx
								) / 1000
							)
						: NaN;

					const m = {
						bitrate: bitrate,
						bufferLevel: bufferLevel,
					};

					// console.log("[DASH PLAYER] : metrics", m);

					setMetrics(m);
				}
			}, 2000);

			onCleanup(() => {
				console.log("[DASH PLAYER] : clearing metrics interval");
				clearInterval(eventPoller);
			});
		})
	);

	return (
		<div class={"dash-player w-full h-full relative"}>
			<div class="absolute left-4 top-4 bg-white p-2 text-sm break-all max-w-xl text-black">
				<pre>{JSON.stringify(metrics(), null, 2)}</pre>
			</div>
			<video
				class="aspect-video"
				id={props.queueItemId}
				ref={setVideoRef}></video>
		</div>
	);
}

export default DashPlayer;
