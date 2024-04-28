// import { Button } from "@geist-ui/core";
// import { useEffect, useState } from "react";
import { For, Show, createSignal } from "solid-js";
import { usePlaylistStoreContext } from "../../store/PlaylistStore";
import { useVideoStoreContext } from "../../store/VideoStore";
import QueueItem from "./QueueItem";

function VideoQueue(props) {
	// const queue = usePlaylistStore((state) => state.queue);
	// const popFromQueue = usePlaylistStore((state) => state.popFromQueue);
	// const moveUpQueue = usePlaylistStore((state) => state.moveUpQueue);
	// const moveDownQueue = usePlaylistStore((state) => state.moveDownQueue);
	// const clearQueue = usePlaylistStore((state) => state.clearQueue);
	const [videoStore] = useVideoStoreContext();

	const [playlistStore, { clearQueue, popFromQueue }] =
		usePlaylistStoreContext();

	const [customerCode, setCustomerCode] = createSignal(
		import.meta.env.VITE_CLOUDFLARE_CUSTOMER_CODE
	);

	return (
		<div
			class={`relative max-w-7xl mx-auto overflow-y-auto overflow-x-hidden rounded-xl bg-blue-50 ${
				videoStore.fullScreen ? "" : "xl:h-full"
			}`}>
			<Show when={videoStore.fullScreen}>
				<div class="absolute top-0 right-0 p-2">
					<button
						class="rounded-full p-2 bg-y-white text-black"
						onClick={() => {
							props.setOpenQueue(false);
						}}>
						Close
					</button>
				</div>
			</Show>
			<div class="flex flex-col items-center gap-2 overflow-hidden">
				<h3 class="pt-2 text-center">Queue</h3>
				<button class="btn" onClick={clearQueue}>
					Clear Queue
				</button>
				<Show
					when={playlistStore.queue.length > 0}
					fallback={<p>No Items In Queue</p>}>
					<div
						class={`flex gap-2 max-w-full overflow-x-auto p-2 ${
							videoStore.fullScreen
								? "flex-col"
								: "flex-row md:overflow-x-hidden xl:flex-col"
						}`}>
						<For each={playlistStore.queue}>
							{(queue_item, idx) => {
								return (
									<QueueItem
										key={queue_item.queue_id}
										item={queue_item}
										pop={popFromQueue}
										// moveUp={moveUpQueue}
										// moveDown={moveDownQueue}
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
