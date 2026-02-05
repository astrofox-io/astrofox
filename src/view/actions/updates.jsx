import { api, env, logger } from "global";
import semver from "semver";
import create from "zustand";
import configStore from "./config";

const initialState = {
	status: null,
	checked: false,
	hasUpdate: false,
	downloadComplete: false,
	downloadProgress: 0,
	lastCheck: 0,
	updateInfo: null,
};

const updateStore = create(() => ({
	...initialState,
}));

export function updateDownloadProgress(info) {
	updateStore.setState({ downloadProgress: info.percent });
}

export async function downloadUpdate() {
	if (env.IS_WEB) {
		updateStore.setState({ status: "unsupported" });
		return;
	}

	updateStore.setState({ status: "downloading" });

	const result = await api.invoke("download-update");

	logger.log("Update downloaded:", result);

	updateStore.setState({ downloadComplete: true, status: null });
}

export async function quitAndInstall() {
	if (env.IS_WEB) {
		updateStore.setState({ status: "unsupported" });
		return;
	}

	const { downloadComplete } = updateStore.getState();

	if (downloadComplete) {
		await api.invoke("quit-and-install");
	}
}

export async function checkForUpdates() {
	if (env.IS_WEB) {
		updateStore.setState({
			status: "unsupported",
			checked: true,
			hasUpdate: false,
			downloadComplete: false,
			downloadProgress: 0,
			lastCheck: Date.now(),
			updateInfo: null,
		});
		return;
	}

	updateStore.setState({ status: "checking", lastCheck: Date.now() });

	try {
		const { updateInfo } = await api.invoke("check-for-updates");

		const hasUpdate = semver.gt(updateInfo.version, env.APP_VERSION);
		const { autoUpdate } = configStore.getState();
		const status = autoUpdate && hasUpdate ? "downloading" : null;

		logger.log("Update check complete", updateInfo);

		updateStore.setState({ checked: true, status, updateInfo, hasUpdate });

		if (autoUpdate && hasUpdate) {
			await downloadUpdate();
		}
	} catch (e) {
		updateStore.setState({ status: "error" });

		logger.error("Update check failed:", e);
	}
}

export function resetUpdates() {
	updateStore.setState({ status: null });
}

export default updateStore;
