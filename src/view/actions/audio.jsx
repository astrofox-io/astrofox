import { loadAudioData } from "@/utils/audio";
import { trimChars } from "@/utils/string";
import { analyzer, api, logger, player } from "@/view/global";
import create from "zustand";
import appStore from "./app";
import configStore from "./config";
import { raiseError } from "./error";

export const initialState = {
	file: "",
	duration: 0,
	loading: false,
	tags: null,
	error: null,
};

const audioStore = create(() => ({
	...initialState,
}));

export async function loadAudioFile(file, play) {
	audioStore.setState({ loading: true });

	player.stop();

	const name = file?.name || file;

	logger.time("audio-file-load");

	try {
		const data = await api.readAudioFile(file);
		const audio = await loadAudioData(data);
		const duration = audio.getDuration();

		player.load(audio);
		audio.addNode(analyzer.analyzer);

		if (!play) {
			play = configStore.getState().autoPlayAudio;
		}

		if (play) {
			player.play();
		}

		logger.timeEnd("audio-file-load", "Audio file loaded:", name);

		const tags = await api.loadAudioTags(file);

		if (tags) {
			const { artist, title } = tags;

			appStore.setState({ statusText: trimChars(`${artist} - ${title}`) });
		} else {
			appStore.setState({ statusText: trimChars(name) });
		}

		audioStore.setState({ file: name, duration, tags, loading: false });
	} catch (error) {
		raiseError("Invalid audio file.", error);

		audioStore.setState({ loading: false });
	}
}

export async function openAudioFile(play) {
	const { files, canceled } = await api.showOpenDialog({
		filters: [
			{
				name: "audio files",
				extensions: ["aac", "flac", "mp3", "m4a", "opus", "ogg", "wav"],
			},
		],
	});

	if (!canceled && files && files.length) {
		if (!play) {
			play = configStore.getState().autoPlayAudio;
		}

		await loadAudioFile(files[0], play);
	}
}

export default audioStore;
