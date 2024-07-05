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

	static async postGetUserByID(user_id) {
		try {
			const response = await Fetch({
				url: "/user/get-by-id",
				method: "POST",
				token: true,
				data: {
					user_id: user_id,
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

	// check if phone number exists in the database
	static async postCheckPhoneNumber(phone) {
		try {
			const response = await Fetch({
				url: "/user/check-phone-number",
				method: "POST",
				data: {
					phone: phone,
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

	// check if email exists in the database
	static async postCheckEmail(email) {
		if (!email) return [false, new Error("Email is required")];

		try {
			const response = await Fetch({
				url: "/user/check-email",
				method: "POST",
				data: {
					email: email,
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

	// check if username exists in the database
	static async postCheckUsername(username) {
		if (!username) return [false, new Error("Username is required")];

		try {
			const response = await Fetch({
				url: "/user/check-username",
				method: "POST",
				data: {
					username: username,
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
