import { useEffect } from "react";
import Otp from "../../../pages/otp/Otp";

export default function PhoneNumberForm({
	heading,
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
			<p className="text-center text-zinc-500">{heading}</p>
			<Otp
				setLoading={setLoading}
				onSuccessCallback={handlePhoneChange}
			/>
		</div>
	);
}
