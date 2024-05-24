// import { useEffect } from "react";
// import Playlist from "../../components/Sidebar/Playlist";
// import VideoPlayerWrapper from "../../components/StackVideoDashJS/VideoPlayerWrapper";
// import {
//   VIDEO_VIEW_STUDENT_MODE,
//   VIDEO_VIEW_TEACHING_MODE,
// } from "../../enums/video_view_modes";
// import { handleNextMarker, handlePrevMarker } from "../../lib/shaka-controls";
// import usePlaylistStore from "../../store/PlaylistStore";
// import useVideoStore, {
//   STATE_VIDEO_ERROR,
//   STATE_VIDEO_LOADING,
// } from "../../store/VideoStore";
// import useWatchHistoryStore from "../../store/WatchHistoryStore";

// export default function TestingVideo() {
//   const setEnableWatchHistory = useWatchHistoryStore(
//     (state) => state.setEnableWatchHistory
//   );

//   const [
//     playlistState,
//     viewMode,
//     videoState,
//     markers,
//     currentMarkerIdx,
//     devMode,
//     setDevMode,
//     fullScreen,
//   ] = useVideoStore((state) => [
//     state.playlistState,
//     state.viewMode,
//     state.videoState,
//     state.markers,
//     state.currentMarkerIdx,
//     state.devMode,
//     state.setDevMode,
//     state.fullScreen,
//   ]);

//   const [popFromArchive, popFromQueue] = usePlaylistStore((state) => [
//     state.popFromArchive,
//     state.popFromQueue,
//   ]);

//   useEffect(() => {
//     // for hand held pointer
//     const handleKeyDown = (event) => {
//       // console.log({
//       // 	playlistState,
//       // 	videoState,
//       // 	viewMode,
//       // 	key: event.key,
//       // });
//       const state = useVideoStore.getState();
//       const viewMode = state.viewMode;
//       const videoState = state.videoState;
//       const markers = state.markers;
//       const currentMarkerIdx = state.currentMarkerIdx;

//       // TODO : fix plalist state when start is clicked
//       if (
//         videoState === null ||
//         videoState === STATE_VIDEO_ERROR ||
//         videoState === STATE_VIDEO_LOADING
//       ) {
//         return;
//       }
//       switch (event.key) {
//         case "PageUp":
//           event.preventDefault();

//           if (viewMode === VIDEO_VIEW_STUDENT_MODE) {
//             console.log("Move to prev video");
//             popFromArchive(-1);
//           } else if (viewMode === VIDEO_VIEW_TEACHING_MODE) {
//             //
//             console.log("Move to prev marker");
//             console.log(markers, currentMarkerIdx);
//             handlePrevMarker();
//           }
//           break;
//         case "PageDown":
//           event.preventDefault();

//           if (viewMode === VIDEO_VIEW_STUDENT_MODE) {
//             console.log("Move to next video");
//             popFromQueue(0);
//           } else if (viewMode === VIDEO_VIEW_TEACHING_MODE) {
//             console.log("Move to next marker");
//             console.log(markers, currentMarkerIdx);
//             handleNextMarker();
//           }
//           break;
//         default:
//           break;
//       }
//       // console.log("keyDown", event);
//     };

//     document.addEventListener("keydown", handleKeyDown);

//     return () => {
//       document.removeEventListener("keydown", handleKeyDown);
//     };
//   }, [popFromArchive, popFromQueue]);

//   useEffect(() => {
//     setEnableWatchHistory(false);
//   }, [setEnableWatchHistory]);

//   return (
//     <div
//       className={`toplvlpage relative mx-auto ${fullScreen ? "" : "my-20 max-w-7xl p-4 xl:p-0"}`}
//     >
//       <VideoPlayerWrapper />
//       <Playlist />
//       <button
//         className={`fixed bottom-4 right-4 p-4 ${devMode ? "bg-y-green" : "bg-y-white text-black"} rounded-full shadow-lg`}
//         onClick={() => setDevMode(!devMode)}
//       >
//         Dev Mode : {devMode ? "ON" : "OFF"}
//       </button>
//     </div>
//   );
// }

import VideoPlayerWrapper from "../../solidjs-src/src/components/StackVideoDashJS/VideoPlayerWrapper";
// import { Cube as SolidCube } from "phosphor-solid";
import {
	ReactToSolidBridge,
	ReactToSolidBridgeProvider,
} from "react-solid-bridge";
import { createStore, produce } from "solid-js/store";
import { v5 as uuidV5 } from "uuid";
import { VIDEO_VIEW_TEACHING_MODE } from "../../solidjs-src/src/enums/video_view_modes";
import { PlaylistStoreContext } from "../../solidjs-src/src/store/PlaylistStore";
import {
	STATE_VIDEO_LOADING,
	VideoStoreContext,
} from "../../solidjs-src/src/store/VideoStore";
import { WatchHistoryContext } from "../../solidjs-src/src/store/WatchHistoryStore";
import { Fetch } from "../../solidjs-src/src/utils/Fetch";

// const VideoPlayerWrapperSolid = convertToReactComponent(VideoPlayerWrapper);

export default function TestingVideo() {
	const [playlistStore, setPlaylistStore] = createStore({
		queueMetadata: {},
		queue: [],
		archive: [],
	});

	const playlistStoreActions = [
		playlistStore,
		{
			setQueueMetadata: (videoId, metadata, value) =>
				setPlaylistStore(
					produce((state) => {
						const qm = { ...state.queueMetadata };
						if (!qm[videoId]) {
							qm[videoId] = {};
						}
						qm[videoId][metadata] = value;

						state.queueMetadata = qm;
					})
				),

			addToQueue: (items) =>
				setPlaylistStore(
					produce((state) => {
						state.queue = [
							...state.queue,
							...items.map((i, idx) => {
								const vi_id = i?._id || i?.id;
								// console.log('vi_id', vi_id)
								// console.log({ video: i });
								// state.queue.push();
								return {
									video: i,
									idx: state.queue.length + idx + 1,
									queue_id: uuidV5(
										vi_id +
											Math.floor(Math.random() * 100000),
										"ed46bc72-c770-4478-a8af-6183469acb64"
									),
								};
							}),
						];
					})
				),

			popFromQueue: (index) =>
				setPlaylistStore(
					produce((state) => {
						if (state.queue.length > index) {
							const q = [...state.queue];
							const removed = q.splice(index, 1);
							state.queue = [...q];
							state.archive = [...state.archive, removed[0]];
						}
					})
				),

			clearQueue: () =>
				setPlaylistStore(
					produce((state) => {
						state.queue = [];
					})
				),

			clearArchive: () =>
				setPlaylistStore(
					produce((state) => {
						state.archive = [];
					})
				),

			popFromArchive: (index) =>
				setPlaylistStore(
					produce((state) => {
						const a = [...state.archive];
						if (a.length > index + 1) {
							let i = index;
							if (index === -1) {
								i = a.length - 1;
							}
							// const a = [...];
							const removed = a.splice(i, 1);
							state.archive = [...a];

							state.queue = [removed[0], ...state.queue];
						}
					})
				),
		},
	];

	const [videoStore, setVideoStore] = createStore({
		devMode: false,
		fullScreen: false,
		playlistState: false,
		currentVideo: null,
		markers: [],
		currentMarkerIdx: null,
		videoState: STATE_VIDEO_LOADING,
		pauseReason: null,
		playbackRate: 1.0,
		autoplayInitialized: false,
		volume: 0.0,
		seekQueue: [],
		currentTime: 0,
		viewMode: VIDEO_VIEW_TEACHING_MODE,
		commitSeekTime: -1,
		playreadyKeyUrl: null,
		videoEvents: [],
	});

	const videoStoreActions = [
		videoStore,
		{
			setDevMode: (dm) =>
				setVideoStore(
					produce((state) => {
						state.devMode = dm;
					})
				),

			setFullScreen: (fs) =>
				setVideoStore(
					produce((state) => {
						state.fullScreen = fs;
					})
				),

			setPlaylistState: (ps) =>
				setVideoStore(
					produce((state) => {
						state.playlistState = ps;
					})
				),

			setCurrentVideo: (item) =>
				setVideoStore(
					produce((state) => {
						state.currentVideo = item;
					})
				),

			setMarkers: (markers) =>
				setVideoStore(
					produce((state) => {
						state.markers = [...markers];
					})
				),

			setCurrentMarkerIdx: (idx) =>
				setVideoStore(
					produce((state) => {
						state.currentMarkerIdx = idx;
					})
				),

			autoSetCurrentMarkerIdx: (currentTime = undefined) => {
				setVideoStore(
					produce((state) => {
						let ct = currentTime ?? state.currentTime;
						// console.log('autoSetCurrentMarkerIdx :', currentTime, '==>', ct)
						// let prevIdx = state.currentMarkerIdx

						// if no markers, dont bother
						if (state.markers.length === 0) {
							state.currentMarkerIdx = null;
							return;
						}

						// if the current time is less than the first marker, set to null
						if (ct < state.markers[0]?.timestamp) {
							state.currentMarkerIdx = null;
							return;
						}

						// find the first marker that is greater than the current time
						const idx =
							state.markers.findIndex((m) => m?.timestamp > ct) -
							1;
						// console.log("autoSetCurrentMarkerIdx :", idx, ct);

						// if the current time is greater than the last marker, set to last marker
						if (idx === -2) {
							state.currentMarkerIdx = state.markers.length - 1;
							return;
						}

						state.currentMarkerIdx = idx;
					})
				);
			},

			setVideoState: (vs) =>
				setVideoStore(
					produce((state) => {
						state.videoState = vs;
					})
				),

			setPauseReason: (pauseReason) => {
				setVideoStore(
					produce((state) => {
						state.pauseReason = pauseReason;
					})
				);
			},

			setPlaybackRate: (rate) =>
				setVideoStore(
					produce((state) => {
						state.playbackRate = rate;
					})
				),

			setAutoplayInitialized: (autoplayInitialized) => {
				setVideoStore(
					produce((state) => {
						state.autoplayInitialized = autoplayInitialized;
					})
				);
			},

			setVolume: (volume) => {
				setVideoStore(
					produce((state) => {
						state.volume = volume;
					})
				);
			},

			addToSeekQueue: (seekEvent) =>
				setVideoStore(
					produce((state) => {
						// console.log(state.seekQueue, seekTime)
						// {type: move | seek, time: number}
						state.seekQueue = [seekEvent];
						state.pauseReason = null;
					})
				),

			popFromSeekQueue: (index) =>
				setVideoStore(
					produce((state) => {
						const sq = [...state.seekQueue];
						if (sq.length > index) {
							sq.splice(index, 1);
						}

						return sq;
					})
				),

			clearSeekQueue: () =>
				setVideoStore(
					produce((state) => {
						state.seekQueue = [];
					})
				),

			setCurrentTime: (time) =>
				setVideoStore(
					produce((state) => {
						state.currentTime = time;
					})
				),

			setViewMode: (mode) =>
				setVideoStore(
					produce((state) => {
						state.viewMode = mode;
					})
				),

			setCommitSeekTime: (time) =>
				setVideoStore(
					produce((state) => {
						state.commitSeekTime = time;
					})
				),

			setPlayreadyKeyUrl: (url) =>
				setVideoStore(
					produce((state) => {
						state.playreadyKeyUrl = url;
					})
				),

			addVideoEvent: (event) =>
				setVideoStore(
					produce((state) => {
						state.videoEvents = [...state.videoEvents, event];
					})
				),

			clearVideoEvents: () => {
				setVideoStore(
					produce((state) => {
						state.videoEvents = [];
					})
				);
			},
		},
	];

	const [watchHistoryStore, setWatchHistoryStore] = createStore({
		enableWatchHistory: true,
		watchHistory: false,
		committedTs: 0,
		watchTimeBuffer: [],
		watchTimeArchive: [],
	});

	const watchHistoryStoreActions = [
		watchHistoryStore,
		{
			setEnableWatchHistory(enable) {
				setWatchHistoryStore(
					produce((state) => {
						state.enableWatchHistory = enable;
					})
				);
			},

			updateWatchHistory(wh) {
				setWatchHistoryStore(
					produce((state) => {
						state.watchHistory.push(wh);
					})
				);
			},

			setCommittedTs(ts) {
				setWatchHistoryStore(
					produce((state) => {
						state.committedTs = ts;
					})
				);
			},

			addToCommittedTs(ts) {
				setWatchHistoryStore(
					produce((state) => {
						state.committedTs = ts;
					})
				);
			},

			appendToWatchTimeBuffer(watchTimeLogs) {
				setWatchHistoryStore(
					produce((state) => {
						state.watchTimeBuffer = [
							...watchTimeLogs,
							...state.watchTimeBuffer,
						];
					})
				);
			},

			updateWatchTimeBuffer(wh) {
				setWatchHistoryStore(
					produce((state) => {
						const timedelta = wh.currentTime - state.committedTs;
						// console.log({ timedelta });

						if (timedelta < 1) {
							return;
						} else {
							state.watchTimeBuffer.push({
								user_id: wh?.user_id,
								asana_id: wh?.asana_id,
								playlist_id: wh?.playlist_id,
								timedelta: timedelta,
							});
						}
					})
				);
			},

			updateWatchTimeArchive(wds) {
				setWatchHistoryStore(
					produce((state) => {
						state.watchTimeArchive = [
							...state.watchTimeArchive,
							...wds,
						];
					})
				);
			},

			// async flushWatchTimeBuffer(user_id) {
			// 	const watch_time_logs = state.watchTimeBuffer;

			// 	// console.log({ watch_time_logs });
			// 	if (watch_time_logs.length === 0) {
			// 		return;
			// 	}

			// 	Fetch({
			// 		url: "/watch-time/update",
			// 		method: "POST",
			// 		token: true,
			// 		data: {
			// 			user_id: user_id,
			// 			watch_time_logs,
			// 			institute_id: null,
			// 		},
			// 	})
			// 		.then((res) => {
			// 			if (res.status === 200) {
			// 				console.log("watch time buffer flushed");
			// 			}
			// 		})
			// 		.catch((err) => {
			// 			console.log(err);
			// 			// localStorage.setItem(
			// 			// 	"6amyoga_watch_time_logs",
			// 			// 	JSON.stringify(watch_time_logs)
			// 			// );
			// 			set((state) => ({
			// 				watchTimeBuffer: [
			// 					...state.watchTimeBuffer,
			// 					...watch_time_logs,
			// 				],
			// 			}));
			// 		});

			// 	set((state) => ({
			// 		watchTimeBuffer: [],
			// 		watchTimeArchive: [
			// 			...state.watchTimeArchive,
			// 			...watch_time_logs,
			// 		],
			// 	}));
			// },

			async flushLocalStorageWatchTimeBuffer(user_id) {
				const watch_time_logs = JSON.parse(
					localStorage.getItem("6amyoga_watch_time_logs")
				);

				if (watch_time_logs && watch_time_logs.length > 0) {
					Fetch({
						url: "/user/watch-duration-history/update",
						method: "POST",
						token: true,
						data: {
							user_id: user_id,
							watch_time_logs,
						},
					})
						.then((res) => {
							if (res.status === 200) {
								localStorage.setItem(
									"6amyoga_watch_time_logs",
									"[]"
								);
							}
						})
						.catch((err) => {
							console.log(err);
						});
				}
			},
		},
	];

	return (
		<ReactToSolidBridgeProvider>
			<h1>Hello</h1>
			<div className="max-w-7xl mx-auto">
				<ReactToSolidBridge
					getSolidComponent={({ getChildren, props }) =>
						VideoStoreContext.Provider({
							value: videoStoreActions,
							get children() {
								return PlaylistStoreContext.Provider({
									value: playlistStoreActions,
									get children() {
										return WatchHistoryContext.Provider({
											value: watchHistoryStoreActions,
											get children() {
												return VideoPlayerWrapper({
													children: getChildren,
												});
											},
										});
									},
								});
							},
						})
					}></ReactToSolidBridge>
			</div>
		</ReactToSolidBridgeProvider>
	);
}
