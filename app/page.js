"use client";
import { get_call, post_call } from "../utils/request";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const extractAccessToken = () => {
	const hash = window.location.hash;
	const token = hash.match(/long_lived_token=([^&]*)/);
	const data_access_expiration_time = hash.match(
		/data_access_expiration_time=([^&]*)/
	);
	return {
		token: token ? token[1] : null,
		data_access_expiration_time: data_access_expiration_time
			? data_access_expiration_time[1]
			: null,
	};
};

export default function Home() {
	const router = useRouter();
	const appId = process.env.FB_APP_ID;
	const configId = process.env.FB_CONFIG_ID;
	const version = "v19.0";
	const [isLogined, setIsLogined] = useState(null);

	function isValidHttpUrl(string) {
		let url;

		try {
			url = new URL(string);
		} catch (_) {
			return false;
		}

		return url.protocol === "http:" || url.protocol === "https:";
	}

	const login = () => {
		router.push(
			`https://facebook.com/${version}/dialog/oauth?client_id=${appId}&display=page&redirect_uri=${location.protocol + "//" + location.host}&response_type=token&scope=email&config_id=${configId}`
		);
	};
	const uploadInstagramReel = async () => {
		const reel_url = await navigator.clipboard.readText();
		if (!reel_url?.length || !isValidHttpUrl(reel_url)) {
			alert("Invalid URL");
			return;
		}

		try {
			const data = (
				await post_call("/api/fetch_reel_url", { reel: reel_url })
			)?.data;
			if (!data?.reel_url?.length) {
				alert("Unable to fetch URL");
				return;
			}
			const video_url = data?.reel_url;
			try {
				await post_call("/api/post_reel", { video_url, reel_url });
			} catch (error) {
				alert("Unable to post reel");
			}
		} catch (error) {
			alert("Unable to fetch URL");
		}
	};
	const saveAccessToken = async (token, data_access_expiration_time) => {
		if (token?.length)
			await post_call(`/api/save_access_token`, {
				access_token: token,
				data_access_expiration_time: data_access_expiration_time,
			});
	};
	const checkLogin = async () => {
		setIsLogined((await get_call(`/api/check_login`))?.data?.logined);
	};

	useEffect(() => {
		const api = async () => {
			let { token, data_access_expiration_time } = extractAccessToken();
			window.location.hash = "";
			if (token?.length) {
				await saveAccessToken(token, data_access_expiration_time);
			}
			await checkLogin();
		};
		api();
	}, []);
	useEffect(() => {
		const api = async () => {
			await getStories();
		};
		if (isLogined?.length) {
			api();
		}
	}, [isLogined]);
	return (
		<div className="bg-white w-screen h-screen overflow-hidden flex text-black justify-center items-center">
			<div className="flex flex-col gap-4 items-center">
				{isLogined === null ? (
					<></>
				) : isLogined ? (
					<>
						<button
							className="bg-blue-950 text-white px-4 py-2 rounded-lg"
							onClick={uploadInstagramReel}
						>
							Upload Instagram Reel
						</button>
					</>
				) : (
					<>
						<p className="text-[30px] font-bold">Login</p>
						<button
							className="bg-blue-950 text-white px-4 py-2 rounded-lg"
							onClick={login}
						>
							Click to login
						</button>
					</>
				)}
			</div>
		</div>
	);
}
