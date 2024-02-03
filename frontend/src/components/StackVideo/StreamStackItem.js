import React, { useEffect, useMemo, useRef, useState } from "react";
import useVideoStore, { STATE_VIDEO_PLAY } from "../../store/VideoStore";
// import asanas from "../../data/asanas.json";

import { Stream } from "@cloudflare/stream-react";
import { toast } from "react-toastify";
import useUserStore from "../../store/UserStore";
import { STATE_VIDEO_PAUSED } from "../../store/VideoStore";
import useWatchHistoryStore from "../../store/WatchHistoryStore";

function StreamStackItem({
	video,
	isActive,
	handleEnd,
	handleLoading,
	handlePlaybackError,
	setDuration,
	setVideoStateVisible,
}) {
	const playerRef = useRef(null);
	const user = useUserStore((state) => state.user);
	const commitTimeInterval = useRef(null);
	const flushTimeInterval = useRef(null);
	const [metadataLoaded, setMetadataLoaded] = useState(false);

	const [
		seekQueue,
		popFromSeekQueue,
		currentVideo,
		videoState,
		setCurrentTime,
	] = useVideoStore((state) => [
		state.seekQueue,
		state.popFromSeekQueue,
		state.currentVideo,
		state.videoState,
		state.setCurrentTime,
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

	// if its active, set the duration
	useEffect(() => {
		if (isActive && metadataLoaded) {
			console.log(
				"PLAYING ----------------------------->",
				video.queue_id,
				playerRef?.current
			);
			setDuration(playerRef?.current?.duration || 0);
		}
	}, [isActive, setDuration, metadataLoaded]);

	useEffect(() => {
		if (
			!isActive &&
			playerRef.current &&
			playerRef.current.currentTime > 0
		) {
			console.log(
				"PAUSE AND RESET ----------------------------->",
				video.queue_id
			);
			playerRef.current?.pause();
			playerRef.current.currentTime = 0;
		}
	}, [isActive]);

	// pop from seek queue and update the time
	useEffect(() => {
		if (isActive && seekQueue.length > 0) {
			const seekEvent = seekQueue[0];
			if (seekEvent && playerRef.current) {
				switch (seekEvent.type) {
					case "seek":
						playerRef.current.currentTime =
							(playerRef.current?.currentTime || 0) +
							Number(seekEvent.t);
						break;
					case "move":
						playerRef.current.currentTime = seekEvent.t;
						break;
					default:
						break;
				}

				addToCommittedTs(playerRef.current?.currentTime);
			}
			popFromSeekQueue(0);
		}
	}, [isActive, seekQueue, popFromSeekQueue, addToCommittedTs]);

	// change play/pause based on video state
	useEffect(() => {
		if (isActive && playerRef.current) {
			if (videoState === STATE_VIDEO_PAUSED) {
				playerRef.current?.pause();
			} else {
				playerRef.current
					.play()
					.then((res) => {})
					.catch((err) => {
						toast("Error playing video", { type: "error" });
					});
			}
		}
	}, [videoState, isActive]);

	useEffect(() => {
		const int = setInterval(() => {
			if (playerRef.current?.currentTime && isActive) {
				setCurrentTime(playerRef.current?.currentTime);
			}
		}, 500);

		return () => {
			clearInterval(int);
		};
	}, [currentVideo, isActive]);

	useEffect(() => {
		return () => {
			// clearing previous interval to flush
			if (flushTimeInterval.current) {
				console.log("Clearing previous flushTimeInterval");
				clearInterval(flushTimeInterval.current);
			}

			// clearing previous commitTimeInterval
			if (commitTimeInterval.current) {
				console.log("Clearing previous commitTimeInterval");
				clearInterval(commitTimeInterval.current);
			}
		};
	}, [commitTimeInterval, flushTimeInterval]);

	/* when video changes
					- flush 
					- reset committedTs
					- clear previous interval to flush 
					- start interval timer to flush	watch duration buffer  [10s]
					- clear previous interval to commit time
					- start interval timer to commit time [5s]
	*/
	useEffect(() => {
		if (isActive) {
			console.log("CURRENT VIDEO", video);
			// flushing
			flushWatchTimeBuffer(user?.user_id);

			// resetting committedTs
			setCommittedTs(0);

			// clearing previous interval to flush
			if (flushTimeInterval.current) {
				clearInterval(flushTimeInterval.current);
			}

			// clearing previous commitTimeInterval
			if (commitTimeInterval.current) {
				clearInterval(commitTimeInterval.current);
			}

			// TODO : send to watch history
			// Fetch({
			// 	url: "http://localhost:4000/watch-history/create",
			// 	method: "POST",
			// 	// TODO : fix thiss
			// 	data: {
			// 		user_id: user?.user_id,
			// 		asana_id: video?.video?.id,
			// 		playlist_id: null,
			// 	},
			// })
			// 	.then((res) => {})
			// 	.catch((err) => {});

			// starting interval timer to flush watch duration buffer
			console.log("Starting new flushTimeInterval");
			flushTimeInterval.current = setInterval(() => {
				flushWatchTimeBuffer(user?.user_id);
			}, 10000);

			// starting interval timer to commit time
			console.log("Starting new commitTimeInterval");
			commitTimeInterval.current = setInterval(() => {
				// TODO : fix this
				updateWatchTimeBuffer({
					user_id: user?.user_id,
					asana_id: video?.video?.id,
					playlist_id: null,
					currentTime: playerRef.current.currentTime,
				});
				addToCommittedTs(playerRef.current?.currentTime);
			}, 5000);
		}
	}, [isActive]);

	// when theres a pause or play, the state is shown for 300ms
	useEffect(() => {
		let t;

		if (
			(videoState === STATE_VIDEO_PLAY ||
				videoState === STATE_VIDEO_PAUSED) &&
			playerRef?.current?.currentTime > 1
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
	}, [videoState, setVideoStateVisible]);

	const videoId = useMemo(() => {
		const v =
			video?.video?.asana_videoID || video?.video?.transition_videoID;
		console.log("Recomputing video id cuz video changed?!?!?!", v);
		return v;
	}, [video]);

	return (
		<div className={`w-full h-full ${isActive ? "block" : "hidden"}`}>
			<Stream
				streamRef={playerRef}
				allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
				src={videoId}
				startTime={0}
				preload="auto"
				onEnded={handleEnd}
				onLoadStart={() => {
					console.log(
						"Loading start ----------------------------->",
						video?.queue_id
					);
					if (isActive) handleLoading(true);
				}}
				onLoadedData={() => {
					console.log(
						"First frame ready ---------------------->",
						video?.queue_id
					);
				}}
				onStalled={() => {
					console.log(
						"Stalled ----------------------------->",
						video?.queue_id
					);
					if (isActive) handleLoading(true);
				}}
				onCanPlay={() => {
					console.log(
						"Can play ----------------------------->",
						video?.queue_id
					);
					if (isActive) handleLoading(false);
				}}
				onSeeking={() => {
					if (isActive) handleLoading(true);
				}}
				onSeeked={() => {
					if (isActive) handleLoading(false);
				}}
				onError={() => {
					if (isActive) handlePlaybackError();
				}}
				onLoadedMetaData={() => {
					setMetadataLoaded(true);
				}}
			/>
		</div>
	);
}

export default StreamStackItem;
