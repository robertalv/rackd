const { withUniwindConfig } = require("uniwind/metro");
const path = require("path");
const {
    getSentryExpoConfig
} = require("@sentry/react-native/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getSentryExpoConfig(__dirname);

config.resolver = {
	...config.resolver,
	nodeModulesPaths: [
		path.resolve(__dirname, "node_modules"),
		path.resolve(__dirname, "../../node_modules"),
	],
	alias: {
		"@": path.resolve(__dirname),
	},
};

const uniwindConfig = withUniwindConfig(config, {
	cssEntryFile: "./global.css",
	dtsFile: "./uniwind-types.d.ts",
});

uniwindConfig.resolver = {
	...uniwindConfig.resolver,
	alias: {
		...uniwindConfig.resolver?.alias,
		"@": path.resolve(__dirname),
	},
};

module.exports = uniwindConfig;