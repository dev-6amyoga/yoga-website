import axios from "axios";
import useUserStore from "../store/UserStore";

export const Fetch = ({
	url = null,
	method = "GET",
	token = null,
	data = null,
	responseType,
	params = {},
	headers = {},
}) => {
	let h = { ...headers };

	if (token) {
		console.log("TOKEN : ", useUserStore.getState().accessToken);
		h["authorization"] = `Bearer ${
			token ? useUserStore.getState().accessToken : ""
		}`;
	}

	if (data) {
		h["Content-Type"] = "application/json";
	}

	let req = {
		method: method,
		headers: h,
		url: url,
		data: data,
		params: params,
	};

	if (responseType) {
		req.responseType = responseType;
	}

	return axios.request(req);
};

export const FetchRetry = async ({
	url = null,
	method = "GET",
	token = null,
	data = null,
	responseType,
	params = {},
	headers = {},
	n = 0,
	retryDelayMs = 1000,
	onRetry = null,
}) => {
	return Fetch({
		url,
		method,
		token,
		data,
		responseType,
		params,
		headers,
	}).catch((err) => {
		if (n === 1) {
			throw err;
		}

		if (onRetry) {
			onRetry(err);
		}

		setTimeout(
			() =>
				FetchRetry({
					url,
					method,
					token,
					data,
					responseType,
					params,
					headers,
					n: n - 1,
					retryDelayMs,
					onRetry,
				}),
			retryDelayMs
		);
	});
};
