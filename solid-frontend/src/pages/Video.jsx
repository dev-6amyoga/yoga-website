import { createEffect, useContext } from "solid-js";
import Playlist from "../components/Sidebar/Playlist";
import VideoPlayerWrapper from "../components/StackVideoDashJS/VideoPlayerWrapper";
import { WatchHistoryContext } from "../store/WatchHistoryStore";

export default function Video() {
	const [store, { setEnableWatchHistory }] = useContext(WatchHistoryContext);

	// const [devMode, setDevMode, fullScreen] = useVideoStore((state) => [
	// 	state.devMode,
	// 	state.setDevMode,
	// 	state.fullScreen,
	// ]);

	// const [popFromArchive, popFromQueue] = usePlaylistStore((state) => [
	// 	state.popFromArchive,
	// 	state.popFromQueue,
	// ]);

	// onMount(() => {
	// 	// for hand held pointer
	// 	const handleKeyDown = (event) => {
	// 		// console.log({
	// 		// 	playlistState,
	// 		// 	videoState.value,
	// 		// 	viewMode.value,
	// 		// 	key: event.key,
	// 		// });
	// 		const state = useVideoStore.getState();
	// 		const viewMode.value = state.viewMode.value;
	// 		const videoState.value = state.videoState.value;
	// 		const markers = state.markers;
	// 		const currentMarkerIdx.value = state.currentMarkerIdx.value;

	// 		// TODO : fix plalist state when start is clicked
	// 		if (
	// 			videoState.value === null ||
	// 			videoState.value === STATE_VIDEO_ERROR ||
	// 			videoState.value === STATE_VIDEO_LOADING
	// 		) {
	// 			return;
	// 		}
	// 		switch (event.key) {
	// 			case "PageUp":
	// 				event.preventDefault();

	// 				if (viewMode.value === VIDEO_VIEW_STUDENT_MODE) {
	// 					console.log("Move to prev video");
	// 					popFromArchive(-1);
	// 				} else if (viewMode.value === VIDEO_VIEW_TEACHING_MODE) {
	// 					//
	// 					console.log("Move to prev marker");
	// 					console.log(markers, currentMarkerIdx.value);
	// 					handlePrevMarker();
	// 				}
	// 				break;
	// 			case "PageDown":
	// 				event.preventDefault();

	// 				if (viewMode.value === VIDEO_VIEW_STUDENT_MODE) {
	// 					console.log("Move to next video");
	// 					popFromQueue(0);
	// 				} else if (viewMode.value === VIDEO_VIEW_TEACHING_MODE) {
	// 					console.log("Move to next marker");
	// 					console.log(markers, currentMarkerIdx.value);
	// 					handleNextMarker();
	// 				}
	// 				break;
	// 			default:
	// 				break;
	// 		}
	// 		// console.log("keyDown", event);
	// 	};

	// 	document.addEventListener("keydown", handleKeyDown);
	// });

	// onCleanup(() => {
	// 	document.removeEventListener("keydown", handleKeyDown);
	// });

	createEffect(() => {
		console.log("Disable watch history");
		setEnableWatchHistory(false);
	});

	return (
		<div class={`toplvlpage relative max-w-7xl mx-auto`}>
			<VideoPlayerWrapper />
			<Playlist />

			{/* <button
				class={`fixed bottom-4 right-4 p-4 ${
					devMode ? "bg-y-green" : "bg-y-white text-black"
				} rounded-full shadow-lg`}
				onClick={() => setDevMode(!devMode)}>
				Dev Mode : {devMode ? "ON" : "OFF"}
			</button> */}
		</div>
	);
}
