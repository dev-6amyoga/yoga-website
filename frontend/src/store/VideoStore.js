import { create } from "zustand"
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
    currentVideo: null,
    setCurrentVideo: (item) =>
        set((state) => {
            return { currentVideo: item };
        }),
    videoState: STATE_VIDEO_PAUSED,
    setVideoState: (vs) =>
        set((state) => {
            return { videoState: vs };
        }),
    playbackRate: 1.0,
    setPlaybackRate: (rate) =>
        set((state) => {
            return {
                playbackRate: rate,
            };
        }),
    seekQueue: [],
    addToSeekQueue: (seekTime) =>
        set((state) => {
            // console.log(state.seekQueue, seekTime)
            return {seekQueue: [...state.seekQueue, seekTime]};
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
}));

export default useVideoStore;
