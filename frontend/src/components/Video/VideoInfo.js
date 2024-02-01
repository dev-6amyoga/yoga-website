import React, { useEffect, useState } from "react";

import usePlaylistStore from "../../store/PlaylistStore";
import useVideoStore from "../../store/VideoStore";

export default function VideoInfo() {
	const queue = usePlaylistStore((state) => state.queue);
	let currentVideo = useVideoStore((state) => state.currentVideo);
	const [markers, setMarkers] = useState(null);

	useEffect(() => {
		if (currentVideo) {
			console.log(currentVideo);
			setMarkers(queue[0]?.video?.asana_markers);
		} else {
			setMarkers(null);
		}
	}, [queue, currentVideo]);

	return (
		<div className="">
			{currentVideo && queue.length > 0 ? (
				<div className="flex flex-col gap-4 py-4">
					<h3>
						<span className="text-zinc-500 text-sm">
							{currentVideo?.video?.transition_id
								? "TRANSITION"
								: "ASANA"}
						</span>
						<br />
						{currentVideo?.video?.asana_name ||
							currentVideo?.video?.transition_video_name}
					</h3>
					<div
						className={`border p-4 rounded-2xl ${
							currentVideo?.video?.transition_id
								? "opacity-0"
								: "opacity-100"
						}`}>
						<h5 className="">Markers</h5>
						<div className="flex gap-1 flex-wrap mt-4">
							{markers ? (
								Object.keys(markers).map((k) => {
									return (
										<p
											key={k}
											className="px-2 py-1 border rounded-full m-0 text-sm">
											{k} : {markers[k].step}
										</p>
									);
								})
							) : (
								<></>
							)}
						</div>
					</div>

					<span className="text-zinc-500 text-sm">
						{currentVideo?.video?.transition_id
							? ""
							: "ASANA DESCRIPTION"}
					</span>
					<p>{queue[0]?.video?.asana_desc}</p>
				</div>
			) : (
				<></>
			)}
		</div>
	);
}
