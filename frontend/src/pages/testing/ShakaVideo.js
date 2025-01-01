import { useEffect } from "react";
import VideoPlayerWrapper from "../../components/StackVideoShaka/VideoPlayerWrapper";
import useShakaOfflineStore from "../../store/ShakaOfflineStore";
import useWatchHistoryStore from "../../store/WatchHistoryStore";

export default function ShakaVideo() {
  const setEnableWatchHistory = useWatchHistoryStore(
    (state) => state.setEnableWatchHistory
  );

  const [setOfflineMode, setUseDownloadedVideo, shakaOfflineStore] =
    useShakaOfflineStore((state) => [
      state.setOfflineMode,
      state.setUseDownloadedVideo,
      state.shakaOfflineStore,
    ]);

  useEffect(() => {
    setEnableWatchHistory(false);
    setUseDownloadedVideo(true);
  }, []);

  useEffect(() => {
    const handleOfflineMode = () => {
      setOfflineMode(true);
    };

    const handleOnlineMode = () => {
      setOfflineMode(false);
    };

    window.addEventListener("offline", handleOfflineMode);
    window.addEventListener("online", handleOnlineMode);

    return () => {
      window.removeEventListener("offline", handleOfflineMode);
      window.removeEventListener("online", handleOnlineMode);
    };
  }, [setOfflineMode]);

  return (
    // <PageWrapper heading="Player">
    <div className="max-w-7xl mx-auto p-4">
      <VideoPlayerWrapper page="testing" />
      {/* <button
				onClick={() => {
					shakaOfflineStore?.deleteAll();
				}}>
				delete all
			</button> */}
    </div>

    // </PageWrapper>
  );
}
