import mongoose from "mongoose";

const settingSchema = new mongoose.Schema(
	{
		access_token: String,
		access_token_expiration: Date,
	},
	{ timestamps: true }
);

const Settings =
	mongoose.models.Settings || mongoose.model("Settings", settingSchema);

export { Settings };
