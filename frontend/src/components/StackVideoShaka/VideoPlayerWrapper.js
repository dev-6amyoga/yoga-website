import useVideoStore from "../../store/VideoStore";
import Playlist from "../Sidebar/Playlist";
import PlaylistSections from "./Sections";
import VideoInfo from "./VideoInfo";
import VideoPlayer from "./VideoPlayer";

export default function VideoPlayerWrapper() {
	const [fullScreen] = useVideoStore((state) => [state.fullScreen]);

	return (
		<>
			<div className="flex flex-col gap-4 my-4">
				<VideoInfo />
			</div>
			<div
				className={`w-full gap-2 ${fullScreen ? "h-screen" : "video-grid"} mb-4`}>
				<div className={`video-area ${fullScreen ? "h-screen" : ""}`}>
					<VideoPlayer />
				</div>

				{!fullScreen && (
					<div className="queue-area">
						<PlaylistSections />
					</div>
				)}
			</div>

			{fullScreen ? (
				<div className="queue-area">
					<PlaylistSections />
				</div>
			) : (
				<></>
			)}

			<Playlist />
		</>
	);
}
