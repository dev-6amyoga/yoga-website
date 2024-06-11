import VideoInfo from "./VideoInfo";
import VideoPlayer from "./VideoPlayer";

export default function VideoPlayerWrapper() {
	return (
		<div className="col-start-1 col-span-5 mb-10">
			<VideoPlayer />
			<VideoInfo />
		</div>
	);
}
