import usePlaylistStore from "../../store/PlaylistStore";
import useVideoStore, { STATE_VIDEO_LOADING } from "../../store/VideoStore";
// import asanas from "../../data/asanas.json";
import { Loading, Tooltip } from "@geist-ui/core";
import { memo, useEffect } from "react";
import {
	FaBackward,
	FaExpand,
	FaForward,
	FaPause,
	FaPlay,
	FaStepBackward,
	FaStepForward,
} from "react-icons/fa";

import { IoMdVolumeLow, IoMdVolumeOff } from "react-icons/io";

import { BsArrowsAngleContract } from "react-icons/bs";

// import { toast } from "react-toastify";
import { useRef } from "react";
import { STATE_VIDEO_PAUSED, STATE_VIDEO_PLAY } from "../../store/VideoStore";

function VideoControls({ handleFullScreen }) {
	let popFromQueue = usePlaylistStore((state) => state.popFromQueue);
	let popFromArchive = usePlaylistStore((state) => state.popFromArchive);
	let volumeSliderRef = useRef(null);

	let [videoState, setVideoState, addToSeekQueue, volume, setVolume] =
		useVideoStore((state) => [
			state.videoState,
			state.setVideoState,
			state.addToSeekQueue,
			state.volume,
			state.setVolume,
		]);

	const handlePlay = () => {
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
		setVideoState(STATE_VIDEO_PLAY);
	};

	useEffect(() => {
		if (volumeSliderRef.current) {
			volumeSliderRef.current.value = volume * 100;
		}
	}, [volume]);

	const handlePause = () => {
		/*
        -- if playing pause it
      */
		setVideoState(STATE_VIDEO_PAUSED);
	};

	const handleNextVideo = () => {
		// remove from queue add to archive
		popFromQueue(0);
	};

	const handleSeekFoward = () => {
		addToSeekQueue({ t: 10, type: "seek" });
	};

	const handleSeekBackward = () => {
		addToSeekQueue({ t: -10, type: "seek" });
	};

	return (
		<div className="flex justify-between items-center px-4">
			<div className="col-start-4 col-span-3 flex gap-8 items-center justify-start text-white rounded-xl p-2">
				<Tooltip text={"Previous Video"} scale={0.5} type="dark">
					<button
						className="w-5 h-5"
						onClick={() => {
							popFromArchive(-1);
						}}>
						<FaStepBackward className="w-full h-full" />
					</button>
				</Tooltip>

				<Tooltip text={"Rewind 10s"} scale={0.5} type="dark">
					<button onClick={handleSeekBackward}>
						<FaBackward />
					</button>
				</Tooltip>

				<Tooltip text={"Play/Pause"} scale={0.5} type="dark">
					<button
						className={`w-5 h-5 ${
							videoState === STATE_VIDEO_LOADING
								? "opacity-30"
								: ""
						}`}
						onClick={() => {
							if (videoState === STATE_VIDEO_PLAY) {
								handlePause();
							} else if (videoState === STATE_VIDEO_PAUSED) {
								handlePlay();
							}
						}}
						disabled={videoState === STATE_VIDEO_LOADING}>
						{videoState === STATE_VIDEO_PLAY ? (
							<FaPause className="w-full h-full" />
						) : videoState === STATE_VIDEO_PAUSED ? (
							<FaPlay className="w-full h-full" />
						) : (
							<Loading color="#fff" />
						)}
					</button>
				</Tooltip>

				<Tooltip text={"Fast Forward 10s"} scale={0.5} type="dark">
					<button onClick={handleSeekFoward}>
						<FaForward />
					</button>
				</Tooltip>

				<Tooltip text={"Next Video"} scale={0.5} type="dark">
					<button className="w-5 h-5" onClick={handleNextVideo}>
						<FaStepForward className="w-full h-full" />
					</button>
				</Tooltip>
			</div>
			<div className="flex items-center justify-center gap-4 text-white">
				<div className="col-start-9 flex items-center gap-1 mb-1">
					{volume === 0 ? (
						<IoMdVolumeOff onClick={() => setVolume(0.3)} />
					) : (
						<IoMdVolumeLow />
					)}
					<input
						type="range"
						min="0"
						max="100"
						class="accent-orange-500"
						ref={volumeSliderRef}
						onChange={(e) =>
							setVolume(parseFloat(e.target.value) / 100)
						}
					/>
				</div>
				<Tooltip
					text={"Full Screen"}
					scale={0.5}
					type="dark"
					className="">
					<button
						className="w-5 h-5"
						onClick={() => {
							if (handleFullScreen.active)
								handleFullScreen.exit();
							else handleFullScreen.enter();
						}}>
						{handleFullScreen.active ? (
							<BsArrowsAngleContract className="w-full h-full" />
						) : (
							<FaExpand className="w-full h-full" />
						)}
					</button>
				</Tooltip>
			</div>
		</div>
	);
}

export default memo(VideoControls);
