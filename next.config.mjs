/** @type {import('next').NextConfig} */
const nextConfig = {
	env: {
		FB_APP_ID: process.env.FB_APP_ID,
		FB_CONFIG_ID: process.env.FB_CONFIG_ID,
		FB_PAGE_ID: process.env.FB_PAGE_ID,
		INSTA_PAGE_ID: process.env.INSTA_PAGE_ID,
	},
};

export default nextConfig;
