import { useEffect } from "react";
import VideoPlayerWrapper from "../../components/StackVideoShaka/VideoPlayerWrapper";
import useWatchHistoryStore from "../../store/WatchHistoryStore";

export default function ShakaVideo() {
  const setEnableWatchHistory = useWatchHistoryStore(
    (state) => state.setEnableWatchHistory
  );

  useEffect(() => {
    setEnableWatchHistory(false);
  }, []);

  return (
    // <PageWrapper heading="Player">
    <div className="max-w-7xl mx-auto p-4">
      <VideoPlayerWrapper page="testing" />
    </div>
    // </PageWrapper>
  );
}
