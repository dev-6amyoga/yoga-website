import { create } from "zustand";
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
	addToSeekQueue: (seekTime) =>
		set((state) => {
			// console.log(state.seekQueue, seekTime)
			return { seekQueue: [...state.seekQueue, seekTime] };
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
}));

export default useVideoStore;
