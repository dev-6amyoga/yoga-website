import usePlaylistStore from "../../store/PlaylistStore";
import useVideoStore, { STATE_VIDEO_LOADING } from "../../store/VideoStore";
// import asanas from "../../data/asanas.json";
import { Loading, Toggle } from "@geist-ui/core";
import { memo, useCallback, useEffect, useMemo } from "react";
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

// import { toast } from "react-toastify";
import { useRef } from "react";
import { toast } from "react-toastify";
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
import { STATE_VIDEO_PAUSED, STATE_VIDEO_PLAY } from "../../store/VideoStore";

function VideoControls({ handleFullScreen }) {
	let popFromQueue = usePlaylistStore((state) => state.popFromQueue);
	let popFromArchive = usePlaylistStore((state) => state.popFromArchive);
	let volumeSliderRef = useRef(null);

	let [
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
		setPauseReason,
	] = useVideoStore((state) => [
		state.videoState,
		state.setVideoState,
		state.addToSeekQueue,
		state.volume,
		state.setVolume,
		state.viewMode,
		state.setViewMode,
		state.markers,
		state.currentMarkerIdx,
		state.setCurrentMarkerIdx,
		state.pauseReason,
		state.setPauseReason,
	]);

	const handlePlay = useCallback(() => {
		/*
			-- if currentVideo is null then play (video starts)
			-- else if video is running, pause. if video not running(paused), play
		*/
		// if (currentVideo === null && queue.length > 0) {
		// 	setPlaylistState(true);
		// 	setCurrentVideo(queue[0]);
		// } else if (currentVideo === null && queue.length === 0) {
		// 	setPlaylistState(false);
		// 	toast("Please add videos to queue!", { type: "warning" });
		// 	return;
		// } else {
		// }
		// setVideoState(STATE_VIDEO_PLAY)

		console.log("SETTING VIDEO STATE TO PLAY ------------>");

		if (videoState === STATE_VIDEO_PAUSED) {
			if (pauseReason === VIDEO_PAUSE_MARKER) {
				console.log("VIDEO PLAY : PAUSE REASON MARKER");
				setCurrentMarkerIdx(
					currentMarkerIdx + 1 > markers.length - 1
						? 0
						: currentMarkerIdx + 1
				);
				setPauseReason(null);
			}
		}

		if (videoState !== STATE_VIDEO_PLAY) {
			setVideoState(STATE_VIDEO_PLAY);
		}
	}, [
		videoState,
		pauseReason,
		markers,
		currentMarkerIdx,
		setPauseReason,
		setCurrentMarkerIdx,
		setVideoState,
	]);

	useEffect(() => {
		if (volumeSliderRef.current) {
			volumeSliderRef.current.value = volume * 100;
		}
	}, [volume]);

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
			if (currentMarkerIdx === 0) {
				addToSeekQueue({ t: 0, type: SEEK_TYPE_MOVE });
				return;
			}
			const idx =
				((currentMarkerIdx || 0) - 1 + markers.length) % markers.length;
			setCurrentMarkerIdx(idx);
			// seek to prev marker
			addToSeekQueue({ t: markers[idx].timestamp, type: SEEK_TYPE_MOVE });
		}
	}, [markers, currentMarkerIdx, setCurrentMarkerIdx, addToSeekQueue]);

	const handleNextMarker = useCallback(() => {
		console.log("Next Marker");
		if (markers.length > 0) {
			const idx = ((currentMarkerIdx || 0) + 1) % markers.length;
			setCurrentMarkerIdx(idx);
			// seek to next marker
			addToSeekQueue({ t: markers[idx].timestamp, type: SEEK_TYPE_MOVE });
		}
	}, [markers, currentMarkerIdx, setCurrentMarkerIdx, addToSeekQueue]);

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
			t: markers[currentMarkerIdx].timestamp,
			type: SEEK_TYPE_MARKER,
		});
	}, [currentMarkerIdx, markers, addToSeekQueue]);

	const iconButtonClass = useMemo(() => {
		return handleFullScreen.active
			? "video_controls__ctrl__button_fs "
			: "video_controls__ctrl__button ";
	}, [handleFullScreen.active]);

	return (
		<div className="flex items-center justify-between px-4 pb-1">
			<div className="flex items-center justify-start rounded-xl text-white">
				{/* {String(handleFullScreen.active)} */}
				{/* previous video */}
				<button
					className={iconButtonClass}
					onClick={() => {
						popFromArchive(-1);
					}}
					title="Previous video">
					<FaStepBackward className="video_controls__ctrl__button__icon" />
				</button>
				{/* seek back */}
				<button
					onClick={handleSeekBackward}
					title="Rewind 5s"
					className={iconButtonClass + " hidden md:block"}>
					<FaBackward className="video_controls__ctrl__button__icon" />
				</button>
				{/* previous marker */}
				{viewMode === VIDEO_VIEW_TEACHING_MODE && (
					<button
						className={iconButtonClass}
						onClick={handlePrevMarker}
						title="Prev Marker">
						<TbArrowBadgeLeft className="video_controls__ctrl__button__icon" />
					</button>
				)}
				{/* play/pause video */}
				<button
					className={`${iconButtonClass} ${
						videoState === STATE_VIDEO_LOADING ? "opacity-30" : ""
					}`}
					onClick={() => {
						if (videoState === STATE_VIDEO_PLAY) {
							handlePause();
						} else if (videoState === STATE_VIDEO_PAUSED) {
							handlePlay();
						}
					}}
					disabled={videoState === STATE_VIDEO_LOADING}
					title="Play/Pause">
					{videoState === STATE_VIDEO_PLAY ? (
						<FaPause className="video_controls__ctrl__button__icon" />
					) : videoState === STATE_VIDEO_PAUSED ? (
						<FaPlay className="video_controls__ctrl__button__icon" />
					) : (
						<Loading color="#fff" />
					)}
				</button>
				{/* next marker */}
				{viewMode === VIDEO_VIEW_TEACHING_MODE && (
					<button
						className={iconButtonClass}
						onClick={handleNextMarker}
						title="Next Marker">
						<TbArrowBadgeRight className="video_controls__ctrl__button__icon" />
					</button>
				)}
				{/* seek forward */}
				<button
					onClick={handleSeekFoward}
					title="Fast Forward 5s"
					className={iconButtonClass + " hidden md:block"}>
					<FaBackward className="video_controls__ctrl__button__icon rotate-180" />
				</button>

				{/* next video */}
				<button
					className={iconButtonClass}
					onClick={handleNextVideo}
					title="Next Video">
					<FaStepForward className="video_controls__ctrl__button__icon" />
				</button>
				{pauseReason === VIDEO_PAUSE_MARKER && (
					<button
						className="rounded-full border bg-white text-xs text-black lg:px-2 lg:py-1"
						onClick={handleReplayMarkerAfterPause}>
						Replay
					</button>
				)}
				{currentMarkerIdx !== null && markers.length > 0 ? (
					<span
						className="mx-2 hidden h-auto max-w-[200px] break-normal break-words text-xs text-white xl:block"
						title={markers[currentMarkerIdx].title}>
						{String(markers[currentMarkerIdx].title).substring(
							0,
							80
						) + "..." ?? ""}
					</span>
				) : (
					<></>
				)}
			</div>

			{/* volume control */}
			<div className="flex items-center justify-center gap-4 text-white">
				<div className="group flex items-center gap-1">
					<div className={iconButtonClass + ""}>
						{volume === 0 ? (
							<IoMdVolumeOff
								onClick={() => setVolume(0.3)}
								className="h-7 w-7"
							/>
						) : volume > 0.5 ? (
							<IoMdVolumeHigh
								onClick={() => setVolume(0)}
								className="h-7 w-7"
							/>
						) : (
							<IoMdVolumeLow
								onClick={() => setVolume(0.0)}
								className="h-7 w-7"
							/>
						)}
					</div>
					<input
						type="range"
						min="0"
						max="100"
						className="hidden w-0 accent-orange-500 opacity-0 transition-all duration-300 group-hover:w-20 group-hover:opacity-100 md:block"
						ref={volumeSliderRef}
						onChange={(e) =>
							setVolume(parseFloat(e.target.value) / 100)
						}
					/>
				</div>

				<div className="group mr-3 flex items-center gap-3">
					<span
						className="clip-rect-left-0 group-hover:clip-rect-full w-0 text-sm capitalize transition-all duration-300 group-hover:w-16"
						title="Current View Mode">
						{viewMode}
					</span>
					<div
						className={handleFullScreen.active ? "-mt-3" : "-mt-1"}
						title="View Mode">
						<Toggle
							checked={viewMode === VIDEO_VIEW_TEACHING_MODE}
							type="secondary"
							// className={+handleFullScreen.active ? 'scale-150' : ''}
							scale={handleFullScreen.active ? 2 : 1.3}
							onChange={handleViewModeToggle}
						/>
					</div>
				</div>

				{/* full screen */}
				<button
					className={
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
						<BsArrowsAngleContract className="video_controls__ctrl__button__icon" />
					) : (
						<FaExpand className="video_controls__ctrl__button__icon" />
					)}
				</button>
			</div>
		</div>
	);
}

export default memo(VideoControls);
