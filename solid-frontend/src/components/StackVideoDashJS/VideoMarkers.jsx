import { createEffect, on } from "solid-js";
import { SEEK_TYPE_MARKER } from "../../enums/seek_types";
import { useVideoStoreContext } from "../../store/VideoStore";

export default function VideoMarkers() {
	const [videoStore, { addToSeekQueue, setMarkers, setCurrentMarkerIdx }] =
		useVideoStoreContext();

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
			} else {
				setMarkers([]);
				setCurrentMarkerIdx(null);
			}
		})
	);

	return (
		<div
			class={`hidden bg-white rounded-2xl border p-4 ${
				videoStore.currentVideo?.video?.transition_id
					? "opacity-0"
					: "opacity-100"
			} ${videoStore.fullScreen ? "m-4" : ""}`}>
			<h5 class="">Markers</h5>
			<div class="mt-4 flex flex-row gap-1 overflow-x-auto">
				<Show when={videoStore.markers.length > 0}>
					<For each={videoStore.markers}>
						{(k, idx) => {
							return (
								<p
									class={`m-0 rounded-full border-2 px-2 py-1 min-w-fit text-sm hover:cursor-pointer ${
										videoStore.currentMarkerIdx === idx()
											? "border-y-green"
											: ""
									}`}
									onClick={() => {
										// TODO : fix this, bug when you go to previous marker
										console.log("CLICKED MARKER : ", idx());
										addToSeekQueue({
											type: SEEK_TYPE_MARKER,
											t: k.timestamp,
											idx: idx(),
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
	);
}
