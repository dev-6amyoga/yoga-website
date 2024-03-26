import { useEffect } from "react";
import Playlist from "../../components/Sidebar/Playlist";
import VideoPlayerWrapper from "../../components/StackVideoShaka/VideoPlayerWrapper";
import useWatchHistoryStore from "../../store/WatchHistoryStore";
import { toast } from "react-toastify";

export default function TestingVideo() {
  const setEnableWatchHistory = useWatchHistoryStore(
    (state) => state.setEnableWatchHistory
  );

  //   wait click middle button well see which jey it maps to

  useEffect(() => {
    // for hand held pointer
    const handleKeyDown = (event) => {
      event.preventDefault();
      switch (event.key) {
        case "PageUp":
          console.log("Left arrow key pressed!");
          break;
        case "PageDown":
          console.log("Right arrow key pressed!");
          break;
        default:
          break;
      }
      console.log("keyDown", event);
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

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
