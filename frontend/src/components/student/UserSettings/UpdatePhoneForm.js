import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import {
	Badge,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	TextField,
	Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import PhoneInputWithCountrySelect from "react-phone-number-input";
// import {} from "react-phone-number-input/input";
import { toast } from "react-toastify";
import OTPAPI from "../../../api/otp.api";
import { UserAPI } from "../../../api/user.api";
import useUserStore from "../../../store/UserStore";
import { Fetch } from "../../../utils/Fetch";
import { validatePhone } from "../../../utils/formValidation";

export default function UpdatePhoneForm() {
	const user = useUserStore((state) => state.user);
	const [update, setUpdate] = useState(false);
	const [isEditing, setIsEditing] = useState(false);

	const [phone, setPhone] = useState("");
	const [phoneError, setPhoneError] = useState(null);

	const [otp, setOtp] = useState("");
	const [otpError, setOtpError] = useState(null);

	const [verified, setVerified] = useState(false);

	// resend related
	const [startResendTimer, setStartResendTimer] = useState(false);
	const [timer, setTimer] = useState(0);
	const [resendCounter, setResendCounter] = useState(0);

	// setting up resend timer
	useEffect(() => {
		let t;
		if (startResendTimer) {
			setTimer(0);
			// update timer every second
			t = setInterval(() => {
				setTimer((prev) => prev + 1);
			}, 1000);
		}

		return () => {
			clearInterval(t);
		};
	}, [startResendTimer]);

	useEffect(() => {
		// reset timer
		if (timer === resendCounter * 30) {
			setStartResendTimer(false);
		}
	}, [timer, resendCounter]);

	const inputErrorDebounce = useRef(null);

	const {
		data: userData,
		isLoading,
		refetch: refetchUser,
	} = useQuery({
		queryKey: ["user", user?.user_id],
		queryFn: async () => {
			const [res, error] = await UserAPI.postGetUserByID(user?.user_id);

			console.log(res.user);

			if (error) {
				toast(error.message, { type: "error" });
				return {};
			}

			return res?.user;
		},
	});

	const handleChange = (e) => {
		const { name, value } = e.target;
		setPhone(() => value);
	};

	const closeUpdateHandler = (event) => {
		setUpdate(false);
	};

	const handleReset = () => {
		setPhone("");
		setIsEditing(false);
		setPhoneError(null);
		setOtpError(null);
		setVerified(false);
		setResendCounter(0);
		setStartResendTimer(false);
	};

	const handleUpdatePhone = async (e) => {
		e.preventDefault();

		console.log("Update phone called");

		if (phone === "" || phone === undefined) {
			toast("Phone is required", { type: "error" });
			return;
		}

		if (!userData?.email) {
			toast("Email is required", { type: "error" });
			return;
		}

		if (!verified) {
			toast("Please verify phone number", { type: "error" });
			return;
		}

		Fetch({
			url: "/user/update-profile",
			method: "POST",
			data: {
				user_id: userData.user_id,
				phone: phone,
			},
		})
			.then((res) => {
				console.log(res);
				toast("Updated!", { type: "success" });
				handleReset();
				refetchUser();
			})
			.catch((err) => {
				toast(`Error : ${err.response.data.error}`, {
					type: "error",
				});
			});
	};

	// check phone number
	useEffect(() => {
		if (inputErrorDebounce.current)
			clearTimeout(inputErrorDebounce.current);

		inputErrorDebounce.current = setTimeout(async () => {
			console.log("Checking phone number");

			if (phone) {
				const [is_phone_valid, phone_error] =
					await validatePhone(phone);

				if (!is_phone_valid || phone_error) {
					setPhoneError(phone_error.message);

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

					return;
				}
			}
			setPhoneError(null);
		}, 500);

		return () => {
			if (inputErrorDebounce.current)
				clearTimeout(inputErrorDebounce.current);
		};
	}, [phone]);

	const handleOTPVerify = async () => {
		// verify otp
		if (phone === "" || phone === undefined) {
			toast("Phone is required", { type: "error" });
			setVerified(false);
			return;
		}

		if (!userData?.email) {
			toast("Email is required", { type: "error" });
			setVerified(false);
			return;
		}

		if (!otp) {
			setOtpError("OTP is required");
			setVerified(false);
			return;
		}

		const [res, error] = await OTPAPI.postVerifyOTP(
			"OTP_FOR_PHONE",
			phone,
			"OTP_TARGET_EMAIL",
			userData.email,
			otp
		);

		if (error) {
			// toast(error.message, { type: "error" });
			setVerified(false);
			setOtpError("Incorrect OTP");
			return;
		}

		if (res?.message === "OTP verified successfully") {
			toast("OTP sent successfully", { type: "success" });
			setVerified(true);
		}
	};

	const handleOTPSend = async () => {
		setVerified(false);
		setOtpError(null);

		if (phone === "" || phone === undefined) {
			toast("Phone is required", { type: "error" });
			return;
		}

		if (!userData?.email) {
			toast("Email is required", { type: "error" });

			return;
		}

		const [res, error] = await OTPAPI.postCreateOTP(
			"OTP_FOR_PHONE",
			phone,
			"OTP_TARGET_EMAIL",
			userData.email
		);

		if (error) {
			toast(error.message, { type: "error" });
			return;
		}

		setResendCounter((prev) => prev + 1);
		setStartResendTimer(true);

		toast("OTP sent to email", { type: "success" });
	};

	return (
		<div className="w-full">
			<form
				className="flex flex-col items-center w-full gap-4"
				onSubmit={handleUpdatePhone}
				onReset={handleReset}>
				<PhoneInputWithCountrySelect
					value={phone}
					onChange={setPhone}
					inputComponent={(props) => (
						<TextField
							fullWidth
							name="phone"
							label={isEditing ? "Phone" : ""}
							placeholder={userData?.phone}
							onChange={handleChange}
							disabled={
								!isEditing || verified || resendCounter > 0
							}
							sx={{ mb: 2 }}
							helperText={phoneError ? phoneError : " "}
							error={phoneError ? true : false}
							{...props}
						/>
					)}
				/>
				{/* <TextField
					fullWidth
					name="phone"
					label={isEditing ? "Phone" : ""}
					placeholder={userData?.phone}
					onChange={handleChange}
					disabled={!isEditing || verified || resendCounter > 0}
					sx={{ mb: 2 }}
					helperText={phoneError ? phoneError : " "}
					error={phoneError ? true : false}
				/> */}

				{/* otp form */}
				{phone && isEditing && !phoneError && !verified ? (
					<div className="flex flex-col gap-4">
						<TextField
							fullWidth
							label="OTP"
							placeholder={"XXXXXX"}
							onChange={(e) => {
								setOtp(e.target.value);
							}}
							size="small"
							disabled={resendCounter === 0 || verified}
							error={otpError ? true : false}
							helperText={otpError ? "Incorrect OTP" : ""}
						/>
						<div className="flex flex-row gap-2">
							<Button
								onClick={handleOTPSend}
								disabled={startResendTimer}
								className="w-full sm:w-auto"
								variant="contained"
								sx={{ height: "fit-content" }}>
								{resendCounter === 0
									? "Send OTP"
									: timer === 30
										? "Resend OTP"
										: `Resend in ${resendCounter * 30 - timer} seconds`}
							</Button>

							<Button
								variant="contained"
								onClick={handleOTPVerify}
								className="w-full sm:w-auto"
								sx={{ height: "fit-content" }}
								disable={resendCounter === 0}>
								Verify
							</Button>
						</div>
					</div>
				) : (
					<>
						{isEditing && !phoneError && verified ? (
							<>
								<Badge color="success">Verified!</Badge>
							</>
						) : (
							<></>
						)}
					</>
				)}

				<div className="flex gap-2">
					{!isEditing ? (
						<Button
							startIcon={<EditIcon />}
							onClick={() => {
								setPhone(null);
								setIsEditing(true);
							}}
							type="button"
							variant="outlined"
							sx={{ height: "fit-content" }}>
							Edit
						</Button>
					) : (
						<></>
					)}

					{isEditing && verified ? (
						<>
							<Button
								startIcon={<SaveIcon />}
								type="submit"
								sx={{ height: "fit-content" }}>
								Save
							</Button>
						</>
					) : (
						<></>
					)}

					{isEditing ? (
						<>
							<Button
								startIcon={<CancelIcon />}
								type="reset"
								variant="outlined"
								sx={{ height: "fit-content" }}>
								Cancel
							</Button>
						</>
					) : (
						<> </>
					)}
				</div>
			</form>

			{/* Update Confirmation Dialog */}
			<Dialog open={update} onClose={closeUpdateHandler}>
				<DialogTitle>Update Profile</DialogTitle>
				<DialogContent>
					<Typography variant="body1">
						Do you really wish to update your profile?
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setUpdate(false)}>No</Button>
					<Button onClick={() => {}} autoFocus>
						Yes
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
}
