// import { Code } from "@geist-ui/core";
// import { Spacer } from "@geist-ui/core";
import { Show } from "solid-js";
import useVideoStore from "../../store/VideoStore";

export default function VideoInfo() {
	const videoStore = useVideoStore.getState();
	const markers = videoStore.markers;
	const setMarkers = videoStore.setMarkers;
	const currentMarkerIdx = videoStore.currentMarkerIdx;
	const setCurrentMarkerIdx = videoStore.setCurrentMarkerIdx;
	const addToSeekQueue = videoStore.addToSeekQueue;
	const videoEvent = videoStore.videoEvent;
	const setVideoEvent = videoStore.setVideoEvent;
	const seekQueue = videoStore.seekQueue;
	const videoState = videoStore.videoState;
	const viewMode = videoStore.viewMode;
	const pauseReason = videoStore.pauseReason;
	const currentVideo = videoStore.currentVideo;
	const currentTime = videoStore.currentTime;
	const devMode = videoStore.devMode;

	// useEffect(() => {
	// 	if (currentVideo) {
	// 		setMarkers(currentVideo?.video?.markers || []);
	// 		if (currentVideo?.video?.markers?.length > 0) {
	// 			setCurrentMarkerIdx(0);
	// 		}
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

	return (
		<div class="">
			<Show when={devMode}>
				<div class="flex w-full gap-4 border my-5">
					<pre class="flex-1">
						{JSON.stringify({ seekQueue }, null, 4)}
					</pre>
					<pre class="flex-1">
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
			</Show>

			<div
				class={`rounded-2xl border p-4 ${
					currentVideo?.video?.transition_id
						? "opacity-0"
						: "opacity-100"
				}`}>
				{/* <h5 class="">Markers</h5> */}
				{/* <div class="mt-4 flex flex-wrap gap-1">
					{markers ? (
						markers.map((k, idx) => {
							return (
								<p
									key={k.timestamp + String(currentMarkerIdx)}
									class={`m-0 rounded-full border-2 px-2 py-1 text-sm hover:cursor-pointer ${
										currentMarkerIdx === idx
											? "border-y-green"
											: ""
									}`}
									onClick={() => {
										// TODO : fix this, bug when you go to previous marker
										console.log("CLICKED MARKER : ", idx);
										setVideoEvent({
											type: VIDEO_EVENT_MOVING_MARKER,
											markerIdx: idx,
										});
										addToSeekQueue({
											type: SEEK_TYPE_MARKER,
											t: k.timestamp,
											idx: idx,
										});
									}}>
									{k.timestamp} : {k.title}{" "}
									{k.loop ? "🔁" : ""}
								</p>
							);
						})
					) : (
						<></>
					)}
				</div> */}
			</div>
			<div class="flex flex-col gap-4 rounded-lg border p-4">
				<p>Video Info</p>
				<Show
					when={currentVideo !== null && currentVideo !== undefined}>
					<h3>
						<span class="text-sm text-zinc-500">
							{currentVideo?.video?.transition_id
								? "TRANSITION"
								: "ASANA"}
						</span>
						<br />
						{currentVideo?.video?.asana_name ||
							currentVideo?.video?.transition_video_name}
					</h3>

					<span class="text-sm text-zinc-500">
						{currentVideo?.video?.transition_id
							? ""
							: "ASANA DESCRIPTION"}
					</span>
					<p>{currentVideo?.video?.asana_desc}</p>
				</Show>
			</div>
		</div>
	);
}
