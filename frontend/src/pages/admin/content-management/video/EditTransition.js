import {
	Button,
	Checkbox,
	Description,
	Input,
	Spacer,
	Text,
} from "@geist-ui/core";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import VideoPlayer from "../../../../components/StackVideoShaka/VideoPlayer";
import { Fetch } from "../../../../utils/Fetch";

import { ArrowLeft, ArrowRight } from "@geist-ui/icons";
import AdminPageWrapper from "../../../../components/Common/AdminPageWrapper";
import MarkerCard from "../../../../components/content-management/video/edit/MarkerCard";
import usePlaylistStore from "../../../../store/PlaylistStore";
import useVideoStore from "../../../../store/VideoStore";
import useWatchHistoryStore from "../../../../store/WatchHistoryStore";
import getFormData from "../../../../utils/getFormData";
import { toTimeString } from "../../../../utils/toTimeString";

function EditTransition() {
	const { transition_id } = useParams();
	const [modalData, setModalData] = useState({});
	const [dirty, setDirty] = useState(false);
	const editAsanaFormRef = useRef(null);
	const addMarkerTimestampInputRef = useRef(null);

	const [unloadBlock, setUnloadBlock] = useState(false);

	const [currentTime, addToSeekQueue, setPlaylistState] = useVideoStore(
		(state) => [
			state.currentTime,
			state.addToSeekQueue,
			state.setPlaylistState,
		]
	);

	const [addToQueue, clearQueue] = usePlaylistStore((state) => [
		state.addToQueue,
		state.clearQueue,
	]);

	const [setEnableWatchHistory] = useWatchHistoryStore((state) => [
		state.setEnableWatchHistory,
	]);

	const [loading, setLoading] = useState(false);

	const [transition_video, setTransitionVideo] = useState({});

	const [markers, setMarkers] = useState([]);

	const moveToTimestamp = useCallback(
		(time) => {
			addToSeekQueue({
				type: "move",
				t: time,
			});
		},
		[addToSeekQueue]
	);

	const updateData = useCallback(async () => {
		setLoading(true);
		Fetch({
			url: `/content/video/updateTransition/${transition_video.transition_id}`,
			method: "PUT",
			data: { ...modalData, markers: markers },
		})
			.then((res) => {
				console.log(res.data);
				toast("Added successfully!!");
				setTransitionVideo(res.data);
				setMarkers(res.data?.markers ?? []);
				setModalData(res.data);
				setDirty(false);
				if (editAsanaFormRef.current) {
					editAsanaFormRef.current.reset();
				}
				setLoading(false);
			})
			.catch((error) => {
				toast(error, { type: "error" });
				setLoading(false);
			});
	}, [transition_video, modalData, markers]);

	const handleSaveMarker = useCallback((marker, prevIdx) => {
		setDirty(true);

		setMarkers((p) => {
			const ms = [...p];
			ms.splice(prevIdx, 1);
			// add marker in correct place
			const idx = ms.findIndex(
				(m) => parseFloat(m.timestamp) > parseFloat(marker.timestamp)
			);
			ms.splice(idx === -1 ? ms.length + 1 : idx, 0, marker);
			console.log("saving", prevIdx, idx, ms.timestamp);

			return ms;
		});
	}, []);

	const currentMarkers = useMemo(() => {
		let prevIdx = -1;
		let nextIdx = -1;

		for (let i = 0; i < markers.length - 1; i++) {
			if (
				parseFloat(markers[i]?.timestamp) <= currentTime &&
				parseFloat(markers[i + 1]?.timestamp) > currentTime
			) {
				prevIdx = i;
				nextIdx = i + 1;
				break;
			}
		}

		if (
			prevIdx === -1 &&
			parseFloat(markers[markers.length - 1]?.timestamp) < currentTime
		) {
			prevIdx = markers.length - 1;
		}

		if (nextIdx === -1 && parseFloat(markers[0]?.timestamp) > currentTime) {
			nextIdx = 0;
		}

		return [
			prevIdx === -1 ? null : markers[prevIdx],
			nextIdx === -1 ? null : markers[nextIdx],
			prevIdx,
			nextIdx,
		];
	}, [currentTime, markers]);

	const addMarker = useCallback(
		(m) => {
			setDirty(true);
			if (!m?.timestamp || !m?.title) {
				toast("Invalid marker", { type: "error" });
				return;
			}
			if (parseFloat(m.timestamp) < 0) {
				toast("Invalid timestamp", { type: "error" });
				return;
			}
			if (m.title.length < 3) {
				toast("Title too short", { type: "error" });
				return;
			}
			let idx = -1;
			let found = false;
			for (let i = 0; i < markers.length; i++) {
				if (markers[i].timestamp === m.timestamp) {
					found = true;
					break;
				}
				if (
					parseFloat(markers[i].timestamp) > parseFloat(m.timestamp)
				) {
					idx = i;
					break;
				}
			}

			if (found) {
				toast("Marker already exists", { type: "warning" });
				return;
			}

			m.loop = m.loop === "on" ? true : false;

			setMarkers((p) => {
				const ms = [...p];
				ms.splice(idx === -1 ? ms.length : idx, 0, m);
				return ms;
			});
		},
		[markers]
	);

	const handleAddMarker = useCallback(
		(e) => {
			e.preventDefault();

			const formData = getFormData(e);

			console.log(formData);
			addMarker(formData);
		},
		[addMarker]
	);

	const handleDeleteMarker = useCallback((idx) => {
		setDirty(true);

		setMarkers((p) => {
			const ms = [...p];
			ms.splice(idx, 1);
			return ms;
		});
	}, []);

	const handleMoveToMarker = useCallback(
		(marker) => {
			if (marker?.timestamp) {
				moveToTimestamp(parseFloat(marker.timestamp));
				toast(`Moved to : ${marker.title}`, { type: "info" });
			}
		},
		[moveToTimestamp]
	);

	const handleUnloadToggle = useCallback(
		(e) => {
			e.preventDefault();
			if (unloadBlock) {
				setUnloadBlock(false);
				return;
			}

			if (dirty) {
				setUnloadBlock(true);
			}
		},
		[dirty, unloadBlock]
	);

	useEffect(() => {
		window.addEventListener("beforeunload", handleUnloadToggle);

		return () => {
			window.removeEventListener("beforeunload", handleUnloadToggle);
		};
	}, [handleUnloadToggle]);

	// set current video
	useEffect(() => {
		clearQueue();
		if (transition_video?.transition_id) {
			addToQueue([transition_video]);
		}
		return () => {
			clearQueue();
		};
	}, [transition_video, addToQueue, clearQueue]);

	// get transition by id
	useEffect(() => {
		if (transition_id) {
			setLoading(true);
			Fetch({
				url: "/content/get-transition-by-id",
				method: "POST",
				data: {
					asana_id: transition_id,
				},
			})
				.then((res) => {
					setTransitionVideo(res.data);
					setMarkers(res.data?.markers ?? []);
					setModalData(res.data);
					setLoading(false);
				})
				.catch((error) => {
					console.error(error);
					toast("Error fetching transition video", { type: "error" });
					setLoading(false);
				});
		}
	}, [transition_id]);

	return (
		<AdminPageWrapper heading="Edit Transition Video">
			<Spacer h={4} />

			<div className="rounded-lg border p-4">
				<div className="flex flex-col gap-4">
					<Description title="Transition Video Markers" />

					{/* video player */}
					<div className="max-w-3xl mx-auto w-full">
						<div className="w-full">
							<VideoPlayer />
						</div>
						<Spacer y={4} />
						<Button
							w={"100%"}
							className="my-4 mx-auto"
							onClick={() => {
								clearQueue();
								addToQueue([transition_video]);
								setPlaylistState(false);
								setPlaylistState(true);
							}}>
							Reset Player
						</Button>
					</div>

					{/* markers list */}
					<div className="rounded-lg border p-4">
						<Description title="Markers" />
						<Spacer y={2} />
						<div className="flex flex-row gap-4 max-w-full overflow-x-auto pb-4">
							{markers.map((marker, idx) => {
								return (
									<MarkerCard
										key={String(marker?.timestamp)}
										marker={marker}
										handleDelete={handleDeleteMarker}
										handleSave={handleSaveMarker}
										idx={idx}
										moveToTimestamp={moveToTimestamp}
										isActive={currentMarkers[2] === idx}
									/>
								);
							})}
						</div>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
						{/* add marker form */}
						<div className="border rounded-lg p-4">
							<Description title="Add Marker" />

							<Text blockquote className="text-center">
								Current Time : {currentTime.toFixed(2)}s |{" "}
								{toTimeString(currentTime)}
							</Text>
							<div className="flex justify-between">
								<Button
									icon={<ArrowLeft />}
									scale={0.5}
									auto
									disabled={currentMarkers[0] ? false : true}
									title={currentMarkers[0]?.title}
									onClick={() =>
										handleMoveToMarker(currentMarkers[0])
									}>
									{currentMarkers[0] ? (
										<>
											Prev :{" "}
											{toTimeString(
												currentMarkers[0]?.timestamp
											)}{" "}
											:{" "}
											{currentMarkers[0]?.title.slice(
												0,
												10
											) + "..."}
										</>
									) : (
										<>Prev</>
									)}
								</Button>
								<Button
									iconRight={<ArrowRight />}
									scale={0.5}
									auto
									disabled={currentMarkers[1] ? false : true}
									title={currentMarkers[1]?.title}
									onClick={() =>
										handleMoveToMarker(currentMarkers[1])
									}>
									{currentMarkers[1] ? (
										<>
											Next :{" "}
											{toTimeString(
												currentMarkers[1]?.timestamp
											)}{" "}
											:{" "}
											{currentMarkers[1]?.title.slice(
												0,
												10
											) + "..."}
										</>
									) : (
										<>Next</>
									)}
								</Button>
							</div>

							<Spacer h={1} />

							<form onSubmit={handleAddMarker}>
								<div className="flex flex-row gap-2 items-end">
									<Input
										width="100%"
										initialValue={currentTime}
										name="timestamp"
										ref={addMarkerTimestampInputRef}>
										Marker Timestamp (in seconds)
									</Input>
									<Button
										scale={0.8}
										auto
										onClick={() => {
											if (
												addMarkerTimestampInputRef.current
											) {
												addMarkerTimestampInputRef.current.value =
													currentTime?.toFixed(2) ??
													0;
											}
										}}>
										Set Cur. Time
									</Button>
								</div>
								<Spacer h={1} />
								<Input width="100%" name="title">
									Marker Title
								</Input>
								<Spacer h={1} />
								<Checkbox name="loop">
									Loop (the marker will loop during "Teaching"
									View Mode)
								</Checkbox>

								<Spacer h={1} />

								<Button
									width="100%"
									type="success"
									htmlType="submit"
									scale={0.8}>
									Add Marker
								</Button>
							</form>
							<Button onClick={updateData}>Save Markers</Button>
						</div>
					</div>
				</div>
			</div>
			<Spacer h={4} />
		</AdminPageWrapper>
	);
}

export default EditTransition;
