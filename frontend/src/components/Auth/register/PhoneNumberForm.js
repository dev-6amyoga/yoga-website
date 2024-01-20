import { useEffect } from "react";
import Otp from "../../../pages/otp/Otp";

export default function PhoneNumberForm({
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
			<p className="text-center text-zinc-500">Your personal number</p>
			<Otp
				setLoading={setLoading}
				onSuccessCallback={handlePhoneChange}
			/>
		</div>
	);
}
