import { Modal, Spacer } from "@geist-ui/core";
import { Box, Divider, TextField, alpha } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useShallow } from "zustand/react/shallow";
import usePlaylistStore from "../../store/PlaylistStore";
import useUserStore from "../../store/UserStore";
import { Fetch } from "../../utils/Fetch";
import PlaylistList from "./PlaylistList";

function Playlist() {
	const [modalState, setModalState] = useState(false);
	const [asana_details, setAsanaDetails] = useState([]);
	const appendToAsanaDetails = (newItem) => {
		setAsanaDetails((prevAsanaDetails) => [...prevAsanaDetails, newItem]);
	};
	const [modalData, setModalData] = useState({
		playlist_id: 0,
		playlist_name: "",
		applicable_teachers: [],
		user_id: 0,
		institute_id: 0,
		asana_ids: [],
		playlist_mode: "",
	});
	const [isInstitute, setIsInstitute] = useState(false);
	const [isTeacher, setIsTeacher] = useState(false);
	const [isPersonal, setIsPersonal] = useState(false);
	const [institutePlaylists, setInstitutePlaylists] = useState([]);
	const [teacherPlaylists, setTeacherPlaylists] = useState([]);
	const [madeForTeacher, setMadeForTeacher] = useState([]);
	const [playlists, setPlaylists] = useState([]);
	const [userPlaylists, setUserPlaylists] = useState([]);
	const [loading, setLoading] = useState(true);
	const [user, institutes, currentInstituteId, currentRole] = useUserStore(
		useShallow((state) => [
			state.user,
			state.institutes,
			state.currentInstituteId,
			state.currentRole,
		])
	);
	const user_id = user?.user_id;
	const [currentInstitute, setCurrentInstitute] = useState(null);
	const [allAsanas, setAllAsanas] = useState([]);
	const [allTransitions, setAllTransitions] = useState([]);
	const [schedulePresent, setSchedulePresent] = useState(false);
	const [schedules, setSchedules] = useState([]);
	const [nextMonthSchedulePresent, setNextMonthSchedulePresent] =
		useState(false);
	const [nextMonthSchedules, setNextMonthSchedules] = useState([]);
	const queue = usePlaylistStore((state) => state.queue);
	const archive = usePlaylistStore((state) => state.archive);
	const addToQueue = usePlaylistStore((state) => state.addToQueue);
	const clearQueue = usePlaylistStore((state) => state.clearQueue);

	const [query, setQuery] = useState("");
	const searchTimeout = useRef(null);

	useEffect(() => {
		if (currentInstituteId) {
			Fetch({
				url: "/schedule/getSchedulesById",
				method: "POST",
				data: {
					user_id: user_id,
					user_type: "INSTITUTE",
					institute_id: currentInstituteId,
				},
			}).then((res) => {
				if (res.status === 200) {
					setSchedules(res.data);
					if (res.data.length > 0) {
						setSchedulePresent(true);
						Fetch({
							url: "/schedule/getNextMonthSchedulesById",
							method: "POST",
							data: {
								user_id: user_id,
								user_type: "INSTITUTE",
								institute_id: currentInstituteId,
							},
						}).then((res) => {
							if (res.status === 200) {
								// console.log(res.data, "IS RES!!");
								setNextMonthSchedules(res.data);
								if (res.data.length > 0) {
									setNextMonthSchedulePresent(true);
								}
							}
						});
					}
				}
			});

			//after fetching, check if user_id is a teacher, and if so, fetch their schedules
		}
		//user_id is a student, fetch their schedules
	}, [currentInstitute, user_id]);

	useState(() => {
		if (currentInstituteId) {
			setCurrentInstitute(
				institutes?.find(
					(institute) => institute.institute_id === currentInstituteId
				)
			);
		}
	}, [currentInstituteId, institutes]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await Fetch({
					url: "/content/video/getAllAsanas",
				});
				const data = response.data;
				setAllAsanas(data);
			} catch (error) {
				toast("Error fetching asanas");
			}
		};
		fetchData();
	}, []);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await Fetch({
					url: "/content/video/getAllTransitions",
				});
				const data = response.data;
				setAllTransitions(data);
			} catch (error) {
				toast(error);
			}
		};
		fetchData();
	}, []);

	useEffect(() => {
		const fetchData = async () => {
			setAsanaDetails([]);
			for (var i = 0; i < modalData.asana_ids.length; i++) {
				try {
					const response = await Fetch({
						url: "/content/get-asana-by-id",
						method: "POST",
						data: {
							asana_id: modalData.asana_ids[i],
						},
					});
					if (response?.status === 200) {
						const data = response.data;
						appendToAsanaDetails(data);
					}
				} catch (err) {
					console.log(err);
				}
			}
		};
		if (modalData.asana_ids.length > 0) {
			fetchData();
		}
	}, [modalData.asana_ids]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await Fetch({
					url: "/institute-playlist/get-playlists",
					method: "POST",
					data: {
						institute_id: currentInstituteId,
					},
				});
				if (response?.status === 200) {
					const data = response.data;
					setInstitutePlaylists(data);
				} else {
				}
			} catch (err) {
				console.log(err);
			}
		};
		if (isInstitute && currentInstituteId) {
			fetchData();
		}
	}, [isInstitute, currentInstituteId]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await Fetch({
					url: "/teacher-playlist/get-playlists",
					method: "POST",
					data: {
						user_id: user?.user_id,
						institute_id: currentInstituteId,
					},
				});
				if (response?.status === 200) {
					const data = response.data;
					setTeacherPlaylists(data);
					try {
						const response = await Fetch({
							url: "/institute-playlist/get-playlists",
							method: "POST",
							data: {
								institute_id: currentInstituteId,
							},
						});
						if (response?.status === 200) {
							const data = response.data;
							const filteredMadeForTeacher = data.filter(
								(item) => {
									const applicableTeachers = Array.isArray(
										item.applicable_teachers
									)
										? item.applicable_teachers
										: [];
									const userId = user && user.user_id;
									return (
										userId &&
										applicableTeachers.includes(
											Number(userId)
										)
									);
								}
							);
							if (madeForTeacher.length > 0) {
								setMadeForTeacher([]);
							}
							setMadeForTeacher((prev) => [
								...prev,
								...filteredMadeForTeacher,
							]);
						}
					} catch (err) {
						console.log(err);
					}
				} else {
					console.log("No playlists made!");
				}
			} catch (err) {
				console.log(err);
			}
		};
		if (isTeacher && currentInstituteId && user) {
			fetchData();
		}
	}, [isTeacher, currentInstituteId, user]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await Fetch({
					url: "/user-institute/get-role-by-user-institute-id",
					method: "POST",
					data: {
						user_id: user?.user_id,
						institute_id: currentInstituteId,
					},
				});
				const data = response.data;
				if (data?.user_institute?.length === 1) {
					if (data.user_institute[0].role.name === "TEACHER") {
						setIsTeacher(true);
						setIsPersonal(false);
					} else if (
						data.user_institute[0].role.name === "INSTITUTE_OWNER"
					) {
						setIsInstitute(true);
						setIsPersonal(false);
					}
				}
			} catch (error) {
				console.log(error);
			}
		};
		if (currentInstituteId && user) {
			fetchData();
		}
	}, [currentInstituteId, user]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await Fetch({
					url: "/content/playlists/getAllPlaylists",
				});
				const data = response.data;
				console.log(data, "IS A RESP YO");
				if (currentRole === "STUDENT") {
					const studentPlaylists = data.filter(
						(playlist) =>
							playlist.playlist_mode.toLowerCase() === "student"
					);

					setPlaylists(studentPlaylists);
				} else {
					setPlaylists(data);
				}
				setLoading(false);
			} catch (error) {
				setLoading(false);
				console.log(error);
			}
		};
		fetchData();
	}, [user_id, currentInstituteId]);

	const handleAddToQueue = (playlist) => {
		clearQueue();
		if (playlist?.playlist_dash_url) {
			console.log("Adding playlist to queue");
			addToQueue([playlist]);
		} else {
			// addToQueue()
			// console.log(playlist);
			let videos = [];

			playlist.asana_ids.forEach((asana_id) => {
				if (typeof asana_id === "number") {
					const asana = allAsanas.find(
						(asana) => asana.asana_id === asana_id
					);
					if (asana) {
						videos.push(asana);
					}
				} else {
					const transition = allTransitions.find(
						(transition) => transition.transition_id === asana_id
					);
					if (transition) {
						videos.push(transition);
					}
				}
			});

			addToQueue(videos);
		}
	};

	const showDetails = (x) => {
		setModalData(x);
		setModalState(true);
	};

	const closeModal = () => {
		setModalState(false);
	};

	const handleSearch = (e) => {
		if (searchTimeout.current) {
			clearTimeout(searchTimeout.current);
		}
		searchTimeout.current = setTimeout(() => {
			const q = String(e.target.value).toLowerCase();
			setQuery(q);
		}, 500);
	};

	return (
		// <div className="bg-blue-50 px-4 pb-4 mb-12 rounded-lg">
		<Box
			sx={(theme) => ({
				alignSelf: "center",
				height: { xs: 200, sm: "max-content" },
				width: "100%",
				backgroundSize: "cover",
				borderRadius: "10px",
				outline: "1px solid",
				outlineColor: alpha("#BFCCD9", 0.5),
				boxShadow: `0 0 12px 8px ${alpha("#9CCCFC", 0.2)}`,
				px: 4,
				pb: 4,
			})}>
			<Modal visible={modalState} onClose={closeModal} width="30%">
				<Modal.Title>
					{modalData.playlist_name || modalData.schedule_name}
				</Modal.Title>
				<Modal.Subtitle>
					<p>Playlist Type: {modalData.playlist_mode} Mode</p>
					<p>
						Playlist Duration:{" "}
						{(modalData.duration / 60).toFixed(2)} minutes
					</p>
				</Modal.Subtitle>
				{asana_details && asana_details.length > 0 ? (
					<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-2 max-h-96 overflow-auto py-10 px-4">
						{asana_details
							.reduce((acc, current) => {
								const lastIndex = acc.length - 1;
								if (
									lastIndex >= 0 &&
									acc[lastIndex].asana_name ===
										current.asana_name
								) {
									acc[lastIndex].count++;
								} else {
									acc.push({ ...current, count: 1 });
								}
								return acc;
							}, [])
							.map((asanaDetail) => (
								<div
									key={asanaDetail.asana_name}
									className="p-2 border border-y-green rounded-lg">
									<p>
										{asanaDetail.asana_name}
										{asanaDetail.language
											? ` - ${asanaDetail.language}`
											: ""}{" "}
										(x{asanaDetail.count})
									</p>
								</div>
							))}
					</div>
				) : (
					<p>No asanas found</p>
				)}

				<Modal.Action passive onClick={closeModal}>
					Close
				</Modal.Action>
			</Modal>

			<Spacer h={1} />
			<div
				className="sm:flex sm:justify-between gap-2 sm:w-full pb-4 sm:pb-0"
				id="playlist-section">
				<h3>Playlists & Schedules</h3>
				<Spacer h={1} />
				<TextField
					label="Search"
					size="small"
					fullWidth
					sx={{
						display: { xs: "none", sm: "block" },
						width: "30%",
					}}
					onChange={handleSearch}
				/>
				<TextField
					label="Search"
					size="small"
					fullWidth
					sx={{
						display: { xs: "block", sm: "none" },
					}}
					onChange={handleSearch}
				/>
			</div>
			<Spacer h={1} />

			<Divider />

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
				<PlaylistList
					name="Institute Playlists"
					desc="Choose from institutes' playlists to practice."
					playlists={institutePlaylists}
					query={query}
					handleAddToQueue={handleAddToQueue}
					showDetails={showDetails}
					show={isInstitute}
					isFuture={false}
				/>

				<PlaylistList
					name="Schedule Playlists"
					desc="Choose from your schedules to practice."
					playlists={schedules}
					query={query}
					handleAddToQueue={handleAddToQueue}
					showDetails={showDetails}
					show={schedulePresent}
					isFuture={false}
				/>

				<PlaylistList
					name="Next Month Schedule Playlists"
					desc="Choose from your schedules to practice."
					playlists={nextMonthSchedules}
					query={query}
					handleAddToQueue={handleAddToQueue}
					showDetails={showDetails}
					show={nextMonthSchedulePresent}
					isFuture={true}
				/>

				<PlaylistList
					name="Teacher's Playlists"
					desc="Choose from your playlists to practice."
					playlists={teacherPlaylists}
					query={query}
					handleAddToQueue={handleAddToQueue}
					showDetails={showDetails}
					show={isTeacher}
					isFuture={false}
				/>

				<PlaylistList
					name="Made for you"
					playlists={madeForTeacher}
					query={query}
					handleAddToQueue={handleAddToQueue}
					showDetails={showDetails}
					show={isTeacher}
					isFuture={false}
				/>

				<PlaylistList
					name="My Playlists"
					desc="Choose from your playlists to practice."
					playlists={userPlaylists}
					query={query}
					handleAddToQueue={handleAddToQueue}
					showDetails={showDetails}
					show={isPersonal}
					isFuture={false}
				/>

				<PlaylistList
					name={"6AM Yoga Curated Playlists"}
					desc={"Choose from curated playlists to practice."}
					playlists={playlists}
					query={query}
					handleAddToQueue={handleAddToQueue}
					showDetails={showDetails}
					show={true}
					isFuture={false}
				/>
			</div>
		</Box>
		// </div>
	);
}

export default Playlist;
