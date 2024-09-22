import { memo, useEffect, useMemo, useRef } from "react";
import { SEEK_TYPE_MARKER } from "../../enums/seek_types";
import usePlaylistStore from "../../store/PlaylistStore";
import useVideoStore from "../../store/VideoStore";
import { toTimeString } from "../../utils/toTimeString";

function PlaylistSections() {
	// const [sections] = usePlaylistStore((state) => [state.sections]);
	const sectionsRef = useRef(null);

	const [
		fullScreen,
		addToSeekQueue,
		currentMarkerIdx,
		setCurrentMarkerIdx,
		setMarkers,
	] = useVideoStore((state) => [
		state.fullScreen,
		state.addToSeekQueue,
		state.currentMarkerIdx,
		state.setCurrentMarkerIdx,
		state.setMarkers,
	]);

	const [queue] = usePlaylistStore((state) => [state.queue]);
	const clearQueue = usePlaylistStore((state) => state.clearQueue);

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

	const currVideo = useMemo(() => {
		if (queue && queue.length > 0) {
			return queue[0];
		}
		return null;
	}, [queue]);

	useEffect(() => {
		if (currVideo) {
			setMarkers(currVideo?.video?.markers ?? currVideo?.video?.sections);
			setCurrentMarkerIdx(0);
		}
	}, [currVideo, setCurrentMarkerIdx, setMarkers]);

	const currMarker = useMemo(() => {
		console.log(
			"[PlaylistSections] recalc currMarker => currentMarkerIdx",
			currentMarkerIdx
		);
		if (
			currVideo &&
			currentMarkerIdx !== null &&
			currentMarkerIdx !== undefined &&
			currentMarkerIdx >= 0 &&
			currVideo?.video?.sections !== undefined
		) {
			return currVideo?.video?.sections[currentMarkerIdx];
		}
		return null;
	}, [currVideo, currentMarkerIdx]);

	return (
		<div
			className={`relative mx-auto overflow-y-auto overflow-x-hidden rounded-xl bg-blue-50 ${fullScreen ? "" : "xl:h-full"}`}>
			<div className="px-4 pt-4 pb-2 sticky top-0 bg-blue-50 z-[1000] rounded-xl">
				<div className="py-4"></div>
				<h6 className="uppercase">Currently Playing</h6>
				{currVideo ? (
					<div className="flex flex-col gap-2 py-2">
						<div>
							<p className="text-sm text-zinc-500">
								{currVideo?.video?.transition_id
									? "TRANSITION"
									: currVideo?.video?.playlist_id
										? "PLAYLIST"
										: "ASANA"}
							</p>
							<p className="text-sm">
								{currVideo?.video?.asana_name ||
									currVideo?.video?.transition_video_name ||
									currVideo?.video?.playlist_name}
							</p>
						</div>
						<div>
							<p className="text-sm text-zinc-500">
								CURRENT SECTION
							</p>
							<p className="h-8 text-sm">
								{currMarker ? (
									<p title={currMarker.name}>
										{currMarker.name.substring(0, 45)}...
									</p>
								) : (
									"---"
								)}
							</p>
						</div>
					</div>
				) : (
					<p className="text-center">---</p>
				)}
			</div>

			{/* <div className="flex flex-col gap-4 pb-4 max-h-72" ref={sectionsRef}> */}
			<h6 className="uppercase px-4 py-2">Sections</h6>
			<div
				className="flex flex-col gap-4 px-4 pb-4 max-h-44 overflow-x-auto"
				ref={sectionsRef}>
				{currVideo?.video?.sections?.map((s, idx) => {
					return (
						<div
							key={s.time}
							id={`section-${idx}`}
							className={`text-sm w-full border flex-shrink-0 flex flex-row items-center gap-2 p-2 hover:cursor-pointer hover:bg-blue-100 transition-colors ${currentMarkerIdx === idx ? "bg-blue-100" : ""}`}
							onClick={() => handleSeek(s, idx)}>
							<div
								className={`bg-blue-500 flex items-center justify-center text-white w-10 h-10 rounded-full ${
									idx ? "text-lg" : "text-base"
								}`}>
								{idx + 1}
							</div>
							<div className="flex flex-col gap-1">
								{/* <Tooltip title={s.name}>
									
								</Tooltip> */}
								<p className="font-medium text-sm">
									{s.name.substring(0, 45)}..
								</p>
								<p className="text-sm">
									{toTimeString(s.time)}
								</p>
							</div>
						</div>
					);
				}) ?? <p className="text-center">---</p>}
			</div>
			<div className="px-4 py-4">
				<button
					className="bg-blue-500 rounded-md px-3 py-2 text-white text-sm uppercase"
					onClick={clearQueue}>
					Clear Queue
				</button>
			</div>
		</div>
	);
}

export default memo(PlaylistSections);
