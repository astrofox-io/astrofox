import useApp, { toggleState } from "@/app/actions/app";
import Icon from "@/app/components/interface/Icon";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { player } from "@/app/global";
import useForceUpdate from "@/app/hooks/useForceUpdate";
import { Cycle, SoundBars, SoundWaves } from "@/app/icons";
import classNames from "classnames";
import type { LucideIcon } from "lucide-react";
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
	<TooltipProvider>
		<Tooltip>
			<TooltipTrigger
				render={
					<div
						className={"mr-2.5 [&:last-child]:mr-0 cursor-default"}
						onClick={onClick}
					/>
				}
			>
				<Icon
					className={classNames("w-4 h-4", {
						"!text-neutral-500 hover:!text-neutral-400": !enabled,
						"!text-primary hover:!text-primary": enabled,
					})}
					glyph={icon}
				/>
			</TooltipTrigger>
			{title && (
				<TooltipContent
					side="bottom"
					sideOffset={6}
					className="rounded bg-neutral-950 px-3 py-2 text-sm text-neutral-200 shadow-lg z-100"
				>
					{title}
				</TooltipContent>
			)}
		</Tooltip>
	</TooltipProvider>
);
