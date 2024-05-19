import { load } from "cheerio";
import { launch } from "puppeteer";
import { setTimeout } from "node:timers/promises";
import { Upload } from "@aws-sdk/lib-storage";
import { S3Client } from "@aws-sdk/client-s3";
import fs from "fs";
import os from "os";
import path from "path";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import mime from "mime-types";

const saveVideoToTemp = async (url) => {
	const tmpDir = os.tmpdir();
	try {
		const response = await axios({
			method: "GET",
			url,
			responseType: "stream",
		});
		const contentType = response.headers["content-type"];
		const extension = mime.extension(contentType) || "bin";
		const filename = `${uuidv4()}.${extension}`;
		const filePath = path.join(tmpDir, filename);
		const writer = fs.createWriteStream(filePath);
		response.data.pipe(writer);
		return new Promise((resolve, reject) => {
			writer.on("finish", () => resolve({ filePath, contentType }));
			writer.on("error", () => reject({}));
		});
	} catch (error) {
		console.error("Error downloading the video:", error);
		throw error;
	}
};

const uploadToS3 = async (file, contentType) => {
	const accessKeyId = process.env.AWS_S3_ACCESS_KEY;
	const secretAccessKey = process.env.AWS_S3_ACCESS_SECRET;
	const region = process.env.AWS_S3_REGION;
	const Bucket = process.env.AWS_S3_BUCKET;

	file = fs.readFileSync(file);

	const upload = await new Upload({
		client: new S3Client({
			credentials: {
				accessKeyId,
				secretAccessKey,
			},
			region,
		}),
		params: {
			Bucket,
			Key: `reels/${uuidv4()}-${uuidv4()}`,
			Body: file,
			ContentType: contentType,
		},
	}).done();
	return upload?.Key;
};

export default async function handler(req, res) {
	if (req.method === "POST") {
		try {
			const { reel } = req.body;
			const browser = await launch({
				headless: true,
				args: ["--no-sandbox", "--disable-setuid-sandbox"],
			});
			const page = await browser.newPage();
			await page.goto(reel, {
				waitUntil: "networkidle2",
			});
			await setTimeout(5000);
			const html = await page.content();
			await browser.close();
			const $ = load(html);

			const reel_url = $("video").attr("src");
			const saved_video = await saveVideoToTemp(reel_url);
			const s3Url = await uploadToS3(
				saved_video?.filePath,
				saved_video?.contentType
			);

			return res.status(200).json({ reel_url: s3Url });
		} catch (error) {
			console.log(error);
			return res.status(500).json({ error: "Internal Server Error" });
		}
	} else {
		return res.status(405).json({ message: "Method Not Allowed" });
	}
}
