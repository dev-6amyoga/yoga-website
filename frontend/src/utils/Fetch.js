import axios from "axios"
import useUserStore from "../store/UserStore"

export const Fetch = ({
    url = null,
    method = "GET",
    token = null,
    data = null,
    params = {},
    headers = {},
}) => {
    let h = { ...headers };

    if (token) {
        h["Authorization"] = `Bearer ${token || useUserStore.getState().accessToken}`;
    }

    if (data) {
        h["Content-Type"] = "application/json";
    }

    return axios.request({
        method: method,
        headers: h,
        url: url,
        data: data,
        params: params,
    });
};
