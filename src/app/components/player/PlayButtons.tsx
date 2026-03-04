import { player } from "@/app/global";
import useForceUpdate from "@/app/hooks/useForceUpdate";
import { Pause, Play, Stop } from "@/app/icons";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import classNames from "classnames";
import React, { useEffect } from "react";

export default function PlayButtons() {
	const forceUpdate = useForceUpdate();
	const playing = player.isPlaying();
	const PlayPauseIcon = playing ? Pause : Play;

	useEffect(() => {
		player.on("playback-change", forceUpdate);
	}, []);

	function handlePlayButtonClick() {
		player.play();
	}

	function handleStopButtonClick() {
		player.stop();
	}

	return (
		<div className={"whitespace-nowrap"}>
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger
						render={
							<div
								className={classNames(
									"text-neutral-100 bg-transparent p-0 mr-1 inline-flex items-center justify-center [flex-wrap:nowrap] border-2 border-neutral-700 h-10 w-10 rounded-full leading-9 text-center [vertical-align:middle] transition-[all_0.2s] [&:last-child]:mr-0 [&:hover]:border-2 [&:hover]:border-primary [&:active]:border-neutral-100",
								)}
								onClick={handlePlayButtonClick}
							/>
						}
					>
						<PlayPauseIcon
							className={classNames("w-6 h-6", {
								"translate-x-px": !playing,
							})}
						/>
					</TooltipTrigger>
					<TooltipContent
						side="bottom"
						sideOffset={6}
						className="rounded bg-neutral-950 px-3 py-2 text-sm text-neutral-200 shadow-lg z-100"
					>
						{playing ? "Pause" : "Play"}
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger
						render={
							<div
								className={classNames(
									"text-neutral-100 bg-transparent p-0 mr-1 inline-flex items-center justify-center [flex-wrap:nowrap] border-2 border-neutral-700 h-10 w-10 rounded-full leading-9 text-center [vertical-align:middle] transition-[all_0.2s] [&:last-child]:mr-0 [&:hover]:border-2 [&:hover]:border-primary [&:active]:border-neutral-100",
								)}
								onClick={handleStopButtonClick}
							/>
						}
					>
						<Stop className={"w-6 h-6"} />
					</TooltipTrigger>
					<TooltipContent
						side="bottom"
						sideOffset={6}
						className="rounded bg-neutral-950 px-3 py-2 text-sm text-neutral-200 shadow-lg z-100"
					>
						Stop
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		</div>
	);
}
