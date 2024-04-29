import {
	BiRegularExitFullscreen,
	BiRegularFullscreen,
	BiSolidBookReader,
} from "solid-icons/bi";
import { Match, Show, Switch, createEffect, createMemo, on } from "solid-js";
import { usePlaylistStoreContext } from "../../store/PlaylistStore";
import {
	STATE_VIDEO_LOADING,
	STATE_VIDEO_PAUSED,
	STATE_VIDEO_PLAY,
	useVideoStoreContext,
} from "../../store/VideoStore";

import {
	FaSolidBackward as FaBackward,
	FaSolidForward as FaForward,
	FaSolidPause as FaPause,
	FaSolidPlay as FaPlay,
	FaSolidPersonChalkboard,
} from "solid-icons/fa";

import {
	AiFillStepBackward as FaStepBackward,
	AiFillStepForward as FaStepForward,
} from "solid-icons/ai";
import { IoVolumeHigh, IoVolumeLow, IoVolumeOff } from "solid-icons/io";
import { TbArrowBadgeLeft, TbArrowBadgeRight } from "solid-icons/tb";

import {
	SEEK_TYPE_MARKER,
	SEEK_TYPE_MOVE,
	SEEK_TYPE_SEEK,
} from "../../enums/seek_types";

import { VIDEO_PAUSE_MARKER } from "../../enums/video_pause_reasons";
import {
	VIDEO_VIEW_STUDENT_MODE,
	VIDEO_VIEW_TEACHING_MODE,
} from "../../enums/video_view_modes";

function VideoControls(props) {
	const [playlistStore, { popFromQueue, popFromArchive }] =
		usePlaylistStoreContext();

	let volumeSliderRef = null;

	const [
		videoStore,
		{
			setVideoState,
			addToSeekQueue,
			setVolume,
			setViewMode,
			setCurrentMarkerIdx,
			setPauseReason,
			setFullScreen,
		},
	] = useVideoStoreContext();

	const handlePlay = () => {
		console.log("SETTING VIDEO STATE TO PLAY ------------>");
		if (videoStore.videoState === STATE_VIDEO_PAUSED) {
			if (videoStore.pauseReason === VIDEO_PAUSE_MARKER) {
				console.log("VIDEO PLAY : PAUSE REASON MARKER");
				setCurrentMarkerIdx((prevIdx) =>
					prevIdx + 1 > videoStore.markers.length - 1
						? 0
						: prevIdx + 1
				);
				setPauseReason(null);
			}
		}
		if (videoStore.videoState !== STATE_VIDEO_PLAY) {
			setVideoState(STATE_VIDEO_PLAY);
		}
	};

	createEffect(
		on([() => videoStore.volume], () => {
			if (volumeSliderRef) {
				volumeSliderRef.value = videoStore.volume * 100;
			}
		})
	);

	const handlePause = () => {
		console.log("SETTING VIDEO STATE TO PAUSE ------------>");
		setVideoState(STATE_VIDEO_PAUSED);
	};

	const handleNextVideo = () => {
		popFromQueue(0);
	};

	const handleSeekFoward = () => {
		addToSeekQueue({ t: 5, type: SEEK_TYPE_SEEK });
	};

	const handleSeekBackward = () => {
		addToSeekQueue({ t: -5, type: SEEK_TYPE_SEEK });
	};

	const handlePrevMarker = () => {
		console.log("Prev Marker");
		if (videoStore.markers.length > 0) {
			if (videoStore.currentMarkerIdx === 0) {
				addToSeekQueue({ t: 0, type: SEEK_TYPE_MOVE });
				return;
			}
			const idx =
				((videoStore.currentMarkerIdx || 0) -
					1 +
					videoStore.markers.length) %
				videoStore.markers.length;
			setCurrentMarkerIdx(idx);
			addToSeekQueue({
				t: videoStore.markers[idx].timestamp,
				type: SEEK_TYPE_MOVE,
			});
		}
	};

	const handleNextMarker = () => {
		console.log("Next Marker");
		if (videoStore.markers.length > 0) {
			const idx =
				((videoStore.currentMarkerIdx || 0) + 1) %
				videoStore.markers.length;
			setCurrentMarkerIdx(idx);
			// seek to next marker
			addToSeekQueue({
				t: videoStore.markers[idx].timestamp,
				type: SEEK_TYPE_MOVE,
			});
		}
	};

	const handleViewModeToggle = (e) => {
		if (videoStore.viewMode === VIDEO_VIEW_STUDENT_MODE) {
			// toast("View Mode: teacher", { type: "success" });
			setViewMode(VIDEO_VIEW_TEACHING_MODE);
		} else {
			// toast("View Mode: student", { type: "success" });
			setViewMode(VIDEO_VIEW_STUDENT_MODE);
		}
	};

	const handleReplayMarkerAfterPause = () => {
		addToSeekQueue({
			t: videoStore.markers[videoStore.currentMarkerIdx].timestamp,
			type: SEEK_TYPE_MARKER,
		});
	};

	const handleFullScreen = () => {
		if (videoStore.fullScreen) {
			setFullScreen(false);
		} else {
			setFullScreen(true);
		}
	};

	const iconButtonClass = createMemo(
		on([() => ""], () => {
			// return videoStore.fullScreen
			// 	? "video_controls__ctrl__button_fs "
			// 	: "video_controls__ctrl__button ";

			return "video_controls__ctrl__button";
		})
	);

	return (
		<div class="flex items-center justify-between px-4 pb-1">
			<div class="flex items-center justify-start rounded-xl text-white">
				{/* {String(videoStore.fullScreen)} */}
				{/* previous video */}
				<button
					class={iconButtonClass()}
					onClick={() => {
						popFromArchive(-1);
					}}
					title="Previous video">
					<FaStepBackward class="video_controls__ctrl__button__icon" />
				</button>
				{/* seek back */}
				<button
					onClick={handleSeekBackward}
					title="Rewind 5s"
					class={iconButtonClass() + " hidden md:block"}>
					<FaBackward class="video_controls__ctrl__button__icon" />
				</button>
				{/* previous marker */}
				<Show when={videoStore.viewMode === VIDEO_VIEW_TEACHING_MODE}>
					<button
						class={iconButtonClass()}
						onClick={handlePrevMarker}
						title="Prev Marker">
						<TbArrowBadgeLeft class="video_controls__ctrl__button__icon" />
					</button>
				</Show>

				{/* play/pause video */}
				<button
					class={`${iconButtonClass()} ${
						videoStore.videoState === STATE_VIDEO_LOADING
							? "opacity-30"
							: ""
					}`}
					onClick={() => {
						if (videoStore.videoState === STATE_VIDEO_PLAY) {
							handlePause();
						} else if (
							videoStore.videoState === STATE_VIDEO_PAUSED
						) {
							handlePlay();
						}
					}}
					disabled={videoStore.videoState === STATE_VIDEO_LOADING}
					title="Play/Pause">
					<Switch>
						<Match
							when={videoStore.videoState === STATE_VIDEO_PLAY}>
							<FaPause class="video_controls__ctrl__button__icon" />
						</Match>

						<Match
							when={videoStore.videoState === STATE_VIDEO_PAUSED}>
							<FaPlay class="video_controls__ctrl__button__icon" />
						</Match>

						<Match
							when={
								videoStore.videoState === STATE_VIDEO_LOADING
							}>
							<p>...</p>
						</Match>
					</Switch>
				</button>
				{/* next marker */}
				{videoStore.viewMode === VIDEO_VIEW_TEACHING_MODE && (
					<button
						class={iconButtonClass()}
						onClick={handleNextMarker}
						title="Next Marker">
						<TbArrowBadgeRight class="video_controls__ctrl__button__icon" />
					</button>
				)}
				{/* seek forward */}
				<button
					onClick={handleSeekFoward}
					title="Fast Forward 5s"
					class={iconButtonClass() + " hidden md:block"}>
					<FaForward class="video_controls__ctrl__button__icon" />
				</button>

				{/* next video */}
				<button
					class={iconButtonClass()}
					onClick={handleNextVideo}
					title="Next Video">
					<FaStepForward class="video_controls__ctrl__button__icon" />
				</button>

				<Show when={videoStore.pauseReason === VIDEO_PAUSE_MARKER}>
					<button
						class="rounded-full border bg-white text-xs text-black lg:px-2 lg:py-1"
						onClick={handleReplayMarkerAfterPause}>
						Replay
					</button>
				</Show>

				<Show
					when={
						videoStore.currentMarkerIdx !== null &&
						videoStore.markers.length > 0
					}>
					<span
						class="mx-2 hidden h-auto max-w-[200px] break-normal break-words text-xs text-white xl:block"
						title={
							videoStore.markers[videoStore.currentMarkerIdx]
								?.title
						}>
						{String(
							videoStore.markers[videoStore.currentMarkerIdx]
								?.title
						).substring(0, 80) + "..." ?? ""}
					</span>
				</Show>
			</div>

			{/* videoStore.volume control */}
			<div class="flex items-center justify-center gap-4 text-white">
				<div class="group flex items-center gap-1">
					<div class={iconButtonClass() + ""}>
						<Switch>
							<Match when={videoStore.volume === 0}>
								<IoVolumeOff
									onClick={() => setVolume(0.3)}
									class="h-7 w-7"
								/>
							</Match>
							<Match when={videoStore.volume > 0.5}>
								<IoVolumeHigh
									onClick={() => setVolume(0.0)}
									class="h-7 w-7"
								/>
							</Match>
							<Match
								when={
									videoStore.volume <= 0.5 &&
									videoStore.volume > 0
								}>
								<IoVolumeLow
									onClick={() => setVolume(0.0)}
									class="h-7 w-7"
								/>
							</Match>
						</Switch>
					</div>
					<input
						type="range"
						min="0"
						max="100"
						class="hidden w-0 accent-orange-500 opacity-0 transition-all duration-300 group-hover:w-20 xl:group-hover:w-28 group-hover:opacity-100 md:block"
						ref={volumeSliderRef}
						onChange={(e) => {
							console.log(
								"[VIDEO CONTROLS] VOLUME : ",
								parseFloat(e.target.value)
							);
							setVolume(parseFloat(e.target.value) / 100);
						}}
					/>
				</div>

				<div class="group mr-3 flex items-center gap-3">
					<span
						class="clip-rect-left-0 group-hover:clip-rect-full w-0 text-sm capitalize transition-all duration-300 group-hover:w-16"
						title="Current View Mode">
						{videoStore.viewMode}
					</span>
					<div
						class={videoStore.fullScreen ? "" : ""}
						title="View Mode">
						<button
							onClick={handleViewModeToggle}
							class={videoStore.fullScreen ? "mt-1.5" : "mt-1.5"}>
							<Switch>
								<Match
									when={
										videoStore.viewMode ===
										VIDEO_VIEW_TEACHING_MODE
									}>
									<FaSolidPersonChalkboard class="video_controls__ctrl__button__icon" />
								</Match>
								<Match
									when={
										videoStore.viewMode ===
										VIDEO_VIEW_STUDENT_MODE
									}>
									<BiSolidBookReader class="video_controls__ctrl__button__icon" />
								</Match>
							</Switch>
						</button>
					</div>
				</div>

				{/* full screen */}
				<button
					class={
						videoStore.fullScreen
							? "video_controls__ctrl__button_fs"
							: "video_controls__ctrl__button"
					}
					onClick={handleFullScreen}
					title="Full Screen">
					<Switch>
						<Match when={videoStore.fullScreen}>
							<BiRegularExitFullscreen class="video_controls__ctrl__button__icon" />
						</Match>

						<Match when={!videoStore.fullScreen}>
							<BiRegularFullscreen class="video_controls__ctrl__button__icon" />
						</Match>
					</Switch>
				</button>
			</div>
		</div>
	);
}

export default VideoControls;
