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
import { useEffect, useState } from "react";
import useVideoStore from "../../store/VideoStore";
import { browser, detectBrowser } from "../../utils/browser";
import { isMobileTablet } from "../../utils/isMobileOrTablet";
import DownloadProgressCircle from "../DownloadProgressCircle";
import Playlist from "../Sidebar/Playlist";
import PlaylistSections from "./Sections";
import VideoPlayer from "./VideoPlayer";

export default function VideoPlayerWrapper({ page = "student" }) {
	const [fullScreen, playerSupported, setPlayerSupported] = useVideoStore(
		(state) => [
			state.fullScreen,
			state.playerSupported,
			state.setPlayerSupported,
		]
	);

	const [isMobile, setIsMobile] = useState(false);

	// Check if the device is mobile or tablet

	useEffect(() => {
		const check = isMobileTablet();
		console.log("[VideoPlayerWrapper] Is mobile or tablet:", check);

		setIsMobile(check);
	}, []);

	useEffect(() => {
		const detectedBrowser = detectBrowser();
		console.log("[VideoPlayerWrapper] Detected browser:", detectedBrowser);

		switch (detectedBrowser) {
			case browser.unknown:
			case browser.ie:
			case browser.firefox:
				setPlayerSupported(false);
				break;
			default:
				break;
		}
	}, []);

	return (
		<>
			{!playerSupported ? (
				<>
					<div style={{ textAlign: "center", padding: "20px" }}>
						<h2>Cannot be accessed on this browser.</h2>
						<p>
							Please try on a different browser for the best
							experience.
						</p>
					</div>
				</>
			) : isMobile ? (
				<>
					<div style={{ textAlign: "center", padding: "20px" }}>
						<h2>Cannot be accessed on mobile devices</h2>
						<p>
							Please try on a laptop or desktop for the best
							experience.
						</p>
					</div>
				</>
			) : (
				<>
					<DownloadProgressCircle />
					<div
						className={
							fullScreen
								? ""
								: "relative video-grid mb-12 w-full gap-6"
						}>
						<div
							className={
								fullScreen
									? "absolute w-full h-screen top-0 left-0 right-0 bottom-0 z-[10000]"
									: "video-area"
							}>
							<VideoPlayer />
						</div>
						<div className="queue-area">
							<PlaylistSections />
						</div>
					</div>
					<Playlist page={page} />
				</>
			)}
		</>
	);
}
