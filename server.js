import { createServer } from "https";
import { parse } from "url";
import next from "next";
import fs from "fs";
import "dotenv/config";
import connectToMongoDB from "./dbConnection/connectDb.js";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(async () => {
	try {
		const uri = process.env.MONGODB_URI || "";
		if (!uri) {
			throw new Error("Please add your MongoDB URI to .env");
		}
		await connectToMongoDB(uri);

		const httpsOptions = {
			key: fs.readFileSync(path.join(__dirname, "ssl/key.pem")),
			cert: fs.readFileSync(path.join(__dirname, "ssl/cert.pem")),
		};
		const server = createServer(httpsOptions, (req, res) => {
			const parsedUrl = parse(req.url, true);

			handle(req, res, parsedUrl);
		});

		server.on("error", (error) => {
			console.error("Server error:", error);
		});

		server.listen(process.env.PORT || 3000, (err) => {
			if (err) throw err;
			console.log(
				`> Ready on http://localhost:${process.env.PORT || 3000}`
			);
		});
	} catch (err) {
		console.error("Error:", err);
	}
});

process.on("uncaughtException", (err) => {
	console.error("There was an uncaught error", err);
	process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
	console.error("Unhandled Rejection at:", promise, "reason:", reason);
	process.exit(1);
});
