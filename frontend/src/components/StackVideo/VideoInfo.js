import React, { useEffect, useState } from "react";

import { Code } from "@geist-ui/core";
import useVideoStore from "../../store/VideoStore";

export default function VideoInfo() {
	let currentVideo = useVideoStore((state) => state.currentVideo);
	const [markers, setMarkers] = useState(null);

	useEffect(() => {
		if (currentVideo) {
			console.log(currentVideo);
			setMarkers(currentVideo?.video?.asana_markers);
		} else {
			setMarkers(null);
		}
	}, [currentVideo]);

	return (
		<div className="">
			{currentVideo ? (
				<div className="flex flex-col gap-4 py-4">
					<Code block>{JSON.stringify(currentVideo, null, 4)}</Code>
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
					<p>{currentVideo?.video?.asana_desc}</p>
				</div>
			) : (
				<></>
			)}
		</div>
	);
}
