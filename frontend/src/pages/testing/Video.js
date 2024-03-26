import { useEffect } from "react";
import Playlist from "../../components/Sidebar/Playlist";
import VideoPlayerWrapper from "../../components/StackVideoShaka/VideoPlayerWrapper";
import useWatchHistoryStore from "../../store/WatchHistoryStore";
import { toast } from "react-toastify";
import usePlaylistStore from "../../store/PlaylistStore";
import useVideoStore, {
  STATE_VIDEO_ERROR,
  STATE_VIDEO_LOADING,
  STATE_VIDEO_PAUSED,
} from "../../store/VideoStore";

import { handleNextMarker, handlePrevMarker } from "../../lib/shaka-controls";
import {
  VIDEO_VIEW_STUDENT_MODE,
  VIDEO_VIEW_TEACHING_MODE,
} from "../../enums/video_view_modes";

export default function TestingVideo() {
  const setEnableWatchHistory = useWatchHistoryStore(
    (state) => state.setEnableWatchHistory
  );

  const [playlistState, viewMode, videoState, markers, currentMarkerIdx] =
    useVideoStore((state) => [
      state.playlistState,
      state.viewMode,
      state.videoState,
      state.markers,
      state.currentMarkerIdx,
    ]);

  const [popFromArchive, popFromQueue] = usePlaylistStore((state) => [
    state.popFromArchive,
    state.popFromQueue,
  ]);

  useEffect(() => {
    // for hand held pointer
    const handleKeyDown = (event) => {
      event.preventDefault();
      console.log({ playlistState, videoState, viewMode, key: event.key });
      // TODO : fix plalist state when start is clicked
      if (
        videoState === null ||
        videoState === STATE_VIDEO_ERROR ||
        videoState === STATE_VIDEO_LOADING
      ) {
        return;
      }
      switch (event.key) {
        case "PageUp":
          if (viewMode === VIDEO_VIEW_STUDENT_MODE) {
            console.log("Move to prev video");
            popFromArchive(-1);
          } else if (viewMode === VIDEO_VIEW_TEACHING_MODE) {
            //
            console.log("Move to prev marker");
            console.log(markers, currentMarkerIdx);
            handlePrevMarker();
          }
          break;
        case "PageDown":
          if (viewMode === VIDEO_VIEW_STUDENT_MODE) {
            console.log("Move to next video");
            popFromQueue(0);
          } else if (viewMode === VIDEO_VIEW_TEACHING_MODE) {
            console.log("Move to next marker");
            console.log(markers, currentMarkerIdx);
            handleNextMarker();
          }
          break;
        default:
          break;
      }
      // console.log("keyDown", event);
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [viewMode, videoState, playlistState, popFromArchive, popFromQueue]);

  useEffect(() => {
    setEnableWatchHistory(false);
  }, [setEnableWatchHistory]);

  return (
    <div className="mx-auto my-20 max-w-7xl p-4 xl:p-0">
      <VideoPlayerWrapper />
      <Playlist />
    </div>
  );
}
