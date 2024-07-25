import { Modal, Spacer } from "@geist-ui/core";
import { Box, Divider, TextField, alpha } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useShallow } from "zustand/react/shallow";
import usePlaylistStore from "../../store/PlaylistStore";
import useUserStore from "../../store/UserStore";
import { Fetch } from "../../utils/Fetch";
import PlaylistList from "./PlaylistList";

function Playlist({ page, onAddToQueue = () => {} }) {
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
	const [customPlaylists, setCustomPlaylists] = useState([]);
	const [userPlaylists, setUserPlaylists] = useState([]);
	const [user, userPlan, institutes, currentInstituteId, currentRole] =
		useUserStore(
			useShallow((state) => [
				state.user,
				state.userPlan,
				state.institutes,
				state.currentInstituteId,
				state.currentRole,
			])
		);
	const user_id = user?.user_id;
	const [currentInstitute, setCurrentInstitute] = useState(null);
	const [allAsanas, setAllAsanas] = useState([]);
	const [allTransitions, setAllTransitions] = useState([]);
	const addToQueue = usePlaylistStore((state) => state.addToQueue);
	const [query, setQuery] = useState("");
	const searchTimeout = useRef(null);

	useEffect(() => {
		const fetchCustomPlanDetails = async (planId) => {
			try {
				const res = await Fetch({
					url: `/customPlan/getCustomPlanById/${planId}`,
					token: true,
					method: "GET",
				});
				return res.status === 200 ? res.data : null;
			} catch (err) {
				console.log(err);
				return null;
			}
		};

		const fetchPlaylistById = async (playlistId) => {
			try {
				const res = await Fetch({
					url: `/content/playlists/getPlaylistById/${playlistId}`,
					method: "GET",
				});
				return res.status === 200 ? res.data : null;
			} catch (err) {
				console.error(err);
				return null;
			}
		};

		const fetchData = async () => {
			try {
				const res = await Fetch({
					url: `/customUserPlan/getCustomUserPlansByUser/${user.user_id}`,
					token: true,
					method: "GET",
				});

				if (res.status !== 200) return;

				const today = new Date();
				const validPlans = res.data.plans
					?.filter((plan) => new Date(plan.validity_to) > today)
					.sort(
						(a, b) =>
							new Date(b.created.$date) -
							new Date(a.created.$date)
					);
				setCurrentCustomUserPlans(validPlans);
				const playlistsData = await Promise.all(
					validPlans.map((plan) =>
						fetchCustomPlanDetails(plan.custom_plan_id)
					)
				);
				let activePlaylists = [];
				playlistsData.flat().forEach((plan) => {
					const matchingUserPlan = validPlans.find(
						(userPlan) => userPlan.custom_plan_id === plan._id
					);
					if (!matchingUserPlan) return;
					const daysSinceStart =
						Math.floor(
							(today - new Date(matchingUserPlan.validity_from)) /
								(1000 * 60 * 60 * 24)
						) + 1;
					plan.playlists.forEach((playlist) => {
						const [activeFrom, activeTo] =
							Object.values(playlist)[0];
						if (
							daysSinceStart >= activeFrom &&
							daysSinceStart <= activeTo
						) {
							activePlaylists.push(
								Number(Object.keys(playlist)[0])
							);
						}
					});
				});
				const uniqueActivePlaylists = [...new Set(activePlaylists)];
				const playlistDetails = await Promise.all(
					uniqueActivePlaylists.map(fetchPlaylistById)
				);
				setCustomPlaylists(playlistDetails.filter(Boolean));
			} catch (err) {
				console.log(err);
			}
		};
		if (user) {
			fetchData();
		}
	}, [user]);

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
				console.log(error);
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
				if (currentRole === "STUDENT") {
					const studentPlaylists = data.filter(
						(playlist) =>
							playlist.playlist_mode.toLowerCase() === "student"
					);
					setPlaylists(studentPlaylists);
				} else {
					setPlaylists(data);
				}
			} catch (error) {
				console.log(error);
			}
		};
		if (userPlan || page === "testing") {
			fetchData();
		} else {
			setPlaylists([]);
		}
	}, [user_id, currentInstituteId, page, userPlan]);

	const handleAddToQueue = (playlist, playlist_type) => {
		if (playlist?.playlist_dash_url) {
			addToQueue([playlist]);
			// console.log(playlist);
			onAddToQueue(playlist);
		} else {
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
				<h3>Playlists</h3>
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

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

				<PlaylistList
					name={"Custom Playlists"}
					desc={"Choose from custom playlists to practice."}
					playlists={customPlaylists}
					query={query}
					handleAddToQueue={handleAddToQueue}
					showDetails={showDetails}
					show={true}
					isFuture={false}
				/>
			</div>
		</Box>
	);
}

export default Playlist;
