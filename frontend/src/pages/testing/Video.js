// import { useEffect } from "react";
// import Playlist from "../../components/Sidebar/Playlist";
// import VideoPlayerWrapper from "../../components/StackVideoDashJS/VideoPlayerWrapper";
// import {
//   VIDEO_VIEW_STUDENT_MODE,
//   VIDEO_VIEW_TEACHING_MODE,
// } from "../../enums/video_view_modes";
// import { handleNextMarker, handlePrevMarker } from "../../lib/shaka-controls";
// import usePlaylistStore from "../../store/PlaylistStore";
// import useVideoStore, {
//   STATE_VIDEO_ERROR,
//   STATE_VIDEO_LOADING,
// } from "../../store/VideoStore";
// import useWatchHistoryStore from "../../store/WatchHistoryStore";

// export default function TestingVideo() {
//   const setEnableWatchHistory = useWatchHistoryStore(
//     (state) => state.setEnableWatchHistory
//   );

//   const [
//     playlistState,
//     viewMode,
//     videoState,
//     markers,
//     currentMarkerIdx,
//     devMode,
//     setDevMode,
//     fullScreen,
//   ] = useVideoStore((state) => [
//     state.playlistState,
//     state.viewMode,
//     state.videoState,
//     state.markers,
//     state.currentMarkerIdx,
//     state.devMode,
//     state.setDevMode,
//     state.fullScreen,
//   ]);

//   const [popFromArchive, popFromQueue] = usePlaylistStore((state) => [
//     state.popFromArchive,
//     state.popFromQueue,
//   ]);

//   useEffect(() => {
//     // for hand held pointer
//     const handleKeyDown = (event) => {
//       // console.log({
//       // 	playlistState,
//       // 	videoState,
//       // 	viewMode,
//       // 	key: event.key,
//       // });
//       const state = useVideoStore.getState();
//       const viewMode = state.viewMode;
//       const videoState = state.videoState;
//       const markers = state.markers;
//       const currentMarkerIdx = state.currentMarkerIdx;

//       // TODO : fix plalist state when start is clicked
//       if (
//         videoState === null ||
//         videoState === STATE_VIDEO_ERROR ||
//         videoState === STATE_VIDEO_LOADING
//       ) {
//         return;
//       }
//       switch (event.key) {
//         case "PageUp":
//           event.preventDefault();

//           if (viewMode === VIDEO_VIEW_STUDENT_MODE) {
//             console.log("Move to prev video");
//             popFromArchive(-1);
//           } else if (viewMode === VIDEO_VIEW_TEACHING_MODE) {
//             //
//             console.log("Move to prev marker");
//             console.log(markers, currentMarkerIdx);
//             handlePrevMarker();
//           }
//           break;
//         case "PageDown":
//           event.preventDefault();

//           if (viewMode === VIDEO_VIEW_STUDENT_MODE) {
//             console.log("Move to next video");
//             popFromQueue(0);
//           } else if (viewMode === VIDEO_VIEW_TEACHING_MODE) {
//             console.log("Move to next marker");
//             console.log(markers, currentMarkerIdx);
//             handleNextMarker();
//           }
//           break;
//         default:
//           break;
//       }
//       // console.log("keyDown", event);
//     };

//     document.addEventListener("keydown", handleKeyDown);

//     return () => {
//       document.removeEventListener("keydown", handleKeyDown);
//     };
//   }, [popFromArchive, popFromQueue]);

//   useEffect(() => {
//     setEnableWatchHistory(false);
//   }, [setEnableWatchHistory]);

//   return (
//     <div
//       className={`toplvlpage relative mx-auto ${fullScreen ? "" : "my-20 max-w-7xl p-4 xl:p-0"}`}
//     >
//       <VideoPlayerWrapper />
//       <Playlist />
//       <button
//         className={`fixed bottom-4 right-4 p-4 ${devMode ? "bg-y-green" : "bg-y-white text-black"} rounded-full shadow-lg`}
//         onClick={() => setDevMode(!devMode)}
//       >
//         Dev Mode : {devMode ? "ON" : "OFF"}
//       </button>
//     </div>
//   );
// }

import VideoPlayerWrapper from "../../solidjs-src/src/components/StackVideoDashJS/VideoPlayerWrapper";
// import { Cube as SolidCube } from "phosphor-solid";
import {
	convertToReactComponent,
	ReactToSolidBridgeProvider,
} from "react-solid-bridge";

const VideoPlayerWrapperSolid = convertToReactComponent(VideoPlayerWrapper);

export default function TestingVideo() {
	return (
		<ReactToSolidBridgeProvider>
			<h1>Hello</h1>
			{/* <ReactToSolidBridge
				getSolidComponent={({ getChildren, props }) =>
					VideoPlayerWrapper({ children: getChildren })
				}></ReactToSolidBridge> */}
			<VideoPlayerWrapperSolid />
		</ReactToSolidBridgeProvider>
	);
}
