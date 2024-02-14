import { Button, Checkbox, Divider, Input, Select, Text } from "@geist-ui/core";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ROLE_ROOT } from "../../../enums/roles";
import getFormData from "../../../utils/getFormData";
import { withAuth } from "../../../utils/withAuth";
import AdminNavbar from "../../Common/AdminNavbar/AdminNavbar";
import "./RegisterVideoForm.css";

function RegisterVideoForm() {
	const navigate = useNavigate();
	const [data, setData] = useState([]);
	const [selectedLanguage, setSelectedLanguage] = useState("");
	const [asana_category, setAsanaCategory] = useState("");
	const [noBreakAsana, setNoBreakAsana] = useState(false);
	const [asana_type, setAsanaType] = useState("");
	const [asana_difficulty, setAsanaDifficulty] = useState(null);
	const [counter, setCounter] = useState(false);
	const [muted, setMuted] = useState(false);
	const [withAudio, setWithAudio] = useState(false);
	const [tableLanguages, setTableLanguages] = useState([]);
	const [categories, setCategories] = useState([]);
	const hello1 = (value) => {
		console.log(value);
		if (value.includes("true")) {
			setNoBreakAsana(true);
		}
	};
	const hello = (value) => {
		if (value.length === 0) {
			setWithAudio(false);
			setMuted(false);
			setCounter(false);
		}
		if (value.length !== 0) {
			if (value.includes("with_audio")) {
				setWithAudio(true);
			}
			if (value.includes("muted")) {
				setMuted(true);
			}
			if (value.includes("with_timer")) {
				setCounter(true);
			}
		}
	};
	const handleDifficulty = (val) => {
		setAsanaDifficulty(val);
	};

	const [personStart, setPersonStart] = useState(null);
	const [personEnd, setPersonEnd] = useState(null);
	const [matStart, setMatStart] = useState(null);
	const [matEnd, setMatEnd] = useState(null);
	const handlePersonStart = (val) => {
		setPersonStart(val);
	};
	const handlePersonEnd = (val) => {
		setPersonEnd(val);
	};
	const handleMatStart = (val) => {
		setMatStart(val);
	};
	const handleMatEnd = (val) => {
		setMatEnd(val);
	};
	const handleLanguageChange = (val) => {
		setSelectedLanguage(val);
	};
	const handler4 = (val) => {
		setAsanaCategory(val);
	};
	const handler_type = (val) => {
		setAsanaType(val);
	};

	useEffect(() => {
		fetch("http://localhost:4000/content/video/getAllAsanas")
			.then((response) => response.json())
			.then((asanas) => {
				setData(asanas);
			})
			.catch((error) => {
				console.error(error);
			});
	}, []);
	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch(
					"http://localhost:4000/content/language/getAllLanguages"
				);
				const data = await response.json();
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
				const response = await fetch(
					"http://localhost:4000/content/asana/getAllAsanaCategories"
				);
				const data = await response.json();
				setCategories(data);
			} catch (error) {
				console.log(error);
			}
		};
		fetchData();
	}, []);

	// const markerNavigate = () => {};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const asana_category1 = asana_category;
		const language = selectedLanguage;
		const formData = getFormData(e);
		const additionalData = {
			asana_category: asana_category1,
			language: language,
			asana_type: asana_type,
			asana_difficulty: asana_difficulty,
			counter: counter,
			nobreak_asana: noBreakAsana,
			muted: muted,
			asana_withAudio: withAudio,
			person_starting_position: personStart,
			person_ending_position: personEnd,
			mat_starting_position: matStart,
			mat_ending_position: matEnd,
		};
		const combinedData = {
			...formData,
			...additionalData,
		};
		if (
			combinedData.asana_name === "" ||
			combinedData.asana_type === "" ||
			combinedData.asana_videoID === "" ||
			combinedData.asana_category === "" ||
			combinedData.asana_difficulty === "" ||
			combinedData.person_starting_position === null ||
			combinedData.person_ending_position === null ||
			combinedData.mat_starting_position === null ||
			combinedData.mat_ending_position === null
		) {
			toast("Missing required fields!");
		} else if (
			withAudio === false &&
			muted === false &&
			counter === false
		) {
			toast("One or more of the audio options must be selected!");
		} else {
			let toastShown = false;
			for (var i = 0; i !== data.length; i++) {
				if (data[i].asana_name === combinedData.asana_name) {
					if (data[i].language === combinedData.language) {
						if (
							data[i].counter === combinedData.counter &&
							data[i].muted === combinedData.muted &&
							data[i].asana_withAudio ===
								combinedData.asana_withAudio
						) {
							toast(
								"Asana already exists with the same language!"
							);
							toastShown = true;
						}
					} else if (
						data[i].asana_videoID === combinedData.asana_videoID
					) {
						toast("Asana already exists with the same Video ID !");
						toastShown = true;
					}
				}
			}
			if (toastShown) {
			} else {
				toast("Adding new asana, kindly wait!");
				try {
					const response = await fetch(
						"http://localhost:4000/content/video/addAsana",
						{
							method: "POST",
							headers: {
								"Content-Type": "application/json",
							},
							body: JSON.stringify(combinedData),
						}
					);
					if (response.ok) {
						toast("New Asana added successfully");
						navigate("/admin/allAsanas");
					} else {
						console.log("Failed to add new Asana");
					}
				} catch (error) {
					toast("Error while making the request:", error);
				}
			}
		}
	};
	return (
		<div className="video_form min-h-screen">
			<AdminNavbar />
			<div className="flex items-center justify-center min-h-screen max-w-4xl mx-auto">
				<form
					className="flex flex-col gap-1 border-2 w-full p-4 rounded-md mx-auto bg-white"
					onSubmit={handleSubmit}>
					<Text h3>Register New Video</Text>
					<Input width="100%" name="asana_name">
						Asana Name
					</Input>
					<Input width="100%" name="asana_desc">
						Description
					</Input>
					<Text h6>Category</Text>
					<Select
						placeholder="Choose Category"
						onChange={handler4}
						name="asana_category">
						{categories &&
							categories.map((x) => (
								<Select.Option
									key={x.asana_category_id}
									value={x.asana_category}>
									{x.asana_category}
								</Select.Option>
							))}
					</Select>
					<Text h6>Type</Text>
					<Select
						value={asana_type}
						placeholder="Choose Asana Type"
						onChange={handler_type}
						name="asana_type">
						<Select.Option value="Single">Single</Select.Option>
						<Select.Option value="Combination">
							Combination
						</Select.Option>
					</Select>

					<Text h6>Asana Difficulty</Text>
					<Select
						multiple
						placeholder="Choose Difficulty"
						onChange={handleDifficulty}
						name="asana_difficulty">
						<Select.Option key="Beginner" value="Beginner">
							Beginner
						</Select.Option>
						<Select.Option key="Intermediate" value="Intermediate">
							Intermediate
						</Select.Option>
						<Select.Option key="Advanced" value="Advanced">
							Advanced
						</Select.Option>
					</Select>
					<Input width="100%" id="asana_videoID" name="asana_videoID">
						Cloudflare Video ID
					</Input>
					<Input width="100%" id="asana_hls_url" name="asana_hls_url">
						HLS URL
					</Input>
					<Input
						width="100%"
						id="asana_dash_url"
						name="asana_dash_url">
						DASH URL
					</Input>
					<Text>Language</Text>
					<Select
						placeholder="Choose Language"
						value={selectedLanguage}
						onChange={handleLanguageChange}
						id="asana_language"
						name="asana_language">
						{tableLanguages &&
							tableLanguages.map((language) => (
								<Select.Option
									key={language.language_id}
									value={language.language}>
									{language.language}
								</Select.Option>
							))}
					</Select>
					<br />
					<Text h5>Audio Settings </Text>
					<Checkbox.Group
						value={[]}
						onChange={hello}
						name="audio_settings">
						<Checkbox value="with_audio">With Audio?</Checkbox>
						<Checkbox value="muted">Muted?</Checkbox>
						<Checkbox value="with_timer">With Timer?</Checkbox>
					</Checkbox.Group>
					<Divider />
					<Text h5>No Break Asana</Text>
					<Checkbox.Group
						value={[]}
						onChange={hello1}
						name="nobreak_asana">
						<Checkbox value="true">No break asana?</Checkbox>
					</Checkbox.Group>

					<Text h5>Person Starting Position</Text>
					<Select
						placeholder="Choose Person Starting Position"
						onChange={handlePersonStart}>
						<Select.Option key="Front" value="Front">
							Front
						</Select.Option>
						<Select.Option key="Left" value="Left">
							Left
						</Select.Option>
						<Select.Option key="Right" value="Right">
							Right
						</Select.Option>
						<Select.Option key="Back" value="Back">
							Back
						</Select.Option>
						<Select.Option key="Diagonal" value="Diagonal">
							Diagonal
						</Select.Option>
					</Select>
					<br />

					<Text h5>Person Ending Position</Text>
					<Select
						placeholder="Choose Person Starting Position"
						onChange={handlePersonEnd}>
						<Select.Option key="Front" value="Front">
							Front
						</Select.Option>
						<Select.Option key="Left" value="Left">
							Left
						</Select.Option>
						<Select.Option key="Right" value="Right">
							Right
						</Select.Option>
						<Select.Option key="Back" value="Back">
							Back
						</Select.Option>
						<Select.Option key="Diagonal" value="Diagonal">
							Diagonal
						</Select.Option>
					</Select>
					<br />

					<Text h5>Mat Starting Position</Text>
					<Select
						placeholder="Choose Mat Starting Position"
						onChange={handleMatStart}>
						<Select.Option key="Front" value="Front">
							Front
						</Select.Option>
						<Select.Option key="Side" value="Side">
							Side
						</Select.Option>
						<Select.Option key="Diagonal" value="Diagonal">
							Diagonal
						</Select.Option>
					</Select>
					<br />

					<Text h5>Mat Ending Position</Text>
					<Select
						placeholder="Choose Mat Starting Position"
						onChange={handleMatEnd}>
						<Select.Option key="Front" value="Front">
							Front
						</Select.Option>
						<Select.Option key="Side" value="Side">
							Side
						</Select.Option>
						<Select.Option key="Diagonal" value="Diagonal">
							Diagonal
						</Select.Option>
					</Select>
					<br />

					{/* <Button onClick={markerNavigate}>Add Markers</Button> */}
					<Button htmlType="submit">Submit</Button>
				</form>
			</div>
		</div>
	);
}

export default withAuth(RegisterVideoForm, ROLE_ROOT);
