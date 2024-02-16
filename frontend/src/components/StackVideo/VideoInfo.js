// import { Code } from "@geist-ui/core";
import useVideoStore from "../../store/VideoStore";

export default function VideoInfo() {
	let currentVideo = useVideoStore((state) => state.currentVideo);

	const [markers, currentMarkerIdx, setCurrentMarkerIdx, addToSeekQueue] =
		useVideoStore((state) => [
			state.markers,
			state.currentMarkerIdx,
			state.setCurrentMarkerIdx,
			state.addToSeekQueue,
		]);

	return (
		<div className="">
			{currentVideo ? (
				<div className="flex flex-col gap-4 py-4">
					{/* <Code block>{JSON.stringify(currentVideo, null, 4)}</Code> */}
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
								markers.map((k, idx) => {
									return (
										<p
											key={k.timestamp}
											className={`px-2 py-1 border rounded-full m-0 text-sm hover:cursor-pointer ${
												currentMarkerIdx === idx
													? "border-amber-500"
													: ""
											}`}
											onClick={() => {
												setCurrentMarkerIdx(idx);
												addToSeekQueue({
													t: k.timestamp,
													type: "move",
												});
											}}>
											{k.timestamp} : {k.title}
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
