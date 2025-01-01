// import React from "react";
// import useVideoStore from "../../store/VideoStore";
// import Playlist from "../Sidebar/Playlist";
// import PlaylistSections from "./Sections";
// import VideoPlayer from "./VideoPlayer";
// import DownloadProgressCircle from "../DownloadProgressCircle";
// import { Modal, Box, Typography, Button } from "@mui/material";
// import { isMobileTablet } from "../../utils/isMobileOrTablet";

// export default function VideoPlayerWrapper({ page = "student" }) {
//   const fullScreen = useVideoStore((state) => state.fullScreen);

//   return (
//     <>
//       <DownloadProgressCircle />
//       <div
//         className={fullScreen ? "" : "relative video-grid mb-12 w-full gap-6"}
//       >
//         <div
//           className={
//             fullScreen
//               ? "absolute w-full h-screen top-0 left-0 right-0 bottom-0 z-[10000]"
//               : "video-area"
//           }
//         >
//           <VideoPlayer />
//         </div>
//         <div className="queue-area">
//           <PlaylistSections />
//         </div>
//       </div>
//       <Playlist page={page} />
//     </>
//   );
// }
import React from "react";
import useVideoStore from "../../store/VideoStore";
import Playlist from "../Sidebar/Playlist";
import PlaylistSections from "./Sections";
import VideoPlayer from "./VideoPlayer";
import DownloadProgressCircle from "../DownloadProgressCircle";
import { isMobileTablet } from "../../utils/isMobileOrTablet";

export default function VideoPlayerWrapper({ page = "student" }) {
  const fullScreen = useVideoStore((state) => state.fullScreen);

  // Check if the device is mobile or tablet
  const isMobile = isMobileTablet();
  console.log("Is mobile or tablet:", isMobile);

  if (isMobile) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        <h2>Cannot be accessed on mobile devices</h2>
        <p>Please try on a laptop or desktop for the best experience.</p>
      </div>
    );
  }

  return (
    <>
      <DownloadProgressCircle />
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
        <div className="queue-area">
          <PlaylistSections />
        </div>
      </div>
      <Playlist page={page} />
    </>
  );
}
