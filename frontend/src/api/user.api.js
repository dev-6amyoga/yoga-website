import { Fetch } from "../utils/Fetch";

export class UserAPI {
	static async postGetUserByToken(access_token) {
		try {
			const response = await Fetch({
				url: "/user/get-by-token",
				method: "POST",
				data: {
					access_token: access_token,
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
