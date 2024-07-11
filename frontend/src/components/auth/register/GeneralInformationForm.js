// import { useEffect, useState } from "react";
import {
	Button,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	TextField,
} from "@mui/material";
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

	const [phone, setPhone] = useState(generalInfo?.phone_no || "");
	const [phoneError, setPhoneError] = useState(null);

	const [infoSaved, setInfoSaved] = useState(false);

	const handleGeneralInfoChange = useCallback(
		async (e) => {
			e.preventDefault();
			const formData = getFormData(e);

			// VALIDATE NAME
			if (formData.name.length < 4) {
				toast("Name must be at least 4 characters", {
					type: "warning",
				});
				return;
			}

			// VALIDATE EMAIL
			let [is_email_valid, email_error] = validateEmail(
				formData?.email_id
			);

			if (!is_email_valid) {
				toast(email_error.message, { type: "warning" });
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

			// VALIDATE PASSWORD
			if (formData?.password !== formData?.confirm_password) {
				toast("Passwords do not match");
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

			// VALIDATE PHONE NUMBER

			const [is_phone_valid, phone_error] = await validatePhone(
				formData.phone_no
			);

			if (!is_phone_valid || phone_error) {
				toast(phone_error.message, { type: "warning" });
				return;
			}

			// VALIDATE USERNAME
			let [username, username_error] = await UserAPI.postCheckUsername(
				formData.username
			);

			if (username.exists) {
				toast("Username already exists", { type: "warning" });
				return;
			}

			if (username_error) {
				toast(username_error.message, { type: "warning" });
				return;
			}

			setPasswordError(null);
			setEmailError(null);
			setUsernameError(null);
			setPhoneError(null);

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

	// Check username
	useEffect(() => {
		if (inputErrorDebounce.current)
			clearTimeout(inputErrorDebounce.current);

		inputErrorDebounce.current = setTimeout(async () => {
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

	// Check password
	useEffect(() => {
		if (inputErrorDebounce.current)
			clearTimeout(inputErrorDebounce.current);

		inputErrorDebounce.current = setTimeout(() => {
			setLoading(true);
			if (password && confirmPassword && password !== confirmPassword) {
				setPasswordError(null);
				setLoading(false);
				return;
			} else {
				const [is_password_valid, pass_error] =
					validatePassword(password);
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

	// Check email
	useEffect(() => {
		if (inputErrorDebounce.current)
			clearTimeout(inputErrorDebounce.current);

		inputErrorDebounce.current = setTimeout(async () => {
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

	// Check phone number
	useEffect(() => {
		if (inputErrorDebounce.current)
			clearTimeout(inputErrorDebounce.current);

		inputErrorDebounce.current = setTimeout(async () => {
			setLoading(true);
			if (phone) {
				const [is_phone_valid, phone_error] =
					await validatePhone(phone);

				if (!is_phone_valid || phone_error) {
					setPhoneError(phone_error.message);
					setLoading(false);
					return;
				}

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

				setPhoneError(null);
			}
			setLoading(false);
		}, 500);

		return () => {
			if (inputErrorDebounce.current)
				clearTimeout(inputErrorDebounce.current);
		};
	}, [phone]);

	// const fetchCountryCodes = async () => {
	//   const response = await fetch("https://restcountries.com/v3.1/all");
	//   const data = await response.json();
	//   return data.reduce((acc, country) => {
	//     const countryCode =
	//       country.idd?.root +
	//       (country.idd?.suffixes ? country.idd.suffixes[0] : "");
	//     if (countryCode) {
	//       acc[country.name.common] = countryCode;
	//     }
	//     return acc;
	//   }, {});
	// };

	const fetchCountryCodes = async () => {
		const response = await fetch("https://restcountries.com/v3.1/all");
		const data = await response.json();
		const countryCodes = data.reduce((acc, country) => {
			const countryCode =
				country.idd?.root +
				(country.idd?.suffixes ? country.idd.suffixes[0] : "");
			if (countryCode) {
				acc[country.name.common] = countryCode;
			}
			return acc;
		}, {});

		const sortedCountryCodes = Object.keys(countryCodes)
			.sort()
			.reduce((acc, country) => {
				acc[country] = countryCodes[country];
				return acc;
			}, {});

		return sortedCountryCodes;
	};

	const [countryCodes, setCountryCodes] = useState({});
	const [country, setCountry] = useState("");

	useEffect(() => {
		const getCountryCodes = async () => {
			const codes = await fetchCountryCodes();
			setCountryCodes(codes);
		};
		getCountryCodes();
	}, []);

	const handleCountryChange = (event) => {
		const selectedCountry = event.target.value;
		setCountry(selectedCountry);
		const countryCode = countryCodes[selectedCountry];
		if (countryCode) {
			setPhone(countryCode);
		}
	};

	const handlePhoneChange = (event) => {
		const newPhone = event.target.value;
		const countryCode = countryCodes[country] || "";
		if (
			newPhone === countryCode &&
			event.nativeEvent.inputType === "deleteContentBackward"
		) {
			setPhone(countryCode);
			return;
		}
		if (newPhone.length < countryCode.length) {
			setPhone(countryCode);
		} else {
			setPhone(newPhone);
		}
	};

	const handleDisable = (e) => {
		e.preventDefault();
	};

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

			<FormControl fullWidth>
				<InputLabel id="country-label">Country</InputLabel>
				<Select
					labelId="country-label"
					value={country}
					onChange={handleCountryChange}
					required>
					{Object.keys(countryCodes).map((countryName) => (
						<MenuItem key={countryName} value={countryName}>
							{countryName}
						</MenuItem>
					))}
				</Select>
			</FormControl>

			<TextField
				width="100%"
				name="phone_no"
				placeholder="XXXXXXXXXX"
				value={phone}
				onChange={handlePhoneChange}
				required
				label="Phone No"
				error={phoneError ? true : false}
				helperText={phoneError ? phoneError : " "}
			/>

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
				className={`text-sm border p-2 rounded-lg text-zinc-500 ${passwordError ? "border-red-500" : ""}`}>
				Password must be minimum 8 letters and contain at least 1
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
				onCut={handleDisable}
				onCopy={handleDisable}
				onPaste={handleDisable}
				title="Password must be minimum 8 letters and contain at least 1 number, 1 alphabet, 1 special character."
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
				title="Password must be minimum 8 letters and contain at least 1 number, 1 alphabet, 1 special character."
				required
				label="Confirm Password"
				onCut={handleDisable}
				onCopy={handleDisable}
				onPaste={handleDisable}
				error={
					password && confirmPassword && password !== confirmPassword
				}
				helperText={
					password && confirmPassword && password !== confirmPassword
						? "Passwords do not match"
						: " "
				}
			/>
			<Button variant="outlined" type="submit">
				Save Changes
			</Button>
		</form>
	);
}
