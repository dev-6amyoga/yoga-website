import { Button, Grid, Input, Modal, Table } from "@geist-ui/core";
import { Search } from "@geist-ui/icons";
import Papa from "papaparse";
import { useEffect, useState } from "react";
import { ROLE_ROOT } from "../../enums/roles";
import { withAuth } from "../../utils/withAuth";
import AdminPageWrapper from "../Common/AdminPageWrapper";

function AllLanguages() {
	const [delState, setDelState] = useState(false);
	const [delLanguageId, setDelLanguageId] = useState(0);
	const [searchTerm, setSearchTerm] = useState("");
	const [filteredTransitions, setFilteredTransitions] = useState([]);
	useEffect(() => {
		if (searchTerm.length > 0) {
			console.log(searchTerm);
			setFilteredTransitions(
				languages.filter((transition) =>
					transition.language
						.toLowerCase()
						.includes(searchTerm.toLowerCase())
				)
			);
		} else {
			setFilteredTransitions(languages);
		}
	}, [searchTerm]);
	const closeDelHandler = (event) => {
		setDelState(false);
	};
	const [languages, setLanguages] = useState([]);
	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch(
					"http://localhost:4000/content/language/getAllLanguages"
				);
				const data = await response.json();
				setLanguages(data);
				setFilteredTransitions(data);
			} catch (error) {
				console.log(error);
			}
		};
		fetchData();
	}, []);
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
	const deleteLanguage = async () => {
		try {
			const languageId = delLanguageId;
			const response = await fetch(
				`http://localhost:4000/content/video/deleteLanguage/${languageId}`,
				{
					method: "DELETE",
					headers: {
						"Content-Type": "application/json",
					},
				}
			);
			if (response.ok) {
				setLanguages((prev) =>
					prev.filter((lang) => lang.language_id !== languageId)
				);
			} else {
				console.log("Error deleting Language:", response.status);
			}
			setDelState(false);
		} catch (error) {
			console.log(error);
		}
	};

	const renderAction = (value, rowData, index) => {
		const handleDelete = async () => {
			try {
				const language_id = Number(rowData.language_id);
				setDelLanguageId(language_id);
				setDelState(true);
			} catch (error) {
				console.error(error);
			}
		};

		return (
			<Grid.Container gap={0.1}>
				<Grid>
					<Button
						type="error"
						auto
						scale={1 / 3}
						font="12px"
						onClick={handleDelete}>
						Remove
					</Button>
				</Grid>
			</Grid.Container>
		);
	};

	return (
		<AdminPageWrapper heading="Content Management - View All Languages">
			<div className="elements">
				<Button
					onClick={() => {
						handleDownload(languages);
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
				<Table data={filteredTransitions} className="bg-white ">
					<Table.Column prop="language_id" label="Language ID" />
					<Table.Column prop="language" label="Language" />
					<Table.Column
						prop="operation"
						label="ACTIONS"
						width={150}
						render={renderAction}
					/>
				</Table>
			</div>
			<div>
				<Modal visible={delState} onClose={closeDelHandler}>
					<Modal.Title>Delete Language</Modal.Title>
					<Modal.Content>
						<p>Do you really wish to delete this language?</p>
					</Modal.Content>
					<Modal.Action passive onClick={() => setDelState(false)}>
						No
					</Modal.Action>
					<Modal.Action onClick={deleteLanguage}>Yes</Modal.Action>
				</Modal>
			</div>
		</AdminPageWrapper>
	);
}

export default withAuth(AllLanguages, ROLE_ROOT);
