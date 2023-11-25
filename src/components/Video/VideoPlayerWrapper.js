import VideoPlayer from "./VideoPlayer";
import VideoControls from "./VideoControls";
import VideoInfo from "./VideoInfo";

export default function VideoPlayerWrapper() {
  return (
    <div className="col-start-1 col-span-5 mb-10">
      <VideoPlayer />
      <VideoControls />
      <VideoInfo />
    </div>
  );
}
