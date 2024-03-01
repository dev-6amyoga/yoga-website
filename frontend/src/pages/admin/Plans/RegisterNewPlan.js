import {
	Button,
	Card,
	Checkbox,
	Input,
	Select,
	Spacer,
	Text,
} from "@geist-ui/core";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AdminPageWrapper from "../../../components/Common/AdminPageWrapper";
import { ROLE_ROOT } from "../../../enums/roles";
import { Fetch } from "../../../utils/Fetch";
import { withAuth } from "../../../utils/withAuth";

function RegisterNewPlan() {
	const navigate = useNavigate();
	const [isChecked, setChecked] = useState(true);
	const notify = (x) => toast(x);

	const handleCheckboxChange = () => {
		setChecked(!isChecked);
		console.log(!isChecked);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const plan_name = document.querySelector("#plan_name").value;
		const playlist_6am = 1;
		const instituteplaylist_count = document.querySelector(
			"#institute_playlist_count"
		).value;
		const institute_playlist_creation = isChecked ? 1 : 0;
		const teacher_count = document.querySelector("#teacher_count").value;
		const new_plan = {
			name: plan_name,
			has_basic_playlist: playlist_6am,
			playlist_creation_limit: instituteplaylist_count,
			number_of_teachers: teacher_count,
			has_self_audio_upload: selfVoiceStatus,
			has_playlist_creation: institute_playlist_creation,
			plan_user_type: userType,
			plan_validity: 0,
		};

		try {
			const response = await Fetch({
				url: "/plan/register",
				method: "POST",
				body: new_plan,
			});
			if (response?.status === 200) {
				notify("New Plan added successfully");
				setTimeout(() => {
					navigate("/admin");
				}, 2000);
			} else {
				const errorData = response.data;
				notify(errorData.error);
			}
		} catch (error) {
			console.log(error);
		}
	};
	const [selfVoiceStatus, setSelfVoiceStatus] = useState(true);
	const handler = (value) => {
		setSelfVoiceStatus(value);
	};
	const [userType, setUserType] = useState("");
	const handler1 = (value) => {
		setUserType(value);
	};

	return (
		<AdminPageWrapper heading="Plan Management - Register New Plan">
			<Card>
				<Text h3>Register New Plan</Text>
				<hr />
				<Spacer h={1} />
				<form className="flex flex-col gap-1" onSubmit={handleSubmit}>
					<Text h5>Plan Name:</Text>
					<Input width="100%" id="plan_name"></Input>
					<br />
					<Checkbox
						id="institute_playlist_creation"
						checked={isChecked}
						onChange={handleCheckboxChange}>
						Allow Playlist Creation
					</Checkbox>

					<Text h5>Institute Playlist Count:</Text>
					<Input width="100%" id="institute_playlist_count"></Input>
					<br />
					<Text h5>Self Voice Enabled?</Text>
					<Select
						placeholder="Yes"
						onChange={handler}
						id="self_voice">
						<Select.Option value="Yes"> Yes </Select.Option>
						<Select.Option value="No"> No </Select.Option>
					</Select>

					<Text h5>Teacher Count:</Text>
					<Input width="100%" id="teacher_count"></Input>
					<br />
					<Text h5>User Type</Text>
					<Select
						placeholder="institute"
						onChange={handler1}
						id="user_type">
						<Select.Option value="student"> Student </Select.Option>
						<Select.Option value="institute">
							{" "}
							Institute{" "}
						</Select.Option>
					</Select>
					<Button htmlType="submit">Submit</Button>
				</form>
			</Card>
		</AdminPageWrapper>
	);
}

export default withAuth(RegisterNewPlan, ROLE_ROOT);
