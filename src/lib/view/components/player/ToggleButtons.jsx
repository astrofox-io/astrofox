import useApp, { toggleState } from "@/lib/view/actions/app";
import Icon from "@/lib/view/components/interface/Icon";
import { player } from "@/lib/view/global";
import useForceUpdate from "@/lib/view/hooks/useForceUpdate";
import { Cycle, SoundBars, SoundWaves } from "@/lib/view/icons";
import classNames from "classnames";
import React from "react";
import shallow from "zustand/shallow";
import styles from "./ToggleButtons.module.tailwind";

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
