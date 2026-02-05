import defaultAppConfig from "config/app.json";
import { api, env, logger } from "global";
import { uniqueId } from "utils/crypto";
import create from "zustand";
import { raiseError } from "./error";

const { APP_CONFIG_FILE } = env;

const configStore = create(() => ({
	...defaultAppConfig,
}));

export async function saveConfig(config) {
	try {
		await api.saveConfig(config);

		logger.log("Saved config file", APP_CONFIG_FILE, config);

		configStore.setState(config);
	} catch (error) {
		raiseError("Failed to save config file.", error);
	}
}

export async function loadConfig() {
	try {
		const config = await api.loadConfig();

		if (config === null) {
			return configStore.setState({ ...defaultAppConfig, uid: uniqueId() });
		}

		logger.log("Loaded config file", APP_CONFIG_FILE, config);

		configStore.setState(config);
	} catch (error) {
		raiseError("Failed to load config file.", error);
	}
}

export default configStore;
