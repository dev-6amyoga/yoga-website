import { children, createContext, useContext } from "solid-js";

// import {} from "zustand";
import { createStore, produce } from "solid-js/store";
import { VIDEO_VIEW_TEACHING_MODE } from "../enums/video_view_modes";
import createWithStore from "../utils/createWithStore";

export const STATE_VIDEO_PLAY = "PLAY",
	STATE_VIDEO_PAUSED = "PAUSED",
	STATE_VIDEO_LOADING = "LOADING",
	STATE_VIDEO_ERROR = "ERROR";

const useVideoStore = createWithStore((set) => ({
	devMode: { value: false },
	setDevMode: (dm) =>
		set(() => {
			return { devMode: { value: dm } };
		}),

	fullScreen: { value: false },
	setFullScreen: (fs) =>
		set(() => {
			return { fullScreen: { value: fs } };
		}),

	playlistState: { value: false },
	setPlaylistState: (ps) =>
		set(() => {
			return { playlistState: { value: ps } };
		}),

	// currentVideo is the video object that is currently playing
	currentVideo: { value: null },
	setCurrentVideo: (item) =>
		set(() => {
			return { currentVideo: { value: item } };
		}),

	markers: [],
	setMarkers: (markers) =>
		set(() => {
			return { markers };
		}),

	currentMarkerIdx: { value: null },
	setCurrentMarkerIdx: (idx) =>
		set(() => {
			return { currentMarkerIdx: { value: idx } };
		}),

	autoSetCurrentMarkerIdx: (currentTime = undefined) => {
		set((state) => {
			let ct = currentTime ?? state.currentTime;
			// console.log('autoSetCurrentMarkerIdx :', currentTime, '==>', ct)
			// let prevIdx = state.currentMarkerIdx

			// if no markers, dont bother
			if (state.markers.length === 0) {
				return { currentMarkerIdx: { value: null } };
			}

			// if the current time is less than the first marker, set to null
			if (ct < state.markers[0].timestamp) {
				return { currentMarkerIdx: { value: null } };
			}

			// find the first marker that is greater than the current time
			const idx = state.markers.findIndex((m) => m.timestamp > ct) - 1;
			// console.log("autoSetCurrentMarkerIdx :", idx, ct);

			// if the current time is greater than the last marker, set to last marker
			if (idx === -2) {
				return {
					currentMarkerIdx: { value: state.markers.length - 1 },
				};
			}

			return { currentMarkerIdx: { value: idx } };
		});
	},

	// videoState is one of the STATE_VIDEO_* constants
	videoState: { value: STATE_VIDEO_LOADING },
	setVideoState: (vs) =>
		set(() => {
			return { videoState: { value: vs } };
		}),

	// pauseReason : if the pause is cause by a marker or a normal pause
	pauseReason: { value: null },
	setPauseReason: (pauseReason) => {
		set(() => {
			return { pauseReason: { value: pauseReason } };
		});
	},

	//
	playbackRate: { value: 1.0 },
	setPlaybackRate: (rate) =>
		set(() => {
			return {
				playbackRate: { value: rate },
			};
		}),

	autoplayInitialized: { value: false },
	setAutoplayInitialized: (autoplayInitialized) => {
		set(() => {
			return { autoplayInitialized: { value: autoplayInitialized } };
		});
	},

	volume: { value: 0.0 },
	setVolume: (volume) => {
		set(() => {
			return { volume: { value: volume } };
		});
	},

	// seekQueue holds the seek times that the user has clicked on
	seekQueue: [],
	addToSeekQueue: (seekEvent) =>
		set((state) => {
			// console.log(state.seekQueue, seekTime)
			// {type: move | seek, time: number}
			return {
				seekQueue: [...state.seekQueue, seekEvent],
				pauseReason: null,
			};
		}),

	popFromSeekQueue: (index) =>
		set((state) => {
			if (state.seekQueue.length > index) {
				const sq = [...state.seekQueue];
				sq.splice(index, 1);
				// console.log(q, "in func after splice");
				return {
					seekQueue: sq,
				};
			}
			return {};
		}),

	currentTime: { value: 0 },
	// setCurrentTime: (time) =>
	// 	set(() => {
	// 		console.log("SET CURRENT TIME HAS BEEN CALLED!!!")
	// 		return { currentTime: { value: time } };
	// 	}),
	setCurrentTime: (time) =>
	set(() => {
		return { currentTime: { value: time } };
	}), 


	viewMode: { value: VIDEO_VIEW_TEACHING_MODE },
	setViewMode: (mode) =>
		set(() => {
			return { viewMode: { value: mode } };
		}),

	commitSeekTime: { value: -1 },
	setCommitSeekTime: (time) =>
		set(() => {
			return { commitSeekTime: { value: time } };
		}),

	playreadyKeyUrl: { value: null },
	setPlayreadyKeyUrl: (url) =>
		set(() => {
			return { playreadyKeyUrl: { value: url } };
		}),
}));

export const VideoStoreContext = createContext([
	{
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
	},
	{},
]);

export const VideoStoreProvider = (props) => {
	const [store, setStore] = createStore({
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
	});

	const videoStore = [
		store,
		{
			setDevMode: (dm) =>
				setStore(
					produce((state) => {
						state.devMode = dm;
					})
				),

			setFullScreen: (fs) =>
				setStore(
					produce((state) => {
						state.fullScreen = fs;
					})
				),

			setPlaylistState: (ps) =>
				setStore(
					produce((state) => {
						state.playlistState = ps;
					})
				),

			setCurrentVideo: (item) =>
				setStore(
					produce((state) => {
						state.currentVideo = item;
					})
				),

			setMarkers: (markers) =>
				setStore(
					produce((state) => {
						state.markers = markers;
					})
				),

			setCurrentMarkerIdx: (idx) =>
				setStore(
					produce((state) => {
						state.currentMarkerIdx = idx;
					})
				),

			autoSetCurrentMarkerIdx: (currentTime = undefined) => {
				setStore(
					produce((state) => {
						let ct = currentTime ?? state.currentTime;
						// console.log('autoSetCurrentMarkerIdx :', currentTime, '==>', ct)
						// let prevIdx = state.currentMarkerIdx

						// if no markers, dont bother
						if (state.markers.length === 0) {
							state.currentMarkerIdx = null;
						}

						// if the current time is less than the first marker, set to null
						if (ct < state.markers[0].timestamp) {
							state.currentMarkerIdx = null;
						}

						// find the first marker that is greater than the current time
						const idx =
							state.markers.findIndex((m) => m.timestamp > ct) -
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
				setStore(
					produce((state) => {
						state.videoState = vs;
					})
				),

			setPauseReason: (pauseReason) => {
				setStore(
					produce((state) => {
						state.pauseReason = pauseReason;
					})
				);
			},

			setPlaybackRate: (rate) =>
				setStore(
					produce((state) => {
						state.playbackRate = rate;
					})
				),

			setAutoplayInitialized: (autoplayInitialized) => {
				setStore(
					produce((state) => {
						state.autoplayInitialized = autoplayInitialized;
					})
				);
			},

			setVolume: (volume) => {
				setStore(
					produce((state) => {
						state.volume = volume;
					})
				);
			},

			addToSeekQueue: (seekEvent) =>
				setStore(
					produce((state) => {
						// console.log(state.seekQueue, seekTime)
						// {type: move | seek, time: number}
						state.seekQueue.push(seekEvent);
						state.pauseReason = null;
					})
				),

			popFromSeekQueue: (index) =>
				setStore(
					produce((state) => {
						if (state.seekQueue.length > index) {
							state.seekQueue.splice(index, 1);
						}
					})
				),

			setCurrentTime: (time) =>
				setStore(
					produce((state) => {
						state.currentTime = time;
					})
				),

			setViewMode: (mode) =>
				setStore(
					produce((state) => {
						state.viewMode = mode;
					})
				),

			setCommitSeekTime: (time) =>
				setStore(
					produce((state) => {
						state.commitSeekTime = time;
					})
				),

			setPlayreadyKeyUrl: (url) =>
				setStore(
					produce((state) => {
						state.playreadyKeyUrl = url;
					})
				),
		},
	];

	console.log("Hello, videoStore");

	const resolvedChildren = children(() => props.children);

	return (
		<VideoStoreContext.Provider value={videoStore}>
			{resolvedChildren()}
		</VideoStoreContext.Provider>
	);
};

export const useVideoStoreContext = () => {
	const c = useContext(VideoStoreContext);

	if (!c) {
		throw new Error(
			"useVideoStoreContext must be used within a VideoStoreProvider"
		);
	}

	return c;
};

export default useVideoStore;
