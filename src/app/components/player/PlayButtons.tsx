import Icon from "@/app/components/interface/Icon";
import Tooltip from "@/app/components/interface/Tooltip";
import { player } from "@/app/global";
import useForceUpdate from "@/app/hooks/useForceUpdate";
import { Pause, Play, Stop } from "@/app/icons";
import classNames from "classnames";
import React, { useEffect } from "react";

export default function PlayButtons() {
	const forceUpdate = useForceUpdate();
	const playing = player.isPlaying();

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
			<Tooltip text={playing ? "Pause" : "Play"}>
				<div
					className={classNames(
						"text-neutral-100 bg-transparent p-0 mr-1 inline-flex items-center justify-center [flex-wrap:nowrap] border-2 border-neutral-700 h-10 w-10 rounded-full leading-9 text-center [vertical-align:middle] transition-[all_0.2s] [&:last-child]:mr-0 [&:hover]:border-2 [&:hover]:border-primary [&:active]:border-neutral-100",
					)}
					onClick={handlePlayButtonClick}
				>
					<Icon
						className={classNames("w-6 h-6", {
							"translate-x-px": !playing,
						})}
						glyph={playing ? Pause : Play}
					/>
				</div>
			</Tooltip>
			<Tooltip text="Stop">
				<div
					className={classNames(
						"text-neutral-100 bg-transparent p-0 mr-1 inline-flex items-center justify-center [flex-wrap:nowrap] border-2 border-neutral-700 h-10 w-10 rounded-full leading-9 text-center [vertical-align:middle] transition-[all_0.2s] [&:last-child]:mr-0 [&:hover]:border-2 [&:hover]:border-primary [&:active]:border-neutral-100",
					)}
					onClick={handleStopButtonClick}
				>
					<Icon className={"w-6 h-6"} glyph={Stop} />
				</div>
			</Tooltip>
		</div>
	);
}
