"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { get_call, post_call } from "../../utils/request";
import { Settings } from "../../models/settings";
import moment from "moment";

const extractAccessToken = () => {
	const hash = window.location.hash;
	const token = hash.match(/access_token=([^&]*)/);
	return token ? token[1] : null;
};

export default function Home() {
	const router = useRouter();
	const appId = process.env.FB_APP_ID;
	const configId = process.env.FB_CONFIG_ID;
	const instaPageId = process.env.INSTA_PAGE_ID;
	const version = "v19.0";
	const [accessToken, setAccessToken] = useState(null);

	const login = () => {
		router.push(
			`https://facebook.com/${version}/dialog/oauth?client_id=${appId}&display=page&redirect_uri=${location.protocol + "//" + location.host}&response_type=token&scope=email&config_id=${configId}`
		);
	};
	const postReel = async () => {
		console.log(instaPageId);
		const res = await post_call(
			`https://graph.facebook.com/${version}/${instaPageId}/media?video_url=https://static.videezy.com/system/resources/previews/000/019/650/original/Uhr10.mp4&caption=Test+Title&media_type=REELS`,
			{},
			accessToken
		);
		console.log(res);
	};
	const saveAccessToken = async (token) => {
		let setting = await Settings.findOne();
		if (!setting) {
			await Settings.create({});
			setting = await Settings.findOne();
		}
		console.log(setting);
	};
	const getAccessToken = async (token) => {
		let setting = await Settings.findOne();
		return moment(setting.access_token_expiration) > moment()
			? setting.access_token
			: "";
	};

	useEffect(() => {
		const api = async () => {
			let token = extractAccessToken();
			console.log(token);
			if (token?.length) {
				setAccessToken(token);
				saveAccessToken(token);
				// window.location.hash = "";
			} else {
				token = await getAccessToken();
			}
			console.log(token);
		};
		api();
	}, []);
	useEffect(() => {
		const api = async () => {
			await postReel();
		};
		if (accessToken?.length) {
			api();
		}
	}, [accessToken]);
	return (
		<div className="bg-white w-screen h-screen overflow-hidden flex text-black justify-center items-center">
			<div className="flex flex-col gap-4 items-center">
				<p className="text-[30px] font-bold">Login</p>
				<button
					className="bg-blue-950 text-white px-4 py-2 rounded-lg"
					onClick={login}
				>
					Click to login
				</button>
			</div>
		</div>
	);
}
