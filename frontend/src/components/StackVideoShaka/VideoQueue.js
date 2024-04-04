import { Button } from "@geist-ui/core";
import { useEffect, useState } from "react";
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

	const [customerCode, setCustomerCode] = useState("");

	useEffect(() => {
		setCustomerCode(process.env.REACT_APP_CLOUDFLARE_CUSTOMER_CODE);
	}, []);

	return (
		<div
			className={`max-w-7xl mx-auto overflow-y-auto overflow-x-hidden rounded-xl bg-blue-50 ${fullScreen ? "" : "xl:h-full"}`}>
			<div className="flex flex-col items-center gap-2 overflow-hidden">
				<h3 className="pt-2 text-center">Queue</h3>
				<Button auto type="secondary" onClick={clearQueue}>
					Clear Queue
				</Button>
				{queue.length === 0 ? (
					<p className="text-center">No videos in queue</p>
				) : (
					<div
						className={`flex flex-row gap-2 max-w-full overflow-x-auto p-2 ${fullScreen ? "" : "md:overflow-x-hidden xl:flex-col"}`}>
						{queue.map((queue_item, idx) => {
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
						})}
					</div>
				)}
			</div>
		</div>
	);
}

export default VideoQueue;
