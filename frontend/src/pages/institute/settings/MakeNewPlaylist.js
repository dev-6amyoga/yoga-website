import {
	Button,
	Card,
	Divider,
	Grid,
	Input,
	Modal,
	Select,
	Table,
} from "@geist-ui/core";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useShallow } from "zustand/react/shallow";
import InstitutePageWrapper from "../../../components/Common/InstitutePageWrapper";
import { ROLE_INSTITUTE_OWNER } from "../../../enums/roles";
import useUserStore from "../../../store/UserStore";
import { Fetch } from "../../../utils/Fetch";
import { withAuth } from "../../../utils/withAuth";

function MakeNewPlaylist() {
	const [user, institutes, currentInstituteId] = useUserStore(
		useShallow((state) => [
			state.user,
			state.institutes,
			state.currentInstituteId,
		])
	);
	const navigate = useNavigate();
	const [teachers, setTeachers] = useState([]);
	const [selectedTeachers, setSelectedTeachers] = useState([]);
	const [currentInstitute, setCurrentInstitute] = useState(null);
	const user_id = user?.user_id;
	const [asanas, setAsanas] = useState([]);
	const [playlist_temp, setPlaylistTemp] = useState([]);
	const [modalState, setModalState] = useState(false);
	const [modalData, setModalData] = useState({
		rowData: {
			asana_name: "",
		},
		count: "",
		index: 0,
	});

	const handleSelectTeachers = (val) => {
		setSelectedTeachers(val);
	};

	useEffect(() => {
		if (selectedTeachers.includes("all-teachers")) {
			setSelectedTeachers(teachers.map((t) => t?.user.user_id));
		}
	}, [selectedTeachers]);

	useState(() => {
		if (currentInstituteId) {
			console.log(currentInstitute);
			setCurrentInstitute(
				institutes?.find(
					(institute) => institute.institute_id === currentInstituteId
				)
			);
		}
	}, [currentInstituteId, institutes]);

	useEffect(() => {
		const fetchData = async () => {
			if (currentInstituteId) {
				try {
					const response = await Fetch({
						url: "/uipr/get-teachers-in-institute",
						method: "POST",
						data: {
							institute_id: currentInstituteId,
						},
					});
					const data = response.data;
					setTeachers(data?.users ?? []);
				} catch (err) {
					toast(err);
				}
			}
		};
		fetchData();
	}, [user]);

	const handleInputChange = (e) => {
		const { id, value } = e.target;
		setModalData({ ...modalData, [id]: value });
	};

	const updateData = () => {
		const x = document.getElementById("asana_count_playlist").value;
		const entryToUpdate = playlist_temp[modalData.index];
		if (entryToUpdate) {
			entryToUpdate.count = x;
		}
		setModalState(false);
	};
	const handleSubmit = async (e) => {
		e.preventDefault();
		const playlist_name = document.querySelector("#playlist_name").value;
		const playlist_sequence = {};
		playlist_sequence["playlist_name"] = playlist_name;
		playlist_sequence["asana_ids"] = [];
		playlist_temp.map((item) => {
			const asana_id_playlist = item["rowData"]["id"];
			const asana_count = Number(item["count"]);
			for (let i = 0; i < asana_count; i++) {
				playlist_sequence["asana_ids"].push(Number(asana_id_playlist));
			}
		});
		const numberSelectedTeachers = selectedTeachers.map((id) => Number(id));
		const newRecord = {
			user_id: user_id,
			institute_id: currentInstituteId,
			playlist_name: playlist_sequence["playlist_name"],
			asana_ids: playlist_sequence["asana_ids"],
			applicable_teachers: numberSelectedTeachers,
		};
		// if (currentCount === maxCount) {
		//   toast("LIMIT REACHED!!");
		// } else {
		//   incrementPlaylistField("current_count");
		console.log(newRecord);
		try {
			const response = await Fetch({
				url: "/institute-playlist/add-playlist",
				method: "POST",

				data: newRecord,
			});
			if (response?.status === 200) {
				// setMaxStudId((prevMaxStudId) => prevMaxStudId + 1);
				toast("Playlist added successfully");
				navigate("/institute/playlist-page");
			} else {
				console.error("Failed to add playlist");
			}
		} catch (error) {
			console.error("Error during playlist addition:", error);
		}
		// }
	};

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await Fetch({
					url: "/content/video/getAllAsanas",
				});
				const data = response.data;
				setAsanas(data);
			} catch (error) {
				toast(error);
			}
		};
		fetchData();
	}, []);
	const addToPlaylist = (rowData, inputId, index) => {
		const countInput = document.getElementById(inputId);
		const countValue = countInput ? countInput.value : "";
		const count = countValue === "" ? 1 : parseInt(countValue, 10);
		if (!isNaN(count)) {
			setPlaylistTemp((prevPlaylist) => [
				...prevPlaylist,
				{
					rowData: rowData,
					count: count,
				},
			]);
		} else {
			toast("Invalid count entered. Please enter a valid number.");
		}
	};
	const renderAction2 = (value, rowData, index) => {
		const inputId = `asana_count_${rowData.id}`;
		return (
			<div>
				<Input
					width="50%"
					id={inputId}
					placeholder="1"
					// type="number"
					min="1"
					pattern="\d+"
				/>
				<Button
					type="warning"
					auto
					scale={1 / 3}
					font="12px"
					onClick={() => addToPlaylist(rowData, inputId, index)}>
					Add
				</Button>
			</div>
		);
	};
	const renderAction = (value, rowData, index) => {
		const handleDelete = () => {
			setPlaylistTemp((prevPlaylist) =>
				prevPlaylist.filter((entry) => entry !== rowData)
			);
		};
		const handleUpdate = async () => {
			const updatedRowData = { ...rowData, index: index };
			setModalData(updatedRowData);
			setModalState(true);
		};

		return (
			<Grid.Container gap={0.1}>
				<Grid>
					<Button
						type="error"
						auto
						scale={1 / 5}
						font="12px"
						onClick={handleDelete}>
						Remove
					</Button>
				</Grid>
				<Grid>
					<Button
						type="warning"
						auto
						scale={1 / 5}
						font="12px"
						onClick={() => handleUpdate(Number(rowData.id))}>
						Update
					</Button>
				</Grid>
			</Grid.Container>
		);
	};
	return (
		<InstitutePageWrapper heading="Make Playlist">
			<div className="max-w-7xl mx-auto">
				<Card>
					<Table width={60} data={asanas} className="bg-white ">
						<Table.Column prop="asana_name" label="Asana Name" />
						<Table.Column prop="asana_category" label="Category" />
						<Table.Column
							prop="in_playlist"
							label="Add To Playlist"
							width={150}
							render={(value, rowData, index) =>
								renderAction2(value, rowData, index)
							}
						/>
					</Table>
				</Card>
				{playlist_temp.length > 0 && (
					<Card>
						<Table
							width={40}
							data={playlist_temp}
							className="bg-dark ">
							<Table.Column
								prop="rowData.asana_name"
								label="Asana Name"
								render={(_, rowData) => {
									return <p>{rowData.rowData.asana_name}</p>;
								}}
							/>
							<Table.Column
								prop="rowData.asana_category"
								label="Category"
								render={(_, rowData) => {
									return (
										<p>{rowData.rowData.asana_category}</p>
									);
								}}
							/>
							<Table.Column
								prop="rowData.language"
								label="Language"
								render={(_, rowData) => {
									return <p>{rowData.rowData.language}</p>;
								}}
							/>
							<Table.Column prop="count" label="Count" />
							<Table.Column
								prop="operation"
								label="ACTIONS"
								width={150}
								render={renderAction}
							/>
						</Table>
						<Divider />
						<form
							className="flex-col items-center justify-center space-y-10 my-10"
							onSubmit={handleSubmit}>
							<h4>Playlist Details</h4>
							<Input width="100%" id="playlist_name">
								Playlist Name
							</Input>
							{/* <Text>Choose Teachers</Text> */}
							<Select
								multiple
								placeholder="Choose Teachers"
								onChange={handleSelectTeachers}>
								<Select.Option
									key="all-teachers"
									value="all-teachers">
									All Teachers
								</Select.Option>
								{teachers?.map((t) => (
									<Select.Option
										key={"teacher" + t?.user.user_id}
										value={String(t?.user.user_id)}>
										{t?.user.name} [id: {t?.user.user_id}]
									</Select.Option>
								))}
							</Select>
							<br />

							<Button htmlType="submit">Submit</Button>
						</form>
					</Card>
				)}
				<div>
					<Modal
						visible={modalState}
						onClose={() => setModalState(false)}>
						<Modal.Title>Update</Modal.Title>
						<Modal.Subtitle>
							{modalData.rowData.asana_name}
						</Modal.Subtitle>
						<Modal.Subtitle>{modalData.index}</Modal.Subtitle>
						<Modal.Content>
							<form>
								<Input
									width="100%"
									id="asana_count_playlist"
									placeholder={modalData.count}
									onChange={handleInputChange}>
									Count
								</Input>
							</form>
						</Modal.Content>
						<Modal.Action
							passive
							onClick={() => setModalState(false)}>
							Cancel
						</Modal.Action>
						<Modal.Action onClick={updateData}>Update</Modal.Action>
					</Modal>
				</div>
			</div>
		</InstitutePageWrapper>
	);
}

export default withAuth(MakeNewPlaylist, ROLE_INSTITUTE_OWNER);
