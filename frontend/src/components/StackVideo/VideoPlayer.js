import React, { useCallback, useEffect, useRef } from "react";
import usePlaylistStore from "../../store/PlaylistStore";
import useVideoStore, {
	STATE_VIDEO_ERROR,
	STATE_VIDEO_LOADING,
	STATE_VIDEO_PLAY,
} from "../../store/VideoStore";

import { Button, Loading } from "@geist-ui/core";
import { AnimatePresence } from "framer-motion";
import { useState } from "react";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import { FaPause, FaPlay } from "react-icons/fa";
import { STATE_VIDEO_PAUSED } from "../../store/VideoStore";
import StreamStackItem from "./StreamStackItem";
import VideoPlaybar from "./VideoPlaybar";

function VideoPlayer() {
	const playerVideo = useRef(null);

	const [queue, popFromQueue] = usePlaylistStore((state) => [
		state.queue,
		state.popFromQueue,
		state.queueMetadata,
		state.setQueueMetadata,
	]);

	const [
		currentVideo,
		setCurrentVideo,
		videoState,
		setVideoState,
		playlistState,
		setPlaylistState,
	] = useVideoStore((state) => [
		state.currentVideo,
		state.setCurrentVideo,
		state.videoState,
		state.setVideoState,
		state.playlistState,
		state.setPlaylistState,
	]);

	// watch history store
	// let [addToCommittedTs] = useWatchHistoryStore((state) => [
	// 	state.addToCommittedTs,
	// ]);

	// const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [videoStateVisible, setVideoStateVisible] = useState(false);

	const draggableHandle = useRef(null);

	// // debug
	// useEffect(() => {
	// 	if (watchTimeArchive && watchTimeArchive.length > 0) {
	// 		console.log(
	// 			"DURATIONS : ",
	// 			watchTimeArchive?.reduce((acc, curr) => {
	// 				if (!acc[curr.asana_id]) {
	// 					acc[curr.asana_id] = 0;
	// 				}
	// 				acc[curr.asana_id] += curr.timedelta;
	// 				return acc;
	// 			}, {})
	// 		);
	// 	}
	// }, [watchTimeArchive]);

	// set player video ref
	useEffect(() => {
		if (currentVideo) {
			console.log("SETTING PLAYER VIDEO CURRENT -> ", currentVideo);
			playerVideo.current = currentVideo;
		} else {
			playerVideo.current = null;
		}
	}, [currentVideo]);

	useEffect(() => {
		if (queue && queue.length > 0 && playlistState) {
			setCurrentVideo(queue[0]);
		} else {
			setCurrentVideo(null);
			setVideoState(STATE_VIDEO_PAUSED);
		}
	}, [queue, playlistState, setCurrentVideo, setVideoState]);

	const handleEnd = useCallback(() => {
		console.log("Video ended ------------------>");
		// setNewVideoState(true);
		popFromQueue(0);
	}, [popFromQueue]);

	const handleSetPlay = useCallback(() => {
		console.log("SETTING VIDEO STATE TO PLAY ------------>");
		setVideoState(STATE_VIDEO_PLAY);
	}, [setVideoState]);

	const handleLoading = useCallback(
		(loading) => {
			if (loading) setVideoState(STATE_VIDEO_LOADING);
			else {
				handleSetPlay();
			}
		},
		[handleSetPlay, setVideoState]
	);

	const handleSetPause = useCallback(() => {
		console.log("SETTING VIDEO STATE TO PAUSE ------------>");
		setVideoState(STATE_VIDEO_PAUSED);
	}, [setVideoState]);

	const handlePlaybackError = useCallback(() => {
		console.log("Error playing video ------------------->");
		setVideoState(STATE_VIDEO_ERROR);
	}, [setVideoState]);

	const handleStartPlaylist = useCallback(() => {
		if (currentVideo === null && queue.length > 0) {
			setPlaylistState(true);
			setCurrentVideo(queue[0]);
		}
	}, [currentVideo, queue, setPlaylistState, setCurrentVideo]);

	const handleAlternatePlayPause = useCallback(() => {
		if (videoState === STATE_VIDEO_PLAY) {
			setVideoState(STATE_VIDEO_PAUSED);
		} else if (videoState === STATE_VIDEO_PAUSED) {
			setVideoState(STATE_VIDEO_PLAY);
		}
	}, [setVideoState, videoState]);

	const handleFullScreen = useFullScreenHandle();

	const toTimeString = useCallback((seconds) => {
		const s = seconds > 0 ? seconds : 0;

		return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(
			Math.ceil(s) % 60
		).padStart(2, "0")}`;
	}, []);

	return (
		<FullScreen handle={handleFullScreen}>
			<div className="hover:cursor-pointer">
				<div className="bg-black grid place-items-center aspect-video rounded-xl overflow-hidden">
					{currentVideo ? (
						<>
							{videoState === STATE_VIDEO_ERROR ? (
								<div className="text-lg flex flex-col gap-4 items-center justify-center">
									<p>Error : Video playback error</p>
									<Button onClick={handleSetPlay}>
										Refresh
									</Button>
								</div>
							) : (
								<div className="relative w-full h-full">
									{queue.length > 0 ? (
										<div className="">
											{queue
												.slice(0, 2)
												.map((queueItem) => {
													return (
														<AnimatePresence
															key={
																queueItem.queue_id
															}
															initial={false}
															mode="wait">
															<StreamStackItem
																video={
																	queueItem
																}
																handleEnd={
																	handleEnd
																}
																handleLoading={
																	handleLoading
																}
																handlePlaybackError={
																	handlePlaybackError
																}
																setDuration={
																	setDuration
																}
																isActive={
																	currentVideo?.queue_id ===
																	queueItem?.queue_id
																}
																setVideoStateVisible={
																	setVideoStateVisible
																}
															/>
														</AnimatePresence>
													);
												})}
										</div>
									) : (
										<></>
									)}
									<div className="absolute bottom-0 h-40 w-full hover:opacity-100 opacity-0 transition-opacity duration-300 ease-in-out z-20">
										<div className="absolute bottom-0 w-full bg-black bg-opacity-40">
											<VideoPlaybar
												duration={duration}
												draggableHandle={
													draggableHandle
												}
												toTimeString={toTimeString}
												handleSetPause={handleSetPause}
												handleSetPlay={handleSetPlay}
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
						<div className="text-lg"> </div>
					)}
				</div>
			</div>
		</FullScreen>
	);
}
export default VideoPlayer;
