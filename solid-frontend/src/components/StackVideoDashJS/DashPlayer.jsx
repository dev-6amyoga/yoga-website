import dashjs from "dashjs";
import { createEffect, createSignal, on, onCleanup } from "solid-js";
import { dashSettings } from "../../lib/dashjs-settings";
import { useVideoStoreContext } from "../../store/VideoStore";
import { Fetch } from "../../utils/Fetch";
import { isMobileTablet } from "../../utils/isMobileOrTablet";

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
	const [playerRef, setPlayerRef] = createSignal(null);
	const [playerRefSet, setPlayerRefSet] = createSignal(false);
	const [metadataLoaded, setMetadataLoaded] = createSignal(false);
	const [streamInitialized, setStreamInitialized] = createSignal(false);
	const [drmSet, setDrmSet] = createSignal(false);
	console.log("dashplayer! >>>>");

	const [videoStore, { setPlayreadyKeyUrl }] = useVideoStoreContext();

	const onMetadataLoaded = () => {
		console.log("[DASH PLAYER] : metadata loaded");
		setMetadataLoaded(true);
	};

	const onPlaybackNotAllowed = () => {
		if (playerRef() && isActive) {
			console.log("[DASH PLAYER] : playback not allowed");
			playerRef().setMute(true);
			playerRef().initialize(videoRef.current, props.src, true);
			playerRef().setMute(false);
		}
	};

	const onStreamInitialized = () => {
		console.log("[DASH PLAYER] : stream initialized");
		setStreamInitialized(true);
	};

	createEffect(
		on([() => props.src], () => {
			//is it not picking up src? for some reason??
			// no wait one sec
			console.log("[DASH PLAYER] : setup", { src: props.src });
			let p = null;
			if (props.src) {
				p = dashjs.MediaPlayer().create();
				setPlayerRef(p);
				p.updateSettings(dashSettings);
				p.initialize(null, props.src, true);
				// p.initialize(null, props.src, true, { autoplay: true, muted: true });
				p.attachView(videoRef.current);
				setPlayerRefSet(true);
				console.log("[DASH PLAYER] : player created");
			}

			onCleanup(() => {
				console.log("[DASH PLAYER] Cleanup, player reset");
			});
		})
	);

	createEffect(
		on([playerRefSet, () => props.src, drmSet], () => {
			if (playerRefSet() && drmSet() && props.src) {
				console.log("[DASH PLAYER] : preloading");
				playerRef().preload();
			}
		})
	);

	// 	createEffect(on([playerRefSet, ()=> props.src, metadataLoaded, streamInitialized], () => {
	//   if (playerRefSet() && props.src && metadataLoaded() && streamInitialized()) {
	//      if (props.isActive) {
	//        playerRef().play().catch((error) => {
	//          console.error("Autoplay failed");
	//        });
	//      }
	//    }
	// }));

	createEffect(
		on([playerRefSet, () => props.src, () => props.isAsanaVideo], () => {
			if (playerRefSet && props.src && videoRef.current) {
				console.log("[DASH PLAYER] : setting DRM Info");
				const check = isMobileTablet();
				const isMobile = { done: true, check: check };
				console.log("Checking for isMobile", isMobile);
				// const store = useVideoStore.getState();
				var playreadyKeyUrl;
				playreadyKeyUrl = undefined;
				// const setPlayreadyKeyUrl = videoStore.setPlayreadyKeyUrl;
				//console.log("Fetching DRM Info");
				console.log("[DASH PLAYER] : isAsanaVideo", props.isAsanaVideo);

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

	createEffect(
		on(
			[
				playerRefSet,
				() => props.src,
				() => onMetadataLoaded,
				() => props.setDuration,
				() => props.onCanPlayThrough,
				() => props.onEnded,
				() => onPlaybackNotAllowed,
				() => props.onError,
				() => props.onPause,
				() => props.onPlay,
				() => props.onVolumeChange,
				() => props.onSeeked,
				() => props.onSeeking,
			],
			() => {
				if (playerRefSet() && props.src && videoRef.current) {
					console.log("[DASH PLAYER] : setting up event listeners");
					playerRef().on(
						dashjs.MediaPlayer.events.CAN_PLAY_THROUGH,
						props.onCanPlayThrough
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
						props.onPause
					);
					playerRef().on(
						dashjs.MediaPlayer.events.PLAYBACK_PLAYING,
						props.onPlay
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
						props.onPause
					);
					playerRef().off(
						dashjs.MediaPlayer.events.PLAYBACK_PLAYING,
						props.onPlay
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

	// set ref
	// useImperativeHandle(
	// 	ref,
	// 	() => {
	// 		console.log("[DASH PLAYER] : ref");
	// 		return {
	// 			get player() {
	// 				return playerRef();
	// 			},
	// 			get videoElement() {
	// 				return videoRef.current;
	// 			},
	// 			get videoUrl() {
	// 				try {
	// 					return playerRef().getSource();
	// 				} catch (error) {
	// 					return null;
	// 				}
	// 			},
	// 			set videoUrl(url) {
	// 				if (playerRef() === null) {
	// 					return;
	// 				}

	// 				// playerRef().setSource(url);
	// 				// playerRef().player.initialize();
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
	// 				// playerRef().attachView(element);
	// 			}
	// 		}
	// 	},
	// 	[playerRefSet]
	// );

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
		<div class={props.className + " relative"}>
			<video ref={setVideoRef} controls></video>
		</div>
	);
}

export default DashPlayer;
