import { Fetch } from "../utils/Fetch";

export default class OTPAPI {
	static async postVerifyOTP(
		otp_for_type,
		otp_for,
		otp_target_type,
		otp_target,
		value
	) {
		try {
			const response = await Fetch({
				url: "/otp/verify",
				method: "POST",
				data: {
					otp_for_type: otp_for_type,
					otp_for: otp_for,
					otp_target_type: otp_target_type,
					otp_target: otp_target,
					value: value,
				},
			});

			if (response.status === 200) {
				return [response.data, null];
			} else {
				return [null, response.data];
			}
		} catch (err) {
			return [null, err];
		}
	}

	static async postCreateOTP(
		otp_for_type,
		otp_for,
		otp_target_type,
		otp_target
	) {
		try {
			const response = await Fetch({
				url: "/otp/create",
				method: "POST",
				data: {
					otp_for_type,
					otp_for,
					otp_target_type,
					otp_target,
				},
			});

			if (response.status === 200) {
				return [response.data, null];
			} else {
				return [null, response.data];
			}
		} catch (err) {
			return [null, err];
		}
	}
}
