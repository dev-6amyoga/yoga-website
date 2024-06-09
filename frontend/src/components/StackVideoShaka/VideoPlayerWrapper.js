import useVideoStore from "../../store/VideoStore";
import Playlist from "../Sidebar/Playlist";
import PlaylistSections from "./Sections";
import "./StackVideo.css";
import VideoInfo from "./VideoInfo";
import VideoPlayer from "./VideoPlayer";

export default function VideoPlayerWrapper() {
  const [fullScreen] = useVideoStore((state) => [state.fullScreen]);

  return (
    <>
      <div className={`w-full gap-2 ${fullScreen ? "h-screen" : "video-grid"}`}>
        <div className={`video-area ${fullScreen ? "h-screen" : ""}`}>
          <VideoPlayer />
        </div>

        {!fullScreen && (
          <div className="queue-area">
            <PlaylistSections />
          </div>
        )}
      </div>

      {fullScreen ? (
        <div className="queue-area">
          <PlaylistSections />
        </div>
      ) : (
        <></>
      )}

      {/* <div className="flex flex-col gap-4 my-12">
				<VideoInfo />
			</div> */}

      <Playlist />
    </>
  );
}
