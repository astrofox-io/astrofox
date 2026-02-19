import path from "node:path";

/** @type {import("next").NextConfig} */
const resolveFromRoot = (target) => path.resolve(process.cwd(), target);
const shaderLoader = resolveFromRoot("loaders/glsl-loader.cjs");

const nextConfig = {
	turbopack: {
		resolveAlias: {
			"@": resolveFromRoot("src"),
			actions: resolveFromRoot("src/view/actions"),
			assets: resolveFromRoot("src/view/assets"),
			audio: resolveFromRoot("src/audio"),
			canvas: resolveFromRoot("src/canvas"),
			components: resolveFromRoot("src/view/components"),
			config: resolveFromRoot("src/config"),
			core: resolveFromRoot("src/core"),
			displays: resolveFromRoot("src/displays"),
			drawing: resolveFromRoot("src/drawing"),
			effects: resolveFromRoot("src/effects"),
			global: resolveFromRoot("src/view/global.jsx"),
			graphics: resolveFromRoot("src/graphics"),
			hooks: resolveFromRoot("src/view/hooks"),
			icons: resolveFromRoot("src/view/icons.jsx"),
			shaders: resolveFromRoot("src/shaders"),
			styles: resolveFromRoot("src/view/styles"),
			utils: resolveFromRoot("src/utils"),
			video: resolveFromRoot("src/video"),
			view: resolveFromRoot("src/view"),
			src: resolveFromRoot("src"),
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
