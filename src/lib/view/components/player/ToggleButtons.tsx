import useApp, { toggleState } from "@/lib/view/actions/app";
import Icon from "@/lib/view/components/interface/Icon";
import { player } from "@/lib/view/global";
import useForceUpdate from "@/lib/view/hooks/useForceUpdate";
import { Cycle, SoundBars, SoundWaves } from "@/lib/view/icons";
import type { LucideIcon } from "lucide-react";
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

interface ToggleButtonProps {
	enabled?: boolean;
	title?: string;
	icon?: LucideIcon;
	onClick?: () => void;
}

const ToggleButton = ({ enabled, title, icon, onClick }: ToggleButtonProps) => (
	<div
		className={"mr-2.5 [&:last-child]:mr-0 cursor-default"}
		onClick={onClick}
	>
		<Icon
			className={classNames("w-4 h-4", {
				"!text-neutral-500 hover:!text-neutral-400": !enabled,
				"!text-primary hover:!text-primary": enabled,
			})}
			glyph={icon}
			title={title}
		/>
	</div>
);
