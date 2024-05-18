import moment from "moment";
import { Settings } from "../../models/settings";
import { get_call } from "../../utils/request";

export const getAccessToken = async () => {
	const setting = await Settings.findOne();
	const access_token =
		setting?.access_token_expiration &&
		moment(setting.access_token_expiration) > moment()
			? setting.access_token
			: "";
	try {
		await get_call(
			`https://graph.facebook.com/v19.0/me/accounts?access_token=${access_token}`
		);
		return access_token;
	} catch (error) {
		return null;
	}
};

export default async function handler(req, res) {
	if (req.method === "GET") {
		try {
			return res
				.status(200)
				.json({ logined: (await getAccessToken())?.length > 0 });
		} catch (error) {
			console.log(error);
			return res.status(500).json({ error: "Internal Server Error" });
		}
	} else {
		return res.status(405).json({ message: "Method Not Allowed" });
	}
}
