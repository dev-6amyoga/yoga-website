import { Match, Switch, createEffect, createSignal, on } from "solid-js";
import { useVideoStoreContext } from "../../store/VideoStore";
import "./StackVideo.css";
import VideoInfo from "./VideoInfo";
import VideoMarkers from "./VideoMarkers";
import VideoPlayer from "./VideoPlayer";
import VideoQueue from "./VideoQueue";

export default function VideoPlayerWrapper() {
	// const [fullScreen] = useVideoStore((state) => [state.fullScreen]);
	const [videoStore, {}] = useVideoStoreContext();
	const [openQueue, setOpenQueue] = createSignal(true);

	createEffect(
		on([() => videoStore.fullScreen], () => {
			if (!videoStore.fullScreen) {
				setOpenQueue(false);
			}
		})
	);

	return (
		<>
			<div
				class={
					videoStore.fullScreen
						? "relative w-full h-screen"
						: "video-grid mb-12 w-full gap-2"
				}>
				<div class={videoStore.fullScreen ? "" : "video-area"}>
					<VideoPlayer />
				</div>

				<div
					class={
						videoStore.fullScreen
							? "fixed z-[1001] top-4 right-4 max-w-xl"
							: "queue-area"
					}>
					<Switch>
						<Match when={videoStore.fullScreen && openQueue()}>
							<VideoQueue
								openQueue={openQueue}
								setOpenQueue={setOpenQueue}
							/>
						</Match>
						<Match when={!videoStore.fullScreen}>
							<VideoQueue
								openQueue={openQueue}
								setOpenQueue={setOpenQueue}
							/>
						</Match>
						<Match when={videoStore.fullScreen && !openQueue()}>
							<button
								class="rounded-full px-2 py-1 bg-y-white text-y-black"
								onClick={() => {
									setOpenQueue(true);
								}}>
								Open Queue
							</button>
						</Match>
					</Switch>
				</div>
			</div>
			{/* <VideoPlayer />

			<VideoQueue /> */}
			<div class="flex flex-col gap-4">
				<VideoMarkers />
				<VideoInfo />
			</div>
		</>
	);
}
