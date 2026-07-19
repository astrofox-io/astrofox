/**
 * Wait for the Next dev server (PORT from .env, default 3000), then start Electron.
 * Keeps wait-on and ELECTRON_START_URL aligned when PORT is not 3000.
 */
import { spawn } from "node:child_process";
import waitOn from "wait-on";

const port = process.env.PORT || "3000";
const host = "127.0.0.1";
const url = `http://${host}:${port}`;

console.log(`[electron] waiting for ${url} ...`);

try {
	await waitOn({
		resources: [url],
		timeout: 180_000,
		interval: 250,
		window: 500,
	});
} catch (error) {
	console.error(
		`[electron] timed out waiting for ${url}. Is Next listening on PORT=${port}?`,
	);
	console.error(error instanceof Error ? error.message : error);
	process.exit(1);
}

console.log(`[electron] starting (ELECTRON_START_URL=${url})`);

const child = spawn("electron", ["."], {
	stdio: "inherit",
	shell: true,
	env: {
		...process.env,
		ELECTRON_DEV: "1",
		ELECTRON_START_URL: process.env.ELECTRON_START_URL || url,
	},
});

child.on("exit", (code, signal) => {
	if (signal) {
		process.kill(process.pid, signal);
		return;
	}
	process.exit(code ?? 0);
});
