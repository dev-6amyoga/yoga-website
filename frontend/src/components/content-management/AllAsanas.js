import { Button, Dot, Input, Modal, Select, Table, Text } from "@geist-ui/core";
import { Search } from "@geist-ui/icons";
import Papa from "papaparse";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ROLE_ROOT } from "../../enums/roles";
import { Fetch } from "../../utils/Fetch";
import { withAuth } from "../../utils/withAuth";
import AdminPageWrapper from "../Common/AdminPageWrapper";
import "./AllAsanas.css";

function AllAsanas() {
	const [asanas, setAsanas] = useState([]);
	const [deleteModal, setDeleteModal] = useState(false);
	const [delAsanaId, setDelAsanaId] = useState(0);
	const [loading, setLoading] = useState(true);
	const [sortedAsanas, setSortedAsanas] = useState([]);
	const [sortOrder, setSortOrder] = useState("asc");
	const [modalState, setModalState] = useState(false);
	const [tableLanguages, setTableLanguages] = useState([]);
	const [categories, setCategories] = useState([]);
	const [allPlaylists, setAllPlaylists] = useState([]);
	const [modalData, setModalData] = useState({
		asana_name: "",
		asana_desc: "",
		asana_videoID: "",
		language: "",
		asana_category: "",
		asana_type: "",
		asana_difficulty: "",
	});
	const navigate = useNavigate();

	const [searchTerm, setSearchTerm] = useState("");
	const [filteredTransitions, setFilteredTransitions] = useState([]);

	useEffect(() => {
		if (searchTerm.length > 0) {
			console.log(searchTerm);
			setFilteredTransitions(
				asanas.filter((transition) =>
					transition.asana_name
						.toLowerCase()
						.includes(searchTerm.toLowerCase())
				)
			);
		} else {
			setFilteredTransitions(asanas);
		}
	}, [searchTerm]);

	const handleDownload = (data1) => {
		const csv = Papa.unparse(data1);
		const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
		const link = document.createElement("a");
		if (link.download !== undefined) {
			const url = URL.createObjectURL(blob);
			link.setAttribute("href", url);
			link.setAttribute("download", "data.csv");
			link.style.visibility = "hidden";
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		}
	};

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await Fetch({
					url: "/content/playlists/getAllPlaylists",
				});
				const data = response.data;
				setAllPlaylists(data);
			} catch (error) {
				toast(error);
			}
		};
		fetchData();
	}, []);

	const [category_modal, setCategoryModal] = useState("");
	const [language_modal, setLanguageModal] = useState("");
	const [type_modal, setTypeModal] = useState("");

	const handler1 = (val) => {
		setModalData({ ...modalData, asana_category: val });
	};
	const handler2 = (val) => {
		setModalData({ ...modalData, language: val });
	};
	const handler3 = (val) => {
		setModalData({ ...modalData, asana_type: val });
	};
	const handler4 = (val) => {
		setModalData({ ...modalData, asana_difficulty: val });
	};

	const handleInputChange = (e) => {
		const { id, value } = e.target;
		setModalData({ ...modalData, [id]: value });
	};

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await Fetch({
					url: "/content/video/getAllAsanas",
				});
				const data = response.data;
				setAsanas(data);
				setFilteredTransitions(data);
				setLoading(false);
			} catch (error) {
				setLoading(false);
				toast("Error fetching asanas");
			}
		};
		fetchData();
	}, []);

	useEffect(() => {
		const sortedData = [...asanas].sort((a, b) => {
			if (sortOrder === "asc") {
				return a.asana_name.localeCompare(b.asana_category);
			} else {
				return b.asana_name.localeCompare(a.asana_category);
			}
		});
		setSortedAsanas(sortedData);
	}, [asanas, sortOrder]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await Fetch({
					url: "/content/language/getAllLanguages",
				});
				const data = response.data;
				setTableLanguages(data);
			} catch (error) {
				console.log(error);
			}
		};
		fetchData();
	}, []);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await Fetch({
					url: "/content/asana/getAllAsanaCategories",
				});
				const data = response.data;
				setCategories(data);
			} catch (error) {
				console.log(error);
			}
		};
		fetchData();
	}, []);
	const updateData = async () => {
		try {
			const asanaId = Number(modalData.id);
			const response = await Fetch({
				url: `/content/video/updateAsana/${asanaId}`,
				method: "PUT",
				data: modalData,
			});
			if (response?.status === 200) {
				setAsanas((prevAsanas) =>
					prevAsanas.map((asana) =>
						asana.id === asanaId ? modalData : asana
					)
				);
				setFilteredTransitions((prevAsanas) =>
					prevAsanas.map((asana) =>
						asana.id === asanaId ? modalData : asana
					)
				);
				setModalState(false);
			} else {
				toast("Error updating asana:", response.status);
			}
		} catch (error) {
			toast(error);
		}
	};

	const closeDelHandler = (event) => {
		setDeleteModal(false);
	};

	const deleteAsana = async () => {
		const asanaId = delAsanaId;
		for (var i = 0; i < allPlaylists.length; i++) {
			if (allPlaylists[i].asana_ids.includes(asanaId)) {
				console.log("Update this playlist!");
				allPlaylists[i].asana_ids = allPlaylists[i].asana_ids.filter(
					(id) => id !== asanaId
				);
				try {
					const response = await Fetch({
						url: `/content/playlists/updatePlaylist/${allPlaylists[i].playlist_id}`,
						method: "PUT",
						data: allPlaylists[i],
					});
					if (response?.status === 200) {
						console.log(response);
					} else {
						console.log("Error updating asana:", response.status);
					}
				} catch (error) {
					console.error(error);
				}
			}
		}
		try {
			const response = await Fetch({
				url: `/content/video/deleteAsana/${asanaId}`,
				method: "DELETE",
			});
			if (response?.status === 200) {
				toast("Deleted Successfully!");
				setDeleteModal(false);
				setAsanas((prevAsanas) =>
					prevAsanas.filter((asana) => asana.id !== asanaId)
				);
			} else {
				console.log("Error deleting asana:", response.status);
			}
		} catch (error) {
			console.error(error);
		}
	};

	const renderAction = (value, rowData, index) => {
		const handleDelete = async () => {
			setDeleteModal(true);
			setDelAsanaId(Number(rowData.id));
		};
		const handleUpdate = async () => {
			setModalData(rowData);
			setModalState(true);
		};

		return (
			<div className="flex flex-col gap-2">
				<Button type="error" auto scale={1 / 3} onClick={handleDelete}>
					Remove
				</Button>
				<Button
					type="warning"
					auto
					scale={1 / 3}
					onClick={() => handleUpdate(Number(rowData.id))}>
					Update
				</Button>
				<Button
					scale={1 / 3}
					onClick={() =>
						navigate(`/admin/video/edit/${rowData?.id}`)
					}>
					Edit
				</Button>
			</div>
		);
	};

	const renderBool = (value) => {
		if (String(value).toLowerCase() === "true") {
			return <Dot type="success" />;
		} else {
			return <Dot type="secondary" />;
		}
	};

	return (
		<AdminPageWrapper heading="Content Management - View All Videos">
			<div className="">
				<Button
					onClick={() => {
						handleDownload(asanas);
					}}>
					Download CSV
				</Button>
				<br />
				<Input
					icon={<Search />}
					scale={5 / 3}
					clearable
					type="warning"
					placeholder="Search"
					className="bg-white "
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
				/>
				{loading ? (
					<Text>Loading</Text>
				) : (
					<Table data={filteredTransitions} className="bg-white ">
						{/* <Table.Column prop="id" label="Asana ID" /> */}
						<Table.Column prop="asana_name" label="Asana Name" />
						<Table.Column prop="asana_desc" label="Description" />
						<Table.Column prop="asana_category" label="Category" />
						<Table.Column prop="language" label="Language" />
						<Table.Column prop="asana_type" label="Type" />
						{/* <Table.Column prop="asana_difficulty" label="Difficulty" /> */}
						<Table.Column
							prop="asana_difficulty"
							label="Difficulty"
							render={(data) => {
								if (data.includes("Beginner")) {
									if (data.includes("Intermediate")) {
										if (data.includes("Advanced")) {
											return "Beg, Int, Adv";
										} else {
											return "Beg, Int";
										}
									} else if (data.includes("Advanced")) {
										return "Beg, Adv";
									} else {
										return "Beg";
									}
								} else if (data.includes("Intermediate")) {
									if (data.includes("Advanced")) {
										return "Int, Adv";
									} else {
										return "Int";
									}
								} else {
									if (data.includes("Adnvanced")) {
										return "Adv";
									} else {
										return "";
									}
								}
							}}
						/>
						<Table.Column prop="asana_videoID" label="Video URL" />
						<Table.Column prop="duration" label="Duration" />
						<Table.Column
							prop="nobreak_asana"
							label="No Break Asana"
							render={renderBool}
						/>
						<Table.Column
							prop="asana_withAudio"
							label="With Audio?"
							render={renderBool}
						/>
						<Table.Column
							prop="muted"
							label="Muted?"
							render={renderBool}
						/>
						<Table.Column
							prop="counter"
							label="Counter?"
							render={renderBool}
						/>
						<Table.Column
							prop="operation"
							label="ACTIONS"
							width={150}
							render={renderAction}
						/>
					</Table>
				)}
			</div>

			<div>
				<Modal
					visible={modalState}
					onClose={() => setModalState(false)}>
					<Modal.Title>Update Asana</Modal.Title>
					<Modal.Subtitle>{modalData.asana_name}</Modal.Subtitle>
					<Modal.Content>
						<form>
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
							<Text h6>Language</Text>
							<Select
								onChange={handler2}
								id="language"
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

							<Text h6>Video Type</Text>
							<Select
								onChange={handler3}
								id="asana_type"
								value={modalData.asana_type}>
								<Select.Option value="Single">
									Single
								</Select.Option>
								<Select.Option value="Combination">
									Combination
								</Select.Option>
							</Select>

							<Text h6>Asana Difficulty</Text>
							<Select
								onChange={handler4}
								id="asana_difficulty"
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

							<Text h6>Category</Text>
							<Select
								onChange={handler1}
								id="asana_category"
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
						</form>
					</Modal.Content>
					<Modal.Action passive onClick={() => setModalState(false)}>
						Cancel
					</Modal.Action>
					<Modal.Action onClick={updateData}>Update</Modal.Action>
				</Modal>

				<Modal visible={deleteModal} onClose={closeDelHandler}>
					<Modal.Title>Delete Asana</Modal.Title>
					<Modal.Content>
						<p>Do you really wish to delete this asana?</p>
					</Modal.Content>
					<Modal.Action passive onClick={() => setDeleteModal(false)}>
						No
					</Modal.Action>
					<Modal.Action onClick={deleteAsana}>Yes</Modal.Action>
				</Modal>
			</div>
		</AdminPageWrapper>
	);
}

export default withAuth(AllAsanas, ROLE_ROOT);
