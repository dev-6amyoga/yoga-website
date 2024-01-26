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
    h["token"] = token || useUserStore.getState().accessToken;
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
