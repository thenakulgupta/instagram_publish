import { getAccessToken } from "./check_login";
import { get_call, post_call } from "../../utils/request";
import { PublishedVideos } from "../../models/published_videos";

const instaPageId = process.env.INSTA_PAGE_ID;
const version = "v19.0";

export const uploadPendingVideos = async () => {
	const pending_videos = await PublishedVideos.find({
		upload_status: { $in: ["pending", "uploaded_locally"] },
	});
	if (pending_videos?.length) {
		const accessToken = await getAccessToken();
		if (!accessToken?.length) {
			return;
		}
		await Promise.all(
			pending_videos?.map(async (v) => {
				let update = {};
				const id = v?.insta_video_id;
				const status =
					(
						await get_call(
							`https://graph.facebook.com/${id}?fields=status_code&access_token=${accessToken}`
						)
					)?.data?.status_code || "";

				if (status === "FINISHED") {
					update = { upload_status: "uploaded_locally" };
				} else if (["EXPIRED", "ERROR"].includes(status)) {
					update = { upload_status: "failed" };
				} else if (["PUBLISHED"].includes(status)) {
					update = { upload_status: "uploaded" };
				}

				if (update?.upload_status === "uploaded_locally") {
					const publish = (
						await post_call(
							`https://graph.facebook.com/${version}/${instaPageId}/media_publish?creation_id=${id}&access_token=${accessToken}`
						)
					)?.data;
					const publish_id = publish?.id || "";
					update.insta_video_publish_id = publish_id;
				}
				if (update?.upload_status?.length) {
					await PublishedVideos.updateOne({ _id: v?._id }, update);
				}
			})
		);
	}
};

export default async function handler(req, res) {
	if (req.method === "POST") {
		try {
			const { video_url, reel_url } = req.body;
			const caption = "Test Title";
			const accessToken = await getAccessToken();
			if (!accessToken?.length) {
				return res.status(401).json({ error: "Unauthorised" });
			}
			const id =
				(
					await post_call(
						`https://graph.facebook.com/${version}/${instaPageId}/media?video_url=${process.env.AWS_S3_URL}${video_url}&caption=${caption}&media_type=REELS`,
						{},
						accessToken
					)
				)?.data?.id || "";
			await PublishedVideos.create({
				insta_video_id: id,
				video_url,
				reel_url,
				caption,
			});
			return res.status(200).json({});
		} catch (error) {
			return res.status(500).json({ error: "Internal Server Error" });
		}
	} else {
		return res.status(405).json({ message: "Method Not Allowed" });
	}
}
