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
				p.initialize(null, props.src, false, 0.0);
				// p.initialize(null, props.src, true, { autoplay: true, muted: true });
				// p.initialize(null, props.src, true, { autoplay: true, muted: true });
				p.attachView(videoRef.current);
				// p.preload();
				// p.play();
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
				} else if (
					playerRef() &&
					(!props.isActive || !metadataLoaded())
				) {
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
					playerRef().play();
				} else if (videoStore.videoState === STATE_VIDEO_PAUSED) {
					playerRef().pause();
				}
			}
		})
	);

	// DRM Info
	createEffect(
		on([playerRefSet, () => props.src, () => props.isAsanaVideo], () => {
			if (playerRefSet() && props.src && videoRef.current) {
				console.log("in drm setter!!");
				const check = isMobileTablet();
				const isMobile = { done: true, check: check };
				var playreadyKeyUrl = videoStore.playreadyKeyUrl ?? undefined;
				console.log(
					"in drm setter : playready key url",
					playreadyKeyUrl
				);
				if (props.isAsanaVideo) {
					console.log("in drm setter : is asana");
					if (isMobile.check) {
						Fetch({
							url: "/playback/get-widevine-token",
							method: "POST",
							token: false,
						})
							.then((res) => {
								console.log("in drm setter : is mobile");
								const data = res.data;
								if (data && data.licenseAcquisitionUrl) {
									console.log(
										"in drm setter : is mobile, data obtained, setting now"
									);
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
								props.onError();
							});
					} else {
						console.log("in drm setter : is laptop");
						if (playreadyKeyUrl) {
							console.log(
								"in drm setter: is asana, is drm, is laptop",
								playreadyKeyUrl
							);
							playerRef().setProtectionData({
								"com.microsoft.playready": {
									serverURL: playreadyKeyUrl,
								},
							});
							setDrmSet(true);
						} else {
							console.log(
								"in drm setter: is asana, is drm, is laptop",
								playreadyKeyUrl
							);
							Fetch({
								url: "/playback/get-playready-token",
								method: "POST",
								token: false,
							})
								.then((res) => {
									const data = res.data;
									console.log(
										"in drm setter: is asana, is drm, is laptop, data obtained : ",
										data
									);

									if (
										data &&
										data.licenseAcquisitionUrl &&
										data.token
									) {
										console.log(
											"in drm setter : setting everything!!"
										);
										playerRef().setProtectionData({
											"com.microsoft.playready": {
												serverURL:
													data.licenseAcquisitionUrl +
													"?ExpressPlayToken=" +
													data.token,
											},
										});
										setPlayreadyKeyUrl(
											data.licenseAcquisitionUrl +
												"?ExpressPlayToken=" +
												data.token
										);
										setDrmSet(true);
									}
								})
								.catch((err) => {
									props.onError();
								});
						}
					}
				} else {
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

	const onStreamInitialized = () => {
		console.log("[DASH PLAYER] : stream initialized");
		videoRef.current.currentTime = 0;
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

	const onTimeUpdate = (e) => {
		console.log(
			"[DASH PLAYER] : onTimeUpdate event",
			videoRef.current.currentTime,
			videoRef.current.buffered
		);
	};

	const onSeeked = () => {
		console.log(
			"[DASH PLAYER] : onSeeked event",
			videoRef.current.currentTime
		);
		setVideoState(STATE_VIDEO_PLAY);
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
						() => {
							videoRef.current.currentTime = 0;
						}
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
						onSeeked
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

					videoRef.current.addEventListener(
						"timeupdate",
						onTimeUpdate
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
						onSeeked
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

					videoRef.current.removeEventListener(
						"timeupdate",
						onTimeUpdate
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
