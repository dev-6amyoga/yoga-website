import { useEffect, useMemo, useRef, useState } from "react";
import useVideoStore, {
	STATE_VIDEO_ERROR,
	STATE_VIDEO_LOADING,
	STATE_VIDEO_PLAY,
} from "../../store/VideoStore";
// import asanas from "../../data/asanas.json";

import { Stream } from "@cloudflare/stream-react";
// import { toast } from "react-toastify";
import {
	SEEK_TYPE_MARKER,
	SEEK_TYPE_MOVE,
	SEEK_TYPE_SEEK,
} from "../../enums/seek_types";
import { VIDEO_PAUSE_MARKER } from "../../enums/video_pause_reasons";
import { VIDEO_VIEW_STUDENT_MODE } from "../../enums/video_view_modes";
import usePlaylistStore from "../../store/PlaylistStore";
import useUserStore from "../../store/UserStore";
import { STATE_VIDEO_PAUSED } from "../../store/VideoStore";
import useWatchHistoryStore from "../../store/WatchHistoryStore";
import { Fetch } from "../../utils/Fetch";

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
		// seek queue
		seekQueue,
		popFromSeekQueue,
		addToSeekQueue,
		// current video
		currentVideo,
		// video state
		videoState,
		setVideoState,
		// current time
		setCurrentTime,
		// volume
		volume,
		setVolume,
		// autoplay initialized
		autoplayInitialized,
		setAutoplayInitialized,
		// video event
		videoEvent,
		setVideoEvent,
		// markers
		currentMarkerIdx,
		setCurrentMarkerIdx,
		autoSetCurrentMarkerIdx,
		markers,
		// view mode
		viewMode,
		// pause reason
		pauseReason,
		setPauseReason,
		// commitSeekTime
		commitSeekTime,
		setCommitSeekTime,
	] = useVideoStore((state) => [
		//
		state.seekQueue,
		state.popFromSeekQueue,
		state.addToSeekQueue,
		//
		state.currentVideo,
		//
		state.videoState,
		state.setVideoState,
		//
		state.setCurrentTime,
		//
		state.volume,
		state.setVolume,
		//
		state.autoplayInitialized,
		state.setAutoplayInitialized,
		//
		state.videoEvent,
		state.setVideoEvent,
		//
		state.currentMarkerIdx,
		state.setCurrentMarkerIdx,
		state.autoSetCurrentMarkerIdx,
		state.markers,
		//
		state.viewMode,
		//
		state.pauseReason,
		state.setPauseReason,
		//
		state.commitSeekTime,
		state.setCommitSeekTime,
	]);

	const popFromQueue = usePlaylistStore((state) => state.popFromQueue);

	let [
		enableWatchHistory,
		setCommittedTs,
		addToCommittedTs,
		updateWatchTimeBuffer,
		flushWatchTimeBuffer,
	] = useWatchHistoryStore((state) => [
		state.enableWatchHistory,
		state.setCommittedTs,
		state.addToCommittedTs,
		state.updateWatchTimeBuffer,
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
	}, [isActive, setDuration, metadataLoaded, video.queue_id]);

	// pause and reset the video when its not active
	useEffect(() => {
		const pr = playerRef.current;
		if (!isActive && pr && pr.currentTime > 0) {
			// console.log(
			// 	"PAUSE AND RESET ----------------------------->",
			// 	video.queue_id
			// );
			pr.muted = true;
			setVolume(0);
			pr?.pause();
			pr.currentTime = 0;
		}

		return () => {
			if (pr) {
				pr?.pause();
				pr.currentTime = 0;
			}
		};
	}, [isActive, video.queue_id, setVolume]);

	// set the volume
	useEffect(() => {
		if (playerRef.current) {
			if (volume > 0) {
				playerRef.current.muted = false;
			}
			playerRef.current.volume = volume;
		}
	}, [volume]);

	// pop from seek queue and update the time
	useEffect(() => {
		if (isActive && seekQueue.length > 0) {
			const seekEvent = seekQueue[0];
			console.log("SEEKING --->", seekEvent);
			// setVideoState(STATE_VIDEO_PLAY)
			// setPauseReason(null)
			if (seekEvent && playerRef.current) {
				switch (seekEvent.type) {
					case SEEK_TYPE_SEEK:
						let ct = playerRef.current.currentTime + seekEvent.t;
						if (ct > playerRef.current.duration) {
							handleEnd();
							popFromSeekQueue(0);
							return;
						}
						if (ct < 0) ct = 0;

						playerRef.current.currentTime = ct;
						console.log(
							"SEEKING ----------------------------->",
							playerRef.current.currentTime
						);
						setCommitSeekTime(ct);
						// autoSetCurrentMarkerIdx(playerRef.current?.currentTime)
						// popFromSeekQueue(0)
						break;
					case SEEK_TYPE_MOVE:
						let st = seekEvent.t < 0 ? 0 : seekEvent.t;
						if (st > playerRef.current.duration) {
							handleEnd();
							popFromSeekQueue(0);
							return;
						}

						playerRef.current.currentTime = st;
						console.log(
							"SEEKING ----------------------------->",
							playerRef.current.currentTime
						);
						setCommitSeekTime(st);
						// autoSetCurrentMarkerIdx(playerRef.current?.currentTime)
						// popFromSeekQueue(0)
						break;
					case SEEK_TYPE_MARKER:
						if (seekEvent.t > playerRef.current.duration) {
							handleEnd();
							popFromSeekQueue(0);
							return;
						}

						playerRef.current.currentTime = seekEvent.t;
						// popFromSeekQueue(0)
						setCommitSeekTime(seekEvent.t);
						break;
					default:
						break;
				}
				addToCommittedTs(playerRef.current?.currentTime);
			}
		}
	}, [
		isActive,
		seekQueue,
		popFromSeekQueue,
		addToCommittedTs,
		setVideoEvent,
		setCurrentMarkerIdx,
		autoSetCurrentMarkerIdx,
		setCommitSeekTime,
		setVideoState,
		setPauseReason,
		popFromQueue,
		handleEnd,
	]);

	// change play/pause based on video state
	useEffect(() => {
		if (
			isActive &&
			playerRef.current !== null &&
			playerRef.current !== undefined
		) {
			setPauseReason(null);
			if (videoState === STATE_VIDEO_PAUSED) {
				playerRef.current?.pause();
			} else {
				playerRef.current
					.play()
					.then((res) => {
						if (volume === 0 && !autoplayInitialized) {
							setVolume(0.5);
							setAutoplayInitialized(true);
						}
					})
					.catch((err) => {
						console.error(err);
						// toast("Error playing video", { type: "error" });
						playerRef.current.muted = true;
						playerRef.current
							.play()
							.then((res) => {
								playerRef.current.muted = false;
								if (volume === 0 && !autoplayInitialized) {
									setVolume(0.5);
									setAutoplayInitialized(true);
								}
							})
							.catch((err) => {
								console.error(err);
							});
					});
			}
		}
	}, [
		videoState,
		isActive,
		autoplayInitialized,
		setAutoplayInitialized,
		setPauseReason,
		setVolume,
	]);

	// poll to update the current time, every 20ms, clear the timeout on unmount
	useEffect(() => {
		const checkSeek = (ct) => {
			// check if seekQueue length is greater than 0,
			// check if seekqueue[0] is of type marker
			// check if the current time is === to the marker time
			// pop from seekQueue
			// console.log(
			//     'checkSeek :',
			//     commitSeekTime.toFixed(0) === ct.toFixed(0),
			//     ct,
			//     commitSeekTime,
			//     seekQueue.length
			// )
			if (
				seekQueue.length > 0 &&
				commitSeekTime.toFixed(0) === ct.toFixed(0)
			) {
				if (isActive) handleLoading(false);
				autoSetCurrentMarkerIdx(commitSeekTime);
				return true;
			} else {
				return false;
			}
		};

		const checkPauseOrLoop = (ct) => {
			// console.log('checkPauseOrLoop : ', ct)
			if (viewMode === VIDEO_VIEW_STUDENT_MODE) {
				// console.log('STUDENT --------->')
				return false;
			} else {
				// console.log('TEACHER --------->')
				// either pause or loop
				let currentMarker = markers[currentMarkerIdx];

				if (currentMarkerIdx === markers.length - 1) {
					return false;
				} else if (ct > markers[currentMarkerIdx + 1]?.timestamp) {
					if (currentMarker.loop) {
						// console.log('LOOPING ----------------------------->')
						addToSeekQueue({
							type: SEEK_TYPE_MARKER,
							t: currentMarker.timestamp,
						});
						return true;
					} else {
						setVideoState(STATE_VIDEO_PAUSED);
						setPauseReason(VIDEO_PAUSE_MARKER);
						return true;
					}
				}
			}
		};

		const int = setInterval(() => {
			if (playerRef.current?.currentTime && isActive) {
				// check if the marker has been reached
				if (checkSeek(playerRef.current?.currentTime)) {
					// popping from queue
					// console.log('POPPING FROM QUEUE ----------------------------->')
					popFromSeekQueue(0);
					setVideoState(STATE_VIDEO_PLAY);
					return;
				}

				// pause if currenttime is greater than the timestamp of next?
				if (
					videoState !== STATE_VIDEO_LOADING &&
					checkPauseOrLoop(playerRef.current?.currentTime)
				) {
					return;
				}

				if (
					videoState !== STATE_VIDEO_LOADING ||
					videoState !== STATE_VIDEO_ERROR ||
					videoState !== STATE_VIDEO_PAUSED
				)
					autoSetCurrentMarkerIdx(playerRef.current?.currentTime);
				setCurrentTime(playerRef.current?.currentTime);
			}
		}, 250);

		return () => {
			// console.log('CLEANING INTERVAL --------------------------------------->')
			clearInterval(int);
		};
	}, [
		currentVideo,
		isActive,
		setCurrentTime,
		videoState,
		popFromSeekQueue,
		autoSetCurrentMarkerIdx,
		seekQueue,
		setVideoEvent,
		setCurrentMarkerIdx,
		markers,
		viewMode,
		currentMarkerIdx,
		setVideoState,
		addToSeekQueue,
		commitSeekTime,
		setPauseReason,
		handleLoading,
	]);

	// clear timeouts before unmount
	useEffect(() => {
		return () => {
			// clearing previous interval to flush
			if (flushTimeInterval.current) {
				clearInterval(flushTimeInterval.current);
			}

			// clearing previous commitTimeInterval
			if (commitTimeInterval.current) {
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
		if (isActive && enableWatchHistory) {
			// console.log('CURRENT VIDEO', video)
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
			Fetch({
				url: "/watch-history/create",
				method: "POST",
				// TODO : fix thiss
				data: {
					user_id: user?.user_id,
					asana_id: video?.video?.id,
					playlist_id: null,
				},
			})
				.then((res) => {
					console.log("watch history created", res.data);
				})
				.catch((err) => {
					console.log(err);
				});

			// starting interval timer to flush watch duration buffer
			flushTimeInterval.current = setInterval(() => {
				flushWatchTimeBuffer(user?.user_id);
			}, 10000);

			// starting interval timer to commit time
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
		} else {
			if (flushTimeInterval.current) {
				clearInterval(flushTimeInterval.current);
			}

			if (commitTimeInterval.current) {
				clearInterval(commitTimeInterval.current);
			}
		}
	}, [isActive, enableWatchHistory]);

	// when theres a pause or play, the state is shown for 300ms
	useEffect(() => {
		let t;

		if (
			(videoState === STATE_VIDEO_PLAY ||
				videoState === STATE_VIDEO_PAUSED) &&
			playerRef?.current?.currentTime > 1
		) {
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
			video?.video?.asana_videoID || video?.video?.transition_video_ID;
		// console.log("Recomputing video id cuz video changed?!?!?!", v);
		return v;
	}, [video]);

	return (
		<div className={`h-full w-full ${isActive ? "block" : "hidden"}`}>
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
					// if (isActive) handleLoading(false)
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
