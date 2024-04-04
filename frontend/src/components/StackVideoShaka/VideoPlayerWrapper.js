import useVideoStore from "../../store/VideoStore";
import "./StackVideo.css";
import VideoInfo from "./VideoInfo";
import VideoPlayer from "./VideoPlayer";
import VideoQueue from "./VideoQueue";

export default function VideoPlayerWrapper() {
	const [fullScreen] = useVideoStore((state) => [state.fullScreen]);

	return (
		<>
			<div
				className={
					fullScreen
						? "relative w-full h-screen"
						: "video-grid mb-12 w-full gap-2"
				}>
				<div
					className={
						fullScreen
							? "absolute w-full h-screen top-0 left-0 right-0 bottom-0"
							: "video-area"
					}>
					<VideoPlayer />
				</div>
				{!fullScreen ? (
					<div className="queue-area">
						<VideoQueue />
					</div>
				) : (
					<></>
				)}
			</div>

			{fullScreen ? (
				<div className="queue-area">
					<VideoQueue />
				</div>
			) : (
				<></>
			)}
			<div className="flex flex-col gap-4">
				<VideoInfo />
			</div>
		</>
	);
}
