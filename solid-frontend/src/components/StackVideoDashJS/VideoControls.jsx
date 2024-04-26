import {usePlaylistStore, usePlaylistStoreContext} from "../store/PlaylistStore";
import useVideoStore, { STATE_VIDEO_LOADING, STATE_VIDEO_PAUSED, STATE_VIDEO_PLAY, useVideoStoreContext } from "../store/VideoStore";
import { Loading, Toggle } from "@geist-ui/core";
import { memo, useCallback, useEffect, useMemo } from "react";
import
	{
		createEffect,
		createMemo,
		createSignal,
		on,
		createRef,
		onCleanup,
	} from "solid-js"

import {
    FaBackward,
    FaExpand,
    FaPause,
    FaPlay,
    FaStepBackward,
    FaStepForward,
} from "react-icons/fa";
import { TbArrowBadgeLeft, TbArrowBadgeRight } from "react-icons/tb";
import { IoMdVolumeHigh, IoMdVolumeLow, IoMdVolumeOff } from "react-icons/io";
import { BsArrowsAngleContract } from "react-icons/bs";
// import { useRef } from "react";
import { toast } from "react-toastify";
import {
    SEEK_TYPE_MARKER,
    SEEK_TYPE_MOVE,
    SEEK_TYPE_SEEK,
} from "../enums/seek_types";
import { VIDEO_PAUSE_MARKER } from "../enums/video_pause_reasons";
import {
    VIDEO_VIEW_STUDENT_MODE,
    VIDEO_VIEW_TEACHING_MODE,
} from "../enums/video_view_modes";

function VideoControls({ handleFullScreen }) {
	const [playlistStore, { popFromQueue, popFromArchive }] =
		usePlaylistStoreContext();	
		let volumeSliderRef = createRef(null);

	// let [
	// 	// videoState.value,
	// 	setVideoState,
	// 	addToSeekQueue,
	// 	volume,
	// 	setVolume,
	// 	// viewMode.value,
	// 	setViewMode,
	// 	markers,
	// 	// currentMarkerIdx.value,
	// 	setCurrentMarkerIdx,
	// 	pauseReason,
	// 	setPauseReason,
	// ] = useVideoStore((state) => [
	// 	state.videoState.value,
	// 	state.setVideoState,
	// 	state.addToSeekQueue,
	// 	state.volume,
	// 	state.setVolume,
	// 	state.viewMode.value,
	// 	state.setViewMode,
	// 	state.markers,
	// 	state.currentMarkerIdx.value,
	// 	state.setCurrentMarkerIdx,
	// 	state.pauseReason,
	// 	state.setPauseReason,
	// ]);

		const [videoStore, { 		
		videoState,
		setVideoState,
		addToSeekQueue,
		volume,
		setVolume,
		viewMode,
		setViewMode,
		markers,
		currentMarkerIdx,
		setCurrentMarkerIdx,
		pauseReason,
		setPauseReason, }] =
		useVideoStoreContext();


	// const handlePlay = useCallback(() => {
	// 	console.log("SETTING VIDEO STATE TO PLAY ------------>");
	// 	if (videoState.value === STATE_VIDEO_PAUSED) {
	// 		if (pauseReason === VIDEO_PAUSE_MARKER) {
	// 			console.log("VIDEO PLAY : PAUSE REASON MARKER");
	// 			setCurrentMarkerIdx(
	// 				currentMarkerIdx.value + 1 > markers.length - 1
	// 					? 0
	// 					: currentMarkerIdx.value + 1
	// 			);
	// 			setPauseReason(null);
	// 		}
	// 	}
	// 	if (videoState.value !== STATE_VIDEO_PLAY) {
	// 		setVideoState(STATE_VIDEO_PLAY);
	// 	}
	// }, [
	// 	videoState.value,
	// 	pauseReason,
	// 	markers,
	// 	currentMarkerIdx.value,
	// 	setPauseReason,
	// 	setCurrentMarkerIdx,
	// 	setVideoState,
	// ]);

	const handlePlay = () => {
    console.log("SETTING VIDEO STATE TO PLAY ------------>");
    if (videoState() === STATE_VIDEO_PAUSED) {
        if (pauseReason() === VIDEO_PAUSE_MARKER) {
            console.log("VIDEO PLAY : PAUSE REASON MARKER");
            setCurrentMarkerIdx(prevIdx => 
                prevIdx + 1 > markers.length - 1 ? 0 : prevIdx + 1
            );
            setPauseReason(null);
        }
    }
    if (videoState() !== STATE_VIDEO_PLAY) {
        setVideoState(STATE_VIDEO_PLAY);
    }
};


	createEffect(
		on([() => volume], () => {
			if (volumeSliderRef.current) {
				volumeSliderRef.current.value = volume * 100;
			}
		})
	);

	const handlePause = useCallback(() => {
		/*
        -- if playing pause it
      */
		console.log("SETTING VIDEO STATE TO PAUSE ------------>");
		setVideoState(STATE_VIDEO_PAUSED);
	}, [setVideoState]);

	const handleNextVideo = useCallback(() => {
		// remove from queue add to archive
		popFromQueue(0);
	}, [popFromQueue]);

	const handleSeekFoward = useCallback(() => {
		addToSeekQueue({ t: 5, type: SEEK_TYPE_SEEK });
	}, [addToSeekQueue]);

	const handleSeekBackward = useCallback(() => {
		addToSeekQueue({ t: -5, type: SEEK_TYPE_SEEK });
	}, [addToSeekQueue]);

	const handlePrevMarker = useCallback(() => {
		console.log("Prev Marker");
		if (markers.length > 0) {
			if (currentMarkerIdx.value === 0) {
				addToSeekQueue({ t: 0, type: SEEK_TYPE_MOVE });
				return;
			}
			const idx =
				((currentMarkerIdx.value || 0) - 1 + markers.length) % markers.length;
			setCurrentMarkerIdx(idx);
			// seek to prev marker
			addToSeekQueue({ t: markers[idx].timestamp, type: SEEK_TYPE_MOVE });
		}
	}, [markers, currentMarkerIdx.value, setCurrentMarkerIdx, addToSeekQueue]);

	const handleNextMarker = useCallback(() => {
		console.log("Next Marker");
		if (markers.length > 0) {
			const idx = ((currentMarkerIdx.value || 0) + 1) % markers.length;
			setCurrentMarkerIdx(idx);
			// seek to next marker
			addToSeekQueue({ t: markers[idx].timestamp, type: SEEK_TYPE_MOVE });
		}
	}, [markers, currentMarkerIdx.value, setCurrentMarkerIdx, addToSeekQueue]);

	const handleViewModeToggle = useCallback(
		(e) => {
			if (e.target.checked) {
				toast("View Mode: teacher", { type: "success" });
				setViewMode(VIDEO_VIEW_TEACHING_MODE);
			} else {
				toast("View Mode: student", { type: "success" });
				setViewMode(VIDEO_VIEW_STUDENT_MODE);
			}
		},
		[setViewMode]
	);

	const handleReplayMarkerAfterPause = useCallback(() => {
		// setPauseReason(null)
		addToSeekQueue({
			t: markers[currentMarkerIdx.value].timestamp,
			type: SEEK_TYPE_MARKER,
		});
	}, [currentMarkerIdx.value, markers, addToSeekQueue]);

	const iconButtonClass = useMemo(() => {
		return handleFullScreen.active
			? "video_controls__ctrl__button_fs "
			: "video_controls__ctrl__button ";
	}, [handleFullScreen.active]);

	return (
		<div class="flex items-center justify-between px-4 pb-1">
			<div class="flex items-center justify-start rounded-xl text-white">
				{/* {String(handleFullScreen.active)} */}
				{/* previous video */}
				<button
					class={iconButtonClass}
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
					class={iconButtonClass + " hidden md:block"}>
					<FaBackward class="video_controls__ctrl__button__icon" />
				</button>
				{/* previous marker */}
				{viewMode.value === VIDEO_VIEW_TEACHING_MODE && (
					<button
						class={iconButtonClass}
						onClick={handlePrevMarker}
						title="Prev Marker">
						<TbArrowBadgeLeft class="video_controls__ctrl__button__icon" />
					</button>
				)}
				{/* play/pause video */}
				<button
					class={`${iconButtonClass} ${
						videoState.value === STATE_VIDEO_LOADING ? "opacity-30" : ""
					}`}
					onClick={() => {
						if (videoState.value === STATE_VIDEO_PLAY) {
							handlePause();
						} else if (videoState.value === STATE_VIDEO_PAUSED) {
							handlePlay();
						}
					}}
					disabled={videoState.value === STATE_VIDEO_LOADING}
					title="Play/Pause">
					{videoState.value === STATE_VIDEO_PLAY ? (
						<FaPause class="video_controls__ctrl__button__icon" />
					) : videoState.value === STATE_VIDEO_PAUSED ? (
						<FaPlay class="video_controls__ctrl__button__icon" />
					) : (
						<Loading color="#fff" />
					)}
				</button>
				{/* next marker */}
				{viewMode.value === VIDEO_VIEW_TEACHING_MODE && (
					<button
						class={iconButtonClass}
						onClick={handleNextMarker}
						title="Next Marker">
						<TbArrowBadgeRight class="video_controls__ctrl__button__icon" />
					</button>
				)}
				{/* seek forward */}
				<button
					onClick={handleSeekFoward}
					title="Fast Forward 5s"
					class={iconButtonClass + " hidden md:block"}>
					<FaStepForward class="video_controls__ctrl__button__icon" />
				</button>

				{/* next video */}
				<button
					class={iconButtonClass}
					onClick={handleNextVideo}
					title="Next Video">
					<FaStepForward class="video_controls__ctrl__button__icon" />
				</button>
				{pauseReason === VIDEO_PAUSE_MARKER && (
					<button
						class="rounded-full border bg-white text-xs text-black lg:px-2 lg:py-1"
						onClick={handleReplayMarkerAfterPause}>
						Replay
					</button>
				)}
				{currentMarkerIdx.value !== null && markers.length > 0 ? (
					<span
						class="mx-2 hidden h-auto max-w-[200px] break-normal break-words text-xs text-white xl:block"
						title={markers[currentMarkerIdx.value].title}>
						{String(markers[currentMarkerIdx.value].title).substring(
							0,
							80
						) + "..." ?? ""}
					</span>
				) : (
					<></>
				)}
			</div>

			{/* volume control */}
			<div class="flex items-center justify-center gap-4 text-white">
				<div class="group flex items-center gap-1">
					<div class={iconButtonClass + ""}>
						{volume === 0 ? (
							<IoMdVolumeOff
								onClick={() => setVolume(0.3)}
								class="h-7 w-7"
							/>
						) : volume > 0.5 ? (
							<IoMdVolumeHigh
								onClick={() => setVolume(0)}
								class="h-7 w-7"
							/>
						) : (
							<IoMdVolumeLow
								onClick={() => setVolume(0.0)}
								class="h-7 w-7"
							/>
						)}
					</div>
					<input
						type="range"
						min="0"
						max="100"
						class="hidden w-0 accent-orange-500 opacity-0 transition-all duration-300 group-hover:w-20 group-hover:opacity-100 md:block"
						ref={volumeSliderRef}
						onChange={(e) =>
							setVolume(parseFloat(e.target.value) / 100)
						}
					/>
				</div>

				<div class="group mr-3 flex items-center gap-3">
					<span
						class="clip-rect-left-0 group-hover:clip-rect-full w-0 text-sm capitalize transition-all duration-300 group-hover:w-16"
						title="Current View Mode">
						{viewMode.value}
					</span>
					<div
						class={handleFullScreen.active ? "-mt-3" : "-mt-1"}
						title="View Mode">
						<Toggle
							checked={viewMode.value === VIDEO_VIEW_TEACHING_MODE}
							type="secondary"
							// class={+handleFullScreen.active ? 'scale-150' : ''}
							scale={handleFullScreen.active ? 2 : 1.3}
							onChange={handleViewModeToggle}
						/>
					</div>
				</div>

				{/* full screen */}
				<button
					class={
						handleFullScreen.active
							? "video_controls__ctrl__button_fs"
							: "video_controls__ctrl__button"
					}
					onClick={() => {
						if (handleFullScreen?.active) handleFullScreen?.exit();
						else handleFullScreen?.enter();
					}}
					title="Full Screen">
					{handleFullScreen.active ? (
						<BsArrowsAngleContract class="video_controls__ctrl__button__icon" />
					) : (
						<FaExpand class="video_controls__ctrl__button__icon" />
					)}
				</button>
			</div>
		</div>
	);
}

export default memo(VideoControls);
