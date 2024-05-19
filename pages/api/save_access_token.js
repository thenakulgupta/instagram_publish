import { Settings } from "../../models/settings.js";

export default async function handler(req, res) {
	if (req.method === "POST") {
		try {
			const { access_token, data_access_expiration_time } = req.body;
			let setting = await Settings.findOne();
			if (!setting) {
				await Settings.create({});
				setting = await Settings.findOne();
			}
			setting.access_token = access_token;
			setting.access_token_expiration = new Date(
				data_access_expiration_time * 1000
			);
			await setting.save();
			return res.status(200).json({});
		} catch (error) {
			console.log(error);
			return res.status(500).json({ error: "Internal Server Error" });
		}
	} else {
		return res.status(405).json({ message: "Method Not Allowed" });
	}
}
