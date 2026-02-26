import Icon from "@/lib/view/components/interface/Icon";
import { player } from "@/lib/view/global";
import useForceUpdate from "@/lib/view/hooks/useForceUpdate";
import { Pause, Play, Stop } from "@/lib/view/icons";
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
			<div
				className={classNames(
					"text-text100 bg-transparent p-0 mr-1 inline-flex items-center justify-center [flex-wrap:nowrap] border-2 border-gray300 h-10 w-10 rounded-full leading-9 text-center [vertical-align:middle] transition-[all_0.2s] [&:last-child]:mr-0 [&:hover]:border-2 [&:hover]:border-primary100 [&:active]:border-text100",
				)}
				onClick={handlePlayButtonClick}
			>
				<Icon
					className={classNames("w-6 h-6", {
						"translate-x-px": !playing,
					})}
					glyph={playing ? Pause : Play}
					title={playing ? "Pause" : "Play"}
				/>
			</div>
			<div
				className={classNames(
					"text-text100 bg-transparent p-0 mr-1 inline-flex items-center justify-center [flex-wrap:nowrap] border-2 border-gray300 h-10 w-10 rounded-full leading-9 text-center [vertical-align:middle] transition-[all_0.2s] [&:last-child]:mr-0 [&:hover]:border-2 [&:hover]:border-primary100 [&:active]:border-text100",
				)}
				onClick={handleStopButtonClick}
			>
				<Icon className={"w-6 h-6"} glyph={Stop} title="Stop" />
			</div>
		</div>
	);
}
