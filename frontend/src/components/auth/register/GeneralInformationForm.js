// import { useEffect, useState } from "react";
import { Button, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Fetch } from "../../../utils/Fetch";
import { validateEmail, validatePassword } from "../../../utils/formValidation";
import getFormData from "../../../utils/getFormData";

export default function GeneralInformationForm({
	generalInfo,
	setGeneralInfo,
	googleInfo,
	setBlockStep,
	setLoading,
	handleNextStep,
}) {
	const [username, setUsername] = useState("");

	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const [usernameError, setUsernameError] = useState(null);
	const [passwordError, setPasswordError] = useState(null);

	const [infoSaved, setInfoSaved] = useState(false);

	const handleGeneralInfoChange = (e) => {
		e.preventDefault();
		const formData = getFormData(e);
		console.log(formData);
		const [is_email_valid, email_error] = validateEmail(formData?.email_id);

		if (!is_email_valid) {
			toast(email_error.message, { type: "warning" });
			console.log(email_error);
			return;
		}

		if (!googleInfo) {
			if (formData?.password !== formData?.confirm_password) {
				toast("Passwords do not match");
				return;
			}

			const [is_password_valid, pass_error] = validatePassword(
				formData?.password
			);

			if (!is_password_valid) {
				toast(pass_error.message, { type: "warning" });
				setPasswordError(pass_error);
				return;
			}
		}

		setPasswordError(null);

		setGeneralInfo(formData);
		setInfoSaved(true);
		toast("Progress saved!", { type: "success" });
		handleNextStep();
	};

	useEffect(() => {
		setBlockStep(!infoSaved);
	}, [infoSaved, setBlockStep]);

	useEffect(() => {
		setInfoSaved(false);
	}, []);

	useEffect(() => {
		if (usernameError || passwordError) {
			setBlockStep(true);
		}
	}, [usernameError, passwordError, setBlockStep]);

	const handleUsernameCheck = (username) => {
		setLoading(true);
		if (username) {
			Fetch({
				url: "/user/check-username",
				method: "POST",
				data: {
					username: username,
				},
			})
				.then((res) => {
					const exists = res?.data?.exists;
					setUsernameError(exists);
				})
				.catch((err) => {
					console.log(err);
				});
		}
		setLoading(false);
	};

	useEffect(() => {
		console.log("GOOGLE INFO : ", googleInfo);
	}, [googleInfo]);

	return (
		<form
			className="flex flex-col gap-4 w-full"
			onSubmit={handleGeneralInfoChange}>
			<h6 className="text-center">General Information</h6>
			<TextField
				width="100%"
				name="name"
				placeholder="John Doe"
				defaultValue={generalInfo?.name}
				required
				label="Name"
			/>
			<TextField
				width="100%"
				name="email_id"
				placeholder="abc@email.com"
				defaultValue={generalInfo?.email_id}
				required
				label="Email ID"
			/>

			{/* {googleInfo && googleInfo?.verified ? (
        <></>
      ) : ( */}
			<>
				{username && usernameError ? (
					<p className="text-sm border border-red-500 p-2 rounded-lg">
						Error : Username exists
					</p>
				) : (
					<></>
				)}
				<TextField
					width="100%"
					name="username"
					placeholder="johnDoe123"
					defaultValue={generalInfo?.username}
					onChange={(e) => {
						setUsername(e.target.value);
						handleUsernameCheck(e.target.value);
					}}
					required
					label="Username"
				/>
				<p
					className={`text-sm border p-2 rounded-lg text-zinc-500 ${
						passwordError ? "border-red-500" : ""
					}`}>
					Password must be minimum 8 letters and contain atleast 1
					number, 1 alphabet, 1 special character [!@#$%^&*,?]
				</p>
				<TextField
					type="password"
					width="100%"
					name="password"
					defaultValue={generalInfo?.password}
					onChange={(e) => setPassword(e.target.value)}
					title="Password must be minimum 8 letters and contain atleast 1 number, 1 alphabet, 1 special character."
					required
					label="Password"
				/>
				<TextField
					type="password"
					width="100%"
					name="confirm_password"
					defaultValue={generalInfo?.confirm_password}
					onChange={(e) => setConfirmPassword(e.target.value)}
					title="Password must be minimum 8 letters and contain atleast 1 number, 1 alphabet, 1 special character."
					required
					label="Confirm Password"
				/>
				{password && confirmPassword && password !== confirmPassword ? (
					<p className="text-sm border border-red-500 p-2 rounded-lg">
						Passwords dont match!
					</p>
				) : (
					<></>
				)}
			</>
			{/* )} */}
			<Button variant="outlined" type="submit">
				Save Changes
			</Button>
		</form>
	);
}
