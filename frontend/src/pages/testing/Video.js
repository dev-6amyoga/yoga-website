import { useEffect } from "react";
import Playlist from "../../components/Sidebar/Playlist";
import VideoPlayerWrapper from "../../components/StackVideoShaka/VideoPlayerWrapper";
import useWatchHistoryStore from "../../store/WatchHistoryStore";

export default function TestingVideo() {
	const setEnableWatchHistory = useWatchHistoryStore(
		(state) => state.setEnableWatchHistory
	);

	useEffect(() => {
		setEnableWatchHistory(false);
	}, [setEnableWatchHistory]);

	return (
		<div className="mx-auto my-20 max-w-7xl p-4 xl:p-0">
			<VideoPlayerWrapper />
			<Playlist />
		</div>
	);
}
