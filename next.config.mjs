import path from "node:path";
import withLess from "next-with-less";

/** @type {import("next").NextConfig} */
const nextConfig = withLess({
	webpack(config) {
		config.resolve.alias = {
			...(config.resolve.alias || {}),
			"@": path.resolve(process.cwd(), "src"),
			actions: path.resolve(process.cwd(), "src/view/actions"),
			assets: path.resolve(process.cwd(), "src/view/assets"),
			audio: path.resolve(process.cwd(), "src/audio"),
			canvas: path.resolve(process.cwd(), "src/canvas"),
			components: path.resolve(process.cwd(), "src/view/components"),
			config: path.resolve(process.cwd(), "src/config"),
			core: path.resolve(process.cwd(), "src/core"),
			displays: path.resolve(process.cwd(), "src/displays"),
			drawing: path.resolve(process.cwd(), "src/drawing"),
			effects: path.resolve(process.cwd(), "src/effects"),
			global: path.resolve(process.cwd(), "src/view/global.jsx"),
			graphics: path.resolve(process.cwd(), "src/graphics"),
			hooks: path.resolve(process.cwd(), "src/view/hooks"),
			icons: path.resolve(process.cwd(), "src/view/icons.jsx"),
			shaders: path.resolve(process.cwd(), "src/shaders"),
			styles: path.resolve(process.cwd(), "src/view/styles"),
			utils: path.resolve(process.cwd(), "src/utils"),
			video: path.resolve(process.cwd(), "src/video"),
			view: path.resolve(process.cwd(), "src/view"),
			src: path.resolve(process.cwd(), "src"),
		};

		const fileLoaderRule = config.module.rules.find((rule) =>
			rule?.test?.test?.(".svg"),
		);

		if (fileLoaderRule) {
			fileLoaderRule.exclude = /\.svg$/i;

			config.module.rules.push({
				...fileLoaderRule,
				test: /\.svg$/i,
				resourceQuery: /url/,
			});

			config.module.rules.push({
				test: /\.svg$/i,
				resourceQuery: /react/,
				use: ["@svgr/webpack"],
			});
		}

		config.module.rules.push({
			test: /\.(glsl|vs|fs|vert|frag)$/i,
			type: "asset/source",
		});

		return config;
	},
});

export default nextConfig;
