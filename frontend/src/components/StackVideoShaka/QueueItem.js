import { memo } from "react";
import { IoRemoveCircleOutline } from "react-icons/io5";

function QueueItem({ item, idx, pop, moveUp, moveDown, customerCode }) {
	// const [hovered, setHovered] = useState(false);
	// const [hoverTimeout, setHoverTimeout] = useState(null);

	// const handleMouseLeave = () => {
	// 	if (hoverTimeout) clearTimeout(hoverTimeout);
	// 	setHoverTimeout(null);
	// 	setHovered(false);
	// };

	// const handleMouseEnter = () => {
	// 	setHoverTimeout(
	// 		setTimeout(() => {
	// 			setHovered(true);
	// 		}, 2000)
	// 	);
	// };

	// const thumbnail = useMemo(
	// 	() =>
	// 		`https://customer-${customerCode}.cloudflarestream.com/${
	// 			item?.video?.asana_videoID ?? item?.video?.transition_video_ID
	// 		}/thumbnails/thumbnail.${
	// 			hovered ? "gif" : "jpg"
	// 		}?time=1s?height=150?${hovered ? "duration=2s" : ""}`,
	// 	[customerCode, hovered, item]
	// );

	console.log(item?.video?.asana_name, item?.video?.asana_thumbnailTs);

	return (
		<div className="bg-yblue-900 flex flex-shrink-0 flex-col items-center gap-2 rounded-xl bg-black px-1 py-2 text-white">
			<img
				src={`https://customer-${customerCode}.cloudflarestream.com/${
					item?.video?.asana_videoID ??
					item?.video?.transition_video_ID
				}/thumbnails/thumbnail.jpg?time=${
					item?.video?.asana_thumbnailTs || 1
				}s?height=150?`}
				alt={item?.video?.asana_name ?? item?.video?.transition_name}
				className="h-24 rounded-xl"
			/>
			<div className="flex w-full justify-between gap-2 xl:grid xl:grid-cols-4">
				<div className="flex-1 xl:col-span-3 xl:col-start-1">
					<p className="m-0 max-w-[15ch] text-ellipsis break-normal break-words text-xs xl:max-w-full">
						{item?.idx}{" "}
						{item?.video?.asana_name ??
							item?.video?.transition_video_name}
					</p>
				</div>
				<div className="mx-auto flex gap-1 xl:col-span-1 xl:col-start-4 xl:mx-0">
					{/* <button
						className="hidden xl:inline-block xl:h-6 xl:w-6"
						onClick={() => moveUp(idx)}>
						<LuMoveUp className="h-full w-full" />
					</button>
					<button
						className="hidden xl:inline-block xl:h-6 xl:w-6"
						onClick={() => moveDown(idx)}>
						<LuMoveDown className="h-full w-full" />
					</button> */}
					<button
						className="h-5 w-5 xl:h-6 xl:w-6"
						onClick={() => pop(idx)}>
						<IoRemoveCircleOutline className="h-full w-full" />
					</button>
				</div>
			</div>
		</div>
	);
}

export default memo(QueueItem);
