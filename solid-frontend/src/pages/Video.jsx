import { createEffect, on, onCleanup, useContext } from "solid-js";
import Playlist from "../components/Sidebar/Playlist";
import VideoPlayerWrapper from "../components/StackVideoDashJS/VideoPlayerWrapper";
import { SEEK_TYPE_MOVE } from "../enums/seek_types";
import {
	VIDEO_VIEW_STUDENT_MODE,
	VIDEO_VIEW_TEACHING_MODE,
} from "../enums/video_view_modes";
import { usePlaylistStoreContext } from "../store/PlaylistStore";
import {
	STATE_VIDEO_ERROR,
	STATE_VIDEO_LOADING,
	useVideoStoreContext,
} from "../store/VideoStore";
import { WatchHistoryContext } from "../store/WatchHistoryStore";

export default function Video() {
	const [store, { setEnableWatchHistory }] = useContext(WatchHistoryContext);

	const [videoStore, { setCurrentMarkerIdx, addToSeekQueue, setFullScreen }] =
		useVideoStoreContext();

	const [playlistStore, { popFromArchive, popFromQueue }] =
		usePlaylistStoreContext();

	// const [devMode, setDevMode, fullScreen] = useVideoStore((state) => [
	// 	state.devMode,
	// 	state.setDevMode,
	// 	state.fullScreen,
	// ]);

	// const [popFromArchive, popFromQueue] = usePlaylistStore((state) => [
	// 	state.popFromArchive,
	// 	state.popFromQueue,
	// ]);

	createEffect(
		on(
			[
				() => videoStore.currentMarkerIdx,
				() => videoStore.markers,
				() => videoStore.viewMode,
				() => videoStore.videoState,
			],
			() => {
				const handlePrevMarker = () => {
					console.log("Prev Marker");
					if (videoStore.markers.length > 0) {
						const idx = (videoStore.currentMarkerIdx || 0) - 1;
						console.log("SETTING MARKER ID :", idx);
						if (idx <= 0) {
							setCurrentMarkerIdx(null);
							popFromArchive(-1);
							// console.log("end reached");
							return;
						}
						// seek to prev marker
						else {
							setCurrentMarkerIdx(idx);
							addToSeekQueue({
								t: videoStore.markers[idx].timestamp,
								type: SEEK_TYPE_MOVE,
							});
							return;
						}
					} else {
						popFromArchive(-1);
					}
				};

				const handleNextMarker = () => {
					console.log("Next Marker");
					if (videoStore.markers.length > 0) {
						const idx = (videoStore.currentMarkerIdx || 0) + 1;

						if (idx >= videoStore.markers.length) {
							popFromQueue(0);
							// console.log("end reached");
							return;
						}

						console.log("SETTING MARKER ID :", idx);
						setCurrentMarkerIdx(idx);
						// seek to next marker
						addToSeekQueue({
							t: videoStore.markers[idx].timestamp,
							type: SEEK_TYPE_MOVE,
						});
					} else {
						popFromQueue(0);
					}
				};

				// for hand held pointer
				const handleKeyDown = (event) => {
					console.log(event.key, "HI I AM KEY");

					// TODO : fix playlist state when start is clicked
					if (
						videoStore.videoState === null ||
						videoStore.videoState === STATE_VIDEO_ERROR ||
						videoStore.videoState === STATE_VIDEO_LOADING
					) {
						return;
					}
					switch (event.key) {
						case "PageUp":
							event.preventDefault();

							if (
								videoStore.viewMode === VIDEO_VIEW_STUDENT_MODE
							) {
								console.log("Move to prev video");
								popFromArchive(-1);
							} else if (
								videoStore.viewMode === VIDEO_VIEW_TEACHING_MODE
							) {
								//
								console.log("Move to prev marker");
								// console.log(
								// 	videoStore.markers,
								// 	videoStore.currentMarkerIdx
								// );
								handlePrevMarker();
							}
							break;
						case "PageDown":
							event.preventDefault();

							if (
								videoStore.viewMode === VIDEO_VIEW_STUDENT_MODE
							) {
								console.log("Move to next video");
								popFromQueue(0);
							} else if (
								videoStore.viewMode === VIDEO_VIEW_TEACHING_MODE
							) {
								console.log("Move to next marker");
								// console.log(
								// 	videoStore.markers,
								// 	videoStore.currentMarkerIdx
								// );
								handleNextMarker();
							}
							break;

						case "ArrowLeft":
							event.preventDefault();

							if (
								videoStore.viewMode === VIDEO_VIEW_STUDENT_MODE
							) {
								console.log("Move to prev video");
								popFromArchive(-1);
							} else if (
								videoStore.viewMode === VIDEO_VIEW_TEACHING_MODE
							) {
								//
								console.log("Move to prev marker");
								// console.log(
								// 	videoStore.markers,
								// 	videoStore.currentMarkerIdx
								// );
								handlePrevMarker();
							}
							break;
						case "ArrowRight":
							event.preventDefault();
							if (
								videoStore.viewMode === VIDEO_VIEW_STUDENT_MODE
							) {
								console.log("Move to next video");
								popFromQueue(0);
							} else if (
								videoStore.viewMode === VIDEO_VIEW_TEACHING_MODE
							) {
								console.log("Move to next marker");
								// console.log(
								// 	videoStore.markers,
								// 	videoStore.currentMarkerIdx
								// );
								handleNextMarker();
							}
							break;
						default:
							break;
					}
					// console.log("keyDown", event);
				};

				document.addEventListener("keydown", handleKeyDown);
				onCleanup(() => {
					document.removeEventListener("keydown", handleKeyDown);
				});
			}
		)
	);

	createEffect(
		on([() => videoStore.fullScreen], () => {
			try {
				if (videoStore.fullScreen) {
					document.getElementById("app").requestFullscreen();
				} else {
					document.exitFullscreen();
				}
			} catch (err) {}
		})
	);

	createEffect(() => {
		const handleFullscreenExit = (event) => {
			if (!document.fullscreenElement) {
				console.log("FULL SCREEN EXIT");
				setFullScreen(false);
			}
		};

		const handleFullScreenError = () => {
			alert("ERROR : Fullscreen failed to enter/exit.");
		};

		document.addEventListener("fullscreenchange", handleFullscreenExit);

		document.addEventListener("fullscreenerror", handleFullScreenError);

		onCleanup(() => {
			document.removeEventListener(
				"fullscreenchange",
				handleFullscreenExit
			);
			document.removeEventListener(
				"fullscreenerror",
				handleFullScreenError
			);
		});
	});
	// no
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

-5