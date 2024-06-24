import { Spacer } from "@geist-ui/core";
import useVideoStore from "../../store/VideoStore";
import Playlist from "../Sidebar/Playlist";
import PoseDetector from "../webcam_component/PoseDetector";
import PlaylistSections from "./Sections";
import VideoPlayer from "./VideoPlayer";

export default function VideoPlayerWrapper() {
  const [fullScreen] = useVideoStore((state) => [state.fullScreen]);

  return (
    <>
      <div
        className={fullScreen ? "" : "relative video-grid mb-12 w-full gap-6"}
      >
        <div
          className={
            fullScreen
              ? "absolute w-full h-screen top-0 left-0 right-0 bottom-0 z-[10000]"
              : "video-area"
          }
        >
          <VideoPlayer />
        </div>
        {!fullScreen ? (
          <div className="queue-area">
            <PoseDetector />
          </div>
        ) : (
          <></>
        )}
      </div>

      <PlaylistSections />

      <Spacer h={4} />

      <Playlist />
    </>
  );
}
