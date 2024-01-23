import React, { useEffect, useRef } from "react";
import usePlaylistStore from "../../store/PlaylistStore";
import useVideoStore, {
	STATE_VIDEO_ERROR,
	STATE_VIDEO_LOADING,
	STATE_VIDEO_PLAY,
} from "../../store/VideoStore";
// import asanas from "../../data/asanas.json";
import { Stream } from "@cloudflare/stream-react";

import { Button, Loading } from "@geist-ui/core";
import { useState } from "react";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import { FaPause, FaPlay } from "react-icons/fa";
import { toast } from "react-toastify";
import { STATE_VIDEO_PAUSED } from "../../store/VideoStore";
import VideoPlaybar from "./VideoPlaybar";

function VideoPlayer() {
	const player = useRef(null);
	const queue = usePlaylistStore((state) => state.queue);
	let popFromQueue = usePlaylistStore((state) => state.popFromQueue);

	const seekQueue = useVideoStore((state) => state.seekQueue);
	let popFromSeekQueue = useVideoStore((state) => state.popFromSeekQueue);

	let currentVideo = useVideoStore((state) => state.currentVideo);
	// let playlistState = useVideoStore((state) => state.playlistState);
	let setPlaylistState = useVideoStore((state) => state.setPlaylistState);

	let setCurrentVideo = useVideoStore((state) => state.setCurrentVideo);
	let videoState = useVideoStore((state) => state.videoState);
	let setVideoState = useVideoStore((state) => state.setVideoState);

	const [playerVideoId, setPlayerVideoId] = useState(currentVideo);

	const [duration, setDuration] = useState(0);
	const [currentTime, setCurrentTime] = useState(0);

	const [videoStateVisible, setVideoStateVisible] = useState(false);

	const draggableHandle = useRef(null);

	// when theres a pause or play, the state is shown for 300ms
	useEffect(() => {
		setVideoStateVisible(true);

		let t = setTimeout(() => {
			setVideoStateVisible(false);
		}, 300);

		return () => {
			clearTimeout(t);
		};
	}, [videoState]);

	// set player video id
	useEffect(() => {
		console.log(currentVideo, "IS THE CURRENT VIDEO");
		if (currentVideo) {
			setPlayerVideoId(
				currentVideo?.video?.asana_videoID ??
					currentVideo?.video?.transition_video_ID
			);
			if (player.current) {
				player.current.currentTime = 0;
			}
		} else {
			setPlayerVideoId(null);
		}
	}, [currentVideo]);

	// pop from seek queue and update the time
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

	// change play/pause based on video state
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

	const handleStartPlaylist = () => {
		if (currentVideo === null && queue.length > 0) {
			setPlaylistState(true);
			setCurrentVideo(queue[0]);
		}
	};

	const handleAlternatePlayPause = () => {
		console.log("CLICKED ON VIDEO PLAYER");
		if (videoState === STATE_VIDEO_PLAY) {
			setVideoState(STATE_VIDEO_PAUSED);
		} else if (videoState === STATE_VIDEO_PAUSED) {
			setVideoState(STATE_VIDEO_PLAY);
		}
	};

	const handleFullScreen = useFullScreenHandle();

	return (
		<FullScreen handle={handleFullScreen}>
			<div className="hover:cursor-pointer">
				<div className="bg-yblue-100 grid place-items-center aspect-video rounded-xl overflow-hidden">
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
											console.log(
												player.current.duration
											);
											setDuration(
												player.current.duration
											);
										}}
									/>
									<div className="absolute bottom-0 h-40 w-full hover:opacity-100 opacity-0 transition-opacity duration-300 ease-in-out z-20">
										<div className="absolute bottom-0 w-full bg-black bg-opacity-60">
											<VideoPlaybar
												currentTime={currentTime}
												duration={duration}
												draggableHandle={
													draggableHandle
												}
												toTimeString={toTimeString}
												handleSetPause={handleSetPause}
												handleSetPlay={handleSetPlay}
												moveToTimestamp={
													moveToTimestamp
												}
												handleFullScreen={
													handleFullScreen
												}
											/>
										</div>
									</div>
									<div
										className={`absolute w-full h-full top-0 left-0 right-0 bottom-0 bg-zinc-800 z-10 transition-all ${
											videoState ===
												STATE_VIDEO_LOADING ||
											videoStateVisible
												? "bg-opacity-40"
												: "bg-opacity-0"
										}`}
										onClick={() => {
											handleAlternatePlayPause();
										}}>
										{videoState === STATE_VIDEO_LOADING ? (
											<Loading color="#fff" />
										) : videoStateVisible ? (
											<div className="w-full h-full flex items-center justify-center">
												<div className="w-8 h-8 text-white">
													{videoState ===
													STATE_VIDEO_PLAY ? (
														<FaPlay className="w-full h-full" />
													) : (
														<FaPause className="w-full h-full" />
													)}
												</div>
											</div>
										) : (
											<></>
										)}
									</div>
								</div>
							)}
						</>
					) : queue.length > 0 ? (
						<div className="text-lg">
							<Button onClick={handleStartPlaylist}>
								Start Playlist
							</Button>
						</div>
					) : (
						<div className="text-lg">No video in queue</div>
					)}
				</div>
			</div>
		</FullScreen>
	);
}
export default VideoPlayer;
