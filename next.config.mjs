import path from "node:path";

/** @type {import("next").NextConfig} */
const resolveFromRoot = (target) => path.resolve(process.cwd(), target);
const shaderLoader = resolveFromRoot("loaders/glsl-loader.cjs");

const nextConfig = {
	turbopack: {
		resolveAlias: {
			"@": resolveFromRoot("src"),
			actions: resolveFromRoot("src/lib/view/actions"),
			assets: resolveFromRoot("src/lib/view/assets"),
			audio: resolveFromRoot("src/lib/audio"),
			canvas: resolveFromRoot("src/lib/canvas"),
			components: resolveFromRoot("src/lib/view/components"),
			config: resolveFromRoot("src/lib/config"),
			core: resolveFromRoot("src/lib/core"),
			displays: resolveFromRoot("src/lib/displays"),
			drawing: resolveFromRoot("src/lib/drawing"),
			effects: resolveFromRoot("src/lib/effects"),
			global: resolveFromRoot("src/lib/view/global"),
			graphics: resolveFromRoot("src/lib/graphics"),
			hooks: resolveFromRoot("src/lib/view/hooks"),
			icons: resolveFromRoot("src/lib/view/icons"),
			shaders: resolveFromRoot("src/lib/shaders"),
			styles: resolveFromRoot("src/lib/view/styles"),
			utils: resolveFromRoot("src/lib/utils"),
			video: resolveFromRoot("src/lib/video"),
			view: resolveFromRoot("src/lib/view"),
			src: resolveFromRoot("src/lib"),
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
