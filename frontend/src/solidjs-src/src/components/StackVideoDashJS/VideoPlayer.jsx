import "./StackVideo.css";

// import { useCallback } from "react";
import { usePlaylistStoreContext } from "../../store/PlaylistStore.jsx";
import {
	STATE_VIDEO_ERROR,
	STATE_VIDEO_LOADING,
	STATE_VIDEO_PLAY,
	useVideoStoreContext,
} from "../../store/VideoStore.jsx";

// import { Button } from "@geist-ui/core";
// import { FaPause, FaPlay } from "react-icons/fa6";
import { For, Show, createEffect, createSignal, on, onCleanup } from "solid-js";
import { SEEK_TYPE_MOVE } from "../../enums/seek_types";
import { VIDEO_PAUSE_MARKER } from "../../enums/video_pause_reasons";
import { VIDEO_VIEW_TEACHING_MODE } from "../../enums/video_view_modes";
import { STATE_VIDEO_PAUSED } from "../../store/VideoStore.jsx";
import { useWatchHistoryContext } from "../../store/WatchHistoryStore.jsx";
import StreamStackItem from "./StreamStackItem";

function VideoPlayer() {
	const [playlistStore, { popFromQueue }] = usePlaylistStoreContext();

	const [
		videoStore,
		{
			setCurrentVideo,
			setVideoState,
			setPlaylistState,
			addToSeekQueue,
			setPauseReason,
			setCurrentMarkerIdx,
			setCurrentTime,
			setFullScreen,
		},
	] = useVideoStoreContext();

	// watch history store
	let [watchHistoryStore, { addToCommittedTs }] = useWatchHistoryContext();

	const [videoStateVisible, setVideoStateVisible] = createSignal(false);
	// const [duration, setDuration] = createSignal(0);

	// const draggableHandle = useRef(null);

	const handleReset = () => {
		setCurrentMarkerIdx(null);
		setPauseReason(null);
		setCurrentTime(0);
	};

	const handleEnd = () => {
		console.log("Video ended ------------------>");
		let currentMarker = null;

		if (
			videoStore.currentMarkerIdx === null ||
			!videoStore.markers ||
			videoStore.markers.length === 0
		) {
			currentMarker = null;
		} else {
			currentMarker = videoStore.markers[videoStore.currentMarkerIdx];
		}

		// check if teaching mode, loopback to previous marker
		if (videoStore.viewMode === VIDEO_VIEW_TEACHING_MODE) {
			console.log("VIDEO ENDED : TEACHING MODE: ", currentMarker);
			if (currentMarker && currentMarker?.loop) {
				console.log(
					"VIDEO END : TEACHING MODE: moving to ",
					currentMarker
				);
				addToSeekQueue({
					t: currentMarker?.timestamp || 0,
					type: SEEK_TYPE_MOVE,
				});
				return;
			}
			console.log(
				"VIDEO END : TEACHING MODE: popping video, marker null"
			);

			handleReset();
			popFromQueue(0);
		} else {
			console.log("VIDEO ENDED : STUDENT MODE: popping video");
			// if student mode, pop from queue
			handleReset();
			popFromQueue(0);
		}
	};

	const handleSetPlay = (isActive) => {
		console.log("SETTING VIDEO STATE TO PLAY ------------>");

		if (isActive) {
			let videoState = videoStore.videoState;
			let markersLength = videoStore.markers?.length || 0;
			let currentMarkerIdx = videoStore.currentMarkerIdx;
			let pauseReason = videoStore.pauseReason;

			if (videoState === STATE_VIDEO_PAUSED) {
				if (pauseReason === VIDEO_PAUSE_MARKER) {
					console.log("VIDEO PLAY : PAUSE REASON MARKER");
					// autoSetCurrentMarkerIdx()
					// set next marker
					setCurrentMarkerIdx((currentMarkerIdx + 1) % markersLength);
					setPauseReason(null);
				}
			}

			if (videoState !== STATE_VIDEO_PLAY) {
				setVideoState(STATE_VIDEO_PLAY);
			}
		}
	};

	const handleSetPause = (isActive) => {
		console.log("SETTING VIDEO STATE TO PAUSE ------------>");
		if (isActive) {
			setVideoState(STATE_VIDEO_PAUSED);
		}
	};
	const handleLoading = (loading, isActive) => {
		if (isActive) {
			if (loading) setVideoState(STATE_VIDEO_LOADING);
			else {
				handleSetPlay(isActive);
			}
		}
	};

	const handlePlaybackError = (isActive) => {
		console.log("Error playing video ------------------->");
		if (isActive) {
			setVideoState(STATE_VIDEO_ERROR);
		}
	};

	const handleStartPlaylist = () => {
		console.log(videoStore.currentVideo, playlistStore.queue.length);
		if (
			videoStore.currentVideo === null &&
			playlistStore.queue.length > 0
		) {
			console.log("Playlist start --------------------->");
			setPlaylistState(false);
			setTimeout(() => {
				setPlaylistState(true);
			}, 100);
		}
	};

	// const handleAlternatePlayPause = useCallback(() => {
	// 	if (videoState === STATE_VIDEO_PLAY) {
	// 		handleSetPause();
	// 	} else if (videoState === STATE_VIDEO_PAUSED) {
	// 		handleSetPlay();
	// 	}
	// }, [videoState, handleSetPlay, handleSetPause]);

	// const handleFullScreen = useFullScreenHandle();

	const toTimeString = (seconds) => {
		const s = seconds > 0 ? seconds : 0;

		return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(
			Math.ceil(s) % 60
		).padStart(2, "0")}`;
	};

	const [videos, setVideos] = createSignal([]);

	createEffect(
		on(
			// dependencies
			[() => playlistStore.queue, () => videoStore.playlistState],
			() => {
				console.log(
					"Queue or playlistState changed : ",
					videoStore.playlistState
				);
				if (
					playlistStore.queue &&
					playlistStore.queue.length > 0 &&
					videoStore.playlistState
				) {
					setCurrentVideo(playlistStore.queue[0]);
				} else {
					setCurrentVideo(null);
					setVideoState(STATE_VIDEO_LOADING);
					setPlaylistState(false);
				}
			}
		)
	);

	createEffect(
		on(
			() => playlistStore.queue,
			(q) => {
				console.log("Queue changed : called", q);
				let timeout = null;

				if (timeout) {
					clearTimeout(timeout);
				}

				if (q.length > 0) {
					console.log("VIDEOPLAYER.js : Setting first video");
					setVideos((prevVideos) => {
						if (q.length > 0) {
							const firstVideo = q[0];
							prevVideos.splice(0, 2, firstVideo);
							return [...prevVideos];
						} else {
							return [...prevVideos];
						}
					});
					timeout = setTimeout(() => {
						console.log("VIDEOPLAYER.js : Setting second video");
						setVideos((prevVideos) => {
							if (q.length > 1) {
								const secondVideo = q[1];
								prevVideos.splice(1, 1, secondVideo);
								return [...prevVideos];
							} else {
								return [...prevVideos];
							}
						});
					}, 2000);
				} else {
					setVideos([]);
				}
				onCleanup(() => {
					if (timeout) {
						clearTimeout(timeout);
					}
				});
			}
		)
	);

	createEffect(
		on([() => videoStore.currentVideo], (v) => {
			const currentVideo = v[0];

			if (currentVideo && currentVideo) {
				console.log(currentVideo.queue_id);
			}
		})
	);

	return (
		<div
			class={`hover:cursor-pointer bg-black border w-full ${
				videoStore.fullScreen
					? "fixed z-[1000] top-0 left-0 right-0 bottom-0"
					: "rounded-xl overflow-hidden"
			}`}>
			{/* <div>
				{String(videoStore.playlistState)}|{playlistStore.queue.length}
				{JSON.stringify(videoStore.currentVideo)}|{videos().length}
				<button
					onClick={() => {
						console.log("setting ...");
						setPlaylistState(true);
						console.log("set...");
					}}>
					Alt
				</button>
			</div> */}
			{/* <pre>{JSON.stringify(videos())}</pre> */}
			<div
				class={`${
					videoStore.fullScreen ? "h-full" : "mx-auto aspect-video"
				}`}>
				<Show
					when={
						videoStore.currentVideo &&
						videoStore.currentVideo !== null &&
						videoStore.currentVideo !== undefined
					}
					fallback={
						<Show
							when={playlistStore.queue.length > 0}
							fallback={<p></p>}>
							<div class="flex flex-col items-center justify-center gap-4 text-lg w-full h-full">
								<button
									onClick={handleStartPlaylist}
									class="btn">
									Start
								</button>
							</div>
						</Show>
					}>
					<Show
						when={videoStore.videoState !== STATE_VIDEO_ERROR}
						fallback={
							<div class="flex flex-col items-center justify-center gap-4 text-lg w-full h-full">
								<p>Error : Video playback error</p>
								<button onClick={handleSetPlay}>Refresh</button>
							</div>
						}>
						<div class="relative w-full h-full">
							{/* <div class="flex flex-row items-end gap-4"> */}
							<Show when={playlistStore.queue.length > 0}>
								<For each={playlistStore.queue.slice(0, 2)}>
									{(queueItem) => {
										return (
											<StreamStackItem
												key={queueItem.queue_id}
												video={queueItem}
												handleEnd={handleEnd}
												handleLoading={handleLoading}
												handlePlaybackError={
													handlePlaybackError
												}
												// setDuration={setDuration}
												isActive={
													videoStore.currentVideo
														?.queue_id ===
													queueItem?.queue_id
												}
												setVideoStateVisible={
													setVideoStateVisible
												}
												handleFullScreen={() => {}}
											/>
										);
									}}
								</For>
							</Show>
							{/* <div class="absolute bottom-0 z-20 h-40 w-full opacity-0 transition-opacity delay-1000 duration-300 ease-in-out hover:opacity-100 hover:delay-0">
									<div class="absolute bottom-0 w-full ">
										<VideoPlaybar
											duration={duration}
											draggableHandle={draggableHandle}
											toTimeString={toTimeString}
											handleSetPause={handleSetPause}
											handleSetPlay={handleSetPlay}
											handleFullScreen={() => {}}
										/>
									</div>
								</div> */}
						</div>
					</Show>
				</Show>
			</div>
		</div>
	);
}
export default VideoPlayer;
