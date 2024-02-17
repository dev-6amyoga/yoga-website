import { create } from "zustand";
import { VIDEO_VIEW_STUDENT_MODE } from "../enums/video_view_modes";
export const STATE_VIDEO_PLAY = "PLAY";
export const STATE_VIDEO_PAUSED = "PAUSED";
export const STATE_VIDEO_LOADING = "LOADING";
export const STATE_VIDEO_ERROR = "ERROR";

const useVideoStore = create((set) => ({
	playlistState: false,
	setPlaylistState: (ps) =>
		set((state) => {
			return { playlistState: ps };
		}),

	// currentVideo is the video object that is currently playing
	currentVideo: null,
	setCurrentVideo: (item) =>
		set((state) => {
			return { currentVideo: item };
		}),

	markers: [],
	setMarkers: (markers) =>
		set((state) => {
			return { markers };
		}),
	currentMarkerIdx: null,
	setCurrentMarkerIdx: (idx) =>
		set((state) => {
			return { currentMarkerIdx: idx };
		}),

	// videoState is one of the STATE_VIDEO_* constants
	videoState: STATE_VIDEO_PAUSED,
	setVideoState: (vs) =>
		set((state) => {
			return { videoState: vs };
		}),

	//
	playbackRate: 1.0,
	setPlaybackRate: (rate) =>
		set((state) => {
			return {
				playbackRate: rate,
			};
		}),

	autoplayInitialized: false,
	setAutoplayInitialized: (autoplayInitialized) => {
		set((state) => {
			return { autoplayInitialized };
		});
	},
	volume: 0.0,
	setVolume: (volume) => {
		set((state) => {
			return { volume };
		});
	},

	// seekQueue holds the seek times that the user has clicked on
	seekQueue: [],
	addToSeekQueue: (seekEvent) =>
		set((state) => {
			// console.log(state.seekQueue, seekTime)
			// {type: move | seek, time: number}
			return { seekQueue: [...state.seekQueue, seekEvent] };
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

	currentTime: 0,
	setCurrentTime: (time) =>
		set((state) => {
			return { currentTime: time };
		}),

	viewMode: VIDEO_VIEW_STUDENT_MODE,
	setViewMode: (mode) =>
		set((state) => {
			return { viewMode: mode };
		}),
}));

export default useVideoStore;
