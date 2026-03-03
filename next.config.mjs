import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const { version: appVersion } = require("./package.json");

/** @type {import("next").NextConfig} */
const resolveFromRoot = (target) => path.resolve(process.cwd(), target);
const shaderLoader = resolveFromRoot("loaders/glsl-loader.cjs");

const nextConfig = {
	env: {
		NEXT_PUBLIC_APP_VERSION: appVersion,
	},
	turbopack: {
		resolveAlias: {
			"@": resolveFromRoot("src"),
		},
		rules: {
			"*.less": [
				{
					condition: {
						path: /\.module\.less$/i,
					},
					loaders: ["less-loader"],
					as: "*.module.css",
				},
				{
					loaders: ["less-loader"],
					as: "*.css",
				},
			],
			"*.svg": {
				loaders: ["@svgr/webpack"],
				as: "*.js",
			},
			"*.glsl": {
				loaders: [shaderLoader],
				as: "*.js",
			},
			"*.vs": {
				loaders: [shaderLoader],
				as: "*.js",
			},
			"*.fs": {
				loaders: [shaderLoader],
				as: "*.js",
			},
			"*.vert": {
				loaders: [shaderLoader],
				as: "*.js",
			},
			"*.frag": {
				loaders: [shaderLoader],
				as: "*.js",
			},
		},
	},
};

export default nextConfig;
