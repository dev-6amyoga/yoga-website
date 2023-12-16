import axios from 'axios';

export const Fetch = ({
    url = null,
    method = 'GET',
    token = null,
    data = null,
    params = {},
    headers = {},
}) => {
    let h = { ...headers };

    if (token) {
        h['Authorization'] = `Bearer ${token}`;
    }

    if (data) {
        h['Content-Type'] = 'application/json';
    }

    switch (method) {
        case 'GET':
            return axios.get(url, { params: params, headers: h });
        default:
            return axios.post(url, data, {
                headers: h,
            });
    }
};
