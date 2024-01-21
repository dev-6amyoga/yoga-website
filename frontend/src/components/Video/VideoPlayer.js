import React, { useEffect, useRef } from "react";
import usePlaylistStore from "../../store/PlaylistStore";
import useVideoStore, {
	STATE_VIDEO_ERROR,
	STATE_VIDEO_LOADING,
	STATE_VIDEO_PLAY,
} from "../../store/VideoStore";
// import asanas from "../../data/asanas.json";
import { Stream } from "@cloudflare/stream-react";

import { Loading } from "@geist-ui/core";
import { useState } from "react";
import { toast } from "react-toastify";
import { STATE_VIDEO_PAUSED } from "../../store/VideoStore";
import VideoPlaybar from "./VideoPlaybar";

function VideoPlayer() {
	const player = useRef(null);
	// const queue = usePlaylistStore((state) => state.queue);
	let popFromQueue = usePlaylistStore((state) => state.popFromQueue);

	const seekQueue = useVideoStore((state) => state.seekQueue);
	let popFromSeekQueue = useVideoStore((state) => state.popFromSeekQueue);

	let currentVideo = useVideoStore((state) => state.currentVideo);
	let videoState = useVideoStore((state) => state.videoState);
	let setVideoState = useVideoStore((state) => state.setVideoState);

	const [playerVideoId, setPlayerVideoId] = useState(currentVideo);

	const [duration, setDuration] = useState(0);
	const [currentTime, setCurrentTime] = useState(0);

	const [playbarVisible, setPlaybarVisible] = useState(false);

	const draggableHandle = useRef(null);

	useEffect(() => {
		if (currentVideo) {
			setPlayerVideoId(currentVideo?.video?.asana_videoID);
			if (player.current) {
				player.current.currentTime = 0;
			}
		} else {
			setPlayerVideoId(null);
		}
	}, [currentVideo]);

	useEffect(() => {
		if (seekQueue.length > 0) {
			const seekTime = seekQueue[0];

			if (seekTime && player.current) {
				player.current.currentTime =
					player.current.currentTime + Number(seekTime);
			}

			popFromSeekQueue(0);
		}
	}, [seekQueue, popFromSeekQueue]);

	useEffect(() => {
		if (player.current != null) {
			if (videoState === STATE_VIDEO_PAUSED) {
				player.current.pause();
			} else {
				/*
                Attempts to play the video. Returns a promise that will resolve 
                if playback begins successfully, and rejects if it fails. 
                The most common reason for this to fail is browser policies 
                which prevent unmuted playback that is not initiated by the user.
                */

				player.current
					.play()
					.then((res) => {})
					.catch((err) => {
						toast("Error playing video", { type: "error" });
					});
			}
		}
	}, [videoState]);

	const handleEnd = () => {
		popFromQueue(0);
	};

	const handleLoading = (loading) => {
		if (loading) setVideoState(STATE_VIDEO_LOADING);
		else setVideoState(STATE_VIDEO_PLAY);
	};

	const handleSetPlay = () => {
		setVideoState(STATE_VIDEO_PLAY);
	};

	const handleSetPause = () => {
		setVideoState(STATE_VIDEO_PAUSED);
	};

	const handlePlaybackError = () => {
		setVideoState(STATE_VIDEO_ERROR);
	};

	useEffect(() => {
		const int = setInterval(() => {
			if (player?.current?.currentTime) {
				// console.log(player?.current?.currentTime);
				setCurrentTime(player?.current?.currentTime);
			}
		}, 250);

		return () => {
			clearInterval(int);
		};
	}, []);

	const toTimeString = (seconds) => {
		return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(
			Math.floor(seconds) % 60
		).padStart(2, "0")}`;
	};

	const moveToTimestamp = (t) => {
		if (player.current) {
			player.current.currentTime = t;
		}
	};

	// const handleAlternatePlayPause = () => {
	// 	console.log("CLICKED ON VIDEO PLAYER");
	// 	if (videoState === STATE_VIDEO_PLAY) {
	// 		setVideoState(STATE_VIDEO_PAUSED);
	// 	} else if (videoState === STATE_VIDEO_PAUSED) {
	// 		setVideoState(STATE_VIDEO_PLAY);
	// 	}
	// };

	return (
		<div>
			<div className="bg-yblue-100 grid place-items-center aspect-video rounded-xl overflow-hidden border">
				{playerVideoId ? (
					<>
						{videoState === STATE_VIDEO_ERROR ? (
							<div className="text-lg">
								Error : Video playback error
							</div>
						) : (
							<div className="relative w-full h-full">
								<Stream
									autoplay
									streamRef={player}
									allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
									src={playerVideoId}
									startTime={0}
									onEnded={handleEnd}
									onLoadStart={() => handleLoading(true)}
									onCanPlay={() => handleLoading(false)}
									onSeeking={() => handleLoading(true)}
									onSeeked={() => handleLoading(false)}
									onError={handlePlaybackError}
									onLoadedMetaData={(e) => {
										console.log(player.current.duration);
										setDuration(player.current.duration);
									}}
								/>
								<div className="absolute bottom-6 w-[calc(100%-2rem)] left-4">
									<VideoPlaybar
										currentTime={currentTime}
										duration={duration}
										draggableHandle={draggableHandle}
										toTimeString={toTimeString}
										handleSetPause={handleSetPause}
										handleSetPlay={handleSetPlay}
										moveToTimestamp={moveToTimestamp}
										playbarVisible={playbarVisible}
									/>
								</div>
								{videoState === STATE_VIDEO_LOADING ? (
									<div className="absolute w-full h-full bg-zinc-800 bg-opacity-40 top-0 left-0 right-0 bottom-0">
										<Loading color="#fff" />
									</div>
								) : (
									<></>
								)}
							</div>
						)}
					</>
				) : (
					<div className="text-lg">No video in queue</div>
				)}
			</div>
		</div>
	);
}
export default VideoPlayer;
