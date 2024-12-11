import { useEffect } from "react";
import useVideoStore from "../../store/VideoStore";
import Playlist from "../Sidebar/Playlist";
import PlaylistSections from "./Sections";
import VideoPlayer from "./VideoPlayer";

export default function VideoPlayerWrapper({ page = "student" }) {
  const fullScreen = useVideoStore((state) => state.fullScreen);
  // const [aiVisible, setAiVisible] = useState(false);

  // console.log("fullScreen", fullScreen);l

  useEffect(() => {
    console.log("[VideoPlayerWrapper] fullScreen changed", fullScreen);
  }, [fullScreen]);

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
          {/* <Button
						onClick={() => {
							setAiVisible(!aiVisible);
						}}
						variant="contained">
						{aiVisible ? "Disable AI Mode" : "Enable AI Mode"}
					</Button> */}
        </div>
        {/* {!fullScreen ? (
          // {aiVisible?  (
          //             <div className="queue-area">
          //   <PoseDetector />
          // </div>
          // ) : <></>}
          <div className="queue-area">
            <PoseDetector />
          </div>
        ) : (
          <></>
        )} */}
        <div className="queue-area">
          <PlaylistSections />
        </div>

        {/* {aiVisible && (
          <div className="queue-area">
            <PoseDetector />
          </div>
        )} */}
      </div>

      {/* <Spacer h={4} /> */}

      <Playlist page={page} />
    </>
  );
}
