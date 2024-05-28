import {
	SEEK_TYPE_MARKER,
	SEEK_TYPE_MOVE,
	SEEK_TYPE_SEEK,
} from "../../../enums/seek_types";
import {
	STATE_VIDEO_ERROR,
	STATE_VIDEO_LOADING,
	STATE_VIDEO_PAUSED,
	STATE_VIDEO_PLAY,
	useVideoStoreContext,
} from "../../../store/VideoStore";

import {
	Show,
	createEffect,
	createMemo,
	createSignal,
	on,
	onCleanup,
} from "solid-js";
import { VIDEO_EVENT_PLAY_INACTIVE } from "../../../enums/video_event";
import { VIDEO_PAUSE_MARKER } from "../../../enums/video_pause_reasons";
import { VIDEO_VIEW_STUDENT_MODE } from "../../../enums/video_view_modes";
import DPSingle from "./DPSingle";

// console.log(STATE_VIDEO_LOADING);

function StreamItem(props) {
	// const user = useUserStore((state) => state.user);
	const [playerRef, setPlayerRef] = createSignal({
		current: { player: null, videoElement: null },
	});
	const commitTimeInterval = null;
	const flushTimeInterval = null;
	let intervalTimer = null;
	let playInActiveTimer = null;

	let [duration, setDuration] = createSignal(0);

	// const [metadataLoaded, setMetadataLoaded] = createSignal(false);
	// const [autoplayInitialized, setAutoplayInitialized] = createSignal(false);
	const [playerLoaded, setPlayerLoaded] = createSignal(false);

	const videoUrl = createMemo(
		on([() => props.video], () => {
			if (!props.video) return null;

			return (
				(props.video?.video?.asana_dash_url ||
					props.video?.video?.transition_dash_url) ??
				""
			);
		})
	);

	// createEffect(
	// 	on([() => props.isActive, () => props.video], () => {
	// 		console.log(props.video, props.isActive);

	// 		if (props.isActive) {
	// 			console.log(playerRef(), "IS REF!"); // If needed for debugging
	// 			if (playerRef().current.player !== null) {
	// 				playerRef().current.player.preload();
	// 			}
	// 		} else {
	// 			console.log(playerRef(), "IS REF NON ACTIVE");
	// 		}
	// 		console.log({
	// 			propsIsActive: props.isActive,
	// 			videoidx: props.video?.idx,
	// 		});
	// 	})
	// );

	const [
		videoStore,
		{
			clearSeekQueue,
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
			addVideoEvent,
			clearVideoEvents,
		},
	] = useVideoStoreContext();

	// seeking
	createEffect(
		on([() => props.isActive, () => videoStore.seekQueue], () => {
			if (props.isActive && videoStore.seekQueue.length > 0) {
				const seekEvent = videoStore.seekQueue[0];
				console.log("SEEKING --->", seekEvent);
				if (seekEvent && playerRef().current) {
					switch (seekEvent.type) {
						case SEEK_TYPE_SEEK: {
							let ct =
								playerRef().current.videoElement.currentTime +
								seekEvent.t;
							if (
								ct > playerRef().current.videoElement.duration
							) {
								props.handleEnd();
								popFromSeekQueue(0);
								return;
							}
							if (ct < 0) ct = 0;

							playerRef().current.videoElement.currentTime = ct;
							setCommitSeekTime(ct);
							break;
						}
						case SEEK_TYPE_MOVE: {
							let st = seekEvent.t < 0 ? 0 : seekEvent.t;
							if (
								st > playerRef().current.videoElement.duration
							) {
								props.handleEnd();
								popFromSeekQueue(0);
								return;
							}
							playerRef().current.videoElement.currentTime = st;
							setCommitSeekTime(st);
							break;
						}
						case SEEK_TYPE_MARKER: {
							if (
								seekEvent.t >
								playerRef().current.videoElement.duration
							) {
								props.handleEnd();
								popFromSeekQueue(0);
								return;
							}
							playerRef().current.videoElement.currentTime =
								seekEvent.t;
							setCommitSeekTime(seekEvent.t);
							break;
						}
						default:
							break;
					}

					// addToCommittedTs(
					// 	playerRef().current?.videoElement.currentTime
					// );
				}
			}
		})
	);

	// current time loop
	createEffect(
		on(
			[
				() => props.isActive,
				() => videoStore.seekQueue,
				() => videoStore.commitSeekTime,
				() => videoStore.viewMode,
				() => videoStore.markers,
				() => videoStore.currentMarkerIdx,
				() => videoStore.currentVideo,
				() => videoStore.videoState,
			],
			() => {
				const checkSeek = (ct) => {
					if (
						videoStore.seekQueue.length > 0 &&
						videoStore.commitSeekTime.toFixed(1) === ct.toFixed(1)
					) {
						if (props.isActive)
							props.handleLoading(false, props.isActive);
						autoSetCurrentMarkerIdx(videoStore.commitSeekTime);
						return true;
					} else {
						return false;
					}
				};

				// checks if the video should be paused or looped based on markers
				// returns true, if the loop should be skipped
				// if in student mode, always return false
				//
				const checkPauseOrLoop = (ct) => {
					if (videoStore.viewMode === VIDEO_VIEW_STUDENT_MODE) {
						return false;
					} else {
						let currentMarker =
							videoStore.markers[videoStore.currentMarkerIdx];
						if (
							videoStore.currentMarkerIdx ===
							videoStore.markers.length - 1
						) {
							return false;
						} else if (
							ct >
							videoStore.markers[videoStore.currentMarkerIdx + 1]
								?.timestamp
						) {
							if (currentMarker?.loop) {
								console.log("LOOPING CUZ OF MARKER");
								addToSeekQueue({
									type: SEEK_TYPE_MARKER,
									t: currentMarker?.timestamp,
								});
								return true;
							} else {
								if (
									videoStore.videoState !== STATE_VIDEO_PAUSED
								) {
									console.log("PAUSING CUZ OF MARKER");
									setVideoState(STATE_VIDEO_PAUSED);
									setPauseReason(VIDEO_PAUSE_MARKER);
								}
								return true;
							}
						}
					}
				};

				if (
					props.isActive &&
					videoStore.videoState !== STATE_VIDEO_ERROR &&
					videoStore.videoState !== STATE_VIDEO_LOADING
				) {
					console.log("createEffect : initializing interval timer");
					intervalTimer = setInterval(() => {
						if (playerRef().current?.videoElement) {
							if (
								checkSeek(
									playerRef().current?.videoElement
										?.currentTime
								)
							) {
								// popFromSeekQueue(0);
								// TODO: see if logic is fine, if there are outstanding seeks,
								// clear them as they must have been added to the commit seek time
								clearSeekQueue();
								setVideoState(STATE_VIDEO_PLAY);
								return;
							}

							if (
								videoStore.videoState !== STATE_VIDEO_LOADING &&
								checkPauseOrLoop(
									playerRef().current?.videoElement
										?.currentTime
								)
							) {
								return;
							}

							// set current marker based on current time of video
							if (
								videoStore.videoState !== STATE_VIDEO_LOADING ||
								videoStore.videoState !== STATE_VIDEO_ERROR ||
								videoStore.videoState !== STATE_VIDEO_PAUSED
							) {
								autoSetCurrentMarkerIdx(
									playerRef().current?.videoElement
										?.currentTime
								);
							}

							// TODO: check if theres a better solution, in student mode
							// before 0.05 seconds of video end, add a video event
							// to play the inactive video
							if (
								videoStore.viewMode ===
									VIDEO_VIEW_STUDENT_MODE &&
								playerRef().current?.videoElement?.currentTime -
									playerRef().current?.videoElement
										?.duration >
									-0.05
							) {
								if (videoStore.videoEvents.length === 0) {
									console.log(
										"[StreamStackItem] Video event play inactive",
										{
											currentTime:
												playerRef().current
													?.videoElement?.currentTime,
											duration:
												playerRef().current
													?.videoElement?.duration,
										}
									);
									addVideoEvent({
										t: VIDEO_EVENT_PLAY_INACTIVE,
									});
								}
							}

							setCurrentTime(
								playerRef().current?.videoElement?.currentTime
							);
							// setVolume(playerRef().current?.videoElement?.volume);
						}
					}, 33.33);
				}

				onCleanup(() => {
					console.log("createEffect : cleaning up interval timer");
					if (intervalTimer) clearInterval(intervalTimer);
				});
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

	const handlePlayerError = () => {
		setVideoState(STATE_VIDEO_ERROR);
	};

	const handlePlayerLoading = (e) => {
		props.handleLoading(true, props.isActive);
	};

	const handlePlayerLoaded = (e) => {
		props.handleLoading(false, props.isActive);
	};

	// props.video events
	const handleVideoSeeking = (e) => {
		console.log("Seeking...");
		props.handleLoading(true, props.isActive);
	};

	const handleVideoSeeked = (e) => {
		console.log("Seeked...");
		setVideoState(STATE_VIDEO_PLAY);
	};

	const handleVideoCanPlayThrough = (e) => {
		// setMetadataLoaded(true);
		// const state = useVideoStore.getState();
		console.log(
			"Can play through...",
			videoStore.videoState,
			playerRef().current.videoElement.currentTime
		);
		// tryToPlay();
		// setVideoState(STATE_VIDEO_PLAY);
	};

	// set the videoStore.volume
	const handleVideoVolumeChange = () => {
		const vVolume =
			playerRef().current.videoElement.volume > 0
				? playerRef().current.videoElement.volume
				: 0;
		if (
			playerRef().current !== null &&
			playerRef().current.videoElement !== null &&
			videoStore.volume !== vVolume
		) {
			setVolume(vVolume);
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
		<div class="absolute h-full w-full">
			<div
				class={`relative stream-stack-item w-full h-full ${
					props.isActive ? "block" : "invisible"
				}`}>
				{/* class={props.isActive ? "flex-1" : "w-60"}> */}
				<DPSingle
					ref={playerInit}
					src={videoUrl()}
					queueItemId={props.video.idx}
					isAsanaVideo={
						!isNaN(props.video?.video?.id) &&
						typeof props.video?.video?.id === "number"
					}
					video={props.video}
					nextVideo={props.nextVideo}
					isActive={props.isActive}
					onError={handlePlayerError}
					onCanPlayThrough={handleVideoCanPlayThrough}
					onVolumeChange={handleVideoVolumeChange}
					onEnded={props.handleEnd}
					onLoading={handlePlayerLoading}
					onLoaded={handlePlayerLoaded}
					onSeeking={handleVideoSeeking}
					onSeeked={handleVideoSeeked}
					setDuration={setDuration}
				/>

				<Show when={videoStore.fullScreen}>
					<div class="absolute top-0 left-0 text-white z-[1001] h-1/2 w-full p-8 hover:opacity-100 opacity-0 hover:delay-0 delay-1000">
						<h5 class="uppercase text-gray-300">
							{props?.video?.video?.asana_name
								? "ASANA"
								: "TRANSITION"}
						</h5>
						<h3>
							{props?.video?.video?.asana_name ||
								props?.video?.video?.transition_name}
						</h3>
					</div>
				</Show>

				{/* <div class="absolute bottom-0 z-20 h-1/3 w-full opacity-0 transition-opacity delay-1000 duration-300 ease-in-out hover:opacity-100 hover:delay-0 pointer-events-auto touch-auto">
					<div class="absolute bottom-0 w-full">
						<VideoPlaybar
							isActive={props.isActive}
							playbarVisible={true}
							duration={duration}
							toTimeString={toTimeString}
							handleSetPlay={props.handleSetPlay}
							handleSetPause={props.handleSetPause}
							handleFullScreen={{
								enter: () => {},
								exit: () => {},
								active: false,
							}}
						/>
					</div>
				</div> */}
			</div>
		</div>
	);
}

export default StreamItem;
