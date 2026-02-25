import useApp, { toggleState } from "@/lib/view/actions/app";
import Icon from "@/lib/view/components/interface/Icon";
import { player } from "@/lib/view/global";
import useForceUpdate from "@/lib/view/hooks/useForceUpdate";
import { Cycle, SoundBars, SoundWaves } from "@/lib/view/icons";
import classNames from "classnames";
import React from "react";
import shallow from "zustand/shallow";

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
		<div className={"flex [&.is-focused_.button]:opacity-[1]"}>
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
		className={classNames("mr-2.5 [&:last-child]:mr-0 [&_.icon]:text-[var(--text500)] [&_.icon]:w-4 [&_.icon]:h-4 [&_.icon:hover]:text-[var(--text300)]", {
			["[&_.icon]:text-[var(--text100)] [&_.icon:hover]:text-[var(--text100)]"]: enabled,
		})}
		onClick={onClick}
	>
		<Icon
			className={""}
			glyph={icon}
			title={title}
			width={20}
			height={20}
		/>
	</div>
);
