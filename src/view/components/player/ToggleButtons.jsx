import useApp, { toggleState } from "actions/app";
import classNames from "classnames";
import Icon from "components/interface/Icon";
import useForceUpdate from "hooks/useForceUpdate";
import React from "react";
import { player } from "view/global";
import { Cycle, SoundBars, SoundWaves } from "view/icons";
import shallow from "zustand/shallow";
import styles from "./ToggleButtons.module.less";

export default function ToggleButtons() {
	const [showWaveform, showOsc] = useApp(
		(state) => [state.showWaveform, state.showOsc],
		shallow,
	);
	const forceUpdate = useForceUpdate();
	const looping = player.isLooping();

	function handleLoopButtonClick() {
		player.setLoop(!looping);
		forceUpdate();
	}

	return (
		<div className={styles.buttons}>
			<ToggleButton
				icon={Cycle}
				title="Repeat"
				enabled={looping}
				onClick={handleLoopButtonClick}
			/>
			<ToggleButton
				icon={SoundBars}
				title="Waveform"
				enabled={showWaveform}
				onClick={() => toggleState("showWaveform")}
			/>
			<ToggleButton
				icon={SoundWaves}
				title="Oscilloscope"
				enabled={showOsc}
				onClick={() => toggleState("showOsc")}
			/>
		</div>
	);
}

const ToggleButton = ({ enabled, title, icon, onClick }) => (
	<div
		className={classNames(styles.button, {
			[styles.enabled]: enabled,
		})}
		onClick={onClick}
	>
		<Icon
			className={styles.icon}
			glyph={icon}
			title={title}
			width={20}
			height={20}
		/>
	</div>
);
