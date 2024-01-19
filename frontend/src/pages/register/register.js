// import { useEffect, useState } from "react";
import { Button, Input, Progress, Spacer } from "@geist-ui/core";
import { Briefcase, Lock, UserCheck } from "@geist-ui/icons";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight } from "react-feather";
import { SiGoogle } from "react-icons/si";
import { toast } from "react-toastify";
import { Fetch } from "../../utils/Fetch";
import { validateEmail, validatePassword } from "../../utils/formValidation";
import getFormData from "../../utils/getFormData";
import "./register.css";

import { AutoComplete } from "@geist-ui/core";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import { useCallback, useEffect } from "react";
import Otp from "../otp/Otp";

function PickRegistationMode({
	regMode,
	setRegMode,
	setGoogleInfo,
	setGeneralInfo,
	setLoading,
	clientID,
}) {
	const googleLogin = useGoogleLogin({
		onSuccess: async (credentialResponse) => {
			setLoading(true);
			const jwt_token = credentialResponse.credential
				? credentialResponse.credential
				: null;

			const baseURL = "http://localhost:4000";
			const payload = await Fetch({
				url: `${baseURL}/auth/verify-google`,
				data: {
					client_id: clientID,
					jwtToken: jwt_token,
				},
			});

			const email_verified = payload.data.email_verified;

			if (email_verified) {
				const email = payload.data.email;
				const name = payload.data.name;
				console.log(email, name);
				setGoogleInfo({
					jwt_token,
					verified: true,
					email_id: email,
					name,
				});
				setGeneralInfo({
					email_id: email,
					name: name,
				});
			} else {
				setGoogleInfo({
					verified: false,
				});
			}
		},
		onError: () => {
			toast("Login Failed", { type: "warning" });
		},
		onNonOAuthError: (err) => {
			toast("Google login failed! Try again", { type: "warning" });
		},
	});

	return (
		<form className="flex flex-col gap-4 w-full" onSubmit={() => {}}>
			<h4 className="text-center">Select Mode Of Registration</h4>

			<div className="flex gap-4 items-center justify-center">
				<div
					className={`flex items-center gap-2 flex-col p-8 border rounded-lg ${
						regMode === "GOOGLE" ? "border-blue-500" : ""
					}`}
					onClick={() => {
						setRegMode("GOOGLE");
						googleLogin();
					}}>
					<SiGoogle className="w-6 h-6" />
					Google
				</div>
				<div
					className={`flex items-center gap-2 flex-col p-8 border rounded-lg ${
						regMode === "NORMAL" ? "border-blue-500" : ""
					}`}
					onClick={() => setRegMode("NORMAL")}>
					<Lock className="w-6 h-6" />
					Normal
				</div>
			</div>
		</form>
	);
}

function GeneralInformationForm({
	generalInfo,
	setGeneralInfo,
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
				Password must be minimum 8 letters and contain atleast 1 number,
				1 alphabet, 1 special character [!@#$%^&*,?]
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
			{password && confirmPassword && password !== confirmPassword ? (
				<p className="text-sm border border-red-500 p-2 rounded-lg">
					Passwords dont match!
				</p>
			) : (
				<></>
			)}
			<Button htmlType="submit" type="success">
				Save Changes
			</Button>
		</form>
	);
}

function PhoneNumberForm({
	phoneInfo,
	setPhoneInfo,
	setBlockStep,
	setLoading,
}) {
	const handlePhoneChange = (value) => {
		setPhoneInfo({ phone_no: value, verified: true });
		setBlockStep(false);
	};

	useEffect(() => {
		if (!phoneInfo) {
			setBlockStep(true);
		} else if (phoneInfo && !phoneInfo.verified) {
			setBlockStep(true);
		}
	}, [phoneInfo, setBlockStep]);

	return (
		<div className="flex flex-col items-center w-full">
			<h4 className="text-center">Phone Number Verification</h4>
			<Otp
				setLoading={setLoading}
				onSuccessCallback={handlePhoneChange}
			/>
		</div>
	);
}

function RoleSelectorForm({ role, setRole }) {
	return (
		<form className="flex flex-col gap-4 w-full" onSubmit={() => {}}>
			<h4 className="text-center">Select Role</h4>

			<div className="flex gap-4 items-center justify-center">
				<div
					className={`flex items-center gap-2 flex-col p-8 border rounded-lg ${
						role === "STUDENT" ? "border-blue-500" : ""
					}`}
					onClick={() => setRole("STUDENT")}>
					<UserCheck />
					Student
				</div>
				<div
					className={`flex items-center gap-2 flex-col p-8 border rounded-lg ${
						role === "INSTITUTE_OWNER" ? "border-blue-500" : ""
					}`}
					onClick={() => setRole("INSTITUTE_OWNER")}>
					<Briefcase />
					Institute
				</div>
			</div>
		</form>
	);
}

function InstituteDetailsForm({
	handleSubmit,
	billingAddressSame,
	setBillingAddressSame,
}) {
	// TODO : Error with clearing the state and city when country/state is changed
	const [countries, setCountries] = useState([]);
	const [countriesSearch, setCountriesSearch] = useState([]);
	const [selectedCountry, setSelectedCountry] = useState(""); // {label: 'India', value: 'India'}

	const [states, setStates] = useState([]);
	const [statesSearch, setStatesSearch] = useState([]);
	const [selectedState, setSelectedState] = useState(""); // {label: 'Karnataka', value: 'Karnataka'}

	const [cities, setCities] = useState([]);
	const [citiesSearch, setCitiesSearch] = useState([]); // {label: 'Bengaluru', value: 'Bengaluru'}
	const [selectedCity, setSelectedCity] = useState("");

	const handleCountrySearch = useCallback(
		(value) => {
			if (value !== "") {
				setCountriesSearch(() =>
					countries
						.filter((country) =>
							country?.name
								?.toLowerCase()
								.includes(value?.toLowerCase())
						)
						?.map((c) => ({ label: c.name, value: c.name }))
				);
			} else {
				setCountriesSearch(() =>
					countries?.map((country) => ({
						label: country.name,
						value: country.name,
					}))
				);
			}
		},
		[countries]
	);

	const handleStateSearch = useCallback(
		(value) => {
			if (value !== "") {
				setStatesSearch(() =>
					states
						.filter((s) =>
							s?.name
								?.toLowerCase()
								.includes(value?.toLowerCase())
						)
						?.map((s) => ({ label: s.name, value: s.name }))
				);
			} else {
				setStatesSearch(() =>
					states?.map((s) => ({
						label: s.name,
						value: s.name,
					}))
				);
			}
		},
		[states]
	);

	const handleCitySearch = useCallback(
		(value) => {
			if (value !== "") {
				setCitiesSearch(() =>
					cities
						.filter((c) =>
							c?.name
								?.toLowerCase()
								.includes(value?.toLowerCase())
						)
						?.map((c) => ({ label: c.name, value: c.name }))
				);
			} else {
				setCitiesSearch(() =>
					cities?.map((c) => ({
						label: c.name,
						value: c.name,
					}))
				);
			}
		},
		[cities]
	);

	const getCountries = useCallback(() => {
		Fetch({
			url: "http://localhost:3000/countries.json",
			method: "GET",
		})
			.then((res) => {
				setCountries(res.data);
			})
			.catch((err) => {
				toast("Error fetching countries: ", {
					type: "error",
				});
			});
	}, []);

	const getStates = useCallback((country) => {
		Fetch({
			url: `http://localhost:3000/countries/${country}.json`,
			method: "GET",
		})
			.then((res) => {
				setStates(res.data.states || []);
			})
			.catch((err) => {});
	}, []);

	const getCities = useCallback(
		(state) => {
			if (state) {
				const st = states.filter((s) => s.name === state)[0];
				const cs = st ? st.cities : [];

				setCities(() => {
					return cs;
				});

				setCitiesSearch(() => {
					return cs?.map((c) => ({ label: c.name, value: c.name }));
				});
			}
		},
		[states]
	);

	const validateAndSubmit = useCallback(
		(e) => {
			e.preventDefault();
			if (
				selectedState &&
				!states.find((s) => s.name === selectedState)
			) {
				toast("Please select a valid state", {
					type: "error",
				});
				return;
			}

			if (selectedCity && !cities.find((c) => c.name === selectedCity)) {
				toast("Please select a valid city", {
					type: "error",
				});
				return;
			}

			if (selectedState && !selectedCountry) {
				toast("Please select a country", {
					type: "error",
				});
				return;
			}

			if (selectedCity && !selectedState) {
				toast("Please select a state", {
					type: "error",
				});
				return;
			}

			handleSubmit(e);
		},
		[
			handleSubmit,
			cities,
			selectedCity,
			selectedState,
			states,
			selectedCountry,
		]
	);

	useEffect(() => {
		getCountries();
	}, [getCountries]);

	useEffect(() => {
		if (
			selectedCountry &&
			countries.find((c) => c.name === selectedCountry)
		) {
			setSelectedState("");
			setSelectedCity("");
			getStates(selectedCountry);
		}
	}, [selectedCountry, getStates, countries]);

	useEffect(() => {
		if (selectedState) {
			setSelectedCity("");
			getCities(selectedState);
		}
	}, [selectedState, getCities]);

	useEffect(() => {
		handleCountrySearch("");
	}, [countries, handleCountrySearch]);

	useEffect(() => {
		handleStateSearch("");
	}, [states, handleStateSearch]);

	return (
		<form
			className="flex flex-col gap-4 w-full"
			onSubmit={validateAndSubmit}>
			<h4 className="text-center">Institute Details</h4>
			<div className="flex flex-col gap-4 w-full">
				<Input width="100%" name="institute_name" required>
					Institute Name
				</Input>
				<Input
					width="100%"
					name="address1"
					placeholder="No.XXX, XZY Road, XX Cross"
					required>
					Address 1
				</Input>
				<Input
					width="100%"
					name="address2"
					placeholder="XX Block, XXX Layout">
					Address 2
				</Input>
				<div className="with-label">
					<label className="text-sm">Country</label>
					<AutoComplete
						width="100%"
						name="country"
						disableFreeSolo
						options={countriesSearch}
						onSearch={handleCountrySearch}
						value={selectedCountry}
						onChange={(val) => setSelectedCountry(val)}
						clearable
						required></AutoComplete>
				</div>
				<div className="with-label">
					<label className="text-sm">State</label>
					<AutoComplete
						width="100%"
						name="state"
						disableFreeSolo
						options={statesSearch}
						value={states.length > 0 ? selectedState : "---"}
						disabled={states.length === 0}
						onSearch={handleStateSearch}
						onChange={(val) => setSelectedState(val)}
						clearable
						required></AutoComplete>
				</div>
				<div className="with-label">
					<label className="text-sm">City</label>
					<AutoComplete
						width="100%"
						name="city"
						disableFreeSolo
						options={citiesSearch}
						value={selectedCity}
						disabled={states.length === 0 || cities.length === 0}
						onSearch={handleCitySearch}
						clearable
						required></AutoComplete>
				</div>
				<Input width="100%" name="pincode" required>
					Pincode
				</Input>
				<div className="flex gap-1 items-end">
					<Input
						width={"100%"}
						name="billing_address"
						required
						placeholder={
							!billingAddressSame
								? "Enter billing address"
								: "Same as above"
						}
						disabled={billingAddressSame}>
						Billing Address
					</Input>
					<Button
						scale={0.8}
						className="flex-1"
						type={
							billingAddressSame ? "secondary-light" : "success"
						}
						onClick={() => setBillingAddressSame((p) => !p)}>
						{billingAddressSame ? "Change" : "Same as above"}
					</Button>
				</div>
				<Input width="100%" name="contact_email" required>
					Contact Email
				</Input>
				<Input
					width="100%"
					name="contact_phone"
					placeholder="9999999999"
					required>
					Contact Phone Number
				</Input>
			</div>
			<Button htmlType="submit" type="success">
				Save Changes
			</Button>
		</form>
	);
}

export default function Register({ switchForm }) {
	// const { toast } = useToast();
	const notify = (x) => toast(x);

	const [step, setStep] = useState(1);
	const [blockStep, setBlockStep] = useState(false);

	const [role, setRole] = useState("STUDENT"); // STUDENT | INSTITUTE_OWNER
	const [regMode, setRegMode] = useState("NORMAL"); // NORMAL | GOOGLE

	const [loading, setLoading] = useState(false);

	const [googleInfo, setGoogleInfo] = useState({});
	const [generalInfo, setGeneralInfo] = useState({});

	const [phoneInfo, setPhoneInfo] = useState({});

	const [instituteInfo, setInstituteInfo] = useState({});

	const [clientID, setClientID] = useState("");

	useEffect(() => {
		setClientID(process.env.REACT_APP_GOOGLE_CLIENT_ID);
	}, []);

	useEffect(() => {
		console.log(blockStep);
	}, [blockStep]);

	// const navigate = useNavigate();

	const [billingAddressSame, setBillingAddressSame] = useState(true);

	const handleStudentRegistration = async () => {
		const newUser = {
			...generalInfo,
			phone_no: phoneInfo?.phone_no,
			role_name: "STUDENT",
			is_google_login: googleInfo && googleInfo?.verified ? true : false,
		};

		console.log(newUser);

		try {
			const response = await fetch(
				"http://localhost:4000/auth/register",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(newUser),
				}
			);
			if (response.ok) {
				toast("New User added successfully! Kindly login.", {
					type: "success",
				});

				setTimeout(() => {
					window.location.reload();
				}, 2000);
			} else {
				const errorData = await response.json();
				toast(errorData.error, { type: "error" });
			}
		} catch (error) {
			console.log(error);
			toast("Error registering new user, try again!", { type: "error" });
		}
	};

	const handleInstituteRegistration = async () => {
		try {
			if (instituteInfo?.pincode)
				instituteInfo.pincode = parseInt(instituteInfo?.pincode);
			// console.log(instituteInfo?.pincode);
		} catch (err) {
			notify("Pincode must be a number");
			return;
		}

		const addressCombination = `${instituteInfo?.address1}, ${instituteInfo?.address2}, ${instituteInfo?.city} - ${instituteInfo?.pincode}, ${instituteInfo?.state}, ${instituteInfo?.country}`;

		const user = {
			name: generalInfo?.name,
			username: generalInfo?.username,
			email_id: generalInfo?.email_id,
			phone_no: generalInfo?.phone,
			password: generalInfo?.password,
			confirm_password: generalInfo?.confirm_password,
			role_name: "INSTITUTE_OWNER",
			is_google_login: googleInfo && googleInfo?.verified,
		};

		const institute = {
			name: instituteInfo?.institute_name,
			address1: instituteInfo?.address1,
			address2: instituteInfo?.address2,
			pincode: instituteInfo?.pincode,
			billing_address: billingAddressSame
				? addressCombination
				: instituteInfo?.billing_address,
			email: instituteInfo?.contact_email,
			phone: instituteInfo?.phone,
		};

		console.log(user, institute);

		Fetch({
			url: "http://localhost:4000/institute/register",
			method: "POST",
			data: institute,
		})
			.then((res) => {
				if (res && res.status === 200) {
					toast("Institute added successfully", {
						type: "success",
					});
					user.institute_name = institute.name;
					Fetch({
						url: "http://localhost:4000/auth/register",
						method: "POST",
						data: user,
					})
						.then((res) => {
							if (res && res.status === 200) {
								toast("User added successfully", {
									type: "success",
								});
							} else {
								toast("Error registering user", {
									type: "error",
								});
							}
						})
						.catch((err) => {
							console.log(err);
							toast(
								"Error registering user: " +
									err?.response?.data?.error,
								{ type: "error" }
							);
						});
				} else {
					toast("Error registering institute", { type: "error" });
				}
			})
			.catch((err) => {
				console.log(err);
				toast(
					"Error registering institute: " +
						err?.response?.data?.error,
					{ type: "error" }
				);
			});
	};

	const maxSteps = 5;
	const minSteps = 1;

	const handleNextStep = () => {
		if (
			(role === "STUDENT" && step < maxSteps) ||
			(role === "INSTITUTE_OWNER" && step < maxSteps + 1)
		)
			setStep((s) => s + 1);
	};

	const handlePrevStep = () => {
		if (step > minSteps) setStep((s) => s - 1);
		setBlockStep(false);
		setLoading(false);
	};

	const RenderStep = useMemo(() => {
		switch (step) {
			case 1:
				return (
					<GoogleOAuthProvider clientId={clientID}>
						<PickRegistationMode
							regMode={regMode}
							setRegMode={setRegMode}
							setGoogleInfo={setGoogleInfo}
							setGeneralInfo={setGeneralInfo}
							setLoading={setLoading}
							clientID={clientID}
						/>
					</GoogleOAuthProvider>
				);
			case 2:
				return (
					<GeneralInformationForm
						generalInfo={generalInfo}
						setGeneralInfo={setGeneralInfo}
						setBlockStep={setBlockStep}
						setLoading={setLoading}
					/>
				);
			case 3:
				return <RoleSelectorForm role={role} setRole={setRole} />;
			case 4:
				return role === "STUDENT" ? (
					<PhoneNumberForm
						phoneValue={phoneInfo}
						setPhoneInfo={setPhoneInfo}
						setBlockStep={setBlockStep}
						setLoading={setLoading}
					/>
				) : (
					<InstituteDetailsForm
						handleSubmit={() => {}}
						billingAddressSame={billingAddressSame}
						setBillingAddressSame={setBillingAddressSame}
					/>
				);
			case 5:
				return role === "STUDENT" ? (
					<div className="border text-center rounded-lg p-4">
						<p>
							We will send an email to{" "}
							<b>{generalInfo?.email_id}</b>
						</p>
						<p>
							Please <b className="text-blue-400">verify</b> your
							email to be able to access your account!
						</p>
					</div>
				) : (
					<PhoneNumberForm
						phoneValue={phoneInfo}
						setPhoneInfo={setPhoneInfo}
						setBlockStep={setBlockStep}
						setLoading={setLoading}
					/>
				);
			case 6:
				return role === "INSTITUTE_OWNER" && step === 6 ? (
					<div className="border text-center rounded-lg p-4">
						<p>
							We will send an email to{" "}
							<b>{generalInfo?.email_id}</b>
						</p>
						<p>
							Please <b className="text-blue-400">verify</b> your
							email to be able to access your account!
						</p>
					</div>
				) : (
					<></>
				);
			default:
				return <></>;
		}
	}, [
		step,
		role,
		regMode,
		billingAddressSame,
		generalInfo,
		phoneInfo,
		clientID,
	]);

	return (
		<div className="bg-white p-4 rounded-lg max-w-xl mx-auto">
			<h3 className="text-center text-2xl">Register</h3>
			<br />
			<Progress
				type="success"
				value={step}
				max={role === "STUDENT" ? maxSteps : maxSteps + 1}
			/>
			<Spacer y={4} />
			{RenderStep}
			<div className="flex flex-row justify-between my-10">
				{(role === "STUDENT" && step < maxSteps) ||
				(role === "INSTITUTE_OWNER" && step < maxSteps + 1) ? (
					<Button
						onClick={handleNextStep}
						loading={loading}
						width={step === 1 ? "100%" : null}
						iconRight={<ArrowRight />}
						disabled={loading || blockStep}>
						Next
					</Button>
				) : (
					<Button
						onClick={() => {
							if (role === "STUDENT") {
								handleStudentRegistration();
							} else {
								handleInstituteRegistration();
							}
						}}>
						Register
					</Button>
				)}

				{step > minSteps && (
					<Button
						onClick={handlePrevStep}
						loading={loading}
						icon={<ArrowLeft />}
						disabled={loading}>
						Back
					</Button>
				)}
			</div>

			<hr />

			<div className="flex flex-col gap-1 items-center w-full mt-4">
				<h5
					onClick={() => switchForm((s) => !s)}
					className="hover:pointer">
					Already have an account?{" "}
					<span className="text-blue-500">Click Here</span>
				</h5>
			</div>
		</div>
	);
}
