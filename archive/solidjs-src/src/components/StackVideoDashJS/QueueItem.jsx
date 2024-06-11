function QueueItem(props) {
	// item, idx, pop, moveUp, moveDown, customerCode
	return (
		<div class="bg-yblue-900 flex flex-shrink-0 flex-col items-center gap-2 rounded-xl bg-black px-1 py-2 text-white">
			<img
				src={`https://customer-${
					props.customerCode
				}.cloudflarestream.com/${
					props.item?.video?.asana_videoID ??
					props.item?.video?.transition_video_ID
				}/thumbnails/thumbnail.jpg?time=${
					props.item?.video?.asana_thumbnailTs || 1
				}s?height=150?`}
				alt={
					props.item?.video?.asana_name ??
					props.item?.video?.transition_name
				}
				class="h-24 rounded-xl"
			/>
			<div class="flex w-full justify-between gap-2 xl:grid xl:grid-cols-4">
				<div class="flex-1 xl:col-span-3 xl:col-start-1">
					<p class="m-0 max-w-[15ch] text-ellipsis break-normal break-words text-xs xl:max-w-full">
						{props.idx}
						{props.item?.idx}{" "}
						{props.item?.video?.asana_name ??
							props.item?.video?.transition_video_name}
					</p>
				</div>
				<div class="mx-auto flex gap-1 xl:col-span-1 xl:col-start-4 xl:mx-0">
					{/* <button
						class="hidden xl:inline-block xl:h-6 xl:w-6"
						onClick={() => moveUp(idx)}>
						<LuMoveUp class="h-full w-full" />
					</button>
					<button
						class="hidden xl:inline-block xl:h-6 xl:w-6"
						onClick={() => moveDown(idx)}>
						<LuMoveDown class="h-full w-full" />
					</button> */}
					<button
						class="h-5 w-5 xl:h-6 xl:w-6 border rounded-full p-2 flex items-center justify-center"
						onClick={() => {
							console.log("QueueItem: pop", props.idx());
							props.pop(props.idx());
						}}>
						-
					</button>
				</div>
			</div>
		</div>
	);
}

export default QueueItem;
