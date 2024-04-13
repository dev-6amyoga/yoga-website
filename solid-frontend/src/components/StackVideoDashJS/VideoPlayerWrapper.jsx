import "./StackVideo.css";
import VideoPlayer from "./VideoPlayer";
import VideoQueue from "./VideoQueue";

export default function VideoPlayerWrapper() {
	// const [fullScreen] = useVideoStore((state) => [state.fullScreen]);

	return (
		<>
			{/* <div
				class={
					fullScreen
						? "relative w-full h-screen"
						: "video-grid mb-12 w-full gap-2"
				}>
				<div
					class={
						fullScreen
							? "absolute w-full h-screen top-0 left-0 right-0 bottom-0"
							: "video-area"
					}>
					<VideoPlayer />
				</div>
				{!fullScreen ? (
					<div class="queue-area">
						<VideoQueue />
					</div>
				) : (
					<></>
				)}
			</div> */}
			<VideoPlayer />

			<VideoQueue />
			<div class="flex flex-col gap-4">{/* <VideoInfo /> */}</div>
		</>
	);
}
