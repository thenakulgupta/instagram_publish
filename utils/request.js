import axios from "axios";

export const post_call = async (url, body, token) => {
	const res = await axios.post(url, body, {
		headers: { Authorization: `Bearer ${token}` },
	});
	return res;
};

export const get_call = async (url) => {
	const res = await axios.get(url, {
		// headers: { Authorization: `Bearer ${token}` },
	});
	return res;
};
