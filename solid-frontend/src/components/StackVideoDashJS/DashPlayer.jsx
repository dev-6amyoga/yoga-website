import dashjs from "dashjs";
import { createEffect, createSignal, on } from "solid-js";
import { useVideoStoreContext } from "../../store/VideoStore";
import { dashSettings } from "../lib/dashjs-settings";
import { Fetch } from "../utils/Fetch";
import { isMobileTablet } from "../utils/isMobileOrTablet";

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

function DashPlayer(props) {
	const videoRef = { current: null };
	const playerRef = { current: null };
	const [playerRefSet, setPlayerRefSet] = createSignal(false);
	const [metadataLoaded, setMetadataLoaded] = createSignal(false);
	const [streamInitialized, setStreamInitialized] = createSignal(false);

	const [videoStore, { setPlayreadyKeyUrl }] = useVideoStoreContext();

	const onMetadataLoaded = () => {
		console.log("[DASH PLAYER] : metadata loaded");
		setMetadataLoaded(true);
	};

	const onPlaybackNotAllowed = () => {
		if (playerRef.current && isActive) {
			console.log("[DASH PLAYER] : playback not allowed");
			playerRef.current.setMute(true);
			playerRef.current.initialize(videoRef.current, src, true);
			playerRef.current.setMute(false);
		}
	};

	const onStreamInitialized = () => {
		console.log("[DASH PLAYER] : stream initialized");
		setStreamInitialized(true);
	};

	createEffect(
		on([() => props.src], () => {
			console.log("[DASH PLAYER] : setup");
			const p = dashjs.MediaPlayer().create();
			playerRef.current = p;
			playerRef.current.updateSettings(dashSettings);
			playerRef.current.initialize(null, src, true);
			setPlayerRefSet(true);
			return () => {
				console.log("[DASH PLAYER] Cleanup, player reset");
				p.reset();
			};
		})
	);

	createEffect(
		on([() => playerRefSet, () => props.src, () => drmSet], () => {
			if (playerRefSet && drmSet && src) {
				console.log("[DASH PLAYER] : preloading");
				playerRef.current.attachView(videoRef.current);
				playerRef.current.preload();
			}
		})
	);

	createEffect(
		on([playerRefSet, () => props.src, () => props.isAsanaVideo], () => {
			if (playerRefSet && src && videoRef.current) {
				console.log("[DASH PLAYER] : setting DRM Info");
				const check = isMobileTablet();
				const isMobile = { done: true, check: check };
				console.log("Checking for isMobile", isMobile);
				// const store = useVideoStore.getState();
				var playreadyKeyUrl;
				playreadyKeyUrl = videoStore.playreadyKeyUrl;
				// const setPlayreadyKeyUrl = videoStore.setPlayreadyKeyUrl;
				//console.log("Fetching DRM Info");
				console.log("[DASH PLAYER] : isAsanaVideo", isAsanaVideo);

				if (isAsanaVideo) {
					if (isMobile.check) {
						// Mobile
						Fetch({
							url: "/playback/get-widevine-token",
							method: "POST",
							token: false,
						})
							.then((res) => {
								const data = res.data;
								console.log("[DASH PLAYER] : widevine token");

								if (data && data.licenseAcquisitionUrl) {
									playerRef.current.setProtectionData({
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
							playerRef.current.setProtectionData({
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
										playerRef.current.setProtectionData({
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

	createEffect(
		on(
			[
				playerRefSet,
				() => props.src,
				onMetadataLoaded,
				props.setDuration,
				props.onCanPlayThrough,
				props.onEnded,
				onPlaybackNotAllowed,
				props.onError,
				props.onPause,
				props.onPlay,
				props.onVolumeChange,
				props.onSeeked,
				props.onSeeking,
			],
			() => {
				if (playerRefSet() && src() && videoRef.current) {
					console.log("[DASH PLAYER] : setting up event listeners");
					playerRef.current.on(
						dashjs.MediaPlayer.events.CAN_PLAY_THROUGH,
						props.onCanPlayThrough
					);
					playerRef.current.on(
						dashjs.MediaPlayer.events.ERROR,
						props.onError
					);
					playerRef.current.on(
						dashjs.MediaPlayer.events.PLAYBACK_ENDED,
						props.onEnded
					);
					playerRef.current.on(
						dashjs.MediaPlayer.events.PLAYBACK_SEEKED,
						props.onSeeked
					);
					playerRef.current.on(
						dashjs.MediaPlayer.events.PLAYBACK_SEEKING,
						props.onSeeking
					);
					playerRef.current.on(
						dashjs.MediaPlayer.events.PLAYBACK_NOT_ALLOWED,
						onPlaybackNotAllowed
					);

					playerRef.current.on(
						dashjs.MediaPlayer.events.PLAYBACK_PAUSED,
						props.onPause
					);
					playerRef.current.on(
						dashjs.MediaPlayer.events.PLAYBACK_PLAYING,
						props.onPlay
					);
					playerRef.current.on(
						dashjs.MediaPlayer.events.PLAYBACK_VOLUME_CHANGED,
						props.onVolumeChange
					);
					playerRef.current.on(
						dashjs.MediaPlayer.events.PLAYBACK_METADATA_LOADED,
						onMetadataLoaded
					);
					playerRef.current.on(
						dashjs.MediaPlayer.events.STREAM_INITIALIZED,
						onStreamInitialized
					);
				}

				return () => {
					console.log("[DASH PLAYER] switching off event listeners");
					playerRef.current.off(
						dashjs.MediaPlayer.events.CAN_PLAY_THROUGH,
						props.onCanPlayThrough
					);
					playerRef.current.off(
						dashjs.MediaPlayer.events.ERROR,
						props.onError
					);
					playerRef.current.off(
						dashjs.MediaPlayer.events.PLAYBACK_ENDED,
						props.onEnded
					);
					playerRef.current.off(
						dashjs.MediaPlayer.events.PLAYBACK_SEEKED,
						props.onSeeked
					);
					playerRef.current.off(
						dashjs.MediaPlayer.events.PLAYBACK_SEEKING,
						props.onSeeking
					);
					playerRef.current.off(
						dashjs.MediaPlayer.events.PLAYBACK_NOT_ALLOWED,
						onPlaybackNotAllowed
					);
					playerRef.current.off(
						dashjs.MediaPlayer.events.PLAYBACK_PAUSED,
						props.onPause
					);
					playerRef.current.off(
						dashjs.MediaPlayer.events.PLAYBACK_PLAYING,
						props.onPlay
					);
					playerRef.current.off(
						dashjs.MediaPlayer.events.PLAYBACK_VOLUME_CHANGED,
						props.onVolumeChange
					);
					playerRef.current.off(
						dashjs.MediaPlayer.events.PLAYBACK_METADATA_LOADED,
						onMetadataLoaded
					);
					playerRef.current.off(
						dashjs.MediaPlayer.events.STREAM_INITIALIZED,
						onStreamInitialized
					);
				};
			}
		)
	);

	// set ref
	// useImperativeHandle(
	// 	ref,
	// 	() => {
	// 		console.log("[DASH PLAYER] : ref");
	// 		return {
	// 			get player() {
	// 				return playerRef.current;
	// 			},
	// 			get videoElement() {
	// 				return videoRef.current;
	// 			},
	// 			get videoUrl() {
	// 				try {
	// 					return playerRef.current.getSource();
	// 				} catch (error) {
	// 					return null;
	// 				}
	// 			},
	// 			set videoUrl(url) {
	// 				if (playerRef.current === null) {
	// 					return;
	// 				}

	// 				// playerRef.current.setSource(url);
	// 				// playerRef.current.player.initialize();
	// 			},
	// 		};
	// 	},
	// 	[playerRefSet]
	// );

	// const setVideoRef =
	// 	(element) => {
	// 		// console.log("[DASH PLAYER] : setVideoRef", element);
	// 		if (element !== null) {
	// 			videoRef.current = element;
	// 			if (playerRefSet) {
	// 				// playerRef.current.attachView(element);
	// 			}
	// 		}
	// 	},
	// 	[playerRefSet]
	// );

	const setVideoRef = (element) => {
		videoRef.current = element;
	};

	createEffect(
		on([playerRefSet], () => {
			if (playerRefSet) {
				props.ref({
					player: playerRef.current,
					videoElement: videoRef.current,
				});
			}
		})
	);

	return (
		<div class={className + " relative"}>
			<video ref={setVideoRef} {...rest}></video>
		</div>
	);
}

export default DashPlayer;
