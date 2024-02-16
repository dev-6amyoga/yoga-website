import {
	Button,
	Description,
	Input,
	Modal,
	Select,
	Spacer,
	Text,
} from "@geist-ui/core";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useBlocker, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Fetch } from "../../utils/Fetch";
import VideoPlayer from "../StackVideo/VideoPlayer";

import { ArrowLeft, ArrowRight } from "@geist-ui/icons";
import usePlaylistStore from "../../store/PlaylistStore";
import useVideoStore from "../../store/VideoStore";
import useWatchHistoryStore from "../../store/WatchHistoryStore";
import getFormData from "../../utils/getFormData";
import AdminPageWrapper from "../Common/AdminPageWrapper";

const toTimeString = (seconds) => {
	const s = seconds > 0 ? seconds : 0;

	return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(
		Math.ceil(s) % 60
	).padStart(2, "0")}`;
};

function SaveChangesAlert({
	unloadBlock,
	handleUnloadToggle,
	blocker,
	updateData,
}) {
	return (
		<Modal visible={blocker.state === "blocked"}>
			<Modal.Title>Changes will be lost!</Modal.Title>
			<Modal.Content>
				Changes made will be lost if you proceed, are you sure?
			</Modal.Content>
			<Modal.Action
				onClick={() => {
					if (blocker?.reset) blocker.reset();
				}}>
				Cancel
			</Modal.Action>
			<Modal.Action
				onClick={() => {
					if (blocker?.proceed) blocker.proceed();
					if (unloadBlock) handleUnloadToggle();
				}}>
				Proceed
			</Modal.Action>
		</Modal>
	);
}

function MarkerCard({
	idx,
	marker,
	handleSave,
	handleDelete,
	moveToTimestamp,
	isActive,
}) {
	const [markerData, setMarkerData] = useState(marker);
	const [dirty, setDirty] = useState(false);

	const handleChange = (e) => {
		setMarkerData((m) => ({ ...m, [e.target.name]: e.target.value }));
	};

	const handleEdit = () => {
		if (!dirty) {
			setDirty(true);
		} else {
			handleSave(markerData, idx);
			setDirty(false);
		}
	};

	return (
		<div
			className={`rounded-lg p-4  flex flex-col justify-between shrink-0 ${
				isActive ? "border-2 border-amber-500" : "border"
			}`}>
			<div className="flex flex-col gap-2">
				{dirty ? (
					<Input
						initialValue={markerData.timestamp}
						name="timestamp"
						onChange={handleChange}>
						Marker Timestamp
					</Input>
				) : (
					<Button
						scale={0.6}
						auto
						mb={1}
						type="success"
						onClick={() => {
							moveToTimestamp(markerData.timestamp);
						}}>
						{`Marker : ${markerData?.timestamp}s | ${toTimeString(
							markerData?.timestamp || 0
						)}`}
					</Button>
				)}
				{dirty ? (
					<Input
						initialValue={markerData.title}
						name="title"
						onChange={handleChange}>
						Marker Title
					</Input>
				) : (
					<p className="max-w-[22ch] break-all break-words text-sm">
						{markerData.title}
					</p>
				)}
			</div>
			<div className="grid grid-cols-2 gap-2 pb-2">
				<Button
					scale={0.2}
					onClick={handleEdit}
					type={dirty ? "success" : "secondary"}>
					{dirty ? "Save" : "Edit"}
				</Button>
				<Button scale={0.2} onClick={() => handleDelete(idx)}>
					Delete
				</Button>
			</div>
		</div>
	);
}

function EditAsana() {
	const { asana_id } = useParams();
	const [modalData, setModalData] = useState({});
	const [tableLanguages, setTableLanguages] = useState([]);
	const [categories, setCategories] = useState([]);
	const [dirty, setDirty] = useState(false);

	const [customerCode, setCustomerCode] = useState("");
	const editAsanaFormRef = useRef(null);
	const addMarkerTimestampInputRef = useRef(null);

	const blocker = useBlocker(
		({ currentLocation, nextLocation }) =>
			dirty && currentLocation.pathname !== nextLocation.pathname
	);
	const [unloadBlock, setUnloadBlock] = useState(false);

	const [currentTime, addToSeekQueue] = useVideoStore((state) => [
		state.currentTime,
		state.addToSeekQueue,
	]);

	const [addToQueue, clearQueue] = usePlaylistStore((state) => [
		state.addToQueue,
		state.clearQueue,
	]);

	const [setEnableWatchHistory] = useWatchHistoryStore((state) => [
		state.setEnableWatchHistory,
	]);

	const [nextThumbnailTimestamp, setNextThumbnailTimestamp] = useState(0);

	const [loading, setLoading] = useState(false);

	/*
  id: Number,
	asana_name: String,

	asana_desc: String,
	asana_category: String,

	asana_thumbnailTs: type: Number
	asana_imageID: String,
	asana_videoID: String,
	asana_hls_url: String,
	asana_dash_url: String,

	asana_withAudio: String,
	asana_audioLag: Number,

	asana_type: String,

	duration: Number,
	asana_difficulty: [String],

	markers: type: [MarkerSchema],
	muted: String,
	language: String,
	nobreak_asana: Boolean,
	person_starting_position: String,
	person_ending_position: String,
	mat_starting_position: String,
	mat_ending_position: String,

	counter: String,
 */
	const [asana, setAsana] = useState({});

	/*
	{
		timestamp: Number,
		title: String,
	}
	*/
	const [markers, setMarkers] = useState([]);

	const handleThumbnailTimestampChange = useCallback(
		(e) => {
			setNextThumbnailTimestamp(currentTime.toFixed(2));
		},
		[currentTime]
	);

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
			url: `http://localhost:4000/content/video/updateAsana/${asana.id}`,
			method: "PUT",
			data: { ...modalData, markers: markers },
		})
			.then((res) => {
				console.log(res.data);
				setAsana(res.data);
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
	}, [asana, modalData, markers]);

	const resetChanges = useCallback(() => {
		setModalData(asana);
		if (editAsanaFormRef.current) {
			editAsanaFormRef.current.reset();
		}
		setDirty(false);
	}, [asana]);

	const handleInputChange = useCallback(
		(e) => {
			const { id, value } = e.target;
			setDirty(true);
			setModalData({ ...modalData, [id]: value });
		},
		[modalData]
	);

	const handleSelect = useCallback(
		(val, key) => {
			setDirty(true);
			setModalData({ ...modalData, [key]: val });
		},
		[modalData]
	);

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
			// validate
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

			setMarkers((p) => {
				// add marker in place
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

	// set customer code
	// disable watch history
	useEffect(() => {
		setCustomerCode(process.env.REACT_APP_CLOUDFLARE_CUSTOMER_CODE);
		setEnableWatchHistory(false);
	}, [setEnableWatchHistory]);

	// set current video
	useEffect(() => {
		clearQueue();
		// set current video
		if (asana?.id) {
			addToQueue([asana]);
		}
		return () => {
			clearQueue();
		};
	}, [asana, addToQueue]);

	// get asana by id
	useEffect(() => {
		// get asana by id
		if (asana_id) {
			setLoading(true);
			Fetch({
				url: "http://localhost:4000/content/get-asana-by-id",
				method: "POST",
				data: {
					asana_id: asana_id,
				},
			})
				.then((res) => {
					setAsana(res.data);
					setMarkers(res.data?.markers ?? []);
					setModalData(res.data);
					setLoading(false);
				})
				.catch((error) => {
					console.error(error);
					toast("Error fetching asana", { type: "error" });
					setLoading(false);
				});
		}
	}, [asana_id]);

	// get all languages
	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await Fetch({
					url: "http://localhost:4000/content/language/getAllLanguages",
				});
				setTableLanguages(response.data);
			} catch (error) {
				console.log(error);
			}
		};
		fetchData();
	}, []);

	// get all categories
	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await Fetch({
					url: "http://localhost:4000/content/asana/getAllAsanaCategories",
				});
				setCategories(response.data);
			} catch (error) {
				console.log(error);
			}
		};
		fetchData();
	}, []);

	return (
		<AdminPageWrapper heading="Edit Asana">
			{/* Alert for saving changes before unload / unmount */}
			<SaveChangesAlert
				unloadBlock={unloadBlock}
				handleUnloadToggle={handleUnloadToggle}
				blocker={blocker}
				updateData={updateData}
				dirty={dirty}
			/>

			<div className="rounded-lg border p-4">
				<form className="flex flex-row gap-4" ref={editAsanaFormRef}>
					<div className="flex-1 flex flex-col gap-3">
						<Description title="Asana Details" />
						<Text small type="secondary">
							<Text span>Asana ID: </Text>
							{asana.id}
						</Text>
						<Input
							width="100%"
							id="asana_name"
							placeholder={modalData.asana_name}
							onChange={handleInputChange}>
							Asana Name
						</Input>

						<Input
							width="100%"
							id="asana_desc"
							placeholder={modalData.asana_desc}
							onChange={handleInputChange}>
							Description
						</Input>

						<Input
							width="100%"
							id="asana_videoID"
							placeholder={modalData.asana_videoID}
							onChange={handleInputChange}>
							Video ID
						</Input>

						<Input
							width="100%"
							id="asana_hls_url"
							placeholder={modalData.asana_hls_url}
							onChange={handleInputChange}>
							HLS Url
						</Input>

						<Input
							width="100%"
							id="asana_dash_url"
							placeholder={modalData.asana_dash_url}
							onChange={handleInputChange}>
							DASH Url
						</Input>

						<div className="grid grid-cols-4">
							<div>
								<Text p>Language</Text>
								<Select
									onChange={(val) =>
										handleSelect(val, "language")
									}
									value={modalData.language}>
									{tableLanguages &&
										tableLanguages.map((language) => (
											<Select.Option
												key={language.language_id}
												value={language.language}>
												{language.language}
											</Select.Option>
										))}
								</Select>
							</div>

							<div>
								<Text p>Video Type</Text>
								<Select
									onChange={(val) =>
										handleSelect(val, "asana_type")
									}
									value={modalData.asana_type}>
									<Select.Option value="Single">
										Single
									</Select.Option>
									<Select.Option value="Combination">
										Combination
									</Select.Option>
								</Select>
							</div>

							<div>
								<Text p>Asana Difficulty</Text>
								<Select
									onChange={(val) =>
										handleSelect(val, "asana_difficulty")
									}
									value={modalData.asana_difficulty}>
									<Select.Option value="Beginner">
										Beginner
									</Select.Option>
									<Select.Option value="Intermediate">
										Intermediate
									</Select.Option>
									<Select.Option value="Advanced">
										Advanced
									</Select.Option>
								</Select>
							</div>

							<div>
								<Text p>Category</Text>
								<Select
									onChange={(val) =>
										handleSelect(val, "asana_category")
									}
									value={modalData.asana_category}>
									{categories &&
										categories.map((x) => (
											<Select.Option
												key={x.asana_category_id}
												value={x.asana_category}>
												{x.asana_category}
											</Select.Option>
										))}
								</Select>
							</div>
						</div>
					</div>
					<div className="flex flex-col gap-2">
						<Description title="Actions" />
						{dirty ? (
							<Button
								scale={0.8}
								type="secondary"
								onClick={(e) => {
									e.preventDefault();
									resetChanges();
								}}>
								Reset Changes
							</Button>
						) : (
							<></>
						)}
						<Button
							scale={0.8}
							type="warning"
							onClick={(e) => {
								e.preventDefault();
								if (dirty) {
									updateData();
								} else {
									setDirty(true);
								}
							}}
							loading={loading}>
							{dirty ? "Save Changes" : "Edit"}
						</Button>
						<Button
							scale={0.8}
							type="error"
							onClick={(e) => {
								e.preventDefault();
							}}>
							Delete
						</Button>
					</div>
				</form>
			</div>

			<Spacer h={4} />

			<div className="rounded-lg border p-4">
				<div className="flex flex-col gap-4">
					<Description title="Asana Markers" />

					{/* video player */}
					<div className="max-w-3xl mx-auto w-full">
						<div className="w-full">
							<VideoPlayer />
						</div>
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

					<div className="grid grid-cols-2 gap-4">
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

							<Spacer h={1 / 2} />

							<form onSubmit={handleAddMarker}>
								<div className="flex flex-row gap-2 items-end">
									<Input
										width="100%"
										initialValue={currentTime}
										name="timestamp"
										ref={addMarkerTimestampInputRef}>
										Marker Timestamp
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
								<Spacer h={1 / 2} />
								<Input width="100%" name="title">
									Marker Title
								</Input>

								<Spacer h={1 / 2} />

								<Button
									width="100%"
									type="success"
									htmlType="submit"
									scale={0.8}>
									Add Marker
								</Button>
							</form>
						</div>

						{/* set thumbnail form */}
						<div className="border rounded-lg p-4">
							<Description title="Set Thumbnail" />
							<Spacer y={2} />
							<div className="flex flex-col">
								<div className="flex flex-row gap-4 w-full justify-between">
									<div>
										<Description title="Current Thumbnail" />
										{customerCode && asana ? (
											<img
												className="max-w-[256px] rounded-lg"
												alt="Current Timestamp"
												src={`https://customer-${customerCode}.cloudflarestream.com/${
													asana?.asana_videoID ??
													asana?.transition_video_ID
												}/thumbnails/thumbnail.jpg?time=${
													modalData.asana_thumbnailTs
												}s?height=150?`}
											/>
										) : (
											<></>
										)}
										<Spacer y={1} />
										<Input
											value={modalData.asana_thumbnailTs}
											width="100%">
											Current Timestamp
										</Input>
									</div>
									<div>
										<Description title="New Thumbnail" />
										{customerCode ? (
											<img
												className="max-w-[256px] rounded-lg"
												src={`https://customer-${customerCode}.cloudflarestream.com/${
													asana?.asana_videoID ??
													asana?.transition_video_ID
												}/thumbnails/thumbnail.jpg?time=${nextThumbnailTimestamp}s?height=150?`}
												alt="New Timestamp"
											/>
										) : (
											<></>
										)}
										<Spacer y={1} />
										<Input
											value={nextThumbnailTimestamp}
											width="100%"
											disabled>
											New Timestamp
										</Input>
									</div>
								</div>
								<Spacer y={2} />
								<div className="grid grid-cols-2 gap-4">
									<Button
										scale={0.8}
										title="Preview Thumbnail at current timestamp"
										onClick={
											handleThumbnailTimestampChange
										}>
										Preview Thumbnail
									</Button>
									<Button
										scale={0.8}
										type="success"
										onClick={() =>
											handleSelect(
												currentTime?.toFixed(2) ?? 0,
												"asana_thumbnailTs"
											)
										}>
										Set Thumbnail
									</Button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<Spacer h={4} />
		</AdminPageWrapper>
	);
}

export default EditAsana;
