// import { Code } from "@geist-ui/core";
// import { Spacer } from "@geist-ui/core";
import { Show } from "solid-js";
import { useVideoStoreContext } from "../../store/VideoStore";

export default function VideoInfo() {
	const [videoStore, {}] = useVideoStoreContext();

	return (
		<div class="">
			{/* debug info */}
			{/* <Show when={!videoStore.fullScreen}>
				<button onClick={clearSeekQueue}>Clear Seek Queue</button>
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
			</Show> */}

			<div class="flex flex-col gap-4 rounded-2xl border p-4 my-4">
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
