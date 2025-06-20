import { useEffect, useRef } from "react";
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
import useUserStore from "../../store/UserStore";
import { STATE_VIDEO_PAUSED } from "../../store/VideoStore";
import useWatchHistoryStore from "../../store/WatchHistoryStore";
import { Fetch } from "../../utils/Fetch";
import VideoPlaybar from "./VideoPlaybar";

function VideoPlayer() {
	const user = useUserStore((state) => state.user);
	const player = useRef(null);
	const [queue, popFromQueue] = usePlaylistStore((state) => [
		state.queue,
		state.popFromQueue,
	]);

	const [
		seekQueue,
		popFromSeekQueue,
		currentVideo,
		setPlaylistState,
		setCurrentVideo,
		videoState,
		setVideoState,
	] = useVideoStore((state) => [
		state.seekQueue,
		state.popFromSeekQueue,
		state.currentVideo,
		state.setPlaylistState,
		state.setCurrentVideo,
		state.videoState,
		state.setVideoState,
	]);

	// watch history store
	let [
		addToWatchHistory,
		committedTs,
		setCommittedTs,
		addToCommittedTs,
		watchTimeBuffer,
		updateWatchTimeBuffer,
		watchTimeArchive,
		updateWatchTimeArchive,
		flushWatchTimeBuffer,
	] = useWatchHistoryStore((state) => [
		state.addToWatchHistory,
		state.committedTs,
		state.setCommittedTs,
		state.addToCommittedTs,
		state.watchTimeBuffer,
		state.updateWatchTimeBuffer,
		state.watchTimeArchive,
		state.updateWatchTimeArchive,
		state.flushWatchTimeBuffer,
	]);

	const [commitTimeInterval, setCommitTimeInterval] = useState(null);
	const [flushTimeInterval, setFlushTimeInterval] = useState(null);

	const [playerVideoId, setPlayerVideoId] = useState(null);

	const [duration, setDuration] = useState(0);
	const [currentTime, setCurrentTime] = useState(0);

	const [videoStateVisible, setVideoStateVisible] = useState(false);

	const draggableHandle = useRef(null);

	/* when video changes
					- flush 
					- reset committedTs
					- clear previous interval to flush 
					- start interval timer to flush	watch duration buffer  [10s]
					- clear previous interval to commit time
					- start interval timer to commit time [5s]
	*/
	useEffect(() => {
		console.log("CURRENT VIDEO", currentVideo);
		// flushing
		flushWatchTimeBuffer(user?.user_id);

		// resetting committedTs
		setCommittedTs(0);

		// clearing previous interval to flush
		if (flushTimeInterval) {
			clearInterval(flushTimeInterval);
		}

		// clearing previous commitTimeInterval
		if (commitTimeInterval) {
			clearInterval(commitTimeInterval);
		}

		if (currentVideo) {
			// TODO : send to watch history
			Fetch({
				url: "/watch-history/create",
				method: "POST",
				// TODO : fix thiss
				data: {
					user_id: user?.user_id,
					asana_id: currentVideo?.video?.id,
					playlist_id: null,
				},
			})
				.then((res) => {})
				.catch((err) => {});

			// starting interval timer to flush watch duration buffer
			console.log("Starting new flushTimeInterval");
			setFlushTimeInterval(
				setInterval(() => {
					flushWatchTimeBuffer(user?.user_id);
				}, 10000)
			);

			// starting interval timer to commit time
			console.log("Starting new commitTimeInterval");
			setCommitTimeInterval(
				setInterval(() => {
					console.log("COMMITTING TIME", player.current.currentTime);
					// TODO : fix this
					updateWatchTimeBuffer({
						user_id: user?.user_id,
						asana_id: currentVideo?.video?.id,
						playlist_id: null,
						currentTime: player.current.currentTime,
					});
					addToCommittedTs(player.current.currentTime);
				}, 5000)
			);
		}
	}, [currentVideo]);

	useEffect(() => {
		console.log({
			user,
			queue,
			committedTs,
			watchTimeBuffer,
			watchTimeArchive,
			seekQueue,
			currentVideo,
			videoState,
			commitTimeInterval,
			flushTimeInterval,
			playerVideoId,
			duration,
			currentTime,
			videoStateVisible,
		});

		return () => {
			// clearing previous interval to flush
			if (flushTimeInterval) {
				console.log("Clearing previous flushTimeInterval");
				clearInterval(flushTimeInterval);
			}

			// clearing previous commitTimeInterval
			if (commitTimeInterval) {
				console.log("Clearing previous commitTimeInterval");
				clearInterval(commitTimeInterval);
			}
		};
	}, [commitTimeInterval, flushTimeInterval]);

	useEffect(() => {
		if (watchTimeArchive && watchTimeArchive.length > 0) {
			console.log(
				"DURATIONS : ",
				watchTimeArchive?.reduce((acc, curr) => {
					if (!acc[curr.asana_id]) {
						acc[curr.asana_id] = 0;
					}
					acc[curr.asana_id] += curr.timedelta;
					return acc;
				}, {})
			);
		}
	}, [watchTimeArchive]);

	// when theres a pause or play, the state is shown for 300ms
	useEffect(() => {
		let t;

		if (
			(videoState === STATE_VIDEO_PLAY ||
				videoState === STATE_VIDEO_PAUSED) &&
			player?.current?.currentTime > 1
		) {
			// console.log(newVideoState, videoState);
			setVideoStateVisible(true);

			t = setTimeout(() => {
				setVideoStateVisible(false);
			}, 300);
		}

		return () => {
			if (t) {
				clearTimeout(t);
			}
		};
	}, [videoState]);

	// set player video id
	useEffect(() => {
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

				addToCommittedTs(player.current.currentTime);
			}
			popFromSeekQueue(0);
		}
	}, [seekQueue, popFromSeekQueue, addToCommittedTs]);

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
		console.log("Video ended ------------------>");
		// setNewVideoState(true);
		popFromQueue(0);
	};

	const handleLoading = (loading) => {
		if (loading) setVideoState(STATE_VIDEO_LOADING);
		else {
			handleSetPlay();
		}
	};

	const handleSetPlay = () => {
		console.log("SETTING VIDEO STATE TO PLAY ------------>", currentTime);
		setVideoState(STATE_VIDEO_PLAY);
	};

	const handleSetPause = () => {
		console.log("SETTING VIDEO STATE TO PAUSE ------------>", currentTime);
		setVideoState(STATE_VIDEO_PAUSED);
	};

	const handlePlaybackError = () => {
		console.log("Error playing video ------------------->");
		setVideoState(STATE_VIDEO_ERROR);
	};

	useEffect(() => {
		const int = setInterval(() => {
			if (player?.current?.currentTime) {
				setCurrentTime(player?.current?.currentTime);
			}
		}, 250);

		return () => {
			clearInterval(int);
		};
	}, []);

	const toTimeString = (seconds) => {
		const s = seconds > 0 ? seconds : 0;

		return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(
			Math.ceil(s) % 60
		).padStart(2, "0")}`;
	};

	const moveToTimestamp = (t) => {
		if (player.current) {
			player.current.currentTime = t;
			addToCommittedTs(player.current.currentTime);
		}
	};

	const handleStartPlaylist = () => {
		if (currentVideo === null && queue.length > 0) {
			setPlaylistState(true);
			setCurrentVideo(queue[0]);
		}
	};

	const handleAlternatePlayPause = () => {
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
										preload="auto"
										onEnded={handleEnd}
										onLoadStart={() => {
											console.log(
												"Loading start ----------------------------->"
											);
											handleLoading(true);
										}}
										onLoadedData={() => {
											console.log(
												"First frame ready ---------------------->"
											);
										}}
										onStalled={() => {
											console.log(
												"Stalled ----------------------------->"
											);
											handleLoading(true);
										}}
										onCanPlay={() => {
											console.log(
												"Can play ----------------------------->"
											);
											handleLoading(false);
										}}
										onSeeking={() => handleLoading(true)}
										onSeeked={() => handleLoading(false)}
										onError={handlePlaybackError}
										onLoadedMetaData={(e) => {
											console.log(
												"Loading metadata --------------------------------->"
											);
											console.log({
												duration:
													player.current.duration,
											});
											setDuration(
												player.current.duration
											);
										}}
									/>
									<div className="absolute bottom-0 h-40 w-full hover:opacity-100 hover:delay-0 delay-500 opacity-0 transition-opacity duration-1000 ease-in-out z-20">
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
						<div className="text-lg"> </div>
					)}
				</div>
			</div>
		</FullScreen>
	);
}
export default VideoPlayer;
