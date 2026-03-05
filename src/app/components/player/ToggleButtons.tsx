import { player } from "@/app/global";
import useAppStore from "@/app/actions/app";
import useForceUpdate from "@/app/hooks/useForceUpdate";
import { Cycle } from "@/app/icons";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import classNames from "classnames";
import type { LucideIcon } from "lucide-react";
import React from "react";

export default function ToggleButtons() {
	const isVideoRecording = useAppStore((state) => state.isVideoRecording);
	const forceUpdate = useForceUpdate();
	const looping = player.isLooping();

	if (isVideoRecording) {
		return null;
	}

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
		</div>
	);
}

interface ToggleButtonProps {
	enabled?: boolean;
	title?: string;
	icon?: LucideIcon;
	onClick?: () => void;
}

const ToggleButton = ({ enabled, title, icon, onClick }: ToggleButtonProps) => {
	const IconComponent = icon;

	return (
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
					{IconComponent && (
						<IconComponent
							className={classNames("w-4 h-4", {
								"!text-neutral-500 hover:!text-neutral-400": !enabled,
								"!text-primary hover:!text-primary": enabled,
							})}
						/>
					)}
				</TooltipTrigger>
				{title && (
					<TooltipContent
						side="top"
						sideOffset={6}
						className="rounded bg-neutral-950 px-3 py-2 text-sm text-neutral-200 shadow-lg z-100"
					>
						{title}
					</TooltipContent>
				)}
			</Tooltip>
		</TooltipProvider>
	);
};
