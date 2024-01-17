import Playlist from "../../components/Sidebar/Playlist";
import VideoPlayerWrapper from "../../components/Video/VideoPlayerWrapper";
import VideoQueue from "../../components/Video/VideoQueue";
import { withAuth } from "../../utils/withAuth";

export default withAuth(function TestingVideo() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-6 gap-2">
        <div className="col-span-4">
          <VideoPlayerWrapper />
        </div>
        <div className="col-span-2">
          <VideoQueue />
        </div>
      </div>
      <Playlist />
    </div>
  );
});
