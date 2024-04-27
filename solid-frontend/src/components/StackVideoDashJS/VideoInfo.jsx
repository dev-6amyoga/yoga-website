// import { Code } from "@geist-ui/core";
// import { Spacer } from "@geist-ui/core";
import { Show, createEffect, on } from "solid-js";
import { SEEK_TYPE_MARKER } from "../../enums/seek_types";
import { useVideoStoreContext } from "../../store/VideoStore";

export default function VideoInfo() {
	// const [
	// 	markers,
	// 	setMarkers,
	// 	currentMarkerIdx,
	// 	setCurrentMarkerIdx,
	// 	addToSeekQueue,
	// 	videoEvent,
	// 	setVideoEvent,
	// 	seekQueue,
	// 	videoState,
	// 	viewMode,
	// 	pauseReason,
	// 	currentVideo,
	// 	currentTime,
	// 	devMode,
	// ] = useVideoStore((state) => [
	// 	state.markers,
	// 	state.setMarkers,
	// 	state.currentMarkerIdx,
	// 	state.setCurrentMarkerIdx,
	// 	state.addToSeekQueue,
	// 	state.videoEvent,
	// 	state.setVideoEvent,
	// 	state.seekQueue,
	// 	state.videoState,
	// 	state.viewMode,
	// 	state.pauseReason,
	// 	state.currentVideo,
	// 	state.currentTime,
	// 	state.devMode,
	// ]);

	const [videoStore, { addToSeekQueue, setMarkers, setCurrentMarkerIdx }] =
		useVideoStoreContext();

	// useEffect(() => {
	// 	if (currentVideo) {
	// 		setMarkers(currentVideo?.video?.markers || []);
	// 		if (currentVideo?.video?.markers?.length > 0) {
	// 			setCurrentMarkerIdx(0);
	// 		}
	// 	}
	// }, [currentVideo, setCurrentMarkerIdx, setMarkers]);

	createEffect(
		on([() => videoStore.currentVideo], () => {
			console.log(
				"currentVideo changed : ",
				videoStore.currentVideo.video?.markers
			);
			if (videoStore.currentVideo) {
				setMarkers(videoStore.currentVideo?.video?.markers || []);
				if (videoStore.currentVideo?.video?.markers?.length > 0) {
					setCurrentMarkerIdx(0);
				}
			}
		})
	);

	// useEffect(() => {
	//     if (
	//         videoStore.currentMarkerIdx !== null &&
	//         videoEvent === VIDEO_EVENT_MOVING_MARKER
	//     ) {
	//         addToSeekQueue({
	//             t: markers[videoStore.currentMarkerIdx].timestamp,
	//             type: 'move',
	//         })
	//     }
	// }, [videoStore.currentMarkerIdx, addToSeekQueue, markers, videoEvent])

	return (
		<div class="">
			<Show when={videoStore.devMode}>
				<div class="flex w-full gap-4 border my-5">
					<pre class="flex-1">
						{JSON.stringify(
							{ seekQueue: videoStore.seekQueue },
							null,
							4
						)}
						{JSON.stringify(
							{ markers: videoStore.markers },
							null,
							4
						)}
					</pre>
					<pre class="flex-1">
						{JSON.stringify(
							{
								currentMarkerIdx: videoStore.currentMarkerIdx,
								videoState: videoStore.videoState,
								pauseReason: videoStore.pauseReason,
								viewMode: videoStore.viewMode,
								currentTime: videoStore.currentTime,
							},
							null,
							4
						)}
					</pre>
				</div>
			</Show>

			<div
				class={`rounded-2xl border p-4 ${
					videoStore.currentVideo?.video?.transition_id
						? "opacity-0"
						: "opacity-100"
				}`}>
				<h5 class="">Markers</h5>
				<div class="mt-4 flex flex-wrap gap-1">
					<Show when={videoStore.markers.length > 0}>
						<For each={videoStore.markers}>
							{(k, idx) => {
								return (
									<p
										class={`m-0 rounded-full border-2 px-2 py-1 text-sm hover:cursor-pointer ${
											videoStore.currentMarkerIdx === idx
												? "border-y-green"
												: ""
										}`}
										onClick={() => {
											// TODO : fix this, bug when you go to previous marker
											console.log(
												"CLICKED MARKER : ",
												idx
											);
											// setVideoEvent({
											// 	type: VIDEO_EVENT_MOVING_MARKER,
											// 	markerIdx: idx,
											// });
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
							}}
						</For>
					</Show>
				</div>
			</div>
			<div class="flex flex-col gap-4 rounded-lg border p-4">
				<p>Video Info</p>
				<Show
					when={
						videoStore.currentVideo !== null &&
						videoStore.currentVideo !== undefined
					}>
					<h3>
						<span class="text-sm text-zinc-500">
							{videoStore.currentVideo?.video?.transition_id
								? "TRANSITION"
								: "ASANA"}
						</span>
						<br />
						{videoStore.currentVideo?.video?.asana_name ||
							videoStore.currentVideo?.video
								?.transition_video_name}
					</h3>

					<span class="text-sm text-zinc-500">
						{videoStore.currentVideo?.video?.transition_id
							? ""
							: "ASANA DESCRIPTION"}
					</span>
					<p>{videoStore.currentVideo?.video?.asana_desc}</p>
				</Show>
			</div>
		</div>
	);
}
