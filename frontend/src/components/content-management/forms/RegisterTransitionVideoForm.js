import { Button, Checkbox, Divider, Input, Select, Text } from "@geist-ui/core";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ROLE_ROOT } from "../../../enums/roles";
import getFormData from "../../../utils/getFormData";
import { withAuth } from "../../../utils/withAuth";
import AdminPageWrapper from "../../Common/AdminPageWrapper";

function RegisterTransitionVideoForm() {
	const navigate = useNavigate();
	const [selectedLanguage, setSelectedLanguage] = useState("");
	const [categories, setCategories] = useState([]);
	const [tableLanguages, setTableLanguages] = useState([]);
	const handleLanguageChange = (val) => {
		setSelectedLanguage(val);
	};
	const [data, setData] = useState([]);
	const [personStart, setPersonStart] = useState(null);
	const [personEnd, setPersonEnd] = useState(null);
	const [matStart, setMatStart] = useState(null);
	const [matEnd, setMatEnd] = useState(null);
	const [catStart, setCatStart] = useState(null);
	const [catEnd, setCatEnd] = useState(null);
	const [aiTransition, setAiTransition] = useState(false);
	const [nonAiTransition, setNonAiTransition] = useState(false);
	const [goingToRelax, setGoingToRelax] = useState(false);
	const [comingFromRelax, setComingFromRelax] = useState(false);

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
	const handlerCatStart = (val) => {
		setCatStart(val);
	};
	const handlerCatEnd = (val) => {
		setCatEnd(val);
	};

	useEffect(() => {
		fetch("http://localhost:4000/content/video/getAllTransitions")
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

	const handleSubmit = async (e) => {
		e.preventDefault();
		const formData = getFormData(e);
		const additionalData = {
			asana_category_start: catStart,
			asana_category_end: catEnd,
			language: selectedLanguage,
			person_starting_position: personStart,
			person_ending_position: personEnd,
			mat_starting_position: matStart,
			mat_ending_position: matEnd,
			going_to_relax: goingToRelax,
			coming_from_relax: comingFromRelax,
			ai_transition : aiTransition,
			non_ai_transition : nonAiTransition
		};
		const combinedData = {
			...formData,
			...additionalData,
		};
		if (
			combinedData.transition_video_name === "" ||
			combinedData.transition_video_ID === "" ||
			combinedData.language === ""
		) {
			toast("Misssing required fields!");
		} else {
			let toastShown = false;
			for (var i = 0; i !== data.length; i++) {
				if (
					data[i].transition_video_name ===
					combinedData.transition_video_name
				) {
					toast("Transition already exists with the same name!");
					toastShown = true;}
				// } else if (
				// 	data[i].transition_video_ID ===
				// 	combinedData.transition_video_ID
				// ) {
				// 	toast("Transition already exists with the same Video ID !");
				// 	toastShown = true;
				// }
			}
			if (toastShown) {
				console.log("wait");
			} else {
				toast("Adding new transition, kindly wait!");
				try {
					const response = await fetch(
						"http://localhost:4000/content/video/addTransition",
						{
							method: "POST",
							headers: {
								"Content-Type": "application/json",
							},
							body: JSON.stringify(combinedData),
						}
					);
					if (response.ok) {
						toast("New Transition added successfully");
						navigate("/admin/video/transition/all");
					} else {
						console.log("Failed to add new transition");
					}
				} catch (error) {
					console.log("Error while making the request:", error);
				}
			}
		}
		// /video/addTransition
	};

	const hello = (value) => {
		if (value.length === 0) {
			setGoingToRelax(false);
			setComingFromRelax(false);
		}
		if (value.length !== 0) {
			if (value.includes("going_to_relax")) {
				if (value.includes("coming_from_relax")) {
					toast("You cannot select both checkboxes!");
				} else {
					setGoingToRelax(true);
				}
			}
			if (value.includes("coming_from_relax")) {
				if (value.includes("going_to_relax")) {
					toast("You cannot select both checkboxes!");
				} else {
					setComingFromRelax(true);
				}
			}
		}
	};

	const aiSetter = (value) => {
		if (value.length === 0) {
			setAiTransition(false);
			setNonAiTransition(false);
		}
		if (value.length !== 0) {
			if (value.includes("ai_transition")) {
				if (value.length >1 ) {
					toast("You cannot select more than 1 checkbox!");
				} else {
					setAiTransition(true);
					setNonAiTransition(false);
				}
			}
			if (value.includes("non_ai_transition")) {
				if (value.length >1 ) {
					toast("You cannot select more than 1 checkbox!");
				} else {
					setNonAiTransition(true);
					setAiTransition(false);
				}
			}
			if(value.includes("both")){
				if (value.includes("ai_transition") || value.includes("non_ai_transition")) {
					toast("You cannot select more than 1 checkbox!");
				}
				else{
					setAiTransition(true);
					setNonAiTransition(true);

				}
			}
		}
	};

	return (
		<AdminPageWrapper heading="Register Transition Video">
			<div className="flex items-center justify-center min-h-screen max-w-7xl mx-auto">
				<form
					className="flex flex-col gap-1 border-2 w-full p-4 rounded-md mx-auto bg-white"
					onSubmit={handleSubmit}>
					<Text h6>Transition Video Name</Text>
					<Input width="100%" name="transition_video_name">
					</Input>
					<Text h6>Category From </Text>
					<Select
						placeholder="Choose Category From"
						onChange={handlerCatStart}>
						{categories &&
							categories.map((x) => (
								<Select.Option
									key={x.asana_category_id}
									value={x.asana_category}>
									{x.asana_category}
								</Select.Option>
							))}
					</Select>
					<Text h6>Category To </Text>
					<Select
						placeholder="Choose Category To"
						onChange={handlerCatEnd}>
						{categories &&
							categories.map((x) => (
								<Select.Option
									key={x.asana_category_id}
									value={x.asana_category}>
									{x.asana_category}
								</Select.Option>
							))}
					</Select>
					<Text h6>Cloudflare ID</Text>
					<Input width="100%" name="transition_video_ID"></Input>
					<Text h6>HLS URL</Text>
					<Input width="100%" name="transition_hls_url"></Input>
					<Text h6>DASH URL</Text>
					<Input width="100%" name="transition_dash_url"></Input>

					<Text h5>Going To/Coming From Relaxation</Text>
					<Checkbox.Group value={[]} onChange={hello} name="relax">
						<Checkbox value="going_to_relax">
							Going To Relax
						</Checkbox>
						<Checkbox value="coming_from_relax">
							Coming From Relax
						</Checkbox>
					</Checkbox.Group>

					<Checkbox.Group value={[]} onChange={aiSetter} name="ai">
						<Checkbox value="ai_transition">
							AI Mode Transition
						</Checkbox>
						<Checkbox value="non_ai_transition">
							Non AI Mode Transition
						</Checkbox>
						<Checkbox value="both">
							Both
						</Checkbox>
					</Checkbox.Group>
					<Divider />
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
		</AdminPageWrapper>
	);
}

export default withAuth(RegisterTransitionVideoForm, ROLE_ROOT);
