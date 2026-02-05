import useApp from "actions/app";
import classNames from "classnames";
import React, { useState, useEffect } from "react";
import { player } from "view/global";
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
	const [showPlayer, showWaveform, showOsc] = useApp(
		(state) => [state.showPlayer, state.showWaveform, state.showOsc],
		shallow,
	);

	function handleAudioLoad() {
		setHasAudio(player.hasAudio());
	}

	useEffect(() => {
		player.on("audio-load", handleAudioLoad);

		return () => {
			player.off("audio-load", handleAudioLoad);
		};
	}, []);

	return (
		<div className={classNames({ [styles.hidden]: !showPlayer })}>
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
