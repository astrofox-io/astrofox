import Audio from "@/lib/audio/Audio";
import { audioContext } from "@/app/global";

export async function loadAudioData(
	data: string | ArrayBuffer,
): Promise<Audio> {
	const audio = new Audio(audioContext);
	await audio.load(data);
	return audio;
}

export function downmix(input: AudioBuffer) {
	const { length, numberOfChannels } = input;
	const output = new Float32Array(length);

	if (numberOfChannels < 2) {
		return input.getChannelData(0);
	}

	for (let i = 0; i < numberOfChannels; i++) {
		const ch = input.getChannelData(i);

		for (let j = 0; j < length; j++) {
			output[j] += ch[j];
		}
	}

	return output.map((x) => x / numberOfChannels);
}
