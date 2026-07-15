/**
 * Download a platform ffmpeg binary into ./bin for desktop packaging.
 * Source mirrors the historical Astrofox ffmpeg host.
 */
import fs from "node:fs";
import https from "node:https";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const destDir = path.resolve(__dirname, "../bin");

const platform = os.platform();
const files = {
	win32: ["win", "ffmpeg.exe"],
	darwin: ["mac", "ffmpeg"],
	linux: ["linux", "ffmpeg"],
};

if (!files[platform]) {
	console.error(`Unsupported platform for ffmpeg install: ${platform}`);
	process.exit(1);
}

const [dir, file] = files[platform];
const url = `https://files.astrofox.io/ffmpeg/${dir}/${file}`;
const dest = path.join(destDir, file);

fs.mkdirSync(destDir, { recursive: true });

if (fs.existsSync(dest)) {
	console.log(`ffmpeg already present: ${dest}`);
	process.exit(0);
}

console.log(`Downloading ${url} -> ${dest}`);

await new Promise((resolve, reject) => {
	const request = (currentUrl) => {
		https
			.get(currentUrl, (res) => {
				if (
					res.statusCode &&
					res.statusCode >= 300 &&
					res.statusCode < 400 &&
					res.headers.location
				) {
					request(res.headers.location);
					return;
				}
				if (res.statusCode !== 200) {
					reject(
						new Error(`Failed to download ffmpeg (HTTP ${res.statusCode})`),
					);
					return;
				}
				const stream = fs.createWriteStream(dest);
				res.pipe(stream);
				stream.on("finish", () => {
					stream.close();
					if (platform !== "win32") {
						fs.chmodSync(dest, 0o755);
					}
					resolve();
				});
			})
			.on("error", reject);
	};
	request(url);
});

console.log("ffmpeg installed.");
