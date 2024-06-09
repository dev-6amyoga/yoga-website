import { Avatar, Tooltip } from "@mui/material";
import { blue } from "@mui/material/colors";
import { useEffect } from "react";
import { SEEK_TYPE_MARKER } from "../../enums/seek_types";
import useVideoStore from "../../store/VideoStore";
import { toTimeString } from "../../utils/toTimeString";

export default function PlaylistSections() {
	// const [sections] = usePlaylistStore((state) => [state.sections]);

	const [
		fullScreen,
		currentVideo,
		addToSeekQueue,
		currentMarkerIdx,
		setCurrentMarkerIdx,
		setMarkers,
	] = useVideoStore((state) => [
		state.fullScreen,
		state.currentVideo,
		state.addToSeekQueue,
		state.currentMarkerIdx,
		state.setCurrentMarkerIdx,
		state.setMarkers,
	]);

	const handleSeek = (s, idx) => {
		// TODO : fix this, bug when you go to previous marker
		console.log("CLICKED SECTION : ", idx);
		// setVideoEvent({
		// 	type: VIDEO_EVENT_MOVING_MARKER,
		// 	markerIdx: idx,
		// });
		addToSeekQueue({
			type: SEEK_TYPE_MARKER,
			t: s.time,
		});
	};

	useEffect(() => {
		if (currentVideo) {
			setMarkers(
				currentVideo?.video?.markers ?? currentVideo?.video?.sections
			);
			setCurrentMarkerIdx(0);
		}
	}, [currentVideo, setMarkers, setCurrentMarkerIdx]);

	return (
		<div
			className={`max-w-7xl mx-auto overflow-y-auto overflow-x-hidden rounded-xl bg-blue-50 ${fullScreen ? "" : "xl:h-full"}`}>
			<div className="flex flex-col gap-4 py-8 max-h-96">
				<h4 className="text-center">Sections</h4>
				{currentVideo?.video?.sections?.map((s, idx) => {
					return (
						<div
							key={s.time}
							className={`flex flex-row items-center gap-2 p-2 hover:cursor-pointer ${currentMarkerIdx === idx ? "bg-blue-100" : ""}`}
							onClick={() => handleSeek(s, idx)}>
							<Avatar sx={{ bgcolor: blue[700] }}>
								{idx + 1}
							</Avatar>
							<div className="flex flex-col gap-1">
								<Tooltip title={s.name}>
									<p className="font-medium text-sm">
										{s.name.substring(0, 45)}..
									</p>
								</Tooltip>
								<p className="text-sm">
									{toTimeString(s.time)}
								</p>
							</div>
						</div>
					);
				}) ?? <p className="text-center"></p>}
			</div>
		</div>
	);
}
