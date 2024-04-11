// import { Button } from "@geist-ui/core";
// import { useEffect, useState } from "react";
import { For, Show, createSignal } from "solid-js";
import usePlaylistStore from "../../store/PlaylistStore";
import useVideoStore from "../../store/VideoStore";
import QueueItem from "./QueueItem";

function VideoQueue() {
	const queue = usePlaylistStore((state) => state.queue);
	const popFromQueue = usePlaylistStore((state) => state.popFromQueue);
	const moveUpQueue = usePlaylistStore((state) => state.moveUpQueue);
	const moveDownQueue = usePlaylistStore((state) => state.moveDownQueue);
	const clearQueue = usePlaylistStore((state) => state.clearQueue);

	const fullScreen = useVideoStore((state) => state.fullScreen);

	const [customerCode, setCustomerCode] = createSignal(
		import.meta.env.VITE_CLOUDFLARE_CUSTOMER_CODE
	);

	return (
		<div
			class={`max-w-7xl mx-auto overflow-y-auto overflow-x-hidden rounded-xl bg-blue-50 ${
				fullScreen ? "" : "xl:h-full"
			}`}>
			<div class="flex flex-col items-center gap-2 overflow-hidden">
				<h3 class="pt-2 text-center">Queue</h3>
				<button auto type="secondary" onClick={clearQueue}>
					Clear Queue
				</button>
				<Show
					when={queue.length > 0}
					fallback={<p>No Items In Queue</p>}>
					<div
						class={`flex flex-row gap-2 max-w-full overflow-x-auto p-2 ${
							fullScreen ? "" : "md:overflow-x-hidden xl:flex-col"
						}`}>
						<For each={queue}>
							{(queue_item, idx) => {
								return (
									<QueueItem
										key={queue_item.queue_id}
										item={queue_item}
										pop={popFromQueue}
										moveUp={moveUpQueue}
										moveDown={moveDownQueue}
										idx={idx}
										customerCode={customerCode}
									/>
								);
							}}
						</For>
					</div>
				</Show>
			</div>
		</div>
	);
}

export default VideoQueue;
