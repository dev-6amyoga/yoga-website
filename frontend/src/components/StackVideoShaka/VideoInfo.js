// import { Code } from "@geist-ui/core";
import { Description } from "@geist-ui/core";
import { useMemo } from "react";
import usePlaylistStore from "../../store/PlaylistStore";
import useTimeStore from "../../store/TimeStore";
import useVideoStore from "../../store/VideoStore";

export default function VideoInfo() {
	const [
		markers,
		setMarkers,
		currentMarkerIdx,
		setCurrentMarkerIdx,
		addToSeekQueue,
		videoEvent,
		setVideoEvent,
		seekQueue,
		videoState,
		viewMode,
		pauseReason,
		currentVideo,
		devMode,
	] = useVideoStore((state) => [
		state.markers,
		state.setMarkers,
		state.currentMarkerIdx,
		state.setCurrentMarkerIdx,
		state.addToSeekQueue,
		state.videoEvent,
		state.setVideoEvent,
		state.seekQueue,
		state.videoState,
		state.viewMode,
		state.pauseReason,
		state.currentVideo,
		state.devMode,
	]);

	const [currentTime] = useTimeStore((state) => [state.currentTime]);

	const [queue] = usePlaylistStore((state) => [state.queue]);

	// useEffect(() => {
	// 	if (currentVideo) {
	// 		setMarkers(
	// 			currVideo?.video?.markers ?? currVideo?.video?.sections
	// 		);
	// 		setCurrentMarkerIdx(0);
	// 	}
	// }, [currentVideo, setCurrentMarkerIdx, setMarkers]);

	// useEffect(() => {
	//     if (
	//         currentMarkerIdx !== null &&
	//         videoEvent === VIDEO_EVENT_MOVING_MARKER
	//     ) {
	//         addToSeekQueue({
	//             t: markers[currentMarkerIdx].timestamp,
	//             type: 'move',
	//         })
	//     }
	// }, [currentMarkerIdx, addToSeekQueue, markers, videoEvent])

	const currVideo = useMemo(() => {
		if (queue && queue.length > 0) {
			return queue[0];
		}
		return null;
	}, [queue]);

	const currMarker = useMemo(() => {
		if (markers && markers.length > 0) {
			return markers[currentMarkerIdx];
		}
		return null;
	}, [currentMarkerIdx, markers]);

	return (
		<div className="">
			{devMode ? (
				<div className="flex w-full gap-4 border my-5">
					<pre className="flex-1">
						{JSON.stringify({ seekQueue }, null, 4)}
					</pre>
					<pre className="flex-1">
						{JSON.stringify(
							{
								currentMarkerIdx,
								videoState,
								pauseReason,
								viewMode,
								currentTime,
							},
							null,
							4
						)}
					</pre>
				</div>
			) : (
				<></>
			)}
			{/* <pre block>{JSON.stringify(queue, null, 4)}</pre> */}

			<div className="flex flex-col gap-4 rounded-lg border p-4">
				<Description title="Currently Playing"></Description>
				{currVideo ? (
					<>
						<h4>
							<span className="text-sm text-zinc-500">
								{currVideo?.video?.transition_id
									? "TRANSITION"
									: currVideo?.video?.playlist_id
										? "PLAYLIST"
										: "ASANA"}
							</span>
							<br />
							{currVideo?.video?.asana_name ||
								currVideo?.video?.transition_video_name ||
								currVideo?.video?.playlist_name}
						</h4>

						{currVideo?.video?.asana_desc ? (
							<>
								<span className="text-sm text-zinc-500">
									{currVideo?.video?.transition_id
										? ""
										: currVideo?.video?.playlist_id
											? ""
											: "ASANA DESCRIPTION"}
								</span>
								<p>{currVideo?.video?.asana_desc}</p>
							</>
						) : (
							<></>
						)}
					</>
				) : (
					<></>
				)}
			</div>
		</div>
	);
}
