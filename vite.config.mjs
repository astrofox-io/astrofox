import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import glsl from "vite-plugin-glsl";
import svgr from "vite-plugin-svgr";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;
const API_PROXY_TARGET =
	process.env.VITE_API_PROXY_TARGET || "http://localhost:3005";
const pkg = JSON.parse(
	fs.readFileSync(path.resolve(__dirname, "package.json"), "utf-8"),
);

export default defineConfig(({ mode }) => ({
	root: path.resolve(__dirname, "src/lib/view"),
	publicDir: path.resolve(__dirname, "public"),
	base: "./",
	plugins: [
		react({
			include: /src[\\/]lib[\\/]view[\\/].*\\.[jt]sx?$/,
		}),
		svgr(),
		glsl(),
	],
	server: {
		port: Number(PORT),
		strictPort: true,
		proxy: {
			"/api/auth": {
				target: API_PROXY_TARGET,
				changeOrigin: true,
			},
			"/api/projects": {
				target: API_PROXY_TARGET,
				changeOrigin: true,
			},
			"/api/health": {
				target: API_PROXY_TARGET,
				changeOrigin: true,
			},
		},
		fs: {
			allow: [
				path.resolve(__dirname, "src"),
				path.resolve(__dirname, "node_modules"),
				path.resolve(__dirname),
			],
		},
	},
	build: {
		outDir: path.resolve(__dirname, "dist"),
		emptyOutDir: true,
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src"),
			actions: path.resolve(__dirname, "src/lib/view/actions"),
			assets: path.resolve(__dirname, "src/lib/view/assets"),
			audio: path.resolve(__dirname, "src/lib/audio"),
			canvas: path.resolve(__dirname, "src/lib/canvas"),
			components: path.resolve(__dirname, "src/lib/view/components"),
			config: path.resolve(__dirname, "src/lib/config"),
			core: path.resolve(__dirname, "src/lib/core"),
			displays: path.resolve(__dirname, "src/lib/displays"),
			drawing: path.resolve(__dirname, "src/lib/drawing"),
			effects: path.resolve(__dirname, "src/lib/effects"),
			global: path.resolve(__dirname, "src/lib/view/global.jsx"),
			graphics: path.resolve(__dirname, "src/lib/graphics"),
			hooks: path.resolve(__dirname, "src/lib/view/hooks"),
			icons: path.resolve(__dirname, "src/lib/view/icons.jsx"),
			shaders: path.resolve(__dirname, "src/lib/shaders"),
			styles: path.resolve(__dirname, "src/lib/view/styles"),
			utils: path.resolve(__dirname, "src/lib/utils"),
			video: path.resolve(__dirname, "src/lib/video"),
			view: path.resolve(__dirname, "src/lib/view"),
			src: path.resolve(__dirname, "src/lib"),
		},
	},
	css: {
		modules: {
			generateScopedName:
				mode === "production"
					? "[hash:base64]"
					: "[name]__[local]--[hash:base64:5]",
		},
	},
	define: {
		__APP_VERSION__: JSON.stringify(pkg.version),
		"process.env.NODE_ENV": JSON.stringify(mode),
	},
}));
