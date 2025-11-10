const { getDefaultConfig } = require("expo/metro-config");
const { withUniwindConfig } = require("uniwind/metro");
const path = require("path");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Ensure proper resolution of react-native from workspace root
config.resolver = {
	...config.resolver,
	nodeModulesPaths: [
		path.resolve(__dirname, "node_modules"),
		path.resolve(__dirname, "../../node_modules"),
	],
};

const uniwindConfig = withUniwindConfig(config, {
	cssEntryFile: "./global.css",
	dtsFile: "./uniwind-types.d.ts",
});

module.exports = uniwindConfig;
