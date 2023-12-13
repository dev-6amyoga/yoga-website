import { create } from "zustand";
import usePlaylistStore from "./PlaylistStore";
export const STATE_VIDEO_PLAY = "PLAY";
export const STATE_VIDEO_PAUSED = "PAUSED";

const useVideoStore = create((set) => ({
  playlistState: false,
  setPlaylistState: (ps) =>
    set((state) => {
      return { playlistState: ps };
    }),
  currentVideoID: null,
  setCurrentVideoID: (item) =>
    set((state) => {
      return { currentVideoID: item };
    }),
  videoState: null,
  setVideoState: (vs) =>
    set((state) => {
      return { videoState: vs };
    }),
}));

export default useVideoStore;
