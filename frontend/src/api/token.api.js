import { Fetch } from "../utils/Fetch";

export const GetWidevineTokenData = async () => {
	try {
		const res = await Fetch({
			url: "/playback/get-widevine-token",
			method: "POST",
			token: false,
		});

		// data =  {licenseAcquisitionUrl}
		const data = res?.data;

		return { data, error: null };
	} catch (err) {
		console.error(err);
		return { data: null, error: err };
	}
};

export const GetPlayreadyTokenData = async () => {
	try {
		const res = await Fetch({
			url: "/playback/get-playready-token",
			method: "POST",
			token: false,
		});

		// data = {licenseAcquisitionUrl, token}
		const data = res?.data;

		data.url = data.licenseAcquisitionUrl;
		data.licenseAcquisitionUrl =
			data.licenseAcquisitionUrl + "?ExpressPlayToken=" + data.token;

		return { data, error: null };
	} catch (err) {
		console.error(err);
		return { data: null, error: err };
	}
};

export const GetFairplayTokenData = async () => {
	try {
		const res = await Fetch({
			url: "/playback/get-fairplay-token",
			method: "POST",
			token: false,
		});

		// data = {licenseAcquisitionUrl}
		const data = res?.data;

		return { data, error: null };
	} catch (err) {
		console.error(err);
		return { data: null, error: err };
	}
};
