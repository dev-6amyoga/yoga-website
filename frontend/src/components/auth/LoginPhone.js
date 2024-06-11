import { Button, TextField } from "@mui/material";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { useCallback, useEffect, useRef, useState } from "react";
import PhoneInput from "react-phone-number-input";
import { toast } from "react-toastify";
import { auth } from "../../utils/firebase";
import RecaptchaContainer from "./RecaptchaContainer";

export default function LoginPhone({ onSuccessCallback, setLoading }) {
	const [otp, setOtp] = useState("");
	const [number, setNumber] = useState("");
	const [verified, setVerified] = useState(false);
	const [otpError, setOtpError] = useState(null);

	// resend related
	const [startResendTimer, setStartResendTimer] = useState(false);
	const [timer, setTimer] = useState(0);
	const [resendCounter, setResendCounter] = useState(0);

	// const [, setConfirmationResult] = useState(null);
	const recaptchaVerifier = useRef(null);
	const confirmationResult = useRef(null);

	const recaptchaContainer = useRef(null);

	const setUpReCaptcha = useCallback((el) => {
		console.log("Setting up recaptcha...", el);
		if (el) {
			recaptchaContainer.current = el;
			const rv = new RecaptchaVerifier(auth, recaptchaContainer.current, {
				//   size: "invisible",
				callback: () => {
					console.log("recaptcha resolved..");
					setVerified(true);
				},
				"expired-callback": () => {
					console.log("in expired callback");
					setVerified(false);
				},
			});
			recaptchaVerifier.current = rv;
			recaptchaVerifier.current.render();
		}
	}, []);

	useEffect(() => {
		// if (setLoading) setLoading(true)
		// if (!recaptchaVerifier.current) setUpReCaptcha()
		// if (setLoading) setLoading(false)
		// to avoid 2 renders in dev mode
		// if (!recaptchaVerifier.current) {
		// }
		return () => {
			// destroy instance when exiting
			if (recaptchaVerifier.current) {
				recaptchaVerifier.current.clear();
				// recaptchaVerifier.current = null;
				// recaptchaContainer.current = null;
			}
		};
	}, []);

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

	const sendOTP = async () => {
		if (number === "" || number === undefined) {
			return;
		}

		if (number && number.length < 10) {
			toast("Invalid phone number", { type: "error" });
			return;
		}

		if (setLoading) setLoading(true);

		setResendCounter((prev) => prev + 1);
		setStartResendTimer(true);
		try {
			console.log("in try");
			// await recaptchaVerifier.current.verify();
			// setVerified(true);
			console.log("SENDING OTP TO : ", number);
			signInWithPhoneNumber(auth, number, recaptchaVerifier.current)
				.then((confResult) => {
					// console.log({ confirmationResult: confResult });
					confirmationResult.current = confResult;
					toast(`OTP Sent to ${number}`, { type: "success" });
				})
				.catch((error) => {
					console.log("HERE IS THE ERROR:", error);
					toast("Error sending OTP, try again!", { type: "error" });
				});
			if (setLoading) setLoading(false);
			return;
		} catch (err) {
			toast("Error with recaptcha, try again", { type: "error" });
			if (setLoading) setLoading(false);
			return;
		} finally {
			if (setLoading) setLoading(false);
		}
	};

	const verifyOtp = async () => {
		setOtpError(null);
		// console.log("otp", otp);
		if (otp === "" || otp === undefined) {
			// toast("OTP is required", { type: "error" });
			setOtpError("OTP is required");
			return;
		}
		if (setLoading) setLoading(true);
		try {
			if (confirmationResult.current) {
				// console.log("Confirming...");
				confirmationResult.current
					.confirm(otp)
					.then((result) => {
						// console.log({ result });
						toast("Verified!", { type: "success" });
						setOtpError(null);
						if (setLoading) setLoading(false);
						// stop timer
						setStartResendTimer(false);
						setTimer(30);

						onSuccessCallback(number);
					})
					.catch((err) => {
						// toast(err, { type: "error" });
						setOtpError("Error / Incorrect OTP");
						if (setLoading) setLoading(false);
					})
					.finally(() => {
						if (setLoading) setLoading(false);
					});
			} else {
				// toast.warn("No OTP Sent", { type: "warning" });
				setOtpError("No OTP Sent");
			}
		} catch (err) {
			console.log(err);
			// toast("Error verifying OTP", { type: "error" });
			setOtpError("Error verifying OTP");
			if (setLoading) setLoading(false);
		}
	};

	return (
		<div className="mx-auto my-4 max-w-md flex flex-col items-center gap-4">
			<PhoneInput
				defaultCountry="IN"
				value={number}
				onChange={setNumber}
				placeholder="Enter Phone Number"
				className="w-full rounded-lg border py-2"
			/>
			{/* <ReCAPTCHA sitekey={process.env?.VITE_} /> */}
			<RecaptchaContainer
				containerRef={setUpReCaptcha}
				className="sm:w-10"
			/>
			<div className="flex w-full flex-col gap-2 items-center justify-center sm:flex-row sm:justify-between">
				<Button
					className="w-full sm:w-auto"
					size="medium"
					variant="outlined">
					Cancel
				</Button>
				<Button
					onClick={() => sendOTP()}
					disabled={!verified || startResendTimer}
					className="w-full sm:w-auto"
					variant="contained">
					{resendCounter === 0
						? "Send OTP"
						: timer === 30
							? "Resend OTP"
							: `Resend in ${resendCounter * 30 - timer} seconds`}
				</Button>
			</div>

			{/* verify otp */}
			{number && (
				<div className="flex w-full flex-col gap-4 PhoneNumberForm">
					<TextField
						type="number"
						label="Enter OTP here"
						onChange={(e) => {
							setOtp(e.target.value);
						}}
						error={otpError}
						helperText={otpError ? "Incorrect OTP" : ""}
					/>
					<Button
						variant="contained"
						onClick={verifyOtp}
						className="w-full sm:w-auto">
						Verify
					</Button>
				</div>
			)}
		</div>
	);
}
