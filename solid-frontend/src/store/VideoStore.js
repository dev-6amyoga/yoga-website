import { createWithStore } from "solid-zustand";
import { VIDEO_VIEW_STUDENT_MODE } from "../enums/video_view_modes";

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
	setCurrentTime: (time) =>
		set(() => {
			return { currentTime: { value: time } };
		}),

	viewMode: { value: VIDEO_VIEW_STUDENT_MODE },
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

export default useVideoStore;
