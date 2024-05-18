import mongoose from "mongoose";

const publishedVideosSchema = new mongoose.Schema(
	{
		insta_video_id: String,
		insta_video_publish_id: String,
		video_url: String,
		reel_url: String,
		caption: String,
		upload_status: {
			type: String,
			enum: ["failed", "pending", "uploaded_locally", "uploaded"],
			default: "pending",
		},
	},
	{ timestamps: true }
);

const PublishedVideos =
	mongoose?.models?.PublishedVideos ||
	mongoose.model("PublishedVideos", publishedVideosSchema);

export { PublishedVideos };
