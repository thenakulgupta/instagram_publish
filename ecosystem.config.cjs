module.exports = {
	apps: [
		{
			name: "tk-instagram-publish",
			script: "npm",
			args: "start",
			cwd: "/var/www/tk-instagram-publish",
			watch: true,
			ignore_watch: [".next", "node-modules"],
		},
	],
};
