import Playlist from "../../components/Sidebar/Playlist";
import VideoPlayerWrapper from "../../components/StackVideo/VideoPlayerWrapper";
import VideoQueue from "../../components/StackVideo/VideoQueue";

export default function TestingVideo() {
	return (
		<div className="max-w-7xl mx-auto">
			<div className="flex flex-col md:grid md:grid-cols-6 gap-2">
				<div className="col-span-5">
					<VideoPlayerWrapper />
				</div>
				<div className="col-span-1">
					<VideoQueue />
				</div>
			</div>
			<Playlist />
		</div>
	);
}
