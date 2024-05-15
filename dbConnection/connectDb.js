import mongoose from "mongoose";
import "dotenv/config";

const connectToMongoDB = async (uri) => {
	if (mongoose.connection.readyState === 0) {
		try {
			await mongoose.connect(uri);
			console.log("Connected to MongoDB");
		} catch (err) {
			console.error("Error connecting to MongoDB", err);
		}
	}
};

export default connectToMongoDB;
