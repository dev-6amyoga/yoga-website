// import { useEffect, useState } from "react";
import { Button, TextField } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { UserAPI } from "../../../api/user.api";
import {
	validateEmail,
	validatePassword,
	validatePhone,
} from "../../../utils/formValidation";
import getFormData from "../../../utils/getFormData";

export default function GeneralInformationForm({
	generalInfo,
	setGeneralInfo,
	googleInfo,
	setBlockStep,
	setLoading,
	handleNextStep,
}) {
	const [username, setUsername] = useState(generalInfo?.username);
	const [usernameError, setUsernameError] = useState(null);

	const [password, setPassword] = useState(generalInfo?.password);
	const [confirmPassword, setConfirmPassword] = useState(
		generalInfo?.confirm_password
	);
	const [passwordError, setPasswordError] = useState(null);

	const [email, setEmail] = useState(generalInfo?.email_id);
	const [emailError, setEmailError] = useState(null);

	const [phone, setPhone] = useState(generalInfo?.phone_no);
	const [phoneError, setPhoneError] = useState(null);

	const [infoSaved, setInfoSaved] = useState(false);

	const handleGeneralInfoChange = useCallback(
		async (e) => {
			e.preventDefault();
			const formData = getFormData(e);
			console.log(formData);

			let [is_email_valid, email_error] = validateEmail(
				formData?.email_id
			);

			if (!is_email_valid) {
				toast(email_error.message, { type: "warning" });
				console.log(email_error);
				return;
			}

			let check_email;

			[check_email, email_error] = await UserAPI.postCheckEmail(
				formData?.email_id
			);

			if (check_email?.exists) {
				toast("Email already exists", { type: "warning" });
				return;
			}

			if (email_error) {
				toast(email_error.message, { type: "warning" });
				return;
			}

			// if (!googleInfo) {

			// }

			if (formData?.password !== formData?.confirm_password) {
				toast("Passwords do not match");
				// setPasswordError("Passwords do not match");
				return;
			}

			const [is_password_valid, pass_error] = validatePassword(
				formData?.password
			);

			if (!is_password_valid || pass_error) {
				toast(pass_error.message, { type: "warning" });
				setPasswordError(pass_error);
				return;
			}

			setPasswordError(null);

			setGeneralInfo(formData);
			setInfoSaved(true);
			toast("Progress saved!", { type: "success" });
			handleNextStep();
		},
		[generalInfo, googleInfo, handleNextStep, setGeneralInfo]
	);

	const inputErrorDebounce = useRef(null);

	useEffect(() => {
		setBlockStep(!infoSaved);
	}, [infoSaved, setBlockStep]);

	useEffect(() => {
		setInfoSaved(false);
	}, []);

	useEffect(() => {
		if (usernameError || passwordError || emailError || phoneError) {
			setBlockStep(true);
		}
	}, [usernameError, passwordError, emailError, phoneError, setBlockStep]);

	// check username
	useEffect(() => {
		if (inputErrorDebounce.current)
			clearTimeout(inputErrorDebounce.current);

		inputErrorDebounce.current = setTimeout(async () => {
			console.log("Checking username");
			setLoading(true);
			if (username) {
				const [check_username, error] =
					await UserAPI.postCheckUsername(username);

				if (error) {
					toast(error.message, { type: "warning" });
					return;
				}

				if (check_username?.exists) {
					setUsernameError("Username exists");
					setLoading(false);
					return;
				}

				setUsernameError(null);
			}
			setLoading(false);
		}, 500);

		return () => {
			if (inputErrorDebounce.current)
				clearTimeout(inputErrorDebounce.current);
		};
	}, [username]);

	// check password
	useEffect(() => {
		if (inputErrorDebounce.current)
			clearTimeout(inputErrorDebounce.current);

		inputErrorDebounce.current = setTimeout(() => {
			setLoading(true);
			if (password && confirmPassword && password !== confirmPassword) {
				// setPasswordError("Passwords do not match");
				setPasswordError(null);
				setLoading(false);
				return;
			} else {
				const [is_password_valid, pass_error] =
					validatePassword(password);

				console.log(
					password,
					confirmPassword,
					is_password_valid,
					pass_error
				);

				if (!is_password_valid || pass_error) {
					setPasswordError(pass_error);
					setLoading(false);
					return;
				}
			}

			setPasswordError(null);
		}, 500);
		return () => {
			if (inputErrorDebounce.current)
				clearTimeout(inputErrorDebounce.current);
		};
	}, [password, confirmPassword]);

	// check email
	useEffect(() => {
		if (inputErrorDebounce.current)
			clearTimeout(inputErrorDebounce.current);

		inputErrorDebounce.current = setTimeout(async () => {
			console.log("Checking email");
			setLoading(true);
			if (email) {
				const [check_email, error] =
					await UserAPI.postCheckEmail(email);

				if (error) {
					toast(error.message, { type: "warning" });
					return;
				}

				if (check_email?.exists) {
					setEmailError("Email exists");
					setLoading(false);
					return;
				}

				setEmailError(null);
			}
			setLoading(false);
		}, 500);

		return () => {
			if (inputErrorDebounce.current)
				clearTimeout(inputErrorDebounce.current);
		};
	}, [email]);

	// check phone number
	useEffect(() => {
		if (inputErrorDebounce.current)
			clearTimeout(inputErrorDebounce.current);

		inputErrorDebounce.current = setTimeout(async () => {
			console.log("Checking phone number");
			setLoading(true);
			if (phone) {
				const [check_phone, error] =
					await UserAPI.postCheckPhoneNumber(phone);

				if (error) {
					toast(error.message, { type: "warning" });
					return;
				}

				if (check_phone?.exists) {
					setPhoneError("Phone number exists");
					setLoading(false);
					return;
				}

				const [is_phone_valid, phone_error] = validatePhone(phone);

				if (!is_phone_valid || phone_error) {
					setPhoneError(phone_error);
					setLoading(false);
					return;
				}

				setPhoneError(null);
			}
			setLoading(false);
		}, 500);

		return () => {
			if (inputErrorDebounce.current)
				clearTimeout(inputErrorDebounce.current);
		};
	}, [phone]);

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
				onChange={(e) => {
					setEmail(e.target.value);
				}}
				required
				label="Email ID"
				error={emailError ? true : false}
				helperText={emailError ? emailError : " "}
			/>
			<TextField
				width="100%"
				name="phone_no"
				placeholder="XXXXXXXXXX"
				defaultValue={generalInfo?.phone_no}
				onChange={(e) => {
					setPhone(e.target.value);
				}}
				required
				label="Phone No"
				error={phoneError ? true : false}
				helperText={phoneError ? phoneError : " "}
			/>

			<>
				<TextField
					width="100%"
					name="username"
					placeholder="johnDoe123"
					defaultValue={generalInfo?.username}
					onChange={(e) => {
						setUsername(e.target.value);
					}}
					required
					label="Username"
					error={usernameError ? true : false}
					helperText={usernameError ? usernameError : " "}
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
					onChange={(e) => {
						setPassword(e.target.value);
					}}
					title="Password must be minimum 8 letters and contain atleast 1 number, 1 alphabet, 1 special character."
					required
					label="Password"
				/>
				<TextField
					type="password"
					width="100%"
					name="confirm_password"
					defaultValue={generalInfo?.confirm_password}
					onChange={(e) => {
						setConfirmPassword(e.target.value);
					}}
					title="Password must be minimum 8 letters and contain atleast 1 number, 1 alphabet, 1 special character."
					required
					label="Confirm Password"
					error={
						password &&
						confirmPassword &&
						password !== confirmPassword
					}
					helperText={
						password &&
						confirmPassword &&
						password !== confirmPassword
							? "Passwords do not match"
							: " "
					}
				/>
			</>
			{/* )} */}
			<Button variant="outlined" type="submit">
				Save Changes
			</Button>
		</form>
	);
}
