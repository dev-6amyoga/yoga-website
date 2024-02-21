import { create } from 'zustand'
import { VIDEO_VIEW_STUDENT_MODE } from '../enums/video_view_modes'

export const STATE_VIDEO_PLAY = 'PLAY',
    STATE_VIDEO_PAUSED = 'PAUSED',
    STATE_VIDEO_LOADING = 'LOADING',
    STATE_VIDEO_ERROR = 'ERROR'

export const useVideoStore = create((set) => ({
    playlistState: false,
    setPlaylistState: (ps) =>
        set(() => {
            return { playlistState: ps }
        }),

    // currentVideo is the video object that is currently playing
    currentVideo: null,
    setCurrentVideo: (item) =>
        set(() => {
            return { currentVideo: item }
        }),

    markers: [],
    setMarkers: (markers) =>
        set(() => {
            return { markers }
        }),
    currentMarkerIdx: null,
    setCurrentMarkerIdx: (idx) =>
        set(() => {
            return { currentMarkerIdx: idx }
        }),

    videoEvent: null,
    setVideoEvent: (videoEvent) =>
        set(() => {
            return { videoEvent }
        }),

    // videoState is one of the STATE_VIDEO_* constants
    videoState: STATE_VIDEO_PAUSED,
    setVideoState: (vs) =>
        set(() => {
            return { videoState: vs }
        }),

    // pauseReason : if the pause is cause by a marker or a normal pause
    pauseReason: null,
    setPauseReason: (pauseReason) => {
        set(() => {
            return { pauseReason }
        })
    },

    //
    playbackRate: 1.0,
    setPlaybackRate: (rate) =>
        set(() => {
            return {
                playbackRate: rate,
            }
        }),

    autoplayInitialized: false,
    setAutoplayInitialized: (autoplayInitialized) => {
        set(() => {
            return { autoplayInitialized }
        })
    },
    volume: 0.0,
    setVolume: (volume) => {
        set(() => {
            return { volume }
        })
    },

    // seekQueue holds the seek times that the user has clicked on
    seekQueue: [],
    addToSeekQueue: (seekEvent) =>
        set((state) => {
            // console.log(state.seekQueue, seekTime)
            // {type: move | seek, time: number}
            return { seekQueue: [...state.seekQueue, seekEvent] }
        }),
    popFromSeekQueue: (index) =>
        set((state) => {
            if (state.seekQueue.length > index) {
                const sq = [...state.seekQueue]
                sq.splice(index, 1)
                // console.log(q, "in func after splice");
                return {
                    seekQueue: sq,
                }
            }
            return {}
        }),

    currentTime: 0,
    setCurrentTime: (time) =>
        set(() => {
            return { currentTime: time }
        }),

    viewMode: VIDEO_VIEW_STUDENT_MODE,
    setViewMode: (mode) =>
        set(() => {
            return { viewMode: mode }
        }),
}))

export default useVideoStore
