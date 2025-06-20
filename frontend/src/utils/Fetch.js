import axios from "axios";
import { Cookies } from "react-cookie";
import { SIXAMYOGA_ACCESS_TOKEN } from "../enums/cookies";
import { getBackendDomain } from "./getBackendDomain";

let cookies = new Cookies({}, { path: "/" });

export const Fetch = async ({
	url = null,
	method = "GET",
	token = null,
	data = null,
	responseType,
	params = {},
	headers = {},
}) => {
	let h = { ...headers };

	// console.log();
	let cookieToken = cookies.get(SIXAMYOGA_ACCESS_TOKEN);

	if (token !== null && token !== undefined && token === true) {
		// console.log("TOKEN : ", useUserStore.getState());
		if (!cookieToken) {
			throw new Error("No token found");
		}

		h["authorization"] = `Bearer ${cookieToken}`;
	}

	if (
		data !== null &&
		data !== undefined &&
		method !== "GET" &&
		h["Content-Type"] === undefined
	) {
		h["Content-Type"] = "application/json";
	}

	// alert(getBackendDomain() + url);

	let req = {
		method: method,
		headers: h,
		url: getBackendDomain() + url,
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
	n = 2,
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
