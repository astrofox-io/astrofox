import useApp from "@/lib/view/actions/app";
import { player } from "@/lib/view/global";
import React, { useState, useEffect, useCallback } from "react";
import shallow from "zustand/shallow";
import AudioWaveform from "./AudioWaveform";
import Oscilloscope from "./Oscilloscope";
import PlayButtons from "./PlayButtons";
import styles from "./Player.module.less";
import ProgressControl from "./ProgressControl";
import ToggleButtons from "./ToggleButtons";
import VolumeControl from "./VolumeControl";

export default function Player() {
	const [hasAudio, setHasAudio] = useState(false);
	const [showWaveform, showOsc] = useApp(
		(state) => [state.showWaveform, state.showOsc],
		shallow,
	);

	const handleAudioLoad = useCallback(() => {
		setHasAudio(player.hasAudio());
	}, []);

	useEffect(() => {
		player.on("audio-load", handleAudioLoad);

		return () => {
			player.off("audio-load", handleAudioLoad);
		};
	}, [handleAudioLoad]);

	return (
		<div>
			<AudioWaveform visible={hasAudio && showWaveform} />
			<div className={styles.player}>
				<PlayButtons />
				<VolumeControl />
				<ProgressControl />
				<ToggleButtons />
			</div>
			{showOsc && <Oscilloscope />}
		</div>
	);
}
