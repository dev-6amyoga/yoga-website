const path = require("path");
const nodeExternals = require("webpack-node-externals");

module.exports = {
	mode: "production",
	entry: "./server.js",
	externals: [nodeExternals()],
	output: {
		path: path.join(__dirname, "dist"),
		publicPath: "/",
		filename: "final.js",
	},
	stats: {
		errorDetails: true,
	},
	target: "node",
};
