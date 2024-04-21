/* @refresh reload */
import { Route, Router } from "@solidjs/router";
import { render } from "solid-js/web";

import { createStore, produce } from "solid-js/store";
import { v5 as uuidV5 } from "uuid";
import App from "./App";
import { VIDEO_VIEW_STUDENT_MODE } from "./enums/video_view_modes";
import "./index.css";
import Video from "./pages/Video";
import { PlaylistStoreContext } from "./store/PlaylistStore";
import { STATE_VIDEO_LOADING, VideoStoreContext } from "./store/VideoStore";
import { WatchHistoryContext } from "./store/WatchHistoryStore";

// if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
// 	throw new Error(
// 		"Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?"
// 	);
// }

function VideoPage() {
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
						if (state.archive.length > index + 1) {
							let i = index;
							if (index === -1) {
								i = state.archive.length - 1;
							}
							// const a = [...];
							const removed = state.archive.splice(i, 1);

							state.queue.splice(0, 0, removed[0]);
						}
					})
				),
		},
	];

	const [videoStore, setVideoStore] = createStore({
		devMode: true,
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
		viewMode: VIDEO_VIEW_STUDENT_MODE,
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
						state.markers = markers;
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
						}

						// if the current time is less than the first marker, set to null
						if (ct < state.markers[0]?.timestamp) {
							state.currentMarkerIdx = null;
						}

						// find the first marker that is greater than the current time
						const idx =
							state.markers.findIndex((m) => m?.timestamp > ct) -
							1;
						// console.log("autoSetCurrentMarkerIdx :", idx, ct);

						// if the current time is greater than the last marker, set to last marker
						if (idx === -2) {
							state.currentMarkerIdx = state.markers.length - 1;
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
						state.seekQueue.push(seekEvent);
						state.pauseReason = null;
					})
				),

			popFromSeekQueue: (index) =>
				setVideoStore(
					produce((state) => {
						if (state.seekQueue.length > index) {
							state.seekQueue.splice(index, 1);
						}
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

			async flushWatchTimeBuffer(user_id) {
				const watch_time_logs = state.watchTimeBuffer;

				// console.log({ watch_time_logs });
				if (watch_time_logs.length === 0) {
					return;
				}

				Fetch({
					url: "/watch-time/update",
					method: "POST",
					token: true,
					data: {
						user_id: user_id,
						watch_time_logs,
						institute_id: null,
					},
				})
					.then((res) => {
						if (res.status === 200) {
							console.log("watch time buffer flushed");
						}
					})
					.catch((err) => {
						console.log(err);
						// localStorage.setItem(
						// 	"6amyoga_watch_time_logs",
						// 	JSON.stringify(watch_time_logs)
						// );
						set((state) => ({
							watchTimeBuffer: [
								...state.watchTimeBuffer,
								...watch_time_logs,
							],
						}));
					});

				set((state) => ({
					watchTimeBuffer: [],
					watchTimeArchive: [
						...state.watchTimeArchive,
						...watch_time_logs,
					],
				}));
			},

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
		<VideoStoreContext.Provider value={videoStoreActions}>
			<PlaylistStoreContext.Provider value={playlistStoreActions}>
				<WatchHistoryContext.Provider value={watchHistoryStoreActions}>
					<Video />
				</WatchHistoryContext.Provider>
			</PlaylistStoreContext.Provider>
		</VideoStoreContext.Provider>
	);
}

render(
	() => (
		<Router>
			<Route path="/" component={App} />
			<Route path="/testing/video" component={VideoPage} />
		</Router>
	),
	document.getElementById("app")
);
