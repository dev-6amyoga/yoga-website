import { Fetch } from "../utils/Fetch";

export class AuthAPI {
	static async postVerifyTokens(access_token, refresh_token) {
		try {
			const response = await Fetch({
				url: "/auth/verify-tokens",
				method: "POST",
				data: {
					access_token: token,
					refresh_token: refresh_token,
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

	static async postUserRefreshToken(refresh_token) {
		try {
			const response = await Fetch({
				url: "/auth/refresh-token",
				method: "POST",
				data: {
					refresh_token: refresh_token,
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
