// import { Code } from "@geist-ui/core";
// import { Spacer } from "@geist-ui/core";
import { Show } from "solid-js";
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
		currentTime,
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
		state.currentTime,
		state.devMode,
	]);

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
	//         currentMarkerIdx.value !== null &&
	//         videoEvent === VIDEO_EVENT_MOVING_MARKER
	//     ) {
	//         addToSeekQueue({
	//             t: markers[currentMarkerIdx.value].timestamp,
	//             type: 'move',
	//         })
	//     }
	// }, [currentMarkerIdx.value, addToSeekQueue, markers, videoEvent])

	return (
		<div class="">
			<Show when={devMode.value}>
				<div class="flex w-full gap-4 border my-5">
					<pre class="flex-1">
						{JSON.stringify({ seekQueue }, null, 4)}
					</pre>
					<pre class="flex-1">
						{JSON.stringify(
							{
								currentMarkerIdx: currentMarkerIdx.value,
								videoState: videoState.value,
								pauseReason,
								viewMode: viewMode.value,
								currentTime: currentTime.value,
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
									key={k.timestamp + String(currentMarkerIdx.value)}
									class={`m-0 rounded-full border-2 px-2 py-1 text-sm hover:cursor-pointer ${
										currentMarkerIdx.value === idx
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
