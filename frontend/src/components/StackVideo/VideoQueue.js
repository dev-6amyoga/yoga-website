import { useEffect, useState } from "react";
import usePlaylistStore from "../../store/PlaylistStore";
import QueueItem from "./QueueItem";

function VideoQueue() {
	const queue = usePlaylistStore((state) => state.queue);
	const popFromQueue = usePlaylistStore((state) => state.popFromQueue);
	const moveUpQueue = usePlaylistStore((state) => state.moveUpQueue);
	const moveDownQueue = usePlaylistStore((state) => state.moveDownQueue);
	const [customerCode, setCustomerCode] = useState("");

	useEffect(() => {
		setCustomerCode(process.env.REACT_APP_CLOUDFLARE_CUSTOMER_CODE);
	}, []);

	return (
		<div className="col-start-7 col-span-2 bg-yblue-50 rounded-xl h-full max-h-[50%] overflow-y-auto overflow-x-hidden">
			<h3 className="text-center pt-2">Queue</h3>
			<div className="flex flex-col gap-2">
				{queue.length === 0 ? (
					<p className="text-center">No videos in queue</p>
				) : (
					<div className="p-2 flex flex-row md:flex-col gap-2 md:overflow-x-scroll">
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
