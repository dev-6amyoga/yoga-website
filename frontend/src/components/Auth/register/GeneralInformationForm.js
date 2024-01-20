// import { useEffect, useState } from "react";
import { Button, Input } from "@geist-ui/core";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Fetch } from "../../../utils/Fetch";
import getFormData from "../../../utils/getFormData";
import { validateEmail, validatePassword } from "../../../utils/formValidation";

export default function GeneralInformationForm({
	generalInfo,
	setGeneralInfo,
	googleInfo,
	setBlockStep,
	setLoading,
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

		// validate email
		const [is_email_valid, email_error] = validateEmail(formData?.email_id);

		if (!is_email_valid) {
			toast(email_error.message, { type: "warning" });
			console.log(email_error);
			return;
		}

		// validate passwords
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

	const handleUsernameCheck = () => {
		setLoading(true);
		if (username) {
			Fetch({
				url: "http://localhost:4000/user/check-username",
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

	return (
		<form
			className="flex flex-col gap-4 w-full"
			onSubmit={handleGeneralInfoChange}>
			<h4 className="text-center">General Information</h4>
			<Input
				width="100%"
				name="name"
				placeholder="John Doe"
				initialValue={generalInfo?.name}
				required>
				Name
			</Input>
			<Input
				width="100%"
				name="email_id"
				placeholder="abc@email.com"
				initialValue={generalInfo?.email_id}
				required>
				Email ID
			</Input>

			{googleInfo && googleInfo?.verified ? (
				<></>
			) : (
				<>
					{username && usernameError ? (
						<p className="text-sm border border-red-500 p-2 rounded-lg">
							Error : Username exists
						</p>
					) : (
						<></>
					)}
					<Input
						width="100%"
						name="username"
						placeholder="johnDoe123"
						initialValue={generalInfo?.username}
						onChange={(e) => setUsername(e.target.value)}
						onFocus={handleUsernameCheck}
						onMouseLeave={handleUsernameCheck}
						onKeyUp={handleUsernameCheck}
						required>
						Username
					</Input>
					<p
						className={`text-sm border p-2 rounded-lg text-zinc-500 ${
							passwordError ? "border-red-500" : ""
						}`}>
						Password must be minimum 8 letters and contain atleast 1
						number, 1 alphabet, 1 special character [!@#$%^&*,?]
					</p>
					<Input.Password
						width="100%"
						name="password"
						initialValue={generalInfo?.password}
						onChange={(e) => setPassword(e.target.value)}
						title="Password must be minimum 8 letters and contain atleast 1 number, 1 alphabet, 1 special character."
						required>
						Password
					</Input.Password>
					<Input.Password
						width="100%"
						name="confirm_password"
						initialValue={generalInfo?.confirm_password}
						onChange={(e) => setConfirmPassword(e.target.value)}
						title="Password must be minimum 8 letters and contain atleast 1 number, 1 alphabet, 1 special character."
						required>
						Confirm Password
					</Input.Password>
					{password &&
					confirmPassword &&
					password !== confirmPassword ? (
						<p className="text-sm border border-red-500 p-2 rounded-lg">
							Passwords dont match!
						</p>
					) : (
						<></>
					)}
				</>
			)}
			<Button htmlType="submit" type="success">
				Save Changes
			</Button>
		</form>
	);
}
