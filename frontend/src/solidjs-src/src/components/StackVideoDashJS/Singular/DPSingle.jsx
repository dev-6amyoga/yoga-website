import dashjs from "dashjs";
import { createEffect, createSignal, on, onCleanup, onMount } from "solid-js";
import { dashSettings } from "../../../lib/dashjs-settings";
import {
	STATE_VIDEO_LOADING,
	STATE_VIDEO_PAUSED,
	STATE_VIDEO_PLAY,
	useVideoStoreContext,
} from "../../../store/VideoStore";
import { Fetch } from "../../../utils/Fetch";
import { isMobileTablet } from "../../../utils/isMobileOrTablet";

// {
// 		src,
// 		isActive,
// 		isAsanaVideo,
// 		props.setDuration,
// 		props.onCanPlayThrough,
// 		props.onEnded,
// 		props.onPlay,
// 		props.onPause,
// 		props.onError,
// 		props.onVolumeChange,
// 		onLoading,
// 		onLoaded,
// 		props.onSeeking,
// 		props.onSeeked,
// 		className,
// 		...rest
// 	},
// 	ref

function DPSingle(props) {
	let videoRef = { current: null };
	const [playerRefSet, setPlayerRefSet] = createSignal(false);
	const [metadataLoaded, setMetadataLoaded] = createSignal(false);
	const [streamInitialized, setStreamInitialized] = createSignal(false);
	const [drmSet, setDrmSet] = createSignal(false);
	const [playInActive, setPlayInActive] = createSignal(false);

	const [playerRef, setPlayerRef] = createSignal(null);
	const [nextPlayerRef, setNextPlayerRef] = createSignal(null);
	const [prevNextVideo, setPrevNextVideo] = createSignal(null);
	const [metrics, setMetrics] = createSignal({});
	// let playInActiveTimer = null;

	console.log("dashplayer! >>>>");

	const [
		videoStore,
		{ setPlayreadyKeyUrl, clearVideoEvents, setVideoState, setVolume },
	] = useVideoStoreContext();

	// createEffect(
	// 	on([() => videoStore.videoEvents, () => props.isActive], () => {
	// 		if (videoStore.videoEvents.length > 0 && !props.isActive) {
	// 			const event = videoStore.videoEvents[0];
	// 			if (event?.t === VIDEO_EVENT_PLAY_INACTIVE) {
	// 				console.log(
	// 					"[DASH PLAYER] : [INACTIVE] play event received"
	// 				);
	// 				setPlayInActive(true);
	// 			}
	// 			clearVideoEvents();
	// 		}
	// 	})
	// );

	const getSource = (video) => {
		if (!props.video) return null;

		return (
			(props.video?.video?.asana_dash_url ||
				props.video?.video?.transition_dash_url) ??
			""
		);
	};

	onMount(() => {
		onCleanup(() => {
			console.log("[DASH PLAYER] Cleanup, DASH PLAYER RESET");
			if (playerRef()) {
				playerRef().destroy();
			}

			if (nextPlayerRef()) {
				nextPlayerRef().destroy();
			}
		});
	});

	// createEffect(
	// 	on([() => props.src, () => props.video, () => props.nextVideo], () => {
	// 		if (!props.src) return;

	// 		console.log("[DASH PLAYER] : setup", {
	// 			src: props.src,
	// 			video: props.video,
	// 			nextVideo: props.nextVideo,
	// 		});

	// 		if (props.nextVideo == null) {
	// 			// current video is last video
	// 			console.log(
	// 				"[DASH PLAYER] : last video ------------------------------>"
	// 			);
	// 			setNextPlayerRef(null);
	// 			setPrevNextVideo(null);
	// 		}

	// 		const prevNV = prevNextVideo();
	// 		// const prevNextSource = getSource(prevNV);
	// 		const nextSource = getSource(props.nextVideo);

	// 		if (props.video?.queue_id === prevNV?.queue_id) {
	// 			console.log(
	// 				"[DASH PLAYER] : middle video ------------------------------>"
	// 			);
	// 			// not first video
	// 			// set up video player for current video
	// 			let p = playerRef();

	// 			if (p) {
	// 				console.log("[DASH PLAYER] : reset prev player");
	// 				// p.reset();
	// 				p.destroy();
	// 			}

	// 			let np = nextPlayerRef();

	// 			if (np) {
	// 				console.log(
	// 					"[DASH PLAYER] : attaching prev next player",
	// 					videoRef.current
	// 					// np.duration()
	// 				);
	// 				np.attachView(videoRef.current);

	// 				// props.setDuration();
	// 				np.play();

	// 				setPlayerRef(np);
	// 			}

	// 			// set up video player for next video
	// 			if (nextSource) {
	// 				console.log("[DASH PLAYER] : setting up next MediaPlayer");
	// 				np = dashjs.MediaPlayer().create();
	// 				np.updateSettings(dashSettings);
	// 				np.initialize(null, nextSource, false, 0.0);
	// 				np.preload();
	// 				setNextPlayerRef(np);
	// 				setPrevNextVideo(props.nextVideo);
	// 			}

	// 			setPlayerRefSet(true);
	// 			setDrmSet(false);
	// 		} else {
	// 			// first video
	// 			console.log(
	// 				"[DASH PLAYER] : first video ------------------------------>"
	// 			);

	// 			let p = dashjs.MediaPlayer().create();
	// 			p.updateSettings(dashSettings);
	// 			p.initialize(videoRef.current, props.src, false, 0.0);
	// 			p.preload();
	// 			p.play();
	// 			setPlayerRef(p);
	// 			console.log("[DASH PLAYER] : player created");

	// 			if (nextSource) {
	// 				// set up video player for next video
	// 				let np = dashjs.MediaPlayer().create();
	// 				np.updateSettings(dashSettings);
	// 				np.initialize(null, nextSource, false, 0.0);
	// 				np.preload();
	// 				setNextPlayerRef(np);
	// 				setPrevNextVideo(props.nextVideo);
	// 				console.log("[DASH PLAYER] : next player created");
	// 			}

	// 			setPlayerRefSet(true);
	// 			setDrmSet(false);
	// 		}

	// 		onCleanup(() => {
	// 			// console.log("[DASH PLAYER] Cleanup, player reset");
	// 			// if (playerRef()) {
	// 			// 	playerRef().destroy();
	// 			// }
	// 			// if (nextPlayerRef()) {
	// 			// 	nextPlayerRef().destroy();
	// 			// }
	// 		});
	// 	})
	// );

	createEffect(
		on([() => props.src], () => {
			if (!props.src) return;

			console.log("[DASH PLAYER] : setup", {
				src: props.src,
				video: props.video,
			});

			let p = nextPlayerRef();

			if (p) {
				p.attachView(videoRef.current);
				p.play();

				setPlayerRef(p);
				setPlayerRefSet(true);
				setDrmSet(false);
			} else {
				// first video
				p = dashjs.MediaPlayer().create();
				p.updateSettings(dashSettings);
				p.initialize(videoRef.current, props.src, false, 0.0);
				p.preload();
				p.play();
				setPlayerRef(p);

				setPlayerRefSet(true);
				setDrmSet(false);
			}

			onCleanup(() => {
				console.log("[DASH PLAYER] Cleanup, player reset");
				if (playerRef()) {
					playerRef().destroy();
				}
			});
		})
	);

	createEffect(
		on([() => props.nextVideo, playerRef], () => {
			let p = playerRef();

			if (!p) return;

			// set up next video
			let nextSource = getSource(props.nextVideo);

			if (nextSource) {
				let np = dashjs.MediaPlayer().create();
				np.updateSettings(dashSettings);
				np.initialize(null, nextSource, false, 0.0);
				np.preload();

				setNextPlayerRef(np);
				setPrevNextVideo(props.nextVideo);
			} else {
				setNextPlayerRef(null);
				setPrevNextVideo(null);
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

					console.log("[DASH PLAYER] : metrics", m);

					setMetrics(m);
				}
			}, 1000);

			onCleanup(() => {
				console.log("[DASH PLAYER] : clearing metrics interval");
				clearInterval(eventPoller);
			});
		})
	);

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
					console.log("[DASH PLAYER] : updating volume");
					playerRef().setVolume(videoStore.volume);
				} else if (playerRef() && !props.isActive && metadataLoaded()) {
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

	// createEffect(
	// 	on([playerRefSet, () => props.src, drmSet], () => {
	// 		if (playerRefSet() && drmSet() && props.src) {
	// 			console.log("[DASH PLAYER] : preloading");
	// 			playerRef().preload();
	// 			playerRef().play().catch((error) => {
	// 				console.error("Play failed");
	// 			});
	// 		}
	// 	})
	// );

	// createEffect(
	// 	on([playerRefSet, () => props.src, drmSet], () => {
	// 		if (playerRefSet() && drmSet() && props.src) {
	// 			console.log("[DASH PLAYER] : preloading");
	// 			playerRef().preload();
	// 			const playPromise = playerRef()
	// 				.play()
	// 				.catch((error) => {
	// 					console.error("Play failed:", error);
	// 				});
	// 			playPromise.then(() => {
	// 				playerRef().pause();
	// 			});
	// 		}
	// 	})
	// );

	createEffect(
		on(
			[
				playerRefSet,
				playerRef,
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
					// playerRef().play();
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
						// playInActiveTimer = setTimeout(() => {
						//   console.log("sending video event!");
						//   addVideoEvent({ t: VIDEO_EVENT_PLAY_INACTIVE });
						// }, inactiveVideoDuration * 1000);
					}
				}
			}
		)
	);

	// DRM Info
	createEffect(
		on(
			[
				playerRefSet,
				playerRef,
				() => props.src,
				() => props.isAsanaVideo,
			],
			() => {
				if (playerRefSet && props.src && videoRef.current) {
					console.log("[DASH PLAYER] : setting DRM Info");
					const check = isMobileTablet();
					const isMobile = { done: true, check: check };
					console.log("Checking for isMobile", isMobile);
					// const store = useVideoStore.getState();
					var playreadyKeyUrl;
					playreadyKeyUrl = videoStore.playreadyKeyUrl ?? undefined;
					// const setPlayreadyKeyUrl = videoStore.setPlayreadyKeyUrl;
					//console.log("Fetching DRM Info");
					console.log(
						"[DASH PLAYER] : isAsanaVideo",
						props.isAsanaVideo
					);
					let player = playerRef();

					if (props.isAsanaVideo) {
						if (isMobile.check) {
							// Mobile
							Fetch({
								url: "/playback/get-widevine-token",
								method: "POST",
								token: false,
							})
								.then((res) => {
									const data = res.data;
									console.log(
										"[DASH PLAYER] : widevine token"
									);

									if (data && data.licenseAcquisitionUrl) {
										player.setProtectionData({
											"com.widevine.alpha": {
												serverURL:
													data.licenseAcquisitionUrl,
											},
										});
										// player
										// 	.getProtectionController()
										// 	.setLicensePreFetch(true);
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
						} else {
							// Non Mobile
							if (playreadyKeyUrl) {
								console.log(
									"[DASH PLAYER] : playready token cached"
								);
								player.setProtectionData({
									"com.microsoft.playready": {
										serverURL: playreadyKeyUrl,
									},
								});
								// player
								// 	.getProtectionController()
								// 	.setLicensePreFetch(true);
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
											player.setProtectionData({
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
											// player
											// 	.getProtectionController()
											// 	.setLicensePreFetch(true);
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
			}
		)
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

	const onStreamInitialized = () => {
		console.log("[DASH PLAYER] : stream initialized");
		setStreamInitialized(true);
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
			// playerRef().current.player.play();
			// if (playInActiveTimer) {
			//   clearTimeout(playInActiveTimer);
			// }
			//   playerRef().current.currentTime = 0;

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
			// playInActiveTimer = setTimeout(() => {
			//   console.log("sending video event!");
			//   addVideoEvent({ t: VIDEO_EVENT_PLAY_INACTIVE });
			// }, inactiveVideoDuration * 1000);
		}
	};

	const onPause = () => {
		if (props.isActive) {
			if (videoStore.videoState !== STATE_VIDEO_PAUSED) {
				console.log(
					"PAUSING ----------------------------->",
					props.video.idx
				);
				// setVideoState(STATE_VIDEO_PAUSED);
			}
			clearVideoEvents();

			// if (playInActiveTimer) {
			//     clearTimeout(playInActiveTimer);
			//   }
		}
	};

	const onWaiting = () => {
		console.log("[DASH PLAYER] : onWaiting event");

		if (props.isActive) {
			setVideoState(STATE_VIDEO_LOADING);
		}
	};

	// Setting event listeners
	createEffect(
		on(
			[
				playerRefSet,
				playerRef,
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
				if (playerRef() && playerRefSet() && videoRef.current) {
					console.log("[DASH PLAYER] : setting up event listeners");
					playerRef().on(
						dashjs.MediaPlayer.events.CAN_PLAY_THROUGH,
						props.onCanPlayThrough
					);
					playerRef().on(
						dashjs.MediaPlayer.events.PLAYBACK_LOADED_DATA,
						() => {
							videoRef.current.currentTime = 0;
						}
					);
					// playerRef().on(
					// 	dashjs.MediaPlayer.events.PLAYBACK_WAITING,
					// 	onWaiting
					// );
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
					// playerRef().on(
					// 	dashjs.MediaPlayer.events.PLAYBACK_WAITING,
					// 	onWaiting
					// );
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

	return (
		<div class={"dash-player w-full h-full relative"}>
			<div class="absolute left-4 top-4 bg-white p-2 text-sm break-all max-w-xl text-black">
				<pre>{JSON.stringify(metrics(), null, 2)}</pre>
			</div>
			<video
				class="aspect-video"
				id={props.queueItemId}
				ref={setVideoRef}
				controls></video>
		</div>
	);
}

export default DPSingle;
